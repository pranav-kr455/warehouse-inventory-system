import csv
import io
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import InventoryItem
from .serializers import InventoryItemSerializer

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer

    # Endpoint: GET /api/inventory/reorder_report/
    @action(detail=False, methods=['get'])
    def reorder_report(self, request):
        items = [item for item in InventoryItem.objects.all() if item.needs_reorder]
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)

    # Endpoint: POST /api/inventory/upload_csv/
    @action(detail=False, methods=['post'])
    def upload_csv(self, request):
        file = request.FILES.get('file')
        if not file or not file.name.endswith('.csv'):
            return Response({"error": "Please upload a valid CSV file."}, status=status.HTTP_400_BAD_REQUEST)

        decoded_file = file.read().decode('utf-8')
        io_string = io.StringIO(decoded_file)
        reader = csv.DictReader(io_string)

        created_count = 0
        updated_count = 0

        for row in reader:
            sku = row.get('sku', '').strip()
            item_name = row.get('item_name', '').strip()
            quantity = int(row.get('quantity', 0))
            threshold = int(row.get('threshold', 20))
            target_stock = int(row.get('target_stock', 100))

            item, created = InventoryItem.objects.update_or_create(
                sku=sku,
                defaults={
                    'item_name': item_name,
                    'quantity': quantity,
                    'threshold': threshold,
                    'target_stock': target_stock,
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        return Response({
            "message": "CSV processed successfully",
            "created": created_count,
            "updated": updated_count
        }, status=status.HTTP_200_OK)