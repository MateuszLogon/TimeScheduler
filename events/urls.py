from django.urls import path
from . import views

app_name = "events"
urlpatterns = [
    path('create_user/', views.create_user, name='create_user'),
    path('<int:event_id>/', views.check_session, name='check_session'),
]