from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import transaction

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from rest_framework_simplejwt.tokens import RefreshToken

from .models import Employee, Attendance, Performance
from .serializers import EmployeeSerializer, AttendanceSerializer, PerformanceSerializer, UserSerializer
from .permission import IsAdminOrReadOnly, IsAdminOrOwner, IsEmployeeMarkingOwnAttendance


# ======================================
# AUTH
# ======================================

@api_view(["POST"])
@permission_classes([AllowAny])
def signup_view(request):
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")
    role = (request.data.get("role") or "employee").lower()

    if not username or not email or not password:
        return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username__iexact=username).exists():
        return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email__iexact=email).exists():
        return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        user = User.objects.create_user(username=username, email=email, password=password)

        if role == "admin":
            user.is_staff = True
        elif role == "superuser":
            user.is_staff = True
            user.is_superuser = True
        user.save()

        if role == "employee":
            Employee.objects.get_or_create(user=user, defaults={"name": username, "role": "employee"})

    refresh = RefreshToken.for_user(user)
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": role,
        "access": str(refresh.access_token),
        "refresh": str(refresh)
    }, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """
    Accepts either username or email in the 'username' or 'email' field and a 'password'.
    Returns JWT access + refresh tokens.
    """
    username_or_email = request.data.get("username") or request.data.get("email")
    password = request.data.get("password")

    if not username_or_email or not password:
        return Response({"detail": "Username/email and password required"}, status=status.HTTP_400_BAD_REQUEST)

    if "@" in username_or_email:
        users = User.objects.filter(email__iexact=username_or_email)
    else:
        users = User.objects.filter(username__iexact=username_or_email)

    if not users.exists():
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    if users.count() > 1:
        return Response({"detail": "Multiple accounts found. Contact admin."}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=users.first().username, password=password)
    if not user:
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    role = "superuser" if user.is_superuser else ("admin" if user.is_staff else "employee")

    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": role,
        "access": str(refresh.access_token),
        "refresh": str(refresh)
    }, status=status.HTTP_200_OK)


# ======================================
# PROFILE
# ======================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_profile(request):
    user = request.user
    if hasattr(user, "employee"):
        serializer = EmployeeSerializer(user.employee, context={"request": request})
        data = serializer.data
        data.update({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.employee.role,
        })
        return Response(data, status=status.HTTP_200_OK)

    # If user has no employee (admin / superuser)
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": "superuser" if user.is_superuser else "admin",
    }, status=status.HTTP_200_OK)


# ======================================
# USER VIEWSET
# ======================================

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().order_by("id")
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


# ======================================
# EMPLOYEE VIEWSET
# ======================================

class EmployeeViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Employee.objects.select_related("user").all()
        if hasattr(user, "employee"):
            return Employee.objects.filter(user=user).select_related("user")
        return Employee.objects.none()

    def perform_create(self, serializer):
        if not (self.request.user.is_staff or self.request.user.is_superuser):
            raise PermissionDenied("Only admins can create employees.")
        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        employee = self.get_object()
        if user.is_staff or user.is_superuser or employee.user == user:
            serializer.save()
        else:
            raise PermissionDenied("You can only modify your own account.")


# ======================================
# EMPLOYEE READ-ONLY VIEWSET
# ======================================

class EmployeeReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Exposed at employee-api/profile/ for employees to read their own profile.
    """
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, "employee"):
            return Employee.objects.filter(user=user).select_related("user")
        return Employee.objects.none()


# ======================================
# ATTENDANCE VIEWSET
# ======================================

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related("employee", "employee__user").all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]


class EmployeeAttendanceViewSet(viewsets.ModelViewSet):
    """
    Exposed at employee-api/attendance/ — employees manage their own attendance.
    Admins can manage all via admin-api/employees/ (EmployeeViewSet) or a separate admin attendance view if added.
    """
    serializer_class = AttendanceSerializer

    def get_permissions(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return [IsAdminUser()]
        return [IsEmployeeMarkingOwnAttendance()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Attendance.objects.select_related("employee", "employee__user").all()
        if hasattr(user, "employee"):
            return Attendance.objects.filter(employee__user=user).select_related("employee", "employee__user")
        return Attendance.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if hasattr(user, "employee"):
            serializer.save(employee=user.employee)
        elif user.is_staff or user.is_superuser:
            # Admins can provide employee via employee_id write field
            serializer.save()
        else:
            raise PermissionDenied("Not authorized to create attendance.")


# ======================================
# PERFORMANCE FUNCTION VIEW
# ======================================

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def performance_view(request):
    """
    GET: Admins see all; employees see their own performances.
    POST: Only admins can create performance records.
    """
    user = request.user

    # GET
    if request.method == "GET":
        if user.is_staff or user.is_superuser:
            performances = Performance.objects.select_related("employee", "employee__user").all()
        else:
            # ensure user has an employee record
            if not hasattr(user, "employee"):
                return Response({"error": "Employee record not found"}, status=status.HTTP_404_NOT_FOUND)
            performances = Performance.objects.filter(employee=user.employee).select_related("employee", "employee__user")

        serializer = PerformanceSerializer(performances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # POST
    if not (user.is_staff or user.is_superuser):
        raise PermissionDenied("Only admins can create performance records.")

    serializer = PerformanceSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)


# ======================================
# PERFORMANCE LATEST FOR EMPLOYEE
# ======================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def performance_latest_for_employee(request, employee_id):
    """
    Returns the latest performance record for the given employee_id
    """
    try:
        # Get latest performance
        perf = Performance.objects.filter(employee_id=employee_id).order_by("-date").first()
        if not perf:
            # fallback values for chart
            return Response([
                {"name": "Task", "value": 0},
                {"name": "Rating", "value": 0},
                {"name": "Remarks", "value": 0},
            ])

        data = [
            {"name": "Task", "value": len(perf.task)},
            {"name": "Rating", "value": perf.rating or 0},
            {"name": "Remarks", "value": len(perf.remarks)},
        ]
        return Response(data)

    except Employee.DoesNotExist:
        return Response([
            {"name": "Task", "value": 0},
            {"name": "Rating", "value": 0},
            {"name": "Remarks", "value": 0},
        ])


# ======================================
# PERFORMANCE DETAIL: GET / PUT / DELETE
# ======================================

@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def performance_detail(request, pk):
    """
    GET: Admin sees any record / employee sees own record
    PUT: Admin only
    DELETE: Admin only
    """
    try:
        performance = Performance.objects.get(pk=pk)
    except Performance.DoesNotExist:
        return Response({"error": "Performance record not found"}, status=status.HTTP_404_NOT_FOUND)

    user = request.user

    # Permission for viewing
    if not (user.is_staff or user.is_superuser) and performance.employee.user != user:
        raise PermissionDenied("You are not allowed to access this record.")

    # GET
    if request.method == "GET":
        serializer = PerformanceSerializer(performance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # PUT
    if request.method == "PUT":
        if not (user.is_staff or user.is_superuser):
            raise PermissionDenied("Only admins can update performance records.")
        serializer = PerformanceSerializer(performance, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    # DELETE
    if request.method == "DELETE":
        if not (user.is_staff or user.is_superuser):
            raise PermissionDenied("Only admins can delete performance records.")
        performance.delete()
        return Response({"message": "Performance deleted successfully"}, status=status.HTTP_204_NO_CONTENT)



# ======================================
# DASHBOARD
# ======================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_home(request):
    return Response({
        "total_employees": Employee.objects.count(),
        "total_attendance": Attendance.objects.count(),
        "total_performance": Performance.objects.count(),
    }, status=status.HTTP_200_OK)
