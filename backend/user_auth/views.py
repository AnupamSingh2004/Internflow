#views.py
from django.contrib.auth.models import User
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    RegisterSerializer, LoginSerializer, EmailVerificationSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer
)
from .utils import send_verification_email, send_password_reset_email, account_activation_token
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.shortcuts import get_object_or_404
from rest_framework import serializers
import logging
from django.contrib.sessions.models import Session
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
# Add these views to your views.py file
from rest_framework.views import APIView
from django.utils import timezone
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

# Add this import at the top
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth import authenticate
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer
from .models import User
from .utils import send_verification_email
from rest_framework.permissions import AllowAny
from profiles.models import StudentProfile, CompanyProfile  # For profile creation during registration
from profiles.serializers import StudentProfileSerializer, CompanyProfileSerializer  # For including profile in response
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from profiles.models import CompanyProfile

class VerifyCompanyView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def patch(self, request, user_id):
        try:
            company_profile = CompanyProfile.objects.get(user_id=user_id)
            new_verified_status = request.data.get('verified')
            
            if new_verified_status is None:
                return Response(
                    {"error": "Verified status is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Allow both verifying and unverifying
            company_profile.verified = new_verified_status
            company_profile.save()
            
            return Response(
                {
                    "message": f"Company {'verified' if company_profile.verified else 'unverified'} successfully",
                    "verified": company_profile.verified
                },
                status=status.HTTP_200_OK
            )
        except CompanyProfile.DoesNotExist:
            return Response(
                {"error": "Company profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """Get current authenticated user with fresh role data"""
    try:
        # Get fresh user data from database to ensure role is current
        fresh_user = User.objects.get(id=request.user.id)
        return Response({
            'id': fresh_user.id,
            'username': fresh_user.username,
            'email': fresh_user.email,
            'first_name': fresh_user.first_name,
            'last_name': fresh_user.last_name,
            'role': fresh_user.role,
            'is_active': fresh_user.is_active,
        })
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

@api_view(['POST'])
@permission_classes([])  # Allow any - refresh token handles auth
def refresh_token(request):
    """Refresh JWT access token"""
    try:
        serializer = TokenRefreshSerializer(data=request.data)
        if serializer.is_valid():
            # Get the user from the refresh token to include fresh role data
            refresh_token = serializer.validated_data.get('refresh')
            if refresh_token:
                try:
                    from rest_framework_simplejwt.tokens import RefreshToken
                    token = RefreshToken(refresh_token)
                    user_id = token.payload.get('user_id')
                    
                    # Get fresh user data
                    user = User.objects.get(id=user_id)
                    
                    # Generate new tokens with fresh user data
                    new_refresh = RefreshToken.for_user(user)
                    
                    return Response({
                        'access': str(new_refresh.access_token),
                        'refresh': str(new_refresh),
                        'user': {
                            'id': user.id,
                            'username': user.username,
                            'email': user.email,
                            'role': user.role,
                        }
                    })
                except (User.DoesNotExist, TokenError):
                    return Response({'error': 'Invalid refresh token'}, status=400)
            else:
                return Response(serializer.validated_data)
        else:
            return Response(serializer.errors, status=400)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# Fix the missing import in invalidate_user_sessions
def invalidate_user_sessions(user):
    """Invalidate all sessions for a specific user"""
    from django.utils import timezone  # Add this import
    
    # Get all sessions
    sessions = Session.objects.filter(expire_date__gte=timezone.now())
    
    for session in sessions:
        session_data = session.get_decoded()
        if session_data.get('_auth_user_id') == str(user.id):
            session.delete()

# Optional: Add JWT token blacklisting for more security
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """Logout user and blacklist their tokens"""
    try:
        # Get the refresh token from request
        refresh_token = request.data.get('refresh')
        
        if refresh_token:
            try:
                from rest_framework_simplejwt.tokens import RefreshToken
                token = RefreshToken(refresh_token)
                token.blacklist()  # This requires token blacklist to be enabled
            except Exception:
                pass  # Token might already be blacklisted or invalid
        
        # Also invalidate sessions
        invalidate_user_sessions(request.user)
        
        return Response({'message': 'Successfully logged out'})
    except Exception as e:
        return Response({'error': str(e)}, status=500)



logger = logging.getLogger(__name__)

User = get_user_model()


class UserListView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        users = User.objects.all()
        data = []
        
        for user in users:
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'company_profile': None
            }
            
            if hasattr(user, 'company_profile'):
                user_data['company_profile'] = {
                    'verified': user.company_profile.verified,
                    'company_name': user.company_profile.company_name
                }
            
            data.append(user_data)
        
        return Response(data)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def update_user_role(request, user_id):
    """Update user role and manage Django admin permissions"""
    try:
        # Check if current user is admin
        if not request.user.role == 'admin':
            return Response({'error': 'Permission denied'}, status=403)
        
        user_to_update = User.objects.get(id=user_id)
        new_role = request.data.get('role')
        
        if new_role not in ['admin', 'general']:
            return Response({'error': 'Invalid role'}, status=400)
        
        # Update the role
        old_role = user_to_update.role
        user_to_update.role = new_role
        
        # IMPORTANT: Update Django admin permissions based on role
        if new_role == 'admin':
            user_to_update.is_staff = True
            # Optionally make them superuser for full admin access
            # user_to_update.is_superuser = True
        else:  # general user
            user_to_update.is_staff = False
            user_to_update.is_superuser = False
        
        user_to_update.save()
        
        # Invalidate user's sessions if role changed
        if old_role != new_role:
            invalidate_user_sessions(user_to_update)
        
        return Response({
            'message': f'Role updated successfully. User {"now has" if new_role == "admin" else "no longer has"} Django admin access.',
            'user': {
                'id': user_to_update.id,
                'username': user_to_update.username,
                'role': user_to_update.role,
                'is_staff': user_to_update.is_staff,
                'is_superuser': user_to_update.is_superuser,
            }
        })
        
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

def invalidate_user_sessions(user):
    """Invalidate all sessions for a specific user"""
    # Get all sessions
    sessions = Session.objects.filter(expire_date__gte=timezone.now())
    
    for session in sessions:
        session_data = session.get_decoded()
        if session_data.get('_auth_user_id') == str(user.id):
            session.delete()
    

class DeleteUserView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def delete(self, request, user_id):
        try:
            # Prevent deleting yourself
            if str(request.user.id) == user_id:
                return Response(
                    {"error": "You cannot delete your own account"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            user = User.objects.get(id=user_id)
            
            # Prevent deleting other admins
            if user.is_admin() and not request.user.is_superuser:
                return Response(
                    {"error": "Only superusers can delete other admin accounts"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            user.delete()
            return Response(
                {"message": "User deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
            
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
class RoleCheckMiddleware:
    """Middleware to ensure role is always fresh from database"""
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            # Refresh user from database to get current role
            try:
                fresh_user = User.objects.get(id=request.user.id)
                request.user.role = fresh_user.role
            except User.DoesNotExist:
                pass
        
        response = self.get_response(request)
        return response


class EmailVerifyView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = EmailVerificationSerializer

    def get(self, request, uidb64, token):
        """Handle email verification via GET request (when user clicks the link)"""
        try:
            # Log the received parameters for debugging
            logger.info(f"Email verification attempt - uidb64: {uidb64}, token: {token}")
            
            # Decode the user ID
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            
            logger.info(f"Found user: {user.email}, is_active: {user.is_active}")
            
            # Check if the token is valid
            if account_activation_token.check_token(user, token):
                if not user.is_active:
                    user.is_active = True
                    user.save()
                    logger.info(f"User {user.email} successfully verified")
                    return Response({
                        "message": "Email successfully verified. You can now log in."
                    }, status=status.HTTP_200_OK)
                else:
                    logger.info(f"User {user.email} already verified")
                    return Response({
                        "message": "Email already verified. You can log in."
                    }, status=status.HTTP_200_OK)
            else:
                logger.warning(f"Invalid token for user {user.email}")
                return Response({
                    "error": "Invalid or expired verification link."
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except (TypeError, ValueError, OverflowError, User.DoesNotExist) as e:
            logger.error(f"Email verification error: {str(e)}")
            return Response({
                "error": "Invalid verification link."
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error during email verification: {str(e)}")
            return Response({
                "error": "Verification failed. Please try again."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, *args, **kwargs):
        """Handle email verification via POST request (if frontend sends data)"""
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data['user']
            if not user.is_active:
                user.is_active = True
                user.save()
                return Response({
                    "message": "Email successfully verified."
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "message": "Email already verified."
                }, status=status.HTTP_200_OK)
        except serializers.ValidationError as e:
            return Response({
                "error": str(e.detail) if hasattr(e, 'detail') else str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Send verification email
        send_verification_email(user)
        
        response_data = {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
            },
            "message": "User created successfully. Please check your email to verify your account."
        }
        
        # Add profile data to response based on role
        if user.is_student():
            profile = StudentProfile.objects.get(user=user)
            response_data['profile'] = StudentProfileSerializer(profile).data
        elif user.is_company():
            profile = CompanyProfile.objects.get(user=user)
            response_data['profile'] = CompanyProfileSerializer(profile).data
        
        return Response(response_data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_by_id(request, user_id):
    """
    Get user details by ID
    """
    try:
        user = get_object_or_404(User, id=user_id)
        
        # Build user data similar to your existing UserListView
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
        }
        
        # Add company profile if user is a company
        if user.role == 'company' and hasattr(user, 'company_profile'):
            user_data['company_profile'] = {
                'company_name': user.company_profile.company_name,
                'verified': user.company_profile.verified,
            }
        
        return Response(user_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )

class LoginView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        refresh = RefreshToken.for_user(user)
        
        response_data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
            }
        }
        
        # Add profile data based on user role
        if user.is_student():
            profile = StudentProfile.objects.get(user=user)
            response_data['student_profile'] = StudentProfileSerializer(profile).data
        elif user.is_company():
            profile = CompanyProfile.objects.get(user=user)
            response_data['company_profile'] = CompanyProfileSerializer(profile).data
        
        return Response(response_data)



class PasswordResetRequestView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = PasswordResetRequestSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email, is_active=True)
            send_password_reset_email(user)
            return Response({"message": "Password reset link sent to your email."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            # Should be caught by serializer, but as a fallback
            return Response({"error": "User with this email does not exist or is not active."}, status=status.HTTP_404_NOT_FOUND)
        

class PasswordResetConfirmView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request, *args, **kwargs):
        # uidb64 and token could be part of the URL or request body.
        # If in URL, extract them: data = {**request.data, 'uidb64': kwargs['uidb64'], 'token': kwargs['token']}
        # Assuming they are in the request body for this example to match serializer directly
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save() # This sets the new password
        return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)

# Example of a protected view
class UserProfileView(generics.RetrieveAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = RegisterSerializer # Re-use for simplicity, or create a UserDetailSerializer

    def get_object(self):
        return self.request.user