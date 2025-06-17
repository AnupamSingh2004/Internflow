from rest_framework import permissions
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsCompanyUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'company_profile')

class IsStudentUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return (request.user and 
                request.user.is_authenticated and 
                hasattr(request.user, 'student_profile'))

class IsTeamLeader(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.leader == request.user

class IsSubmissionOwnerOrTeamLeader(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if obj.user == request.user:
            return True
        if obj.team and obj.team.leader == request.user:
            return True
        return False
    
class IsAuthenticatedOrReadOnlyForSubmissions(BasePermission):
    """
    The request is authenticated as a user, or is a read-only request for submissions.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS and view.basename == 'submission':
            return True
        return request.user and request.user.is_authenticated