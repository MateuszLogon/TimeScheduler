from django.urls import path
from . import views

app_name = "events"
urlpatterns = [
    path('create_user/', views.create_user, name='create_user'),
    path('<int:event_id>/', views.check_session, name='check_session'),
    path('event/<int:event_id>/proposed_times', views.get_proposed_times, name='get_proposed_times'),
    # path('api/create_user/', views.create_user, name='create_user'),
    path('event/<int:event_id>/submit_votes/', views.submit_votes, name='submit_votes'),
    # path('api/submit_responses/', views.submit_responses, name='submit_responses'),
]