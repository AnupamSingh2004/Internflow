from rest_framework import serializers
from .models import Competition, Team, TeamInvitation, Submission
from user_auth.models import User
from profiles.models import StudentProfile
from django.utils import timezone
from django.db.models import Count


class TeamSerializer(serializers.ModelSerializer):
    leader_name = serializers.CharField(source='leader.get_full_name', read_only=True)
    current_size = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()
    
    class Meta:
        model = Team
        fields = '__all__'
        read_only_fields = ('leader', 'created_at', 'updated_at')
    
    def get_current_size(self, obj):
        return obj.current_size()
    
    def get_is_full(self, obj):
        return obj.is_full()
    
    def validate(self, data):
        competition = data.get('competition') or self.instance.competition if self.instance else None
        
        if not competition.is_registration_open():
            raise serializers.ValidationError("Registration for this competition is closed.")
        
        if self.instance and self.instance.leader != self.context['request'].user:
            raise serializers.ValidationError("Only the team leader can update the team.")
        
        return data

class CompetitionSerializer(serializers.ModelSerializer):
    is_registration_open = serializers.SerializerMethodField()
    is_ongoing = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    teams_count = serializers.SerializerMethodField()
    participants_count = serializers.SerializerMethodField()
    teams = TeamSerializer(many=True, read_only=True)
    
    class Meta:
        model = Competition
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at', 'updated_at')
    
    def get_is_registration_open(self, obj):
        return obj.is_registration_open()
    
    def get_is_ongoing(self, obj):
        return obj.is_ongoing()
    
    def validate(self, data):
        if data['start_date'] >= data['end_date']:
            raise serializers.ValidationError("End date must be after start date.")
        if data['registration_deadline'] > data['start_date']:
            raise serializers.ValidationError("Registration deadline must be before the competition starts.")
        return data
    
    def get_teams_count(self, obj):
        return obj.teams.count()

    def get_participants_count(self, obj):
        return obj.teams.aggregate(
            total=Count('members') + Count('leader', distinct=True)
        )['total']



class TeamInvitationSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.name', read_only=True)
    competition_name = serializers.CharField(source='team.competition.title', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    user_email = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()

    class Meta:
        model = TeamInvitation
        fields = [
            'id', 'team', 'team_name', 'competition_name', 
            'user_email','username', 'user', 'token', 'email',
            'status', 'status_display', 'created_at'
        ]
        read_only_fields = ['token', 'status', 'user', 'created_at']

    def get_user_email(self, obj):
        return obj.user.email if obj.user else None

    def get_username(self, obj):
        return obj.user.username if obj.user else None

    def validate(self, data):
        request = self.context.get('request')
        team = data.get('team') or (self.instance.team if self.instance else None)

        if not team:
            raise serializers.ValidationError("Team is required.")

        if team.leader != request.user:
            raise serializers.ValidationError("Only the team leader can send invitations.")

        if team.is_full():
            raise serializers.ValidationError("The team is already full.")

        email = data.get('email')
        username = data.get('username')

        if not email and not username:
            raise serializers.ValidationError("Either email or username must be provided.")

        # Check if user exists
        user = None
        if username:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                if not email:  # Only raise error if email is also not provided
                    raise serializers.ValidationError("User with this username does not exist.")
        
        if email and not user:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                pass  # Allow inviting by email even if user doesn't exist

        if user:
            # Check if user is already in the team
            if user == team.leader or team.members.filter(pk=user.pk).exists():
                raise serializers.ValidationError("This user is already in the team.")
            
            # Check for existing pending invitation
            if TeamInvitation.objects.filter(
                team=team, 
                user=user, 
                status=TeamInvitation.PENDING
            ).exists():
                raise serializers.ValidationError("A pending invitation already exists for this user.")

        return data
    


class SubmissionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    competition_name = serializers.CharField(source='competition.title', read_only=True)
    team_name = serializers.CharField(source='team.name', read_only=True, allow_null=True)
    is_editable = serializers.SerializerMethodField()
    
    class Meta:
        model = Submission
        fields = '__all__'
        read_only_fields = ('user', 'status', 'submitted_at', 'updated_at')
    
    def get_is_editable(self, obj):
        return obj.is_editable()
    
    def validate(self, data):
        competition = data.get('competition')
        if not competition:
            raise serializers.ValidationError("Competition is required")
        
        # Get the actual competition instance if it's just an ID
        if isinstance(competition, int):
            try:
                competition = Competition.objects.get(id=competition)
            except Competition.DoesNotExist:
                raise serializers.ValidationError("Competition does not exist")
        
        if not competition.is_ongoing():
            raise serializers.ValidationError("The competition is not currently active.")
        
        # Check if user is registered for the competition
        user = self.context['request'].user
        if not competition.teams.filter(leader=user).exists() and \
           not competition.teams.filter(members=user).exists():
            raise serializers.ValidationError("You must be registered for the competition to submit.")
        
        return data


class CompetitionRegistrationSerializer(serializers.Serializer):
    team_name = serializers.CharField(max_length=100, required=False)
    
    def validate(self, data):
        request = self.context.get('request')
        team = data.get('team') or (self.instance.team if self.instance else None)

        if not team:
            raise serializers.ValidationError("Team is required.")

        if team.leader != request.user:
            raise serializers.ValidationError("Only the team leader can send invitations.")

        if team.is_full():
            raise serializers.ValidationError("The team is already full.")

        email = data.get('email')
        username = data.get('username')

        if not email and not username:
            raise serializers.ValidationError("Either email or username must be provided.")

        # Check if user exists
        user = None
        if username:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                if not email:  # Only raise error if email is also not provided
                    raise serializers.ValidationError("User with this username does not exist.")
        
        if email and not user:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                pass  # Allow inviting by email even if user doesn't exist

        if user:
            # Check if user is already in the team
            if user == team.leader or team.members.filter(pk=user.pk).exists():
                raise serializers.ValidationError("This user is already in the team.")
            
            # Check for existing pending invitation
            if TeamInvitation.objects.filter(
                team=team, 
                user=user, 
                status=TeamInvitation.PENDING
            ).exists():
                raise serializers.ValidationError("A pending invitation already exists for this user.")

        return data