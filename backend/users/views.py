from django.contrib.auth.hashers import make_password, check_password
from django.http import JsonResponse
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import render
from .models import User
import uuid

def signup(request):
    if request.method == 'POST':
        data = request.POST
        email = data.get('email')
        password = data.get('password')
        
        if User.objects.filter(user_email=email).exists():
            return JsonResponse({'error': 'Email already exists'}, status=400)

        hashed_password = make_password(password)
        new_user = User.objects.create(
            user_email=email,
            user_password=hashed_password,
        )

        # Send verification email
        verification_link = f"http://yourdomain.com/verify/{new_user.user_id}"
        send_mail(
            'Verify your account',
            f'Please click the following link to verify your account: {verification_link}',
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )
        
        return JsonResponse({'message': 'User created. Please verify your email.'}, status=201)

def signin(request):
    if request.method == 'POST':
        data = request.POST
        email = data.get('email')
        password = data.get('password')

        try:
            user = User.objects.get(user_email=email)
            if check_password(password, user.user_password):
                return JsonResponse({'message': 'Login successful', 'user_id': user.user_id}, status=200)
            else:
                return JsonResponse({'error': 'Invalid credentials'}, status=400)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User does not exist'}, status=404)
