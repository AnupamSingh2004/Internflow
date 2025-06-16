from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings

def send_invitation_email(invitation):
    print(f"Sending invitation email to {invitation.email} for team {invitation.team.name}")
    context = {
        'team': invitation.team,
        'competition': invitation.team.competition,
        'leader': invitation.team.leader,
        'accept_url': f"{settings.FRONTEND_URL}/invitations?token={invitation.token}",
        'settings': settings,
    }
    
    subject = f"Invitation to join team {invitation.team.name}"
    html_content = render_to_string('emails/team_invitation.html', context)
    text_content = render_to_string('emails/team_invitation.txt', context)
    
    email = EmailMultiAlternatives(
        subject,
        text_content,
        settings.DEFAULT_FROM_EMAIL,
        [invitation.email],
    )
    email.attach_alternative(html_content, "text/html")
    email.send()

def send_invitation_accepted_notification(invitation):
    context = {
        'team': invitation.team,
        'competition': invitation.team.competition,
        'user': invitation.user,
        'settings': settings,
    }
    
    subject = f"Your invitation has been accepted"
    html_content = render_to_string('emails/invitation_accepted.html', context)
    text_content = render_to_string('emails/invitation_accepted.txt', context)
    
    email = EmailMultiAlternatives(
        subject,
        text_content,
        settings.DEFAULT_FROM_EMAIL,
        [invitation.team.leader.email],
    )
    email.attach_alternative(html_content, "text/html")
    email.send()

def send_invitation_rejected_notification(invitation):
    context = {
        'team': invitation.team,
        'competition': invitation.team.competition,
        'user': invitation.user,
        'settings': settings,
    }
    
    subject = f"Your invitation has been rejected"
    html_content = render_to_string('emails/invitation_rejected.html', context)
    text_content = render_to_string('emails/invitation_rejected.txt', context)
    
    email = EmailMultiAlternatives(
        subject,
        text_content,
        settings.DEFAULT_FROM_EMAIL,
        [invitation.team.leader.email],
    )
    email.attach_alternative(html_content, "text/html")
    email.send()