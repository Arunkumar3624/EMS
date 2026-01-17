# client/management/commands/seed_data.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from client.models import Employee, Attendance, Performance
from faker import Faker
import random

class Command(BaseCommand):
    help = "Seed DB with users, employees, attendance, performance"

    def handle(self, *args, **kwargs):
        fake = Faker()

        # Create admin if not exists
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser("admin", "admin@example.com", "admin123")

        # Create 25 employees
        for i in range(1, 26):
            username = f"employee{i}"
            email = f"{username}@example.com"

            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password="employee123",
                    is_staff=False
                )
            else:
                user = User.objects.get(username=username)

            # Create employee
            if not Employee.objects.filter(user=user).exists():
                Employee.objects.create(
                    user=user,
                    name=fake.name(),
                    role="employee",
                    department=random.choice(["IT", "HR", "Finance", "Marketing"]),
                    address=fake.city(),
                    phone=fake.phone_number()
                )

        self.stdout.write(self.style.SUCCESS("✅ 25 employees created successfully!"))
