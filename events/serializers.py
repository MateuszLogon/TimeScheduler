from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name', 'email']

class VoteSerializer(serializers.Serializer):
    time_id = serializers.IntegerField()
    vote = serializers.ChoiceField(choices=['yes', 'no'])

class SaveVotesSerializer(serializers.Serializer):
    event_id = serializers.IntegerField()
    responses = VoteSerializer(many=True)