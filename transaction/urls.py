from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import api

# Create a router and register our viewset with it.
router = DefaultRouter()
router.register(r'api/transactions', api.TransactionViewSet, basename='transaction')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path('', include(router.urls)),
]
