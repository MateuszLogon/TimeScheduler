from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import User, Event
from rest_framework import generics
from .serializers import UserSerializer

from rest_framework.decorators import api_view
from rest_framework import status
from .models import ProposedTime
from datetime import timedelta



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
                user.save()  
                return JsonResponse({'message': f'User created successfully!'}, status=status.HTTP_201_CREATED)
            except Event.DoesNotExist:
                return JsonResponse(user.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return JsonResponse({'message': 'User already exists!'}, status=status.HTTP_226_IM_USED)
