from django.contrib import admin
from .models import StudentProfile, CompanyProfile

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'college', 'degree')
    search_fields = ('user__username', 'college', 'degree')

@admin.register(CompanyProfile)
class CompanyProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'company_name', 'website', 'verified')
    search_fields = ('user__username', 'company_name', 'website')
    list_filter = ('verified',)