from rest_framework import serializers
from .models import InventoryItem

class InventoryItemSerializer(serializers.ModelSerializer):
    needs_reorder = serializers.ReadOnlyField()
    priority = serializers.ReadOnlyField()
    suggested_reorder = serializers.ReadOnlyField()

    class Meta:
        model = InventoryItem
        fields = [
            'id', 'sku', 'item_name', 'quantity', 'threshold', 
            'target_stock', 'needs_reorder', 'priority', 
            'suggested_reorder', 'updated_at'
        ]