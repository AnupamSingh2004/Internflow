from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import asyncio
import uvicorn
from dataclasses import asdict
import json
import os
from datetime import datetime
import logging

# Import your existing classes (assuming they're in a separate module)
from job_scraper import JobAggregator, Job

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Job Scraper API",
    description="API for scraping jobs from multiple sources",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class JobSearchRequest(BaseModel):
    job_title: str
    location: Optional[str] = ""
    use_selenium: Optional[bool] = False
    max_results_per_source: Optional[int] = 20
    remove_duplicates: Optional[bool] = True

class JobResponse(BaseModel):
    title: str
    company: str
    location: str
    description: str
    apply_link: str
    source_url: str
    platform: str
    posted_date: Optional[str] = None
    salary: Optional[str] = None
    job_type: Optional[str] = None

class JobSearchResponse(BaseModel):
    success: bool
    total_jobs: int
    jobs: List[JobResponse]
    search_params: JobSearchRequest
    timestamp: str
    message: Optional[str] = None

# Global aggregator instance
aggregator = JobAggregator()

@app.get("/")
async def root():
    return {
        "message": "Job Scraper API",
        "version": "1.0.0",
        "endpoints": {
            "search": "/search",
            "health": "/health",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "api_keys_configured": {
            "adzuna": bool(os.getenv('ADZUNA_APP_ID') and os.getenv('ADZUNA_API_KEY')),
            "reed": bool(os.getenv('REED_API_KEY')),
            "usajobs": True  # No key required
        }
    }

@app.post("/search", response_model=JobSearchResponse)
async def search_jobs(request: JobSearchRequest):
    """Search for jobs across multiple platforms"""
    try:
        logger.info(f"Searching for jobs: {request.job_title} in {request.location}")
        
        # Perform the search
        jobs = aggregator.search_all_sources(
            job_title=request.job_title,
            location=request.location,
            use_selenium=request.use_selenium,
            max_results_per_source=request.max_results_per_source
        )
        
        # Remove duplicates if requested
        if request.remove_duplicates:
            jobs = aggregator.remove_duplicates(jobs)
        
        # Convert to response format
        job_responses = [
            JobResponse(**asdict(job)) for job in jobs
        ]
        
        return JobSearchResponse(
            success=True,
            total_jobs=len(job_responses),
            jobs=job_responses,
            search_params=request,
            timestamp=datetime.now().isoformat(),
            message=f"Found {len(job_responses)} jobs"
        )
        
    except Exception as e:
        logger.error(f"Error searching jobs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/search", response_model=JobSearchResponse)
async def search_jobs_get(
    job_title: str = Query(..., description="Job title or keywords to search for"),
    location: str = Query("", description="Location to search in"),
    use_selenium: bool = Query(False, description="Use browser automation for additional sources"),
    max_results_per_source: int = Query(20, description="Maximum results per source"),
    remove_duplicates: bool = Query(True, description="Remove duplicate job listings")
):
    """Search for jobs using GET parameters (alternative to POST)"""
    request = JobSearchRequest(
        job_title=job_title,
        location=location,
        use_selenium=use_selenium,
        max_results_per_source=max_results_per_source,
        remove_duplicates=remove_duplicates
    )
    return await search_jobs(request)

@app.get("/platforms")
async def get_available_platforms():
    """Get list of available job platforms"""
    return {
        "platforms": [
            {
                "name": "Adzuna",
                "type": "API",
                "requires_key": True,
                "coverage": "Global",
                "free_tier": True
            },
            {
                "name": "Reed",
                "type": "API", 
                "requires_key": True,
                "coverage": "UK",
                "free_tier": True
            },
            {
                "name": "USAJobs.gov",
                "type": "API",
                "requires_key": False,
                "coverage": "US Government",
                "free_tier": True
            },
            {
                "name": "RemoteOK",
                "type": "Scraping",
                "requires_key": False,
                "coverage": "Remote jobs",
                "free_tier": True
            },
            {
                "name": "WeWorkRemotely",
                "type": "Scraping",
                "requires_key": False,
                "coverage": "Remote jobs",
                "free_tier": True
            }
        ]
    }

# Background task for cleanup
async def cleanup_selenium():
    """Cleanup selenium resources"""
    if hasattr(aggregator, 'selenium_scraper') and aggregator.selenium_scraper:
        aggregator.selenium_scraper.close()

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    await cleanup_selenium()

if __name__ == "__main__":
    # For development
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )