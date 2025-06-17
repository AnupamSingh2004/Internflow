from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('company', 'Company'),
        ('admin', 'Administrator'),
    ]
    
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='student',
    )

    def is_admin(self):
        return self.role == 'admin'
    
    def is_company(self):
        return self.role == 'company'
    
    def is_student(self):
        return self.role == 'student'
    
    def __str__(self):
        return self.username