from django.shortcuts import render
from django.http import JsonResponse

def index(request):
    return render(request, 'events/index.html')  

def send_user_data(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        return JsonResponse({'name': name, 'email': email})

