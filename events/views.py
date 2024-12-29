from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import User, Event
from rest_framework import generics
from .serializers import UserSerializer

from rest_framework.decorators import api_view
from rest_framework import status
from .models import ProposedTime
from datetime import timedelta
from django.views.decorators.csrf import csrf_exempt
from .models import ProposedTime, Vote, Participant, User
import json


@csrf_exempt
def submit_votes(request, event_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print(f"Received data: {data}")  # Zaloguj otrzymane dane

            votes = data.get('votes', [])  # Oczekujemy, że votes będzie listą, a nie słownikiem
            user_id = data.get('user_id')

            # Sprawdź, czy użytkownik istnieje
            try:
                user = User.objects.get(user_id=user_id)
            except User.DoesNotExist:
                return JsonResponse({"error": "User not found"}, status=404)
            
            # Przetwarzanie głosów (teraz jest to lista, a nie słownik)
            for vote_entry in votes:
                time_id = vote_entry.get('time_id')
                vote = vote_entry.get('vote')

                if not time_id or not vote:
                    continue  # Jeśli brakuje czasu lub głosu, pomijamy ten wpis

                try:
                    proposed_time = ProposedTime.objects.get(time_id=time_id)
                except ProposedTime.DoesNotExist:
                    return JsonResponse({"error": f"Proposed time with id {time_id} not found"}, status=404)
                
                # Aktualizuj lub twórz nowy głos
                Vote.objects.update_or_create(
                    user=user,
                    proposed_time=proposed_time,
                    defaults={'is_available': vote == 'yes'}  # Zapisujemy `True` dla 'yes', `False` dla 'no'
                )

            return JsonResponse({"message": "Votes submitted successfully"})
        
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)
        
    return JsonResponse({"error": "Invalid request method"}, status=400)



def get_proposed_times(request, event_id):
    proposed_times = ProposedTime.objects.filter(event_id=event_id)
    data = [
        {
            'day': proposed_time.proposed_time.strftime('%A'),
            'day_number': proposed_time.proposed_time.strftime('%d'),
            'month': proposed_time.proposed_time.strftime('%B'),
            'year': proposed_time.proposed_time.strftime('%Y'),
            'start_time': proposed_time.proposed_time.strftime('%H:%M'),
            'end_time': (proposed_time.proposed_time + timedelta(hours=1)).strftime('%H:%M'),
            'time_id': proposed_time.time_id
        }
        for proposed_time in proposed_times
    ]
    return JsonResponse(data, safe=False)

@api_view(['GET'])
def check_session(request, event_id):
    try:
        event = Event.objects.get(event_id=event_id)
        return JsonResponse({'message': f'Session exists!'}, status=status.HTTP_200_OK)
    except Event.DoesNotExist:
        return JsonResponse({}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def create_user(request):
    if request.method == 'POST':
        user = UserSerializer(data=request.data)
        
        if user.is_valid():
            try:
                new_user = user.save()
                print(f"User created with user_id: {new_user.user_id}")

                return JsonResponse({'message': 'User created successfully!', 'user_id': new_user.user_id}, status=status.HTTP_201_CREATED)
            except Exception as e:
                print(f"Error creating user: {str(e)}")
                return JsonResponse({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return JsonResponse({'message': 'User already exists!'}, status=status.HTTP_226_IM_USED)
