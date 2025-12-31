from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from machinlist.views import (
    UserViewSet, 
    MachineRegistrationViewSet,
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    LogoutView,
    export_machine_doc,
    export_machine_pdf
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'machines', MachineRegistrationViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/login/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
    path('api/machines/<int:pk>/export/', export_machine_doc, name='export_machine_doc'),
    path('api/machines/<int:pk>/export_pdf/', export_machine_pdf, name='export_machine_pdf'),
]
