from django.core.mail import EmailMessage
from django.conf import settings
from django.template.loader import render_to_string
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

def send_verification_email(user):
    token = account_activation_token.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    verification_link = f"{settings.FRONTEND_VERIFY_EMAIL_URL}/{uid}/{token}/" # Adjusted path

    subject = 'Activate Your Account'
    message = render_to_string('user_auth/emails/account_activation_email.html', {
        'user': user,
        'verification_link': verification_link,
    })
    email = EmailMessage(subject, message, to=[user.email])
    email.content_subtype = "html" # Main content is text/html
    email.send()

def send_password_reset_email(user):
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    reset_link = f"{settings.FRONTEND_RESET_PASSWORD_URL}/{uid}/{token}/" # Adjusted path

    subject = 'Reset Your Password'
    message = render_to_string('user_auth/emails/password_reset_email.html', {
        'user': user,
        'reset_link': reset_link,
    })
    email = EmailMessage(subject, message, to=[user.email])
    email.content_subtype = "html"
    email.send()