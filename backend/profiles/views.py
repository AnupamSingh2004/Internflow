from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .models import UserProfile, Education, Skill, Certification, Project
from .serializers import (
    UserProfileSerializer, EducationSerializer, 
    SkillSerializer, CertificationSerializer, ProjectSerializer
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import MultiPartParser, FormParser

User = get_user_model()




class ProfilePictureUploadView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        user = request.user
        profile = UserProfile.objects.get(user=user)
        
        if 'profile_picture' not in request.FILES:
            return Response({'error': 'No file provided'}, status=400)
        
        profile.profile_picture = request.FILES['profile_picture']
        profile.save()
        
        return Response({
            'profile_picture_url': profile.profile_picture.url
        }, status=200)
    
    def delete(self, request):
        user = request.user
        profile = UserProfile.objects.get(user=user)
        
        if not profile.profile_picture:
            return Response({'error': 'No profile picture to delete'}, status=400)
        
        # Delete the file from storage
        profile.profile_picture.delete(save=False)
        profile.profile_picture = None
        profile.save()
        
        return Response({'message': 'Profile picture deleted'}, status=200)
    

class UserProfileDetailView(generics.RetrieveUpdateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile
    
    def perform_update(self, serializer):
        country_data = self.request.data.get('country')
        if country_data:
            serializer.validated_data['country'] = country_data
        serializer.save()

class EducationListView(generics.ListCreateAPIView):
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Education.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class EducationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EducationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Education.objects.filter(user=self.request.user)

class SkillListView(generics.ListCreateAPIView):
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Skill.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SkillDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Skill.objects.filter(user=self.request.user)

class CertificationListView(generics.ListCreateAPIView):
    serializer_class = CertificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Certification.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CertificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CertificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Certification.objects.filter(user=self.request.user)

class ProjectListView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)

class CompleteProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        profile = UserProfile.objects.filter(user=user).first()
        educations = Education.objects.filter(user=user)
        skills = Skill.objects.filter(user=user)
        certifications = Certification.objects.filter(user=user)
        projects = Project.objects.filter(user=user)
        
        # Ensure proper serialization by using context if needed
        data = {
            'profile': UserProfileSerializer(profile, context={'request': request}).data if profile else None,
            'educations': EducationSerializer(educations, many=True, context={'request': request}).data,
            'skills': SkillSerializer(skills, many=True, context={'request': request}).data,
            'certifications': CertificationSerializer(certifications, many=True, context={'request': request}).data,
            'projects': ProjectSerializer(projects, many=True, context={'request': request}).data,
        }
        
        return Response(data)