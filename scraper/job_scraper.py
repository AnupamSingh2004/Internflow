import requests
import json
import time
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class Job:
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

class JobScraperAPI:
    """Job scraper using official APIs and RSS feeds"""
    
    def __init__(self):
        # API keys (get these from respective platforms)
        self.adzuna_app_id = os.getenv('ADZUNA_APP_ID')
        self.adzuna_api_key = os.getenv('ADZUNA_API_KEY')
        self.reed_api_key = os.getenv('REED_API_KEY')
        self.jobs = []

    def search_adzuna_jobs(self, job_title: str, location: str = "us", max_results: int = 20) -> List[Job]:
        """Search jobs using Adzuna API (free tier available)"""
        if not self.adzuna_app_id or not self.adzuna_api_key:
            logger.warning("Adzuna API credentials not found. Get them from: https://developer.adzuna.com/")
            return []
        
        jobs = []
        base_url = "https://api.adzuna.com/v1/api/jobs"
        
        params = {
            'app_id': self.adzuna_app_id,
            'app_key': self.adzuna_api_key,
            'results_per_page': min(max_results, 50),
            'what': job_title,
            'where': location,
            'content-type': 'application/json'
        }
        
        try:
            response = requests.get(f"{base_url}/{location}/search/1", params=params)
            response.raise_for_status()
            data = response.json()
            
            for job_data in data.get('results', []):
                job = Job(
                    title=job_data.get('title', 'N/A'),
                    company=job_data.get('company', {}).get('display_name', 'N/A'),
                    location=job_data.get('location', {}).get('display_name', 'N/A'),
                    description=job_data.get('description', 'N/A')[:500] + "...",
                    apply_link=job_data.get('redirect_url', 'N/A'),
                    source_url=job_data.get('redirect_url', 'N/A'),
                    platform="Adzuna",
                    posted_date=job_data.get('created', 'N/A'),
                    salary=f"${job_data.get('salary_min', 0)}-${job_data.get('salary_max', 0)}" if job_data.get('salary_min') else None
                )
                jobs.append(job)
                
        except requests.RequestException as e:
            logger.error(f"Error fetching from Adzuna API: {str(e)}")
        
        return jobs

    def search_reed_jobs(self, job_title: str, location: str = "", max_results: int = 20) -> List[Job]:
        """Search jobs using Reed API (UK-focused)"""
        if not self.reed_api_key:
            logger.warning("Reed API key not found. Get it from: https://www.reed.co.uk/developers")
            return []
        
        jobs = []
        base_url = "https://www.reed.co.uk/api/1.0/search"
        
        params = {
            'keywords': job_title,
            'locationName': location,
            'resultsToTake': min(max_results, 100)
        }
        
        try:
            response = requests.get(base_url, params=params, auth=(self.reed_api_key, ''))
            response.raise_for_status()
            data = response.json()
            
            for job_data in data.get('results', []):
                job = Job(
                    title=job_data.get('jobTitle', 'N/A'),
                    company=job_data.get('employerName', 'N/A'),
                    location=job_data.get('locationName', 'N/A'),
                    description=job_data.get('jobDescription', 'N/A')[:500] + "...",
                    apply_link=job_data.get('jobUrl', 'N/A'),
                    source_url=job_data.get('jobUrl', 'N/A'),
                    platform="Reed",
                    posted_date=job_data.get('date', 'N/A'),
                    salary=f"£{job_data.get('minimumSalary', 0)}-£{job_data.get('maximumSalary', 0)}" if job_data.get('minimumSalary') else None,
                    job_type=job_data.get('jobType', 'N/A')
                )
                jobs.append(job)
                
        except requests.RequestException as e:
            logger.error(f"Error fetching from Reed API: {str(e)}")
        
        return jobs

    def search_usajobs_gov(self, job_title: str, location: str = "", max_results: int = 20) -> List[Job]:
        """Search government jobs using USAJobs.gov API (no key required)"""
        jobs = []
        base_url = "https://data.usajobs.gov/api/search"
        
        headers = {
            'Host': 'data.usajobs.gov',
            'User-Agent': os.getenv('USAJOBS_EMAIL', 'divanshu0212@gmail.com'),  # Replace with your email
            "Authorization-Key": os.getenv('authkey')  
        }
        
        params = {
            'Keyword': job_title,
            'LocationName': location,
            'ResultsPerPage': min(max_results, 500)
        }
        
        try:
            response = requests.get(base_url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            
            for job_data in data.get('SearchResult', {}).get('SearchResultItems', []):
                match_job = job_data.get('MatchedObjectDescriptor', {})
                
                job = Job(
                    title=match_job.get('PositionTitle', 'N/A'),
                    company=match_job.get('OrganizationName', 'US Government'),
                    location=f"{match_job.get('PositionLocationDisplay', 'N/A')}",
                    description=match_job.get('QualificationSummary', 'N/A')[:500] + "...",
                    apply_link=match_job.get('ApplyURI', ['N/A'])[0] if match_job.get('ApplyURI') else 'N/A',
                    source_url=match_job.get('PositionURI', 'N/A'),
                    platform="USAJobs.gov",
                    posted_date=match_job.get('PublicationStartDate', 'N/A'),
                    salary=f"${match_job.get('PositionRemuneration', [{}])[0].get('MinimumRange', 'N/A')}-${match_job.get('PositionRemuneration', [{}])[0].get('MaximumRange', 'N/A')}" if match_job.get('PositionRemuneration') else None
                )
                jobs.append(job)
                
        except requests.RequestException as e:
            logger.error(f"Error fetching from USAJobs API: {str(e)}")
        
        return jobs

class JobScraperSelenium:
    """Job scraper using Selenium WebDriver for JavaScript-heavy sites"""
    
    def __init__(self, headless: bool = True):
        self.headless = headless
        self.driver = None
        self.setup_driver()

    def setup_driver(self):
        """Setup Chrome WebDriver with anti-detection measures"""
        chrome_options = Options()
        
        if self.headless:
            chrome_options.add_argument("--headless")
        
        # Anti-detection measures
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        except Exception as e:
            logger.error(f"Error setting up Chrome driver: {str(e)}")
            logger.info("Make sure ChromeDriver is installed: https://chromedriver.chromium.org/")

    def scrape_remoteok(self, job_title: str, max_results: int = 20) -> List[Job]:
        """Scrape RemoteOK.io (allows scraping)"""
        if not self.driver:
            return []
        
        jobs = []
        url = f"https://remoteok.io/remote-{job_title.replace(' ', '-')}-jobs"
        
        try:
            self.driver.get(url)
            time.sleep(3)
            
            job_elements = self.driver.find_elements(By.CSS_SELECTOR, "tr.job")[:max_results]
            
            for job_elem in job_elements:
                try:
                    title_elem = job_elem.find_element(By.CSS_SELECTOR, ".company h2")
                    company_elem = job_elem.find_element(By.CSS_SELECTOR, ".company h3")
                    location_elem = job_elem.find_element(By.CSS_SELECTOR, ".location")
                    salary_elem = job_elem.find_elements(By.CSS_SELECTOR, ".salary")
                    
                    job_link = job_elem.find_element(By.CSS_SELECTOR, "a").get_attribute("href")
                    
                    job = Job(
                        title=title_elem.text.strip() if title_elem else "N/A",
                        company=company_elem.text.strip() if company_elem else "N/A",
                        location=location_elem.text.strip() if location_elem else "Remote",
                        description=f"Remote {job_title} position",
                        apply_link=job_link,
                        source_url=job_link,
                        platform="RemoteOK",
                        salary=salary_elem[0].text.strip() if salary_elem else None
                    )
                    jobs.append(job)
                    
                except NoSuchElementException:
                    continue
                    
        except Exception as e:
            logger.error(f"Error scraping RemoteOK: {str(e)}")
        
        return jobs

    def scrape_weworkremotely(self, job_title: str, max_results: int = 20) -> List[Job]:
        """Scrape WeWorkRemotely.com"""
        if not self.driver:
            return []
        
        jobs = []
        url = "https://weworkremotely.com/categories/remote-programming-jobs"
        
        try:
            self.driver.get(url)
            time.sleep(3)
            
            job_elements = self.driver.find_elements(By.CSS_SELECTOR, ".jobs li")[:max_results]
            
            for job_elem in job_elements:
                try:
                    title_elem = job_elem.find_element(By.CSS_SELECTOR, ".title")
                    company_elem = job_elem.find_element(By.CSS_SELECTOR, ".company")
                    
                    job_link_elem = job_elem.find_element(By.CSS_SELECTOR, "a")
                    job_link = "https://weworkremotely.com" + job_link_elem.get_attribute("href")
                    
                    if job_title.lower() in title_elem.text.lower():
                        job = Job(
                            title=title_elem.text.strip(),
                            company=company_elem.text.strip(),
                            location="Remote",
                            description=f"Remote position from WeWorkRemotely",
                            apply_link=job_link,
                            source_url=job_link,
                            platform="WeWorkRemotely"
                        )
                        jobs.append(job)
                        
                except NoSuchElementException:
                    continue
                    
        except Exception as e:
            logger.error(f"Error scraping WeWorkRemotely: {str(e)}")
        
        return jobs

    def close(self):
        """Close the WebDriver"""
        if self.driver:
            self.driver.quit()

class JobAggregator:
    """Main class to aggregate jobs from multiple sources"""
    
    def __init__(self):
        self.api_scraper = JobScraperAPI()
        self.selenium_scraper = None
        self.all_jobs = []

    def search_all_sources(self, job_title: str, location: str = "", use_selenium: bool = False, max_results_per_source: int = 20) -> List[Job]:
        """Search jobs from all available sources"""
        all_jobs = []
        
        print(f"Searching for '{job_title}' jobs...")
        
        # API-based searches (more reliable)
        print("1. Searching Adzuna...")
        adzuna_jobs = self.api_scraper.search_adzuna_jobs(job_title, location, max_results_per_source)
        all_jobs.extend(adzuna_jobs)
        print(f"   Found: {len(adzuna_jobs)} jobs")
        
        print("2. Searching Reed (UK)...")
        reed_jobs = self.api_scraper.search_reed_jobs(job_title, location, max_results_per_source)
        all_jobs.extend(reed_jobs)
        print(f"   Found: {len(reed_jobs)} jobs")
        
        print("3. Searching USAJobs.gov...")
        usa_jobs = self.api_scraper.search_usajobs_gov(job_title, location, max_results_per_source)
        all_jobs.extend(usa_jobs)
        print(f"   Found: {len(usa_jobs)} jobs")
        
        # Selenium-based searches (if enabled)
        if use_selenium:
            print("4. Setting up browser automation...")
            self.selenium_scraper = JobScraperSelenium()
            
            if self.selenium_scraper.driver:
                print("5. Searching RemoteOK...")
                remote_jobs = self.selenium_scraper.scrape_remoteok(job_title, max_results_per_source)
                all_jobs.extend(remote_jobs)
                print(f"   Found: {len(remote_jobs)} jobs")
                
                print("6. Searching WeWorkRemotely...")
                wwr_jobs = self.selenium_scraper.scrape_weworkremotely(job_title, max_results_per_source)
                all_jobs.extend(wwr_jobs)
                print(f"   Found: {len(wwr_jobs)} jobs")
                
                self.selenium_scraper.close()
        
        self.all_jobs = all_jobs
        return all_jobs

    def remove_duplicates(self, jobs: List[Job]) -> List[Job]:
        """Remove duplicate jobs based on title and company"""
        seen = set()
        unique_jobs = []
        
        for job in jobs:
            key = (job.title.lower(), job.company.lower())
            if key not in seen:
                seen.add(key)
                unique_jobs.append(job)
        
        return unique_jobs

    def print_jobs(self, jobs: List[Job]):
        """Print jobs in a formatted way"""
        if not jobs:
            print("No jobs found!")
            return
        
        print(f"\n{'='*80}")
        print(f"FOUND {len(jobs)} JOB OPPORTUNITIES")
        print(f"{'='*80}\n")
        
        for i, job in enumerate(jobs, 1):
            print(f"Job #{i}")
            print(f"{'─'*50}")
            print(f"Title: {job.title}")
            print(f"Company: {job.company}")
            print(f"Location: {job.location}")
            print(f"Platform: {job.platform}")
            print(f"Apply Link: {job.apply_link}")
            if job.salary:
                print(f"Salary: {job.salary}")
            if job.posted_date:
                print(f"Posted: {job.posted_date}")
            print(f"Description: {job.description[:200]}...")
            print(f"{'─'*50}\n")

    def save_to_json(self, jobs: List[Job], filename: str = "jobs.json"):
        """Save jobs to JSON file"""
        jobs_dict = [asdict(job) for job in jobs]
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(jobs_dict, f, indent=2, ensure_ascii=False)
        
        print(f"Saved {len(jobs)} jobs to {filename}")

def setup_api_keys():
    """Helper function to set up API keys"""
    print("To use this job scraper effectively, you'll need API keys:")
    print("\n1. Adzuna API (Free tier available):")
    print("   - Visit: https://developer.adzuna.com/")
    print("   - Sign up and get APP_ID and API_KEY")
    print("   - Set environment variables: ADZUNA_APP_ID and ADZUNA_API_KEY")
    
    print("\n2. Reed API (UK jobs, free):")
    print("   - Visit: https://www.reed.co.uk/developers")
    print("   - Sign up and get API key")
    print("   - Set environment variable: REED_API_KEY")
    
    print("\n3. Create a .env file in your project directory:")
    print("ADZUNA_APP_ID=your_app_id")
    print("ADZUNA_API_KEY=your_api_key")
    print("REED_API_KEY=your_reed_key")
    
    print("\n4. Install required packages:")
    print("pip install requests python-dotenv selenium")
    print("For Selenium: Download ChromeDriver from https://chromedriver.chromium.org/")

def main():
    """Main function"""
    aggregator = JobAggregator()
    
    # Check if API keys are available
    if not any([os.getenv('ADZUNA_APP_ID'), os.getenv('REED_API_KEY')]):
        print("⚠️  No API keys found!")
        setup_api_keys()
        print("\nYou can still search USAJobs.gov and some remote job sites without API keys.")
        print("Continue? (y/n): ", end="")
        if input().lower() != 'y':
            return
    
    # Get user input
    job_title = input("Enter job title/keywords: ").strip()
    location = input("Enter location (optional): ").strip()
    
    use_selenium = input("Use browser automation for additional sources? (y/n): ").strip().lower() == 'y'
    if use_selenium:
        print("Note: Browser automation requires ChromeDriver to be installed.")
    
    save_json = input("Save results to JSON file? (y/n): ").strip().lower() == 'y'
    
    # Search for jobs
    jobs = aggregator.search_all_sources(job_title, location, use_selenium)
    
    # Remove duplicates
    unique_jobs = aggregator.remove_duplicates(jobs)
    print(f"\nAfter removing duplicates: {len(unique_jobs)} unique jobs")
    
    # Display results
    aggregator.print_jobs(unique_jobs)
    
    # Save to JSON if requested
    if save_json:
        filename = input("Enter filename (default: jobs.json): ").strip() or "jobs.json"
        if not filename.endswith('.json'):
            filename += '.json'
        aggregator.save_to_json(unique_jobs, filename)

if __name__ == "__main__":
    main()