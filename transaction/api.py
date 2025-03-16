from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import Transaction
from .serializers import TransactionSerializer

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        This view should return a list of all transactions
        for the currently authenticated user.
        """
        return Transaction.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        """
        When creating a new transaction, associate it with the current user
        """
        serializer.save(user=self.request.user) 