from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.urls import reverse
from django.db import models
from rest_framework import serializers

from .models import Competition, Team, TeamInvitation, Submission
from .serializers import (
    CompetitionSerializer,
    TeamSerializer,
    TeamInvitationSerializer,
    SubmissionSerializer,
    CompetitionRegistrationSerializer,
)
from user_auth.models import User
from profiles.models import StudentProfile

class IsCompanyUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'company_profile')

class IsStudentUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'student_profile')

class CompetitionViewSet(viewsets.ModelViewSet):
    queryset = Competition.objects.filter(is_active=True).prefetch_related(
        'teams',
        'teams__members',
        'teams__leader'
    )
    serializer_class = CompetitionSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsCompanyUser()]
        return [permissions.IsAuthenticatedOrReadOnly()]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        comp = self.get_object()
        comp.is_approved = True
        comp.save()
        return Response({'status': 'approved'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        comp = self.get_object()
        comp.is_approved = False
        comp.save()
        return Response({'status': 'rejected'})
    
    @action(detail=True, methods=['post'], permission_classes=[IsStudentUser])
    def register(self, request, pk=None):
        competition = self.get_object()
        
        serializer = CompetitionRegistrationSerializer(
            data=request.data,
            context={
                'request': request,
                'competition': competition
            }
        )
        
        if serializer.is_valid():
            team_name = serializer.validated_data.get('team_name', f"{request.user.username}'s Team")
            
            # Check if user already has a team
            if competition.teams.filter(leader=request.user).exists():
                return Response(
                    {'detail': 'You already have a team for this competition.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            with transaction.atomic():
                team = Team.objects.create(
                    competition=competition,
                    name=team_name,
                    leader=request.user
                )
            
            # Return the updated competition with teams
            competition.refresh_from_db()
            serializer = self.get_serializer(competition)
            return Response(
                {
                    'detail': 'Successfully registered for the competition.',
                    'team_id': team.id,
                    'competition': serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        pending_comps = Competition.objects.filter(is_approved=False)
        serializer = self.get_serializer(pending_comps, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_status(self, request, pk=None):
        competition = self.get_object()
        response_data = {
            'registered': False,
            'team': None,
            'is_leader': False,
        }
        
        # Check if user is a team leader
        leader_team = competition.teams.filter(leader=request.user).first()
        if leader_team:
            response_data.update({
                'registered': True,
                'team': TeamSerializer(leader_team).data,
                'is_leader': True,
            })
            return Response(response_data)
        
        # Check if user is a team member
        member_team = competition.teams.filter(members=request.user).first()
        if member_team:
            response_data.update({
                'registered': True,
                'team': TeamSerializer(member_team).data,
                'is_leader': False,
            })
            return Response(response_data)
        
        return Response(response_data)


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Team.objects.filter(
            models.Q(leader=self.request.user) | 
            models.Q(members=self.request.user))
    
    def perform_create(self, serializer):
        competition = serializer.validated_data['competition']
        
        if not competition.is_registration_open():
            raise serializers.ValidationError("Registration for this competition is closed.")
        
        if competition.teams.filter(leader=self.request.user).exists():
            raise serializers.ValidationError("You can only create one team per competition.")
        
        serializer.save(leader=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsStudentUser])
    def invite(self, request, pk=None):
        team = self.get_object()
        
        if team.leader != request.user:
            return Response(
                {'detail': 'Only the team leader can send invitations.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if team.is_full():
            return Response(
                {'detail': 'The team is already full.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        username = request.data.get('username')
        email = request.data.get('email')
        
        if not username and not email:
            return Response(
                {'detail': 'Either username or email is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        invited_user = None
        if username:
            try:
                invited_user = User.objects.get(username=username)
                email = invited_user.email
            except User.DoesNotExist:
                return Response(
                    {'detail': 'User with this username not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )
        elif email:
            invited_user = User.objects.filter(email=email).first()
        
        # Remove the check for existing pending invitations
        # Only check if user is already in the team
        if invited_user:
            if invited_user == team.leader or team.members.filter(pk=invited_user.pk).exists():
                return Response(
                    {'detail': 'This user is already in the team.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not hasattr(invited_user, 'student_profile'):
                return Response(
                    {'detail': 'Only students can be invited to teams.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Create new invitation (will create new one even if pending exists)
        invitation = TeamInvitation.objects.create(
            team=team,
            email=email,
            user=invited_user
        )
        
        try:
            invitation.send_invitation_email()
        except Exception as e:
            print(f"Failed to send invitation email: {e}")
        
        return Response(
            TeamInvitationSerializer(invitation).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        invitation = self.get_object()
        
        # Check if invitation is for current user
        if invitation.user != request.user and invitation.email != request.user.email:
            return Response(
                {'detail': 'This invitation is not for you.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if invitation.status != TeamInvitation.PENDING:
            return Response(
                {'detail': 'This invitation has already been processed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if invitation.team.is_full():
            return Response(
                {'detail': 'The team is already full.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark all invitations for this user+team as expired
        TeamInvitation.objects.filter(
            team=invitation.team,
            email=invitation.email,
            status=TeamInvitation.PENDING
        ).update(status=TeamInvitation.EXPIRED)
        
        # Accept the current invitation
        with transaction.atomic():
            invitation.user = request.user
            invitation.accept()
        
        return Response(
            {'detail': 'Successfully joined the team.'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['get'])
    def invitations(self, request, pk=None):
        """Get all invitations for this team"""
        team = self.get_object()
        
        invitations = TeamInvitation.objects.filter(team=team)
        serializer = TeamInvitationSerializer(invitations, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='my-teams')
    def my_teams(self, request):
        """Get all teams where the current user is leader or member"""
        teams = Team.objects.filter(
            models.Q(leader=request.user) | 
            models.Q(members=request.user)
        ).distinct().prefetch_related('members', 'competition')
        
        serializer = self.get_serializer(teams, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='my-submissions')
    def my_submissions(self, request):
        """Get all submissions for teams where user is leader or member"""
        submissions = Submission.objects.filter(
            models.Q(team__leader=request.user) |
            models.Q(team__members=request.user) |
            models.Q(user=request.user)
        ).select_related('user', 'team', 'competition').distinct()
        
        serializer = SubmissionSerializer(submissions, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], url_path='submissions')
    def team_submissions(self, request, pk=None):
        """Get all submissions for a specific team"""
        team = self.get_object()
        
        # Check if user has access to this team
        if team.leader != request.user and not team.members.filter(pk=request.user.pk).exists():
            return Response(
                {'detail': 'You do not have permission to view submissions for this team.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        submissions = Submission.objects.filter(team=team).select_related(
            'user', 'competition'
        ).order_by('-created_at')
        
        serializer = SubmissionSerializer(submissions, many=True, context={'request': request})
        return Response(serializer.data)


# In your views.py, make these changes:

# In your views.py, make these changes:

class TeamInvitationViewSet(viewsets.ModelViewSet):
    queryset = TeamInvitation.objects.all()
    serializer_class = TeamInvitationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return TeamInvitation.objects.filter(
            models.Q(team__leader=self.request.user) |
            models.Q(email=self.request.user.email) |
            models.Q(user=self.request.user)
        )
    
    def retrieve(self, request, pk=None):
        try:
            # Try to get by regular pk first (assuming it's an integer)
            if pk and pk.isdigit():
                invitation = self.get_object()
            else:
                # If pk is not a digit, try to get by token as string
                invitation = get_object_or_404(
                    TeamInvitation.objects.filter(
                        models.Q(token__iexact=pk) |
                        models.Q(token__iexact=str(pk))))
                
                # Check permissions for token-based access
                if (invitation.user != request.user and 
                    invitation.email != request.user.email and
                    invitation.team.leader != request.user):
                    return Response(
                        {'detail': 'You do not have permission to view this invitation.'},
                        status=status.HTTP_403_FORBIDDEN
                    )
        except (ValueError, TeamInvitation.DoesNotExist):
            return Response(
                {'detail': 'Invitation not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(invitation)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """Allow team leaders to cancel invitations"""
        invitation = self.get_object()
        
        if invitation.team.leader != request.user:
            return Response(
                {'detail': 'Only the team leader can cancel invitations.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if invitation.status != TeamInvitation.PENDING:
            return Response(
                {'detail': 'Only pending invitations can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        invitation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        try:
            if pk and pk.isdigit():
                invitation = self.get_object()
            else:
                # Handle token lookup
                invitation = get_object_or_404(
                    TeamInvitation.objects.filter(
                        models.Q(token__iexact=pk) |
                        models.Q(token__iexact=str(pk)))
                )
                
            # Check if invitation is for current user
            if invitation.user != request.user and invitation.email != request.user.email:
                return Response(
                    {'detail': 'This invitation is not for you.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if invitation.status != TeamInvitation.PENDING:
                return Response(
                    {'detail': 'This invitation has already been processed.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if invitation.team.is_full():
                return Response(
                    {'detail': 'The team is already full.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Accept the invitation
            with transaction.atomic():
                invitation.user = request.user
                invitation.accept()
            
            return Response(
                {'detail': 'Successfully joined the team.'},
                status=status.HTTP_200_OK
            )
            
        except (ValueError, TeamInvitation.DoesNotExist):
            return Response(
                {'detail': 'Invitation not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Handle invitation rejection by either ID or token"""
        try:
            if pk and pk.isdigit():
                invitation = self.get_object()
            else:
                # Handle token lookup
                invitation = get_object_or_404(
                    TeamInvitation.objects.filter(
                        models.Q(token__iexact=pk) |
                        models.Q(token__iexact=str(pk))
                    )
                )
                
            # Check if invitation is for current user
            if invitation.user != request.user and invitation.email != request.user.email:
                return Response(
                    {'detail': 'This invitation is not for you.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if invitation.status != TeamInvitation.PENDING:
                return Response(
                    {'detail': 'This invitation has already been processed.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            invitation.reject()
            
            return Response(
                {'detail': 'Invitation rejected.'},
                status=status.HTTP_200_OK
            )
            
        except (ValueError, TeamInvitation.DoesNotExist):
            return Response(
                {'detail': 'Invitation not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
    


class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # If admin/staff, return all submissions
        if user.is_staff:
            return super().get_queryset()
            
        # If company user, return submissions for their competitions
        if hasattr(user, 'company_profile'):
            return Submission.objects.filter(
                competition__created_by=user
            ).select_related('user', 'team', 'competition')
        
        # For regular users, return their own submissions or team submissions
        return Submission.objects.filter(
            models.Q(user=user) |
            models.Q(team__leader=user) |
            models.Q(team__members=user)
        ).select_related('user', 'team', 'competition')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        competition = serializer.validated_data['competition']
        
        if not competition.is_ongoing():
            raise serializers.ValidationError("The competition is not currently active.")
        
        # Check if user is registered for the competition
        if not competition.teams.filter(leader=self.request.user).exists() and \
           not competition.teams.filter(members=self.request.user).exists():
            raise serializers.ValidationError("You must be registered for the competition to submit.")
        
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        submission = self.get_object()
        
        if not submission.is_editable():
            return Response(
                {'detail': 'This submission can no longer be modified.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if submission.user != request.user and \
           not (submission.team and submission.team.leader == request.user):
            return Response(
                {'detail': 'You are not authorized to modify this submission.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(submission, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# In your views.py
class MyTeamsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Team.objects.filter(
            models.Q(leader=self.request.user) | 
            models.Q(members=self.request.user)
        ).distinct()

class MySubmissionsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Submission.objects.filter(user=self.request.user)