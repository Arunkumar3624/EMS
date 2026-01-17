from django.contrib import admin
from .models import Employee, Attendance, Performance


# ========================================
# Employee Admin
# ========================================
@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "get_username",
        "get_email",
        "role",
        "name",
        "phone",
        "address",
    )
    list_filter = ("role",)
    search_fields = ("user__username", "user__email", "phone", "name")
    ordering = ("id",)
    list_select_related = ("user",)

    @admin.display(description="Username", ordering="user__username")
    def get_username(self, obj):
        return obj.user.username if obj.user else "-"

    @admin.display(description="Email", ordering="user__email")
    def get_email(self, obj):
        return obj.user.email if obj.user else "-"


# ========================================
# Attendance Admin
# ========================================
@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "get_employee_username",
        "get_employee_email",
        "date",
        "status",
        "present_days",
        "absent_days",
    )
    list_filter = ("status", "date")
    search_fields = ("employee__user__username", "employee__user__email")
    ordering = ("-date",)
    list_select_related = ("employee", "employee__user")

    @admin.display(description="Employee Username", ordering="employee__user__username")
    def get_employee_username(self, obj):
        return obj.employee.user.username if obj.employee and obj.employee.user else "-"

    @admin.display(description="Employee Email", ordering="employee__user__email")
    def get_employee_email(self, obj):
        return obj.employee.user.email if obj.employee and obj.employee.user else "-"

    @admin.display(description="Present Days")
    def present_days(self, obj):
        return Attendance.objects.filter(
            employee=obj.employee,
            status=Attendance.STATUS_PRESENT
        ).count()

    @admin.display(description="Absent Days")
    def absent_days(self, obj):
        return Attendance.objects.filter(
            employee=obj.employee,
            status=Attendance.STATUS_ABSENT
        ).count()


# ========================================
# Performance Admin
# ========================================
@admin.register(Performance)
class PerformanceAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "get_employee_username",
        "task",
        "rating",
        "remarks",
        "date",
    )
    list_filter = ("rating", "date")
    search_fields = ("employee__user__username", "employee__user__email", "task", "remarks")
    ordering = ("-date",)
    list_select_related = ("employee", "employee__user")

    @admin.display(description="Employee Username", ordering="employee__user__username")
    def get_employee_username(self, obj):
        return obj.employee.user.username if obj.employee and obj.employee.user else "-"
