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
        
        # Supported Adzuna country codes
        self.supported_countries = {
            'austria': 'at', 'australia': 'au', 'belgium': 'be', 'brazil': 'br',
            'canada': 'ca', 'switzerland': 'ch', 'germany': 'de', 'spain': 'es',
            'france': 'fr', 'united kingdom': 'gb', 'uk': 'gb', 'britain': 'gb',
            'india': 'in', 'italy': 'it', 'mexico': 'mx', 'netherlands': 'nl',
            'new zealand': 'nz', 'poland': 'pl', 'singapore': 'sg',
            'united states': 'us', 'usa': 'us', 'america': 'us', 'south africa': 'za'
        }

    def get_country_code(self, location: str) -> str:
        """Convert location string to supported Adzuna country code"""
        if not location:
            return 'us'  # Default to US
        
        location_lower = location.lower().strip()
        
        # Direct country code check
        if location_lower in ['at', 'au', 'be', 'br', 'ca', 'ch', 'de', 'es', 'fr', 'gb', 'in', 'it', 'mx', 'nl', 'nz', 'pl', 'sg', 'us', 'za']:
            return location_lower
        
        # Country name mapping
        for country, code in self.supported_countries.items():
            if country in location_lower:
                return code
        
        # If no match found, default to US
        logger.warning(f"Location '{location}' not recognized. Using 'us' as default.")
        return 'us'

    def search_adzuna_jobs(self, job_title: str, location: str = "us", max_results: int = 20) -> List[Job]:
        """Search jobs using Adzuna API (free tier available)"""
        if not self.adzuna_app_id or not self.adzuna_api_key:
            logger.warning("Adzuna API credentials not found. Get them from: https://developer.adzuna.com/")
            return []
        
        jobs = []
        
        # Get proper country code
        country_code = self.get_country_code(location)
        
        # Construct the correct URL
        base_url = f"https://api.adzuna.com/v1/api/jobs/{country_code}/search/1"
        
        params = {
            'app_id': self.adzuna_app_id,
            'app_key': self.adzuna_api_key,
            'results_per_page': min(max_results, 50),
            'what': job_title,
            'content-type': 'application/json'
        }
        
        # Only add 'where' parameter if we have a specific location within the country
        if location and location.lower() not in self.supported_countries and len(location) > 2:
            params['where'] = location
        
        try:
            logger.info(f"Searching Adzuna in country: {country_code}")
            response = requests.get(base_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            logger.info(f"Adzuna API returned {len(data.get('results', []))} results")
            
            for job_data in data.get('results', []):
                # Handle company data (can be dict or string)
                company_info = job_data.get('company', {})
                if isinstance(company_info, dict):
                    company_name = company_info.get('display_name', 'N/A')
                else:
                    company_name = str(company_info) if company_info else 'N/A'
                
                # Handle location data
                location_info = job_data.get('location', {})
                if isinstance(location_info, dict):
                    location_name = location_info.get('display_name', 'N/A')
                else:
                    location_name = str(location_info) if location_info else 'N/A'
                
                # Handle salary
                salary_str = None
                salary_min = job_data.get('salary_min')
                salary_max = job_data.get('salary_max')
                if salary_min and salary_max:
                    # Determine currency based on country
                    currency_map = {
                        'us': '$', 'ca': 'CAD$', 'gb': '£', 'au': 'AUD$', 
                        'de': '€', 'fr': '€', 'es': '€', 'it': '€', 'nl': '€', 'be': '€',
                        'in': '₹', 'sg': 'SGD$', 'za': 'ZAR'
                    }
                    currency = currency_map.get(country_code, '$')
                    salary_str = f"{currency}{salary_min:,.0f}-{currency}{salary_max:,.0f}"
                elif salary_min:
                    currency = currency_map.get(country_code, '$')
                    salary_str = f"{currency}{salary_min:,.0f}+"
                
                job = Job(
                    title=job_data.get('title', 'N/A'),
                    company=company_name,
                    location=location_name,
                    description=job_data.get('description', 'N/A')[:500] + '...' if len(job_data.get('description', '')) > 500 else job_data.get('description', 'N/A'),
                    apply_link=job_data.get('redirect_url', 'N/A'),
                    source_url=job_data.get('redirect_url', 'N/A'),
                    platform="Adzuna",
                    posted_date=job_data.get('created', 'N/A'),
                    salary=salary_str
                )
                jobs.append(job)
                
        except requests.RequestException as e:
            logger.error(f"Error fetching from Adzuna API: {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_data = e.response.json()
                    logger.error(f"Adzuna API error details: {error_data}")
                except:
                    logger.error(f"Adzuna API response: {e.response.text}")
        except Exception as e:
            logger.error(f"Unexpected error in Adzuna search: {str(e)}")
        
        return jobs

    def search_reed_jobs(self, job_title: str, location: str = "", max_results: int = 20) -> List[Job]:
        """Search jobs using Reed API (UK-focused) with full descriptions"""
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
            logger.info("Searching Reed API...")
            # First get the job listings
            response = requests.get(base_url, params=params, auth=(self.reed_api_key, ''), timeout=10)
            response.raise_for_status()
            data = response.json()
            
            logger.info(f"Reed API returned {len(data.get('results', []))} results")
            
            for job_data in data.get('results', []):
                job_id = job_data.get('jobId')
                full_description = job_data.get('jobDescription', '')
                
                # Try to get full description if it seems truncated
                if job_id and ('...' in full_description or len(full_description) < 500):
                    try:
                        detail_url = f"https://www.reed.co.uk/api/1.0/jobs/{job_id}"
                        detail_response = requests.get(detail_url, auth=(self.reed_api_key, ''), timeout=5)
                        detail_response.raise_for_status()
                        detail_data = detail_response.json()
                        full_description = detail_data.get('jobDescription', full_description)
                    except Exception as e:
                        logger.warning(f"Couldn't fetch full description for job {job_id}: {str(e)}")
                
                # Handle salary
                salary_str = None
                min_sal = job_data.get('minimumSalary')
                max_sal = job_data.get('maximumSalary')
                if min_sal and max_sal and min_sal > 0:
                    salary_str = f"£{min_sal:,.0f}-£{max_sal:,.0f}"
                elif min_sal and min_sal > 0:
                    salary_str = f"£{min_sal:,.0f}+"
                
                job = Job(
                    title=job_data.get('jobTitle', 'N/A'),
                    company=job_data.get('employerName', 'N/A'),
                    location=job_data.get('locationName', 'N/A'),
                    description=full_description[:500] + '...' if len(full_description) > 500 else full_description,
                    apply_link=job_data.get('jobUrl', 'N/A'),
                    source_url=job_data.get('jobUrl', 'N/A'),
                    platform="Reed",
                    posted_date=job_data.get('date', 'N/A'),
                    salary=salary_str,
                    job_type=job_data.get('jobType', 'N/A')
                )
                jobs.append(job)
                
        except requests.RequestException as e:
            logger.error(f"Error fetching from Reed API: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error in Reed search: {str(e)}")
        
        return jobs

    def search_usajobs_gov(self, job_title: str, location: str = "", max_results: int = 20) -> List[Job]:
        """Search government jobs using USAJobs.gov API (no key required)"""
        jobs = []
        base_url = "https://data.usajobs.gov/api/search"
        
        headers = {
            'Host': 'data.usajobs.gov',
            'User-Agent': os.getenv('USAJOBS_EMAIL', 'your-email@example.com'),  # Replace with your email
            "Authorization-Key": os.getenv('USAJOBS_API_KEY', '')  # Optional API key
        }
        
        params = {
            'Keyword': job_title,
            'LocationName': location,
            'ResultsPerPage': min(max_results, 500)
        }
        
        try:
            logger.info("Searching USAJobs.gov...")
            response = requests.get(base_url, headers=headers, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            search_items = data.get('SearchResult', {}).get('SearchResultItems', [])
            logger.info(f"USAJobs API returned {len(search_items)} results")
            
            for job_data in search_items:
                match_job = job_data.get('MatchedObjectDescriptor', {})
                
                # Handle salary information
                salary_str = None
                remuneration = match_job.get('PositionRemuneration', [])
                if remuneration and len(remuneration) > 0:
                    sal_info = remuneration[0]
                    min_range = sal_info.get('MinimumRange')
                    max_range = sal_info.get('MaximumRange')
                    if min_range and max_range:
                        salary_str = f"${min_range:,.0f}-${max_range:,.0f}"
                    elif min_range:
                        salary_str = f"${min_range:,.0f}+"
                
                # Handle apply URI
                apply_uris = match_job.get('ApplyURI', [])
                apply_link = apply_uris[0] if apply_uris else 'N/A'
                
                job = Job(
                    title=match_job.get('PositionTitle', 'N/A'),
                    company=match_job.get('OrganizationName', 'US Government'),
                    location=match_job.get('PositionLocationDisplay', 'N/A'),
                    description=match_job.get('QualificationSummary', 'N/A')[:500] + '...' if len(match_job.get('QualificationSummary', '')) > 500 else match_job.get('QualificationSummary', 'N/A'),
                    apply_link=apply_link,
                    source_url=match_job.get('PositionURI', 'N/A'),
                    platform="USAJobs.gov",
                    posted_date=match_job.get('PublicationStartDate', 'N/A'),
                    salary=salary_str
                )
                jobs.append(job)
                
        except requests.RequestException as e:
            logger.error(f"Error fetching from USAJobs API: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error in USAJobs search: {str(e)}")
        
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
            logger.info("Chrome WebDriver initialized successfully")
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
            logger.info(f"Scraping RemoteOK: {url}")
            self.driver.get(url)
            time.sleep(3)
            
            job_elements = self.driver.find_elements(By.CSS_SELECTOR, "tr.job")[:max_results]
            logger.info(f"Found {len(job_elements)} job elements on RemoteOK")
            
            for job_elem in job_elements:
                try:
                    title_elem = job_elem.find_element(By.CSS_SELECTOR, ".company h2")
                    company_elem = job_elem.find_element(By.CSS_SELECTOR, ".company h3")
                    location_elem = job_elem.find_elements(By.CSS_SELECTOR, ".location")
                    salary_elem = job_elem.find_elements(By.CSS_SELECTOR, ".salary")
                    
                    job_link = job_elem.find_element(By.CSS_SELECTOR, "a").get_attribute("href")
                    
                    job = Job(
                        title=title_elem.text.strip() if title_elem else "N/A",
                        company=company_elem.text.strip() if company_elem else "N/A",
                        location=location_elem[0].text.strip() if location_elem else "Remote",
                        description=f"Remote {job_title} position",
                        apply_link=job_link if job_link else "N/A",
                        source_url=job_link if job_link else "N/A",
                        platform="RemoteOK",
                        salary=salary_elem[0].text.strip() if salary_elem else None
                    )
                    jobs.append(job)
                    
                except NoSuchElementException:
                    continue
                except Exception as e:
                    logger.warning(f"Error parsing RemoteOK job element: {str(e)}")
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
            logger.info(f"Scraping WeWorkRemotely: {url}")
            self.driver.get(url)
            time.sleep(3)
            
            job_elements = self.driver.find_elements(By.CSS_SELECTOR, ".jobs li")[:max_results]
            logger.info(f"Found {len(job_elements)} job elements on WeWorkRemotely")
            
            for job_elem in job_elements:
                try:
                    title_elem = job_elem.find_element(By.CSS_SELECTOR, ".title")
                    company_elem = job_elem.find_element(By.CSS_SELECTOR, ".company")
                    
                    job_link_elem = job_elem.find_element(By.CSS_SELECTOR, "a")
                    job_link = job_link_elem.get_attribute("href")
                    if job_link and not job_link.startswith("http"):
                        job_link = "https://weworkremotely.com" + job_link
                    
                    if job_title.lower() in title_elem.text.lower():
                        job = Job(
                            title=title_elem.text.strip(),
                            company=company_elem.text.strip(),
                            location="Remote",
                            description=f"Remote position from WeWorkRemotely",
                            apply_link=job_link if job_link else "N/A",
                            source_url=job_link if job_link else "N/A",
                            platform="WeWorkRemotely"
                        )
                        jobs.append(job)
                        
                except NoSuchElementException:
                    continue
                except Exception as e:
                    logger.warning(f"Error parsing WeWorkRemotely job element: {str(e)}")
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
        
        print(f"🔍 Searching for '{job_title}' jobs...")
        if location:
            print(f"📍 Location: {location}")
        
        # API-based searches (more reliable)
        print("1️⃣ Searching Adzuna...")
        try:
            adzuna_jobs = self.api_scraper.search_adzuna_jobs(job_title, location, max_results_per_source)
            all_jobs.extend(adzuna_jobs)
            print(f"   ✅ Found: {len(adzuna_jobs)} jobs")
        except Exception as e:
            print(f"   ❌ Adzuna search failed: {str(e)}")
        
        print("2️⃣ Searching Reed (UK)...")
        try:
            reed_jobs = self.api_scraper.search_reed_jobs(job_title, location, max_results_per_source)
            all_jobs.extend(reed_jobs)
            print(f"   ✅ Found: {len(reed_jobs)} jobs")
        except Exception as e:
            print(f"   ❌ Reed search failed: {str(e)}")
        
        print("3️⃣ Searching USAJobs.gov...")
        try:
            usa_jobs = self.api_scraper.search_usajobs_gov(job_title, location, max_results_per_source)
            all_jobs.extend(usa_jobs)
            print(f"   ✅ Found: {len(usa_jobs)} jobs")
        except Exception as e:
            print(f"   ❌ USAJobs search failed: {str(e)}")
        
        # Selenium-based searches (if enabled)
        if use_selenium:
            print("4️⃣ Setting up browser automation...")
            try:
                self.selenium_scraper = JobScraperSelenium()
                
                if self.selenium_scraper.driver:
                    print("5️⃣ Searching RemoteOK...")
                    remote_jobs = self.selenium_scraper.scrape_remoteok(job_title, max_results_per_source)
                    all_jobs.extend(remote_jobs)
                    print(f"   ✅ Found: {len(remote_jobs)} jobs")
                    
                    print("6️⃣ Searching WeWorkRemotely...")
                    wwr_jobs = self.selenium_scraper.scrape_weworkremotely(job_title, max_results_per_source)
                    all_jobs.extend(wwr_jobs)
                    print(f"   ✅ Found: {len(wwr_jobs)} jobs")
                    
                    self.selenium_scraper.close()
                else:
                    print("   ❌ Browser automation setup failed")
            except Exception as e:
                print(f"   ❌ Browser automation failed: {str(e)}")
        
        self.all_jobs = all_jobs
        return all_jobs

    def remove_duplicates(self, jobs: List[Job]) -> List[Job]:
        """Remove duplicate jobs based on title and company"""
        seen = set()
        unique_jobs = []
        
        for job in jobs:
            # Create a more sophisticated key for duplicate detection
            key = (
                job.title.lower().strip(),
                job.company.lower().strip(),
                job.location.lower().strip()
            )
            if key not in seen:
                seen.add(key)
                unique_jobs.append(job)
        
        return unique_jobs

    def print_jobs(self, jobs: List[Job]):
        """Print jobs in a formatted way"""
        if not jobs:
            print("❌ No jobs found!")
            return
        
        print(f"\n{'='*80}")
        print(f"🎯 FOUND {len(jobs)} JOB OPPORTUNITIES")
        print(f"{'='*80}\n")
        
        for i, job in enumerate(jobs, 1):
            print(f"📋 Job #{i}")
            print(f"{'─'*60}")
            print(f"📌 Title: {job.title}")
            print(f"🏢 Company: {job.company}")
            print(f"📍 Location: {job.location}")
            print(f"🔗 Platform: {job.platform}")
            if job.salary:
                print(f"💰 Salary: {job.salary}")
            if job.posted_date and job.posted_date != 'N/A':
                print(f"📅 Posted: {job.posted_date}")
            if job.job_type and job.job_type != 'N/A':
                print(f"📋 Type: {job.job_type}")
            print(f"🔗 Apply: {job.apply_link}")
            print(f"📝 Description: {job.description[:200]}{'...' if len(job.description) > 200 else ''}")
            print(f"{'─'*60}\n")

    def save_to_json(self, jobs: List[Job], filename: str = "jobs.json"):
        """Save jobs to JSON file"""
        jobs_dict = [asdict(job) for job in jobs]
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(jobs_dict, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Saved {len(jobs)} jobs to {filename}")

    def save_to_csv(self, jobs: List[Job], filename: str = "jobs.csv"):
        """Save jobs to CSV file"""
        import csv
        
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            if jobs:
                writer = csv.DictWriter(f, fieldnames=asdict(jobs[0]).keys())
                writer.writeheader()
                for job in jobs:
                    writer.writerow(asdict(job))
        
        print(f"💾 Saved {len(jobs)} jobs to {filename}")

def setup_api_keys():
    """Helper function to set up API keys"""
    print("🔑 To use this job scraper effectively, you'll need API keys:")
    print("\n1️⃣ Adzuna API (Free tier available):")
    print("   - Visit: https://developer.adzuna.com/")
    print("   - Sign up and get APP_ID and API_KEY")
    print("   - Set environment variables: ADZUNA_APP_ID and ADZUNA_API_KEY")
    
    print("\n2️⃣ Reed API (UK jobs, free):")
    print("   - Visit: https://www.reed.co.uk/developers")
    print("   - Sign up and get API key")
    print("   - Set environment variable: REED_API_KEY")
    
    print("\n3️⃣ Create a .env file in your project directory:")
    print("ADZUNA_APP_ID=your_app_id")
    print("ADZUNA_API_KEY=your_api_key")
    print("REED_API_KEY=your_reed_key")
    print("USAJOBS_EMAIL=your_email@example.com")
    
    print("\n4️⃣ Install required packages:")
    print("pip install requests python-dotenv selenium")
    print("For Selenium: Download ChromeDriver from https://chromedriver.chromium.org/")
    
    print("\n📊 Supported Adzuna Countries:")
    countries = ['Austria (at)', 'Australia (au)', 'Belgium (be)', 'Brazil (br)',
                'Canada (ca)', 'Switzerland (ch)', 'Germany (de)', 'Spain (es)',
                'France (fr)', 'United Kingdom (gb)', 'India (in)', 'Italy (it)',
                'Mexico (mx)', 'Netherlands (nl)', 'New Zealand (nz)', 'Poland (pl)',
                'Singapore (sg)', 'United States (us)', 'South Africa (za)']
    for country in countries:
        print(f"   • {country}")

def main():
    """Main function"""
    aggregator = JobAggregator()
    
    # Check if API keys are available
    has_adzuna = bool(os.getenv('ADZUNA_APP_ID') and os.getenv('ADZUNA_API_KEY'))
    has_reed = bool(os.getenv('REED_API_KEY'))
    
    if not has_adzuna and not has_reed:
        print("⚠️  No API keys found!")
        setup_api_keys()
        print("\n🚀 You can still search USAJobs.gov and some remote job sites without API keys.")
        print("Continue? (y/n): ", end="")
        if input().lower() != 'y':
            return
    else:
        print("✅ API keys detected:")
        if has_adzuna:
            print("   • Adzuna API configured")
        if has_reed:
            print("   • Reed API configured")
    
    # Get user input
    job_title = input("\n🔍 Enter job title/keywords: ").strip()
    if not job_title:
        print("❌ Job title is required!")
        return
    
    location = input("📍 Enter location (optional, e.g., 'us', 'uk', 'canada', 'new york'): ").strip()
    
    use_selenium = input("🤖 Use browser automation for additional sources? (y/n): ").strip().lower() == 'y'
    if use_selenium:
        print("ℹ️  Note: Browser automation requires ChromeDriver to be installed.")
    
    save_format = input("💾 Save results? (json/csv/both/n): ").strip().lower()
    
    # Search for jobs
    print(f"\n🚀 Starting job search...")
    jobs = aggregator.search_all_sources(job_title, location, use_selenium)
    
    if not jobs:
        print("❌ No jobs found from any source. Try different keywords or check your API keys.")
        return
    
    # Remove duplicates
    unique_jobs = aggregator.remove_duplicates(jobs)
    duplicates_removed = len(jobs) - len(unique_jobs)
    if duplicates_removed > 0:
        print(f"🔧 Removed {duplicates_removed} duplicate jobs")
    
    print(f"\n✨ Final results: {len(unique_jobs)} unique job opportunities")
    
    # Display results
    aggregator.print_jobs(unique_jobs)
    
    # Save results if requested
    if save_format in ['json', 'both']:
        filename = input("📁 Enter JSON filename (default: jobs.json): ").strip() or "jobs.json"
        if not filename.endswith('.json'):
            filename += '.json'
        aggregator.save_to_json(unique_jobs, filename)
    
    if save_format in ['csv', 'both']:
        filename = input("📁 Enter CSV filename (default: jobs.csv): ").strip() or "jobs.csv"
        if not filename.endswith('.csv'):
            filename += '.csv'
        aggregator.save_to_csv(unique_jobs, filename)
    
    print(f"\n🎉 Job search completed! Found {len(unique_jobs)} opportunities.")

if __name__ == "__main__":
    main()