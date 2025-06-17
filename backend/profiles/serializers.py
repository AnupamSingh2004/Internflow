from rest_framework import serializers
from .models import UserProfile, Education, Skill, Certification, Project, ProjectSkill
from django_countries.serializer_fields import CountryField
from django.contrib.auth import get_user_model

# serializers.py - Add this custom JWT serializer

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import StudentProfile,CompanyProfile


User = get_user_model()


class StudentProfileSerializer(serializers.ModelSerializer):
    college = serializers.CharField(required=False)
    degree = serializers.CharField(required=False)
    branch = serializers.CharField(required=False, allow_blank=True)
    graduation_year = serializers.IntegerField(required=False, allow_null=True)
    skills = serializers.JSONField(required=False)
    resume_link = serializers.URLField(required=False, allow_blank=True)
    portfolio_link = serializers.URLField(required=False, allow_blank=True)
    linkedin = serializers.URLField(required=False, allow_blank=True)
    github = serializers.URLField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'college', 'degree', 'branch', 'graduation_year',
            'skills', 'resume_link', 'portfolio_link', 'linkedin',
            'github', 'bio', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class CompanyProfileSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(required=False)
    website = serializers.URLField(required=False)
    industry = serializers.CharField(required=False, allow_blank=True)
    location = serializers.CharField(required=False, allow_blank=True)
    contact_number = serializers.CharField(required=False, allow_blank=True)
    about = serializers.CharField(required=False, allow_blank=True)
    company_logo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = CompanyProfile
        fields = [
            'id', 'company_name', 'website', 'industry', 'location',
            'contact_number', 'verified', 'about', 'company_logo',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'verified', 'created_at', 'updated_at']

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add extra responses here if needed
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'role': self.user.role,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
        }
        
        return data




class UserProfileSerializer(serializers.ModelSerializer):
    # Use the CountryField and configure it to return a dictionary
    # This field will handle both serialization and deserialization
    country = CountryField(country_dict=True, required=False, allow_null=True)
    
    # These fields are fine as they are
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'professional_title', 'bio', 'phone_number', 'location',
            'website', 'country', 'profile_picture', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = [
            'id', 'degree', 'institution', 'field_of_study', 'start_year',
            'end_year', 'gpa', 'description', 'is_current', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'proficiency', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = [
            'id', 'name', 'issuing_organization', 'issue_date', 'expiration_date',
            'credential_id', 'credential_url', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class ProjectSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectSkill
        fields = ['id', 'skill']
        read_only_fields = ['id']

class ProjectSerializer(serializers.ModelSerializer):
    skills_used = ProjectSkillSerializer(many=True, required=False)
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'project_url', 'github_url',
            'start_date', 'end_date', 'is_current', 'skills_used', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        skills_data = validated_data.pop('skills_used', [])
        project = Project.objects.create(**validated_data)
        for skill_data in skills_data:
            ProjectSkill.objects.create(project=project, **skill_data)
        return project
    
    def update(self, instance, validated_data):
        skills_data = validated_data.pop('skills_used', None)
        
        # Update project fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle skills update if provided
        if skills_data is not None:
            # Delete existing skills
            instance.skills_used.all().delete()
            # Add new skills
            for skill_data in skills_data:
                ProjectSkill.objects.create(project=instance, **skill_data)
        
        return instance