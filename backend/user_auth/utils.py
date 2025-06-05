# utils.py - Fixed version
import threading
import time
from django.core.mail import EmailMessage
from django.conf import settings
from django.template.loader import render_to_string
from django.contrib.auth.tokens import PasswordResetTokenGenerator, default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth import get_user_model

User = get_user_model()

class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return (
            str(user.pk) + 
            str(timestamp) + 
            str(user.is_active) +
            str(user.email)
        )

# Separate token generators for different purposes
account_activation_token = AccountActivationTokenGenerator()
password_reset_token = default_token_generator  # Use Django's built-in for password reset

def delete_user_after_delay(user_id, delay_seconds=600):  # 600 seconds = 10 minutes
    """
    Delete user after specified delay if still unverified
    """
    def delete_user():
        time.sleep(delay_seconds)
        try:
            user = User.objects.get(id=user_id)
            if not user.is_active:  # Still unverified
                print(f"Auto-deleting unverified user: {user.email}")
                user.delete()
            else:
                print(f"User {user.email} is verified, not deleting")
        except User.DoesNotExist:
            print(f"User with id {user_id} no longer exists")
    
    # Start deletion thread
    thread = threading.Thread(target=delete_user)
    thread.daemon = True  # Dies when main thread dies
    thread.start()

def send_verification_email(user):
    token = account_activation_token.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    verification_link = f"{settings.FRONTEND_VERIFY_EMAIL_URL}/{uid}/{token}/"
    
    subject = 'Activate Your Account - Expires in 10 minutes'
    message = render_to_string('emails/account_activation_email.html', {
        'user': user,
        'verification_link': verification_link,
    })
    
    email = EmailMessage(subject, message, to=[user.email])
    email.content_subtype = "html"
    email.send()
    
    # Schedule auto-deletion after 10 minutes
    delete_user_after_delay(user.id, delay_seconds=600)

def send_password_reset_email(user):
    # Use the correct token generator for password reset
    token = password_reset_token.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    reset_link = f"{settings.FRONTEND_RESET_PASSWORD_URL}/{uid}/{token}/"
    
    print(f"Debug - Password reset link: {reset_link}")  # Debug line
    
    subject = 'Reset Your Password'
    message = render_to_string('emails/password_reset_email.html', {
        'user': user,
        'reset_link': reset_link,
    })
    
    email = EmailMessage(subject, message, to=[user.email])
    email.content_subtype = "html"
    email.send()