from django.apps import AppConfig

class ClientConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "client"

    def ready(self):
        try:
            import client.signals  # noqa: F401
        except Exception as e:
            print(f"⚠️ Signal import skipped due to: {e}")
