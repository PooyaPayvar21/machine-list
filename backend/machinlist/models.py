from enum import unique
from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)

# Create your models here.
class UserManager(BaseUserManager):
    def create_user(self,email,password=None,**extra_fields):
        if not email:
            raise ValueError("Email is Required")
        email = self.normalize_email(email)
        user = self.model(email=email,**extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True")

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser,PermissionsMixin):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'User'),
    )
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    date_joined = models.DateTimeField(auto_now_add=True)
    objects = UserManager()
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    
    def __str__(self):
        return self.email


class MachineRegistration(models.Model):
    section = models.CharField(max_length=150)
    machine_name = models.CharField(max_length=150,unique=True)
    machine_code = models.CharField(max_length=150,unique=True)
    machine_model = models.CharField(max_length=150,unique=True)
    machine_serial = models.CharField(max_length=150,unique=True)
    manufacture_year = models.PositiveIntegerField(verbose_name="Manufacture Year")
    company_entry_date = models.DateField(verbose_name="Company Entry Date")
    installation_date = models.DateField(verbose_name="Installation Date", null=True, blank=True)
    criticality_level = models.CharField(
        max_length=50,
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High'),
            ('critical', 'Critical'),
        ],
        verbose_name="Criticality Level"
    )
    location_name = models.CharField(max_length=255, verbose_name="Location Name")
    location_code = models.CharField(max_length=100, verbose_name="Location Code")

    # Dimensions & Weight
    length_mm = models.FloatField(verbose_name="Length (mm)", null=True, blank=True)
    width_mm = models.FloatField(verbose_name="Width (mm)", null=True, blank=True)
    height_mm = models.FloatField(verbose_name="Height (mm)", null=True, blank=True)
    weight_kg = models.FloatField(verbose_name="Weight (kg)", null=True, blank=True)

    # Technical Characteristics
    foundation_type = models.CharField(max_length=255, verbose_name="Foundation Type", null=True, blank=True)
    automation_level = models.CharField(max_length=100, verbose_name="Automation Level", null=True, blank=True)

    # Warranty & Guarantee
    has_guarantee = models.BooleanField(default=False, verbose_name="Guarantee")
    guarantee_expiry_date = models.DateField(null=True, blank=True, verbose_name="Guarantee Expiry Date")

    has_warranty = models.BooleanField(default=False, verbose_name="Warranty")
    warranty_expiry_date = models.DateField(null=True, blank=True, verbose_name="Warranty Expiry Date")

    # Electrical Specifications
    current_type = models.CharField(
        max_length=10,
        choices=[('AC', 'AC'), ('DC', 'DC')],
        verbose_name="Current Type"
    )
    phase_count = models.PositiveSmallIntegerField(verbose_name="Number of Phases")
    nominal_voltage = models.FloatField(verbose_name="Nominal Voltage (V)")
    nominal_power = models.FloatField(verbose_name="Nominal Power (kW)")
    nominal_current = models.FloatField(verbose_name="Nominal Current (A)")
    electrical_technical_description = models.TextField(
        verbose_name="Electrical Technical Description",
        null=True,
        blank=True
    )
    maximum_consumption = models.FloatField(
        verbose_name="Maximum Consumption",
        null=True,
        blank=True
    )

    # Mechanical & Lubrication
    operating_pressure = models.FloatField(verbose_name="Pressure", null=True, blank=True)
    # lubricant_type = models.CharField(max_length=255, verbose_name="Lubricant Type", null=True, blank=True)
    # alternative_lubricant_type = models.CharField(max_length=255, verbose_name="Alternative Lubricant Type", null=True, blank=True)
    # lubricant_description = models.TextField(verbose_name="Lubricant Description", null=True, blank=True)

    # Vendor Information
    supplier_company_name = models.CharField(max_length=255, verbose_name="Supplier Company Name")
    supplier_phone = models.CharField(max_length=50, verbose_name="Supplier Phone")
    supplier_address = models.TextField(verbose_name="Supplier Address")

    # Manufacturer Information
    manufacturer_company_name = models.CharField(max_length=255, verbose_name="Manufacturer Company Name")
    manufacturer_phone = models.CharField(max_length=50, verbose_name="Manufacturer Phone")
    manufacturer_address = models.TextField(verbose_name="Manufacturer Address")

    # Meta
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.machine_name} ({self.machine_code})"


class MachineLubricant(models.Model):
    machine = models.ForeignKey(
        MachineRegistration,
        on_delete=models.CASCADE,
        related_name='lubricants'
    )
    row_number = models.PositiveSmallIntegerField(verbose_name="Row Number", default=1)
    lubricant_type = models.CharField(max_length=255, verbose_name="Lubricant Type", null=True, blank=True)
    alternative_lubricant_type = models.CharField(max_length=255, verbose_name="Alternative Lubricant Type", null=True, blank=True)
    description = models.TextField(verbose_name="Description", null=True, blank=True)

    class Meta:
        ordering = ['row_number']

    def __str__(self):
        return f"{self.machine.machine_name} - Lubricant {self.row_number}"
    
