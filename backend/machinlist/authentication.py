from pickle import NONE
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import CSRFCheck
from rest_framework import exceptions
from django.conf import settings

def enforce_csrf(request):
    check = CSRFCheck(lambda x: None)
    check.process_request(request)
    reason = check.process_view(request,None,(),{})
    if reason :
        raise exceptions.PermissionDenied(f'CSRF Failed: {reason}')
    
class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self,request):
        header = self.get_header(request)
        if header is None:
            raw_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE']) or None
        else:
            raw_token = self.get_raw_token(header)
        
        if raw_token is None:
            print(f"DEBUG: Authentication Failed. Header: {header}, Cookies: {request.COOKIES.keys()}")
            return None
        
        validated_token = self.get_validated_token(raw_token)
        
        if header is None:
            enforce_csrf(request)
            return self.get_user(validated_token), validated_token