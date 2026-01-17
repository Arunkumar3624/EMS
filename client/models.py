from django.db import models
from django.conf import settings
from django.utils import timezone


# -------------------------------
# Employee Model (Main Profile)
# -------------------------------
class Employee(models.Model):
    ROLE_CHOICES = [
        ("employee", "Employee"),
        ("admin", "Admin"),
        ("superuser", "Superuser"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="employee"
    )
    name = models.CharField(max_length=200, blank=True, default="")
    department = models.CharField(max_length=100, blank=True, null=True)
    address = models.TextField(blank=True, default="")
    phone = models.CharField(max_length=30, blank=True, default="")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="employee")

    def __str__(self):
        return self.name or self.user.username


# -------------------------------
# Attendance Model
# -------------------------------
class Attendance(models.Model):
    STATUS_PRESENT = "present"
    STATUS_ABSENT = "absent"
    STATUS_CHOICES = [
        (STATUS_PRESENT, "Present"),
        (STATUS_ABSENT, "Absent"),
    ]

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="attendances"
    )
    date = models.DateField(default=timezone.now)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_ABSENT)

    class Meta:
        unique_together = ("employee", "date")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.employee.user.username} - {self.date} - {self.status}"


# -------------------------------
# Performance Model
# -------------------------------
class Performance(models.Model):
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="performances"
    )
    task = models.CharField(max_length=255, blank=True, default="")
    rating = models.PositiveSmallIntegerField(null=True, blank=True)
    remarks = models.TextField(blank=True, default="")
    date = models.DateField(default=timezone.now)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        rating_display = self.rating if self.rating is not None else "-"
        task_display = self.task if self.task else "-"
        return f"{self.employee.user.username} - {task_display} - {rating_display}"
