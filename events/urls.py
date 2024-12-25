from django.urls import path
from . import views

app_name = "events"
urlpatterns = [
    path("", views.index, name="index"),
    path('send_user_data/', views.send_user_data, name='send_user_data'),
    
]