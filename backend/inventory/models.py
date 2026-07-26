from django.db import models


class InventoryItem(models.Model):
    sku = models.CharField(max_length=50, unique=True, db_index=True)
    item_name = models.CharField(max_length=150)
    quantity = models.IntegerField(default=0)
    threshold = models.IntegerField(default=20)
    target_stock = models.IntegerField(default=100)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Inventory Item"
        verbose_name_plural = "Inventory Items"
        ordering = ["sku"]

    def save(self, *args, **kwargs):
        """Clean whitespace from strings before saving."""
        if self.sku:
            self.sku = self.sku.strip()
        if self.item_name:
            self.item_name = self.item_name.strip()
        super().save(*args, **kwargs)

    @property
    def needs_reorder(self) -> bool:
        """Determines if current quantity has reached or fallen below threshold."""
        return self.quantity <= self.threshold

    @property
    def priority(self) -> str:
        """
        Classifies stock urgency:
        - NORMAL: Quantity above threshold.
        - CRITICAL: Quantity below 25% of threshold.
        - LOW: Quantity below threshold, but above 25%.
        """
        if not self.needs_reorder:
            return "NORMAL"
        return "CRITICAL" if self.quantity < (self.threshold * 0.25) else "LOW"

    @property
    def suggested_reorder(self) -> int:
        """Calculates deficit units required to reach healthy target stock."""
        return max(0, self.target_stock - self.quantity)

    def __str__(self):
        return f"{self.sku} - {self.item_name}"