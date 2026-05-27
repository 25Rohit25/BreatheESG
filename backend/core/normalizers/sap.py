from decimal import Decimal
import pandas as pd
from datetime import datetime

class SAPNormalizer:
    def normalize(self, row: dict) -> dict:
        qty = float(row.get('Quantity', 0) or 0)
        unit = str(row.get('UoM', '')).strip().upper()
        
        norm_qty = qty
        if unit in ['GAL', 'GALLONS']:
            norm_qty = qty * 3.78541
            unit = 'L'
        elif unit not in ['L', 'LITERS']:
            unit = 'UNKNOWN'
        
        material = str(row.get('MaterialDescription', 'Unknown'))
        ef = Decimal('2.68') if 'Diesel' in material else Decimal('2.31')
        
        try:
            activity_date = pd.to_datetime(row.get('PostingDate')).date()
        except:
            activity_date = datetime.today().date()
            
        return {
            'activity_date': activity_date,
            'activity_type': material,
            'quantity': Decimal(str(qty)),
            'unit': unit,
            'normalized_quantity': Decimal(str(norm_qty)),
            'scope': '1',
            'category': 'Stationary Combustion',
            'location': str(row.get('PlantCode', '')),
            'emission_factor': ef,
            'calculated_emissions_kgco2e': Decimal(str(norm_qty)) * ef,
        }
