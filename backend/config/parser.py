import spacy
import re
import fitz  # PyMuPDF
import docx
from datetime import datetime
from typing import Dict, List, Any, Optional

# Load the spaCy model
try:
    nlp = spacy.load("en_core_web_lg")
except OSError:
    nlp = spacy.load("en_core_web_sm")

# Enhanced regex patterns
EMAIL_REGEX = r"[\w\.-]+@[\w\.-]+\.\w+"
PHONE_REGEX = r"(?:\+91[-.\s]?)?[6-9]\d{9}|(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}"
GITHUB_REGEX = r"github\.com/[\w\-\.]+"
LINKEDIN_REGEX = r"linkedin\.com/[\w\-/]+"
CODECHEF_REGEX = r"codechef\.com/users/[\w\-]+"
CODEFORCES_REGEX = r"codeforces\.com/profile/[\w\-]+"
LEETCODE_REGEX = r"leetcode\.com/u?/[\w\-]+/?[^/]*"
GPA_REGEX = r"(?:gpa|cgpa)[\s:]*(\d\.\d{1,2})"
PERCENTAGE_REGEX = r"percentage[\s:]*(\d+\.?\d*)"
YEAR_REGEX = r"\b(19|20)\d{2}\b"
MONTH_YEAR_REGEX = r"(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{4})"

def extract_text_from_pdf(pdf_file):
    """Extract text from PDF file"""
    doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text() + "\n"
    doc.close()
    return text

def extract_text_from_docx(docx_file):
    """Extract text from DOCX file"""
    doc = docx.Document(docx_file)
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

def clean_text(text):
    """Clean and normalize text"""
    # Remove extra whitespace and normalize
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_name(text):
    """Extract name - usually the first line or prominent text"""
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    # First try: look for name in first few lines
    for i, line in enumerate(lines[:3]):
        # Skip lines with contact info, education keywords, etc.
        if any(keyword in line.lower() for keyword in 
               ['mobile:', 'email:', 'phone:', 'education', 'experience', 'skills', '@', 'github', 'linkedin']):
            continue
        
        # Check if line looks like a name (2-4 words, mostly alphabetic)
        words = line.split()
        if 2 <= len(words) <= 4 and all(word.replace('.', '').isalpha() for word in words):
            return line
    
    # Fallback: use NER
    doc = nlp(text)
    for ent in doc.ents:
        if ent.label_ == "PERSON" and len(ent.text.split()) >= 2:
            return ent.text.strip()
    
    return None

def extract_contact_info(text):
    """Extract comprehensive contact information"""
    contact_info = {}
    
    # Email
    email_match = re.search(EMAIL_REGEX, text, re.IGNORECASE)
    contact_info['email'] = email_match.group(0) if email_match else ""
    
    # Phone
    phone_match = re.search(PHONE_REGEX, text)
    contact_info['phone'] = phone_match.group(0) if phone_match else ""
    
    # GitHub
    github_match = re.search(GITHUB_REGEX, text, re.IGNORECASE)
    contact_info['github'] = github_match.group(0) if github_match else ""
    
    # LinkedIn
    linkedin_match = re.search(LINKEDIN_REGEX, text, re.IGNORECASE)
    contact_info['linkedin'] = linkedin_match.group(0) if linkedin_match else ""
    
    # Coding profiles
    codechef_match = re.search(CODECHEF_REGEX, text, re.IGNORECASE)
    contact_info['codechef'] = codechef_match.group(0) if codechef_match else ""
    
    codeforces_match = re.search(CODEFORCES_REGEX, text, re.IGNORECASE)
    contact_info['codeforces'] = codeforces_match.group(0) if codeforces_match else ""
    
    leetcode_match = re.search(LEETCODE_REGEX, text, re.IGNORECASE)
    contact_info['leetcode'] = leetcode_match.group(0) if leetcode_match else ""
    
    return contact_info

def extract_section_content(text, section_name):
    """Extract content between section headers"""
    lines = text.split('\n')
    section_content = []
    capturing = False
    
    # Common section headers that would end the current section
    section_endings = ['education', 'experience', 'skills', 'projects', 'achievements', 'certifications', 'awards']
    
    for line in lines:
        line_lower = line.lower().strip()
        
        # Check if we've hit the target section
        if section_name.lower() in line_lower and len(line.strip()) < 50:  # Likely a header
            capturing = True
            continue
        
        # Check if we've hit another section (stop capturing)
        if capturing and any(ending in line_lower for ending in section_endings if ending != section_name.lower()) and len(line.strip()) < 50:
            break
        
        # Capture content
        if capturing and line.strip():
            section_content.append(line.strip())
    
    return '\n'.join(section_content)

def extract_skills(text):
    """Extract skills from Skills Summary section"""
    skills_section = extract_section_content(text, 'skills')
    if not skills_section:
        # Fallback: look for skills in full text
        skills_section = text
    
    skills_dict = {}
    
    # Look for categorized skills (Languages:, Frameworks:, etc.)
    categories = ['languages', 'frameworks', 'tools', 'platforms', 'databases', 'soft skills']
    
    for category in categories:
        pattern = rf"{category}[\s:]+([^\n•]+)"
        match = re.search(pattern, skills_section, re.IGNORECASE)
        
        if match:
            skills_text = match.group(1)
            # Split by commas and clean
            skills_list = [skill.strip() for skill in skills_text.split(',') if skill.strip()]
            skills_dict[category.title()] = skills_list
    
    # Flatten all skills for compatibility
    all_skills = []
    for category_skills in skills_dict.values():
        all_skills.extend(category_skills)
    
    return {
        'categorized': skills_dict,
        'all_skills': all_skills
    }

def extract_education(text):
    """Extract education information with detailed parsing"""
    education_section = extract_section_content(text, 'education')
    if not education_section:
        return []
    
    education_entries = []
    
    # Split by bullet points or institutions
    lines = [line.strip() for line in education_section.split('\n') if line.strip()]
    
    current_entry = {}
    for line in lines:
        line = line.lstrip('•').strip()
        
        # Check if this is an institution line (usually longer and contains place)
        if any(word in line.lower() for word in ['university', 'institute', 'college', 'school']) and ',' in line:
            # Save previous entry if exists
            if current_entry:
                education_entries.append(current_entry)
            
            # Start new entry
            parts = line.split(',')
            current_entry = {
                'institution': parts[0].strip(),
                'location': parts[1].strip() if len(parts) > 1 else '',
                'degree': '',
                'gpa': '',
                'percentage': '',
                'startYear': '',
                'endYear': ''
            }
        
        elif current_entry:  # We're in an education entry
            # Look for degree information
            degree_keywords = ['bachelor', 'master', 'phd', 'b.tech', 'm.tech', 'class', 'cbse']
            if any(keyword in line.lower() for keyword in degree_keywords):
                current_entry['degree'] = line
            
            # Extract percentage
            percentage_match = re.search(PERCENTAGE_REGEX, line, re.IGNORECASE)
            if percentage_match:
                current_entry['percentage'] = percentage_match.group(1)
            
            # Extract GPA
            gpa_match = re.search(GPA_REGEX, line, re.IGNORECASE)
            if gpa_match:
                current_entry['gpa'] = gpa_match.group(1)
            
            # Extract years
            years = re.findall(r'\b(19|20)\d{2}\b', line)
            if years:
                if len(years) >= 2:
                    current_entry['startYear'] = years[0]
                    current_entry['endYear'] = years[-1]
                elif not current_entry.get('startYear'):
                    current_entry['startYear'] = years[0]
    
    # Add the last entry
    if current_entry:
        education_entries.append(current_entry)
    
    return education_entries

def extract_projects(text):
    """Extract project information with detailed parsing"""
    projects_section = extract_section_content(text, 'projects')
    if not projects_section:
        return []
    
    projects = []
    lines = [line.strip() for line in projects_section.split('\n') if line.strip()]
    
    current_project = {}
    description_lines = []
    
    for line in lines:
        line = line.lstrip('•◦').strip()
        
        # Check if this is a project title (short line, no URL, not a description)
        if (len(line.split()) <= 5 and 
            'http' not in line.lower() and 
            not line.startswith(tuple('ABCDEFGHIJKLMNOPQRSTUVWXYZ')) and
            not any(word in line.lower() for word in ['developed', 'implemented', 'built', 'created', 'designed'])):
            
            # Save previous project
            if current_project:
                current_project['description'] = ' '.join(description_lines)
                projects.append(current_project)
                description_lines = []
            
            # Start new project
            current_project = {
                'name': line,
                'url': '',
                'technologies': [],
                'description': ''
            }
        
        elif current_project:
            # Look for GitHub URL
            github_match = re.search(r'https://github\.com/[\w\-\./]+', line)
            if github_match:
                current_project['url'] = github_match.group(0)
            
            # Extract technologies (look for common tech terms)
            tech_pattern = r'\b(?:React|Node\.js|Express|MongoDB|Python|JavaScript|TypeScript|TensorFlow|Keras|Docker|AWS|GCP|MySQL|PostgreSQL|Redis|Flask|Django|Vue|Angular|Next\.js|Tailwind|Bootstrap|Git|Docker|Kubernetes|MERN|MEAN|API|REST|GraphQL|JWT|OAuth|HTML|CSS|SASS|LESS|Webpack|Babel|npm|yarn|pip|conda|Linux|Windows|macOS|Android|iOS|Swift|Kotlin|Java|C\+\+|C#|PHP|Ruby|Go|Rust|Scala|R|MATLAB|Jupyter|Pandas|NumPy|Matplotlib|Plotly|Scikit-learn|OpenCV|PIL|BeautifulSoup|Selenium|Scrapy|FastAPI|Streamlit|Gradio|Heroku|Netlify|Vercel|Firebase|Supabase)\b'
            
            technologies = re.findall(tech_pattern, line, re.IGNORECASE)
            if technologies:
                current_project['technologies'].extend([tech.title() for tech in technologies])
            
            # Add to description
            description_lines.append(line)
    
    # Add the last project
    if current_project:
        current_project['description'] = ' '.join(description_lines)
        projects.append(current_project)
    
    # Clean up projects
    for project in projects:
        project['technologies'] = list(set(project['technologies']))  # Remove duplicates
    
    return projects

def extract_achievements(text):
    """Extract achievements and accomplishments"""
    achievements_section = extract_section_content(text, 'achievements')
    if not achievements_section:
        return []
    
    achievements = []
    lines = [line.strip() for line in achievements_section.split('\n') if line.strip()]
    
    for line in lines:
        line = line.lstrip('•').strip()
        if line:
            # Try to extract title and description
            if ':' in line:
                parts = line.split(':', 1)
                achievements.append({
                    'title': parts[0].strip(),
                    'description': parts[1].strip()
                })
            else:
                achievements.append({
                    'title': line,
                    'description': ''
                })
    
    return achievements

def extract_coding_profiles_stats(text):
    """Extract coding profile statistics"""
    stats = {}
    
    # Look for problem counts
    problem_patterns = [
        r'(\d+)\s+(?:data structure|problems?|challenges?)',
        r'solved?\s+(?:over\s+)?(\d+)',
        r'(\d+)\s+(?:on\s+)?(?:leetcode|codechef|codeforces)'
    ]
    
    for pattern in problem_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            stats['problems_solved'] = max([int(match) for match in matches])
            break
    
    # Look for ratings or ranks
    rating_patterns = [
        r'rating\s+(?:by\s+)?(\d+)',
        r'rank\s+(?:of\s+)?(\d+)',
        r'percentile\s+(?:of\s+)?(\d+\.?\d*)'
    ]
    
    for pattern in rating_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            stats['rating_info'] = match.group(0)
            break
    
    return stats

def parse_resume(file):
    """Main parsing function"""
    # Extract text
    file_extension = file.name.split('.')[-1].lower()
    if file_extension == 'pdf':
        text = extract_text_from_pdf(file)
    elif file_extension in ['docx', 'doc']:
        text = extract_text_from_docx(file)
    else:
        raise ValueError(f"Unsupported file type: {file_extension}")
    
    text = clean_text(text)
    
    # Extract all information
    name = extract_name(text)
    contact_info = extract_contact_info(text)
    skills_info = extract_skills(text)
    education = extract_education(text)
    projects = extract_projects(text)
    achievements = extract_achievements(text)
    coding_stats = extract_coding_profiles_stats(text)
    
    # Parse name
    first_name = ""
    last_name = ""
    if name:
        name_parts = name.split()
        first_name = name_parts[0] if name_parts else ""
        last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""
    
    # Structure the parsed data
    parsed_data = {
        "firstName": first_name,
        "lastName": last_name,
        "email": contact_info.get('email', ''),
        "phone": contact_info.get('phone', ''),
        "github": contact_info.get('github', ''),
        "linkedin": contact_info.get('linkedin', ''),
        "codingProfiles": {
            "codechef": contact_info.get('codechef', ''),
            "codeforces": contact_info.get('codeforces', ''),
            "leetcode": contact_info.get('leetcode', '')
        },
        "skills": skills_info.get('categorized', {}),
        "allSkills": skills_info.get('all_skills', []),
        "education": education,
        "projects": projects,
        "achievements": achievements,
        "codingStats": coding_stats,
        "rawText": text  # For debugging
    }
    
    return parsed_data
