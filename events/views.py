from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import User, Event
from rest_framework import generics
from .serializers import UserSerializer
from django.http import JsonResponse

from rest_framework.decorators import api_view
from rest_framework import status

@api_view(['GET'])
def check_session(request, event_id):
    try:
        event = Event.objects.get(event_id=event_id)
        return JsonResponse({'message': f'Session exists!'}, status=status.HTTP_200_OK)
    except Event.DoesNotExist:
        return JsonResponse({}, status=status.HTTP_400_BAD_REQUEST)


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
