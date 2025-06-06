from django.core.management.base import BaseCommand
from user_auth.models import User

class Command(BaseCommand):
    help = 'Make a user admin'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='User email')

    def handle(self, *args, **kwargs):
        email = kwargs['email']
        try:
            user = User.objects.get(email=email)
            user.role = 'admin'
            user.is_staff = True
            user.save()
            self.stdout.write(f"User {email} is now an admin")
        except User.DoesNotExist:
            self.stderr.write(f"User with email {email} not found")