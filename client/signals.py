from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Employee


@receiver(post_save, sender=User)
def create_employee_profile(sender, instance, created, **kwargs):
    """Create an Employee profile automatically when a new User is created."""
    if created:
        Employee.objects.create(user=instance, name=instance.username)


@receiver(post_save, sender=User)
def save_employee_profile(sender, instance, **kwargs):
    """Save employee profile linked to the user."""
    if hasattr(instance, "employee"):
        instance.employee.save()
