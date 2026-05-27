from .base import BaseValidator
import pandas as pd

class SAPValidator(BaseValidator):
    def validate(self, df: pd.DataFrame) -> list:
        errors = []
        required_cols = ['Quantity', 'UoM', 'MaterialDescription', 'PlantCode']
        missing = [col for col in required_cols if col not in df.columns]
        if missing:
            errors.append(f"Missing required columns: {', '.join(missing)}")
        return errors
