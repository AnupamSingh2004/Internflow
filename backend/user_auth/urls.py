from django.urls import path
from .views import (
    RegisterView, LoginView, EmailVerifyView, UserProfileView,
    PasswordResetRequestView, PasswordResetConfirmView,user_list, update_user_role,get_current_user,refresh_token
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # JWT refresh
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Email verification: uidb64 and token are URL parameters
    path('verify-email/<str:uidb64>/<str:token>/', EmailVerifyView.as_view(), name='verify-email'),
    
    path('password-reset/request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    # For confirm, you might pass uid and token in URL or body. If in URL:
    # path('password-reset/confirm/<str:uidb64>/<str:token>/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    # If in body (as current serializer is set up):
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),

    path('profile/', UserProfileView.as_view(), name='user-profile'), # Example protected route

    path('admin/users/', user_list, name='user-list'),
    path('admin/users/<int:user_id>/role/', update_user_role, name='update-user-role'),
    path('me/', get_current_user, name='current_user'),
    path('refresh/', refresh_token, name='refresh_token'), 
]