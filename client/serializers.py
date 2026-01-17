from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Employee, Attendance, Performance

# -------------------------
# User Serializer
# -------------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]


# -------------------------
# Employee Serializer
# -------------------------
class EmployeeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source="user",
        write_only=True,
        required=False
    )

    class Meta:
        model = Employee
        fields = ["id", "user", "user_id", "name", "department", "address", "phone", "role"]
        read_only_fields = ["id", "role", "user"]

    def update(self, instance, validated_data):
        """
        Prevent non-admins from modifying the `role`.
        """
        user = self.context["request"].user
        if not (user.is_staff or user.is_superuser):
            validated_data.pop("role", None)
        return super().update(instance, validated_data)


# -------------------------
# Attendance Serializer
# -------------------------
class AttendanceSerializer(serializers.ModelSerializer):
    employee = EmployeeSerializer(read_only=True)

    class Meta:
        model = Attendance
        fields = ["id", "employee", "date", "status"]
        read_only_fields = ["id", "employee"]

    def create(self, validated_data):
        """
        Auto-assign employee to the logged-in user when marking attendance.
        """
        request = self.context["request"]
        user = request.user
        if hasattr(user, "employee") and not user.is_staff:
            validated_data["employee"] = user.employee
        return super().create(validated_data)


# -------------------------
# Performance Serializer
# -------------------------
class PerformanceSerializer(serializers.ModelSerializer):
    employee = EmployeeSerializer(read_only=True)
    employee_id = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(),
        source="employee",
        write_only=True,
        required=False,  # optional
        allow_null=True  # <-- allow null for frontend without dropdown
    )

    class Meta:
        model = Performance
        fields = ["id", "employee", "employee_id", "task", "rating", "remarks", "date"]
        read_only_fields = ["id", "employee"]

    def create(self, validated_data):
        """
        Allow only admin or superuser to create performance data.
        If no employee_id is provided, you can choose:
        - assign a default employee (e.g., self or first employee), or
        - leave null if backend supports it
        """
        user = self.context["request"].user
        if not (user.is_staff or user.is_superuser):
            raise serializers.ValidationError("❌ Only admins can create performance records.")

        # Handle optional employee_id
        if "employee" not in validated_data or validated_data["employee"] is None:
            # Option 1: raise an error
            raise serializers.ValidationError("❌ Employee must be selected.")
            # Option 2: assign default (example: first employee)
            # validated_data["employee"] = Employee.objects.first()

        return super().create(validated_data)
