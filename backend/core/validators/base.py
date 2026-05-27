import pandas as pd

class BaseValidator:
    def validate(self, df: pd.DataFrame) -> list:
        raise NotImplementedError("Subclasses must implement validate()")
