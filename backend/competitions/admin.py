from django.contrib import admin
from .models import Competition, Team, TeamInvitation, Submission

@admin.register(Competition)
class CompetitionAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'created_by','is_approved', 'start_date', 'end_date', 'is_active')
    list_filter = ('type', 'is_active','is_approved', 'created_by')
    search_fields = ('title', 'description', 'created_by__username')
    readonly_fields = ('created_at', 'updated_at')
    def created_by(self, obj):
        return obj.created_by.username
    created_by.short_description = 'Creator'

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'competition', 'leader', 'member_count')
    search_fields = ('name', 'competition__title', 'leader__username')
    
    def member_count(self, obj):
        return obj.members.count()
    member_count.short_description = 'Members'

@admin.register(TeamInvitation)
class TeamInvitationAdmin(admin.ModelAdmin):
    list_display = ('team', 'email', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('team__name', 'email')

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    # Option 1A: Manually list all fields
    list_display = [
        'id', 'title', 'description', 'user', 'competition', 'team', 
        'submission_file', 'submission_link', 'status', 'score', 
        'feedback', 'submitted_at', 'created_at', 'updated_at'
    ]
    
    # Option 1B: Get all field names dynamically
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]
    
    list_filter = ('status', 'competition')
    search_fields = ('title', 'user__username', 'description')
    readonly_fields = ('submitted_at', 'created_at', 'updated_at')