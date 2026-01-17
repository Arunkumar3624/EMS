from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminOrReadOnly(BasePermission):
    """Allow read-only access to everyone, write access only to admins"""
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_staff or request.user.is_superuser


class IsAdminOrOwner(BasePermission):
    """Only admin or owner can modify the object"""
    def has_object_permission(self, request, view, obj):
        return (
            request.user.is_staff or
            request.user.is_superuser or
            (hasattr(request.user, "employee") and obj.employee == request.user.employee)
        )


class IsEmployeeMarkingOwnAttendance(BasePermission):
    """Only allow employee to update their own attendance"""
    def has_object_permission(self, request, view, obj):
        return hasattr(request.user, "employee") and obj.employee == request.user.employee
