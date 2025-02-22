from django.apps import AppConfig

class ChatConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'chat'

    def ready(self):
        try:
            import chat.signals  # Import the signals
            print("✅ Signals loaded successfully!")
        except Exception as e:
            print(f"❌ Error loading signals: {e}")