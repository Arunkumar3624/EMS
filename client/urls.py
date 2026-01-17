from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    performance_latest_for_employee, signup_view, login_view, my_profile, dashboard_home,
    EmployeeViewSet, EmployeeReadOnlyViewSet,
    AttendanceViewSet, EmployeeAttendanceViewSet,
    performance_view, performance_detail, # function-based
    UserViewSet
)

router = DefaultRouter()

# Admin API
router.register(r'admin-api/employees', EmployeeViewSet, basename='admin-employees')
router.register(r'admin-api/users', UserViewSet, basename='admin-users')

# Employee API (viewsets only)
router.register(r'employee-api/profile', EmployeeReadOnlyViewSet, basename='employee-profile')
router.register(r'employee-api/attendance', EmployeeAttendanceViewSet, basename='employee-attendance')

# General API (viewsets only)
router.register(r'attendance', AttendanceViewSet, basename='attendance')

# ✅ Function-based views (cannot be registered in router)
urlpatterns = [
    # Auth
    path('signup/', signup_view, name='signup'),
    path('login/', login_view, name='login'),

    # Profile
    path('my-profile/', my_profile, name='my-profile'),

    # ✅ Performance view added here
    path('performance/', performance_view, name='performance'),
    path("performance/latest/<int:employee_id>/", performance_latest_for_employee, name="performance-latest"),

    path("performance/<int:pk>/", performance_detail, name="performance-detail"),


    # Include router URLs
    path('', include(router.urls)),
]
