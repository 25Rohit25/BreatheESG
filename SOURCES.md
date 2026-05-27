# Realistic Data Sources & Assumptions

## 1. SAP Fuel & Procurement
**Format**: Flat-file CSV Export
**Challenge**: ERP systems often output localized column names (e.g., `Menge` instead of `Quantity`) and inconsistent units (Liters vs Gallons). 
**Solution**: Our `ColumnMapping` and `SAPNormalizer` handle this gracefully by standardizing units to Liters before applying Scope 1 emission factors.

## 2. Utility Electricity Portal
**Format**: CSV Export from Provider Dashboard
**Challenge**: Billing cycles rarely align perfectly with calendar months, and usage is often estimated rather than actual.
**Solution**: The normalizer captures the exact period, applies the Scope 2 emission factor, and flags negative usage (which usually indicates a roll-back or billing correction rather than actual generation).

## 3. Corporate Travel (e.g., Concur/Navan)
**Format**: JSON/CSV Export
**Challenge**: Travel records mix multiple activity types (Flights, Hotel nights, Trains) in a single feed.
**Solution**: The `TravelParser` inspects the `ExpenseType` to route the row to the correct calculation logic (distance-based for flights, night-based for hotels) and assigns Scope 3 Category 6.
