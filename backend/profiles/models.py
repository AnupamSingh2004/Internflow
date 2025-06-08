from django.db import models
from django.contrib.auth import get_user_model
from django_countries.fields import CountryField

User = get_user_model()

class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    college = models.CharField(max_length=255)
    degree = models.CharField(max_length=100)
    branch = models.CharField(max_length=100, blank=True, null=True)
    graduation_year = models.IntegerField(blank=True, null=True)
    skills = models.JSONField(default=list, blank=True)
    resume_link = models.URLField(blank=True, null=True)
    portfolio_link = models.URLField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    github = models.URLField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Student Profile"

class CompanyProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='company_profile')
    company_name = models.CharField(max_length=255)
    website = models.URLField()
    industry = models.CharField(max_length=100, blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    verified = models.BooleanField(default=False)
    about = models.TextField(blank=True, null=True)
    company_logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.company_name}'s Company Profile"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    professional_title = models.CharField(max_length=100, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    country = CountryField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()}'s Profile"

class Education(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='educations')
    degree = models.CharField(max_length=100)
    institution = models.CharField(max_length=200)
    field_of_study = models.CharField(max_length=100, blank=True, null=True)
    start_year = models.PositiveIntegerField()
    end_year = models.PositiveIntegerField(blank=True, null=True)
    gpa = models.CharField(max_length=10, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_current = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.degree} at {self.institution}"

class Skill(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=50)
    proficiency = models.CharField(max_length=20, choices=[
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert')
    ], default='intermediate')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Certification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='certifications')
    name = models.CharField(max_length=200)
    issuing_organization = models.CharField(max_length=200)
    issue_date = models.DateField()
    expiration_date = models.DateField(blank=True, null=True)
    credential_id = models.CharField(max_length=100, blank=True, null=True)
    credential_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Project(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=200)
    description = models.TextField()
    project_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    is_current = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class ProjectSkill(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='skills_used')
    skill = models.CharField(max_length=100)
    
    def __str__(self):
        return f"{self.skill} for {self.project.title}"