from django.urls import path
from . import views

app_name = "events"
urlpatterns = [
    path('create_user/', views.create_user, name='create_user'),
    path('create_session/', views.create_session, name='create_session'),
    path('<str:event_id>/', views.check_session, name='check_session'),
    path('event/<str:event_id>/proposed_times', views.get_proposed_times, name='get_proposed_times'),
    path('event/<int:event_id>/submit_votes/', views.submit_votes, name='submit_votes'),
    path('add_participant/', views.add_participant, name='add_participant'),
    path('event/<int:event_id>/results/', views.get_results, name='get_results'),
]