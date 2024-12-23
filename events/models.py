from django.db import models


class User(models.Model):
    user_id = models.AutoField(primary_key=True)  
    name = models.CharField(max_length=100)  
    
    def __str__(self):
        return self.name 


class Event(models.Model):
    event_id = models.AutoField(primary_key=True)  
    title = models.CharField(max_length=255)  
    is_finished = models.BooleanField(default=False)  

    def __str__(self):
        return self.title  


class ProposedTime(models.Model):
    time_id = models.AutoField(primary_key=True)  
    event = models.ForeignKey(Event, on_delete=models.CASCADE)  
    proposed_time = models.DateTimeField()  
    length = models.DurationField()  

    def __str__(self):
        return f'{self.event.title} - {self.proposed_time}' 


class Vote(models.Model):
    vote_id = models.AutoField(primary_key=True)  
    user = models.ForeignKey(User, on_delete=models.CASCADE)  
    proposed_time = models.ForeignKey(ProposedTime, on_delete=models.CASCADE)  
    is_available = models.BooleanField()  

    def __str__(self):
        return f'{self.user.name} - {self.proposed_time.proposed_time}'  


class Participant(models.Model):
    participant_id = models.AutoField(primary_key=True)  
    event = models.ForeignKey(Event, on_delete=models.CASCADE) 
    user = models.ForeignKey(User, on_delete=models.CASCADE)  

    def __str__(self):
        return f'{self.user.name} - {self.event.title}'  

