from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Creates a superuser with the given email and password'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='Admin email')
        parser.add_argument('--password', type=str, help='Admin password')

    def handle(self, *args, **options):
        User = get_user_model()
        email = options.get('email')
        password = options.get('password')

        if not email or not password:
            self.stdout.write(self.style.ERROR('Email and password are required. Usage: python manage.py create_admin --email <email> --password <password>'))
            return

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'User with email {email} already exists'))
        else:
            # The create_superuser method in UserManager (models.py) handles is_staff and is_superuser.
            # We also set role='admin' as per the User model definition.
            User.objects.create_superuser(email=email, password=password, role='admin')
            self.stdout.write(self.style.SUCCESS(f'Superuser {email} created successfully'))
