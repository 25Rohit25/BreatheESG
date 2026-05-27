from core.validators.sap import SAPValidator
from core.normalizers.sap import SAPNormalizer

class SAPParser:
    def __init__(self):
        self.validator = SAPValidator()
        self.normalizer = SAPNormalizer()
        
    def detect_suspicious(self, norm_data: dict) -> str:
        flags = []
        qty = float(norm_data['normalized_quantity'])
        if qty < 0:
            flags.append("Negative fuel quantity detected")
        if qty > 50000:
            flags.append("Unusually high fuel spikes (>50k L)")
        if norm_data['unit'] == 'UNKNOWN':
            flags.append("Unknown unit of measure")
        return " | ".join(flags) if flags else None
