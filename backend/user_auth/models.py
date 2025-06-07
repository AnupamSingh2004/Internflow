from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('general', 'General User'),
        ('admin', 'Administrator'),
    ]
    
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='general',
    )

    def is_admin(self):
        return self.role == 'admin'
    
    def __str__(self):
        return self.username