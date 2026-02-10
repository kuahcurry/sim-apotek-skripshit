import csv
import math

# Read the CSV file
with open('storage/app/private/dataobat.csv', 'r', encoding='utf-8') as file:
    reader = csv.reader(file)
    rows = list(reader)

# Modify header
header = rows[0].split(',')
# Insert stok_total after satuan_id (index 6)
header_list = header[0].split(',')
new_header = header_list[:7] + ['stok_total'] + header_list[7:]

# Process data rows
new_rows = [','.join(new_header)]

for i in range(1, len(rows)):
    if not rows[i].strip():
        continue
    
    parts = rows[i].split(',')
    if len(parts) < 8:
        continue
    
    # Extract parts
    before_stok = parts[:7]  # kode through satuan_id
    stok_minimum = parts[7] if len(parts) > 7 else '10'
    
    # Calculate stok_total (2x minimum or at least 50)
    try:
        min_val = int(stok_minimum)
        stok_total = max(50, min_val * 2)
    except:
        stok_total = 100
    
    # Reconstruct row
    new_row = before_stok + [str(stok_total)] + parts[7:]
    new_rows.append(','.join(new_row))

# Write back
with open('storage/app/private/dataobat.csv', 'w', encoding='utf-8', newline='') as file:
    for row in new_rows:
        file.write(row + '\n')

print(f"✅ Added stok_total column. Total rows: {len(new_rows)}")
