from djoser import utils
from djoser.email import BaseEmailMessage
from django.conf import settings
from django.urls import reverse

# Djoser uses these classes to send emails.
# The templates are specified in the get_context_data method or by Djoser's defaults.
# You need to create the actual HTML template files in `templates/emails/`

class ActivationEmail(BaseEmailMessage):
    template_name = "emails/activation_email.html" # Djoser expects this path relative to template dirs

    def get_context_data(self):
        context = super().get_context_data()
        user = context.get("user")
        context["uid"] = utils.encode_uid(user.pk)
        context["token"] = utils.encode_uid(user.pk) # Placeholder, djoser generates its own token
        # Djoser's default context already includes uid and token for activation
        # context['url'] = settings.DJOSER['ACTIVATION_URL'].format(**context)
        # The ACTIVATION_URL in settings.py is already formatted by Djoser using its context.
        # We just need to ensure our template uses {{ url }}
        context['frontend_domain'] = settings.FRONTEND_DOMAIN
        # Djoser will provide 'url' in the context based on DJOSER['ACTIVATION_URL']
        # Example: context['url'] will be 'http://localhost:3000/auth/verify-email/uid_val/token_val'
        return context

class ConfirmationEmail(BaseEmailMessage):
    template_name = "emails/confirmation_email.html" # For email change confirmation etc.

    def get_context_data(self):
        context = super().get_context_data()
        context['frontend_domain'] = settings.FRONTEND_DOMAIN
        # Djoser will provide 'url' in the context based on its settings for confirmation
        return context

class PasswordResetEmail(BaseEmailMessage):
    template_name = "emails/password_reset_email.html"

    def get_context_data(self):
        context = super().get_context_data()
        user = context.get("user")
        # context["uid"] = utils.encode_uid(user.pk) # Djoser provides uid
        # context["token"] = default_token_generator.make_token(user) # Djoser provides token
        # context['url'] = settings.DJOSER['PASSWORD_RESET_CONFIRM_URL'].format(**context)
        context['frontend_domain'] = settings.FRONTEND_DOMAIN
        # Djoser provides 'url' based on DJOSER['PASSWORD_RESET_CONFIRM_URL']
        return context

class PasswordChangedConfirmationEmail(BaseEmailMessage):
    template_name = "emails/password_changed_confirmation_email.html"

    def get_context_data(self):
        context = super().get_context_data()
        context['frontend_domain'] = settings.FRONTEND_DOMAIN
        return context

