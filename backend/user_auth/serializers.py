from django.contrib.auth.models import User
from django.contrib.auth import authenticate,get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from rest_framework import serializers, exceptions
from .tokens import account_activation_token
from .utils import account_activation_token


User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'}, label="Confirm password")

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Email is already in use."})
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"username": "Username is already taken."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        user.set_password(validated_data['password'])
        user.is_active = False # Deactivate account till it is verified
        user.save()
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