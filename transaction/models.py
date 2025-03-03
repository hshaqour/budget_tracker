from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

# Create your models here.
class User(AbstractUser):
    pass


#Do the transaction model
'''Should have Time:
Time
Category
Amt
Description
'''

class Transaction(models.Model):
    CATEGORY_CHOICES = [
        ('Food', 'Food'),
        ('Rent', 'Rent'),
        ('Gym', 'Gym'),
        ('Entertainment', 'Entertainment'),
        ('Other', 'Other'),
    ]


    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)

    description = models.TextField(blank=True, null=True)

    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # This will make it easier to identify transactions in the admin or shell
        return f"{self.user.username} - {self.amount} ({self.category})"