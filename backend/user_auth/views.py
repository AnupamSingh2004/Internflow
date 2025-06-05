from django.contrib.auth.models import User
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    RegisterSerializer, LoginSerializer, EmailVerificationSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer
)
from .utils import send_verification_email, send_password_reset_email
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from .tokens import account_activation_token
from django.contrib.auth.tokens import default_token_generator

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Send verification email
        send_verification_email(user)
        
        return Response({
            "user": RegisterSerializer(user, context=self.get_serializer_context()).data, # Exclude password
            "message": "User created successfully. Please check your email to verify your account."
        }, status=status.HTTP_201_CREATED)

class LoginView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        })

class EmailVerifyView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = EmailVerificationSerializer

    def get(self, request, uidb64, token): # Changed to GET for link clicking
        # This view can also be a POST if frontend makes an API call after extracting params from URL
        data = {'uidb64': uidb64, 'token': token}
        serializer = self.get_serializer(data=data)
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data['user']
            if not user.is_active:
                user.is_active = True
                user.save()
            return Response({"message": "Email successfully verified."}, status=status.HTTP_200_OK)
        except serializers.ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)


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