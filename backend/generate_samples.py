import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

def generate_sap_fuel_data(output_dir):
    data = []
    materials = ['Diesel - High Speed', 'Petrol Unleaded', 'Heating Oil', 'LPG']
    units = ['L', 'Liters', 'kg', 'Gal', 'kWh']
    plants = ['Plant_A', 'Plant_B', 'HQ_London', 'Factory_Munich']
    vendors = ['Shell', 'BP', 'Total', 'Local Supplier']
    
    start_date = datetime(2023, 1, 1)
    
    for i in range(100):
        qty = round(np.random.uniform(50, 5000), 2)
        
        # Add some dirty data (anomalies)
        if i % 15 == 0:
            qty = qty * 100 # extremely high quantity
        if i % 25 == 0:
            unit = 'UNKNOWN'
        else:
            unit = np.random.choice(units)
            
        data.append({
            'MaterialDescription': np.random.choice(materials),
            'Quantity': qty,
            'UoM': unit,
            'PlantCode': np.random.choice(plants),
            'PostingDate': (start_date + timedelta(days=np.random.randint(0, 365))).strftime('%Y-%m-%d'),
            'TotalCost': round(qty * np.random.uniform(1.2, 2.5), 2),
            'VendorName': np.random.choice(vendors)
        })
    
    df = pd.DataFrame(data)
    df.to_csv(os.path.join(output_dir, 'sap_fuel_export.csv'), index=False)
    print("Generated sap_fuel_export.csv")

def generate_utility_electricity(output_dir):
    data = []
    meters = ['MTR-1001', 'MTR-1002', 'MTR-2001']
    facilities = ['HQ_London', 'HQ_London', 'Factory_Munich']
    
    for m_idx, meter in enumerate(meters):
        current_date = datetime(2023, 1, 1)
        for _ in range(12):
            end_date = current_date + timedelta(days=np.random.randint(28, 32))
            
            kwh = round(np.random.uniform(10000, 50000), 2)
            # Add anomaly
            if np.random.random() < 0.05:
                kwh = -500 # Negative usage
                
            data.append({
                'MeterID': meter,
                'Facility': facilities[m_idx],
                'PeriodStart': current_date.strftime('%Y/%m/%d'),
                'PeriodEnd': end_date.strftime('%Y/%m/%d'),
                'Usage_kWh': kwh,
                'TotalCharge': round(kwh * 0.15, 2)
            })
            current_date = end_date
            
    df = pd.DataFrame(data)
    df.to_csv(os.path.join(output_dir, 'utility_electricity.csv'), index=False)
    print("Generated utility_electricity.csv")

def generate_corporate_travel(output_dir):
    data = []
    types = ['Flight', 'Hotel', 'Train']
    classes = ['Economy', 'Business', 'Standard']
    locations = ['LHR', 'JFK', 'MUC', 'CDG', 'DXB']
    
    start_date = datetime(2023, 1, 1)
    
    for i in range(150):
        t_type = np.random.choice(types, p=[0.7, 0.2, 0.1])
        origin = np.random.choice(locations)
        dest = np.random.choice([l for l in locations if l != origin])
        
        dist = round(np.random.uniform(200, 8000), 1)
        if t_type == 'Hotel':
            dist = 0
            
        # Anomaly
        if i % 30 == 0 and t_type == 'Flight':
            dist = 999999 # Erroneous distance
            
        data.append({
            'TripID': f'TRP-{10000+i}',
            'ExpenseType': t_type,
            'Distance': dist,
            'DistanceUnit': 'km',
            'Origin': origin if t_type != 'Hotel' else '',
            'Destination': dest if t_type != 'Hotel' else np.random.choice(locations),
            'TravelDate': (start_date + timedelta(days=np.random.randint(0, 365))).strftime('%d-%m-%Y'),
            'CabinClass': np.random.choice(classes)
        })
        
    df = pd.DataFrame(data)
    df.to_csv(os.path.join(output_dir, 'corporate_travel.csv'), index=False)
    print("Generated corporate_travel.csv")

if __name__ == "__main__":
    output_dir = "sample_data"
    os.makedirs(output_dir, exist_ok=True)
    generate_sap_fuel_data(output_dir)
    generate_utility_electricity(output_dir)
    generate_corporate_travel(output_dir)
    print("Done generating sample data.")
