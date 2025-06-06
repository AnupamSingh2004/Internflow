# In a new file, e.g., your_app/parser.py
import spacy
import re
import fitz  # PyMuPDF
import docx

# Load the spaCy model
nlp = spacy.load("en_core_web_lg")

# --- Define keywords and patterns for extraction ---

# Example skills list (can be expanded significantly)
SKILLS_DB = [
    'react', 'node.js', 'python', 'javascript', 'typescript', 'mongodb', 
    'postgresql', 'git', 'aws', 'docker', 'django', 'flask', 'java', 
    'c++', 'html', 'css', 'sql', 'nosql', 'machine learning', 'data science'
]

# Regex for finding email and phone
EMAIL_REGEX = r"[\w\.-]+@[\w\.-]+\.\w+"
PHONE_REGEX = r"(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}"

def extract_text_from_pdf(pdf_file):
    doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def extract_text_from_docx(docx_file):
    doc = docx.Document(docx_file)
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

def extract_name(text):
    doc = nlp(text)
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            # Often the first person found is the candidate
            return ent.text
    return None

def extract_skills(text):
    # Use a simple set for efficient lookup and to avoid duplicates
    found_skills = set()
    for skill in SKILLS_DB:
        if re.search(r'\b' + re.escape(skill) + r'\b', text, re.IGNORECASE):
            found_skills.add(skill.title()) # Standardize capitalization
    return list(found_skills)

def parse_resume(file):
    # 1. Extract Text
    file_extension = file.name.split('.')[-1].lower()
    if file_extension == 'pdf':
        text = extract_text_from_pdf(file)
    elif file_extension == 'docx':
        text = extract_text_from_docx(file)
    else:
        raise ValueError("Unsupported file type")

    # 2. Extract Information
    name = extract_name(text)
    email = re.search(EMAIL_REGEX, text)
    phone = re.search(PHONE_REGEX, text)
    skills = extract_skills(text)

    # You can add more complex extraction for Education, Projects, etc.
    # This often involves looking for keywords like "Education", "Projects",
    # and then parsing the subsequent text blocks.

    first_name = name.split()[0] if name else ""
    last_name = " ".join(name.split()[1:]) if name and len(name.split()) > 1 else ""

    # 3. Structure the data
    parsed_data = {
        "firstName": first_name,
        "lastName": last_name,
        "email": email.group(0) if email else "",
        "phone": phone.group(0) if phone else "",
        "skills": skills,
        # Add placeholders for more complex fields
        "education": [], 
        "projects": [],
    }

    return parsed_data