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
from datetime import datetime, timedelta
import logging
from django.utils.dateformat import DateFormat

logger = logging.getLogger(__name__)

@csrf_exempt
def submit_votes(request, event_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print(f"Received data: {data}") 

            votes = data.get('votes', []) 
            user_id = data.get('user_id')

            try:
                user = User.objects.get(user_id=user_id)
            except User.DoesNotExist:
                return JsonResponse({"error": "User not found"}, status=404)
            
            # Przetwarzanie głosów (teraz jest to lista, a nie słownik)
            for vote_entry in votes:
                time_id = vote_entry.get('time_id')
                vote = vote_entry.get('vote')

                if not time_id or not vote:
                    continue  

                try:
                    proposed_time = ProposedTime.objects.get(time_id=time_id)
                except ProposedTime.DoesNotExist:
                    return JsonResponse({"error": f"Proposed time with id {time_id} not found"}, status=404)
                
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
    data = []

    for proposed_time in proposed_times:
        # Konwersja HHMMSS na sekundy
        length_hours = proposed_time.length
        length_timedelta = timedelta(hours=length_hours)

        # Obliczanie czasu końca
        end_time = proposed_time.proposed_time + length_timedelta

        data.append({
            'day': proposed_time.proposed_time.strftime('%A'),
            'day_number': proposed_time.proposed_time.strftime('%d'),
            'month': proposed_time.proposed_time.strftime('%B'),
            'year': proposed_time.proposed_time.strftime('%Y'),
            'start_time': proposed_time.proposed_time.strftime('%H:%M'),
            'end_time': end_time.strftime('%H:%M'),
            'time_id': proposed_time.time_id
        })

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

                return JsonResponse({
                    'message': 'User created successfully!',
                    'user_id': new_user.user_id
                }, status=201) 

            except Exception as e:
                print(f"Error creating user: {str(e)}")
                return JsonResponse({'error': str(e)}, status=400)

        else:
            return JsonResponse({'message': 'User already exists!'}, status=226)


@api_view(['POST'])
def create_session(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            session_name = data["name"]
            arr_datetime_str = data["dates"]
            # address = data["meeting_address"]
            e = Event(title=session_name, is_finished=False)
            e.save()

            for datetime_str in arr_datetime_str:
                duration = datetime_str[1]
                datetime_obj = datetime.strptime(datetime_str[0], "%Y-%m-%dT%H:%M:%S.%fZ")
                pt = ProposedTime(event=e, proposed_time=datetime_obj, length=duration)
                pt.save()
            
            return JsonResponse({'message': f'Session created successfully! Event id {e.event_id}'}, status=status.HTTP_200_OK)
        except Exception as e:
            print(f'[CREATE_SESSION] Error msg: {e}')
            return JsonResponse({'message': f'Session couldn\'t be created! Error msg: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
           
@api_view(['POST'])
def add_participant(request):
    if request.method == 'POST':
        try:
            # Pobieranie user_id i event_id z request.data
            user_id = request.data.get('user_id')
            event_id = request.data.get('event_id')
            
            # Logowanie wejściowych danych
            logger.debug(f"Received user_id: {user_id}, event_id: {event_id}")

            # Znajdź użytkownika na podstawie user_id
            user = User.objects.get(user_id=user_id)
            event = Event.objects.get(event_id=event_id)

            # Dodaj uczestnika do wydarzenia
            participant = Participant.objects.create(user=user, event=event)

            # Logowanie sukcesu
            logger.debug(f"Participant added: {participant}")

            return JsonResponse({
                'message': 'Participant added successfully!',
                'user_id': user_id,
                'event_id': event_id
            }, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            logger.error(f"User with user_id {user_id} not found.")
            return JsonResponse({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Event.DoesNotExist:
            logger.error(f"Event with event_id {event_id} not found.")
            return JsonResponse({'message': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error while adding participant: {str(e)}")
            return JsonResponse({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 

@api_view(['GET'])
def get_results(request, event_id):
    try:
        event = Event.objects.get(event_id=event_id)
        proposed_times = ProposedTime.objects.filter(event=event)

        results = []
        for proposed_time in proposed_times:
            yes_votes = Vote.objects.filter(proposed_time=proposed_time, is_available=True).count()
            no_votes = Vote.objects.filter(proposed_time=proposed_time, is_available=False).count()

            formatted_time = proposed_time.proposed_time.isoformat()

            results.append({
                'time_id': proposed_time.time_id,
                'proposed_time': formatted_time, 
                'yes_votes': yes_votes,
                'no_votes': no_votes
            })

        return JsonResponse(results, safe=False)

    except Event.DoesNotExist:
        return JsonResponse({'message': 'Event not found'}, status=404)