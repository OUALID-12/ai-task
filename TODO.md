# Task Update Fixes - TODO

## Completed ✅
- [x] Fixed handleDepartmentChange to send department in JSON body instead of query parameters
- [x] Verified handleCompleteUpdate sends all required fields correctly
- [x] Ensured deadline field is handled properly (null or valid date string)

## Next Steps
- [ ] Test the department update PATCH request to confirm no more 400 errors
- [ ] Test the complete task update PUT request to confirm no more 400 errors
- [ ] Verify all partial update endpoints work correctly

## Summary of Changes
- Updated `handleDepartmentChange` in TaskEditTopSheet.tsx to send department as JSON body
- Confirmed `handleCompleteUpdate` properly handles all required fields including deadline as null or valid date
