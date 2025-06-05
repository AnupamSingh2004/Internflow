from django.contrib.auth.tokens import PasswordResetTokenGenerator
import six

class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return (
            six.text_type(user.pk) + six.text_type(timestamp) +
            six.text_type(user.is_active) # Or user.profile.email_confirmed if you have a profile model
        )

account_activation_token = AccountActivationTokenGenerator()

# Django's default PasswordResetTokenGenerator can be used for password reset.
# We define a new one here mainly for email verification to ensure it's distinct
# and its hash considers different fields if needed.