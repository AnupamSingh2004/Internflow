from django.urls import path
from .views import (
    RegisterView, LoginView, EmailVerifyView, UserProfileView,
    PasswordResetRequestView, PasswordResetConfirmView,VerifyCompanyView,DeleteUserView,UserListView, update_user_role,get_current_user,refresh_token
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # JWT refresh
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('verify-email/<str:uidb64>/<str:token>/', EmailVerifyView.as_view(), name='verify-email'),
    path('password-reset/request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('admin/users/<str:user_id>/', DeleteUserView.as_view(), name='delete-user'),
    path('admin/users/', UserListView.as_view(), name='user-list'),
    path('admin/users/<int:user_id>/role/', update_user_role, name='update-user-role'),
    path('admin/companies/<str:user_id>/verify/', VerifyCompanyView.as_view(), name='verify-company'),
    path('me/', get_current_user, name='current_user'),
    path('refresh/', refresh_token, name='refresh_token'), 
]