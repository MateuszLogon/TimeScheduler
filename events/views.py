from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import User

def index(request):
    return render(request, 'events/index.html')  

def send_user_data(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        
        if name and email:
            try:
                user = User.objects.create(name=name, email=email)
                return JsonResponse({'name': user.name, 'email': user.email})
            
            except Exception as e:
                return JsonResponse({'error': f'Error saving data: {str(e)}'}, status=400)

        return JsonResponse({'error': 'Invalid data'}, status=400)
    
    return JsonResponse({'error': 'Invalid request method'}, status=405)