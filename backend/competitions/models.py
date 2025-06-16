from django.db import models
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.urls import reverse
import uuid

class Competition(models.Model):
    TYPE_CHOICES = [
        ('hackathon', 'Hackathon'),
        ('coding', 'Coding Challenge'),
        ('design', 'Design Contest'),
        ('innovation', 'Innovation Challenge'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='hackathon')
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    registration_deadline = models.DateTimeField()
    max_team_size = models.IntegerField(default=4)
    rules = models.TextField(blank=True)
    judging_criteria = models.TextField(blank=True)
    prizes = models.JSONField(default=dict, blank=True)
    registration_link = models.URLField(blank=True)
    submission_link = models.URLField(blank=True)
    created_by = models.ForeignKey('user_auth.User', on_delete=models.CASCADE, related_name='created_competitions')
    is_approved = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    tags = models.JSONField(default=list) 
    updated_at = models.DateTimeField(auto_now=True)
    certificate_available = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def is_registration_open(self):
        return timezone.now() <= self.registration_deadline
    
    def is_ongoing(self):
        now = timezone.now()
        return self.start_date <= now <= self.end_date


class Team(models.Model):
    competition = models.ForeignKey(Competition, on_delete=models.CASCADE, related_name='teams')
    name = models.CharField(max_length=100)
    leader = models.ForeignKey('user_auth.User', on_delete=models.CASCADE, related_name='led_teams')
    members = models.ManyToManyField('user_auth.User', blank=True, related_name='team_memberships')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['competition', 'leader']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.competition.title}"
    
    def current_size(self):
        return self.members.count() + 1  # +1 for the leader
    
    def is_full(self):
        return self.current_size() >= self.competition.max_team_size


class TeamInvitation(models.Model):
    PENDING = 'pending'
    ACCEPTED = 'accepted'
    REJECTED = 'rejected'
    EXPIRED = 'expired'
    
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (ACCEPTED, 'Accepted'),
        (REJECTED, 'Rejected'),
        (EXPIRED, 'Expired'),
    ]
    
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='invitations')
    email = models.EmailField()
    user = models.ForeignKey('user_auth.User', on_delete=models.CASCADE, null=True, blank=True, related_name='team_invitations')
    token = models.UUIDField(default=uuid.uuid4, unique=True,editable=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Invitation to {self.email} for {self.team.name}"
    
    def accept(self):
        """Accept the invitation and add user to team"""
        if self.status != self.PENDING:
            raise ValueError("Invitation is not pending")
        
        if self.team.is_full():
            raise ValueError("Team is full")
        
        if not self.user:
            raise ValueError("User must be set before accepting")
        
        # Add user to team
        self.team.members.add(self.user)
        self.status = self.ACCEPTED
        self.save()
    
    def reject(self):
        """Reject the invitation"""
        if self.status != self.PENDING:
            raise ValueError("Invitation is not pending")
        
        self.status = self.REJECTED
        self.save()
    
    def send_invitation_email(self):
        """Send invitation email to the user"""
        try:
            # Create invitation URL
            invitation_url = f"{settings.FRONTEND_URL}/invitations?token={self.token}/"
            
            # Email context
            context = {
                'team_name': self.team.name,
                'competition_name': self.team.competition.title,
                'leader_name': self.team.leader.get_full_name() or self.team.leader.username,
                'invitation_url': invitation_url,
                'competition_start_date': self.team.competition.start_date,
                'competition_end_date': self.team.competition.end_date,
            }
            
            # Send email
            subject = f"Team Invitation: {self.team.name} - {self.team.competition.title}"
            
            # Create plain text message
            message = f"""
Hello!

You have been invited to join the team "{self.team.name}" for the competition "{self.team.competition.title}".

Team Leader: {context['leader_name']}
Competition: {self.team.competition.title}
Start Date: {self.team.competition.start_date.strftime('%B %d, %Y at %I:%M %p')}
End Date: {self.team.competition.end_date.strftime('%B %d, %Y at %I:%M %p')}

To accept or reject this invitation, please visit:
{invitation_url}

This invitation will expire when the competition registration deadline passes.

Best regards,
Competition Platform Team
            """
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[self.email],
                fail_silently=False,
            )
            
        except Exception as e:
            print(f"Failed to send invitation email: {e}")
            raise


class Submission(models.Model):
    DRAFT = 'draft'
    SUBMITTED = 'submitted'
    UNDER_REVIEW = 'under_review'
    REVIEWED = 'reviewed'
    
    STATUS_CHOICES = [
        (DRAFT, 'Draft'),
        (SUBMITTED, 'Submitted'),
        (UNDER_REVIEW, 'Under Review'),
        (REVIEWED, 'Reviewed'),
    ]
    
    competition = models.ForeignKey(Competition, on_delete=models.CASCADE, related_name='submissions')
    team = models.ForeignKey(Team, on_delete=models.CASCADE, null=True, blank=True, related_name='submissions')
    user = models.ForeignKey('user_auth.User', on_delete=models.CASCADE, related_name='submissions')
    title = models.CharField(max_length=200)
    description = models.TextField()
    submission_file = models.FileField(
        upload_to='submissions/',
        null=True,
        blank=True,
        verbose_name="Submission File"
    )
    submission_link = models.URLField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=DRAFT)
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.competition.title}"
    
    def is_editable(self):
        """Check if the submission can still be edited"""
        return (
            self.status == self.DRAFT and
            self.competition.is_ongoing()
        )
    
    def submit(self):
        """Submit the submission"""
        if not self.is_editable():
            raise ValueError("Submission cannot be modified")
        
        self.status = self.SUBMITTED
        self.submitted_at = timezone.now()
        self.save()