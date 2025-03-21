from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from .constants import TRANSACTION_CATEGORIES

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
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=TRANSACTION_CATEGORIES)
    description = models.TextField(blank=True, null=True)
    date = models.DateTimeField()  # Removed auto_now_add to allow user-provided dates

    def __str__(self):
        # This will make it easier to identify transactions in the admin or shell
        return f"{self.user.username} - {self.amount} ({self.category})"