from django.core.management.base import BaseCommand
from competitions.models import Competition, Team
from user_auth.models import User

class Command(BaseCommand):
    help = 'Manually register user to competition'

    def handle(self, *args, **options):
        comp = Competition.objects.get(id=1)
        user = User.objects.get(id=1)
        
        team = Team.objects.create(
            competition=comp,
            name="Manual Test Team",
            leader=user
        )
        team.members.add(user)
        
        self.stdout.write(f"Created team {team.name} for user {user.username}")