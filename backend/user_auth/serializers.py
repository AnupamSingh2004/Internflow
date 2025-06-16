from django.contrib.auth.models import User
from django.contrib.auth import authenticate,get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from rest_framework import serializers, exceptions
from .tokens import account_activation_token
from .utils import account_activation_token
from profiles.models import StudentProfile, CompanyProfile


User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'date_joined']
        read_only_fields = ['id', 'is_active', 'date_joined']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        # Add profile data based on user role
        if instance.role == 'student' and hasattr(instance, 'studentprofile'):
            from profiles.serializers import StudentProfileSerializer
            representation['profile'] = StudentProfileSerializer(instance.studentprofile).data
        
        elif instance.role == 'company' and hasattr(instance, 'companyprofile'):
            from profiles.serializers import CompanyProfileSerializer
            representation['profile'] = CompanyProfileSerializer(instance.companyprofile).data
        
        return representation

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    
    # Student specific fields
    college = serializers.CharField(required=False, write_only=True)
    degree = serializers.CharField(required=False, write_only=True)
    branch = serializers.CharField(required=False, write_only=True)
    graduation_year = serializers.IntegerField(required=False, write_only=True)
    
    # Company specific fields
    company_name = serializers.CharField(required=False, write_only=True)
    website = serializers.URLField(required=False, write_only=True)
    industry = serializers.CharField(required=False, write_only=True)
    location = serializers.CharField(required=False, write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password2',
            'first_name', 'last_name', 'role',
            # Student fields
            'college', 'degree', 'branch', 'graduation_year',
            # Company fields
            'company_name', 'website', 'industry', 'location'
        ]
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords don't match")
        
        role = data.get('role')
        
        # Validate student fields
        if role == 'student':
            if not data.get('college'):
                raise serializers.ValidationError({"college": "College is required for students"})
            if not data.get('degree'):
                raise serializers.ValidationError({"degree": "Degree is required for students"})
        
        # Validate company fields
        elif role == 'company':
            if not data.get('company_name'):
                raise serializers.ValidationError({"company_name": "Company name is required"})
            if not data.get('website'):
                raise serializers.ValidationError({"website": "Website is required"})
        
        return data
    
    def create(self, validated_data):
        # Remove password2 and profile fields before user creation
        validated_data.pop('password2')
        role = validated_data.get('role', 'student')
        
        # Separate profile data
        profile_data = {}
        
        if role == 'student':
            student_fields = ['college', 'degree', 'branch', 'graduation_year']
            for field in student_fields:
                if field in validated_data:
                    profile_data[field] = validated_data.pop(field)
        
        elif role == 'company':
            company_fields = ['company_name', 'website', 'industry', 'location']
            for field in company_fields:
                if field in validated_data:
                    profile_data[field] = validated_data.pop(field)
        
        # Create user (only with user fields)
        user = User.objects.create_user(**validated_data)
        
        # Create appropriate profile
        if role == 'student':
            StudentProfile.objects.create(user=user, **profile_data)
        elif role == 'company':
            CompanyProfile.objects.create(user=user, **profile_data)
        
        return user


class LoginSerializer(serializers.Serializer):
    username_or_email = serializers.CharField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, data):
        username_or_email = data.get('username_or_email')
        password = data.get('password')

        if not username_or_email or not password:
            raise exceptions.AuthenticationFailed('Both username/email and password are required.')

        user = authenticate(request=self.context.get('request'), username=username_or_email, password=password)
        
        # Try authenticating with email if username failed
        if not user:
            try:
                user_obj = User.objects.get(email=username_or_email)
                user = authenticate(request=self.context.get('request'), username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass # Let the original authentication failure message propagate

        if not user:
            raise exceptions.AuthenticationFailed('Invalid credentials.')
        
        if not user.is_active:
            raise exceptions.AuthenticationFailed('Account not active. Please verify your email.')

        data['user'] = user
        return data

class EmailVerificationSerializer(serializers.Serializer):
    uidb64 = serializers.CharField()
    token = serializers.CharField()
    
    def validate(self, attrs):
        try:
            # Decode the user ID
            uid = force_str(urlsafe_base64_decode(attrs['uidb64']))
            user = User.objects.get(pk=uid)
            
            # Check if user is already active - return success instead of error
            if user.is_active:
                attrs['user'] = user
                attrs['already_verified'] = True
                return attrs
            
            # Verify the token
            if not account_activation_token.check_token(user, attrs['token']):
                raise serializers.ValidationError("Invalid or expired verification link.")
                
            attrs['user'] = user
            attrs['already_verified'] = False
            return attrs
            
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError("Invalid verification link.")
        except Exception as e:
            raise serializers.ValidationError(f"Verification failed: {str(e)}")
    
    def save(self):
        user = self.validated_data['user']
        already_verified = self.validated_data.get('already_verified', False)
        
        if not already_verified:
            user.is_active = True
            user.save()
        
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value, is_active=True).exists():
            # Don't reveal if user exists for security, but for dev it's ok
            raise serializers.ValidationError("User with this email does not exist or is not active.")
        return value

class PasswordResetConfirmSerializer(serializers.Serializer):
    uidb64 = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        try:
            # Decode the user ID
            uid = force_str(urlsafe_base64_decode(attrs['uidb64']))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError("Invalid reset link.")
        
        # Check if the token is valid using the correct token generator
        if not default_token_generator.check_token(user, attrs['token']):
            raise serializers.ValidationError("Invalid or expired reset link.")
        
        # Check if passwords match
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        
        attrs['user'] = user
        return attrs

    def save(self):
        user = self.validated_data['user']
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user