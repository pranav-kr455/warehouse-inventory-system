import csv
import os

INPUT_FILE = "stock_data.csv"
OUTPUT_FILE = "restock_report.csv"


def load_stock_data(filepath):
    """
    Reads inventory CSV into a list of dictionaries with error handling.
    Creates a sample file if no input file exists.
    """
    if not os.path.exists(filepath):
        print(f"[!] '{filepath}' not found. Creating a sample dataset...")
        sample_data = [
            ["sku", "item_name", "quantity", "threshold"],
            ["SKU-3311", "Steel Bolts (M6)", 42, 50],
            ["SKU-4456", "Cardboard Boxes (L)", 9, 30],
            ["SKU-5502", "Bubble Wrap Roll", 130, 40],
            ["SKU-6120", "Adhesive Labels", 15, 20],
            ["SKU-1042", "Cotton Fabric Roll", 18, 20],
            ["SKU-2087", "Packing Tape", 240, 50],
        ]
        with open(filepath, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerows(sample_data)

    stock_list = []
    with open(filepath, mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            try:
                stock_list.append(
                    {
                        "sku": row["sku"].strip(),
                        "item_name": row["item_name"].strip(),
                        "quantity": int(row["quantity"]),
                        "threshold": int(row["threshold"]),
                    }
                )
            except (ValueError, KeyError) as e:
                # Handle malformed or incomplete rows cleanly
                print(f"[Warning] Skipping invalid row {row}: {e}")
                continue

    return stock_list


def scan_and_flag_stock(stock_data):
    """
    Loops through items, compares quantity vs threshold using conditionals,
    and flags low stock items along with priority tiers.
    """
    reorder_list = []

    for item in stock_data:
        qty = item["quantity"]
        threshold = item["threshold"]

        # Conditional logic: Flag item if current quantity is at or below threshold
        if qty <= threshold:
            units_needed = threshold - qty
            # Priority logic: Flag as CRITICAL if stock is below 25% of threshold
            priority = "CRITICAL" if qty < (threshold * 0.25) else "LOW"

            reorder_list.append(
                {
                    "sku": item["sku"],
                    "item_name": item["item_name"],
                    "quantity": qty,
                    "threshold": threshold,
                    "priority": priority,
                    "units_needed": units_needed,
                }
            )

    return reorder_list


def export_csv_report(reorder_list, output_filepath):
    """Writes flagged items out to a CSV summary report."""
    if not reorder_list:
        return

    fieldnames = [
        "sku",
        "item_name",
        "quantity",
        "threshold",
        "priority",
        "units_needed",
    ]
    with open(output_filepath, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(reorder_list)


def print_console_summary(reorder_list, total_scanned):
    """Prints a clean, formatted report for warehouse managers."""
    print("\n" + "=" * 65)
    print("           DAILY WAREHOUSE RESTOCK REPORT")
    print("=" * 65)
    print(
        f"Total Scanned: {total_scanned} items | Flagged for Reorder: {len(reorder_list)} items"
    )
    print("-" * 65)

    if not reorder_list:
        print(" All items are sufficiently stocked. No reorders needed.")
    else:
        print(
            f"{'SKU':<10} | {'Item Name':<22} | {'Qty':<5} | {'Status':<10} | {'Deficit'}"
        )
        print("-" * 65)
        for item in reorder_list:
            print(
                f"{item['sku']:<10} | {item['item_name']:<22} | {item['quantity']:<5} | "
                f"{item['priority']:<10} | +{item['units_needed']} units needed"
            )

    print("=" * 65 + "\n")


def main():
    # 1. Load CSV data into a list of dictionaries
    stock_data = load_stock_data(INPUT_FILE)

    if not stock_data:
        print("No stock data available.")
        return

    # 2. Evaluate stock levels against thresholds
    reorder_items = scan_and_flag_stock(stock_data)

    # 3. Output human-readable report to console
    print_console_summary(reorder_items, len(stock_data))

    # 4. Generate output CSV report
    if reorder_items:
        export_csv_report(reorder_items, OUTPUT_FILE)
        print(f"[+] Restock report saved to '{OUTPUT_FILE}'")


if __name__ == "__main__":
    main()