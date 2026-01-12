# Frontend Updates Needed

## ✅ Completed
- Footer component created
- Layout updated with footer
- Tracking page updated for new booking structure
- Document upload API updated

## ❌ Missing/Needs Update

### 1. QuoteCalculator Component
**Current:** Uses `/api/quote/calculate` (old structure)
**Needs:** 
- Update to use `/api/quote/create` 
- Collect full address data (not just postcodes)
- Collect full vehicle data (make, model, year)
- Store quote_id for booking creation

### 2. BookingPage Component  
**Current:** Uses old nested structure
**Needs:**
- Update to use quote_id from stored quote
- Send pickupAddress, dropoffAddress, vehicle objects
- Use new booking structure with foreign keys
- Handle booking_number instead of bookingId

### 3. AdminPage Component
**Current:** Uses bookingId (old field)
**Needs:**
- Update to use booking_number
- Update to use new booking structure
- Add admin-only fields display (internal_cost, internal_margin)
- Add JobAssignment management
- Add ConditionReport management

### 4. NEW: ConditionReport Component
**Needs:**
- Form for pickup/delivery condition reports
- Checklist JSON input
- Odometer/fuel level inputs
- Signature capture
- Mandatory before status changes

### 5. NEW: Admin Internal Management Pages
**Needs:**
- Carrier management (internal only)
- QuoteInternal view (admin only)
- CarrierSettlement management (finance only)
- JobAssignment management (dispatch)

### 6. Carrier Model Update
**Status:** ✅ Updated with all required fields (legal_name, trading_name, abn, etc.)

## Priority Order
1. Update QuoteCalculator (critical for quote flow)
2. Update BookingPage (critical for booking flow)
3. Update AdminPage (needed for admin operations)
4. Create ConditionReport component
5. Create admin management pages
