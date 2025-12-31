from rest_framework import serializers
from .models import User, MachineRegistration, MachineLubricant

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'password', 'role', 'is_active', 'is_staff', 'date_joined']
        read_only_fields = ['id', 'date_joined']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class MachineLubricantSerializer(serializers.ModelSerializer):
    class Meta:
        model = MachineLubricant
        fields = ['row_number', 'lubricant_type', 'alternative_lubricant_type', 'description']

class MachineRegistrationSerializer(serializers.ModelSerializer):
    lubricants = MachineLubricantSerializer(many=True, required=False)

    class Meta:
        model = MachineRegistration
        fields = '__all__'

    def create(self, validated_data):
        lubricants_data = validated_data.pop('lubricants', [])
        machine = MachineRegistration.objects.create(**validated_data)
        
        for i, lubricant_data in enumerate(lubricants_data):
            MachineLubricant.objects.create(
                machine=machine,
                row_number=i + 1, # Auto-assign row number if not provided, or overwrite
                **lubricant_data
            )
        return machine

    def update(self, instance, validated_data):
        lubricants_data = validated_data.pop('lubricants', None)
        
        # Update Machine instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if lubricants_data is not None:
            # Simple approach: Delete old and recreate new
            instance.lubricants.all().delete()
            for i, lubricant_data in enumerate(lubricants_data):
                MachineLubricant.objects.create(
                    machine=instance,
                    row_number=i + 1,
                    **lubricant_data
                )
        
        return instance