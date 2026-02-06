# Excel Templates Quick Reference

## Residents Template

| Column Name | Required | Format | Example | Notes |
|------------|----------|--------|---------|-------|
| Name* | ✅ Yes | Text | John Doe | Full name |
| Email* | ✅ Yes | Email | john@example.com | Valid email format |
| Mobile* | ✅ Yes | 10 digits | 9876543210 | Must start with 6-9 |
| Login Name* | ✅ Yes | Text | john.doe | Unique, no spaces |
| Password* | ✅ Yes | Text | password123 | Min 6 characters |
| Flat Number* | ✅ Yes | Text | A-101 | Flat/Unit number |
| Wing | ❌ No | Text | A | Building wing |
| Floor | ❌ No | Number | 1 | Floor number |
| Ownership Type | ❌ No | owner/tenant | owner | Default: owner |

**Download:** Click "Bulk Upload" → Select "Residents" → "Download Template"

---

## Security Personnel Template

| Column Name | Required | Format | Example | Notes |
|------------|----------|--------|---------|-------|
| Name* | ✅ Yes | Text | Ramesh Kumar | Full name |
| Email* | ✅ Yes | Email | ramesh@example.com | Valid email format |
| Mobile* | ✅ Yes | 10 digits | 9876543212 | Must start with 6-9 |
| Login Name* | ✅ Yes | Text | ramesh.security | Unique, no spaces |
| Password* | ✅ Yes | Text | password123 | Min 6 characters |
| Shift | ❌ No | Text | morning | morning/evening/night |
| ID Number | ❌ No | Text | SEC001 | Employee ID |

**Download:** Click "Bulk Upload" → Select "Security Personnel" → "Download Template"

---

## Staff Template

| Column Name | Required | Format | Example | Notes |
|------------|----------|--------|---------|-------|
| Name* | ✅ Yes | Text | Prakash Sharma | Full name |
| Role* | ✅ Yes | Text | cleaner | Job role |
| Mobile* | ✅ Yes | 10 digits | 9876543214 | Must start with 6-9 |
| Email | ❌ No | Email | prakash@example.com | Optional |
| ID Number | ❌ No | Text | STF001 | Employee ID |
| Shift | ❌ No | Text | morning | Work shift |
| Salary | ❌ No | Number | 15000 | Monthly salary |
| Join Date | ❌ No | YYYY-MM-DD | 2024-01-15 | Date format |

**Download:** Click "Bulk Upload" → Select "Staff Members" → "Download Template"

---

## Common Validation Rules

### ✅ Valid Examples
- **Email:** `john@example.com`, `user.name@domain.co.in`
- **Mobile:** `9876543210`, `8765432109`, `7654321098`
- **Login Name:** `john.doe`, `ramesh123`, `security_01`
- **Ownership Type:** `owner`, `Owner`, `OWNER`, `tenant`, `Tenant`
- **Date:** `2024-01-15`, `2024-12-31`

### ❌ Invalid Examples
- **Email:** `john@example` (missing domain), `john.example.com` (missing @)
- **Mobile:** `1234567890` (doesn't start with 6-9), `98765` (not 10 digits)
- **Login Name:** `john doe` (has space), `john@doe` (special chars)
- **Ownership Type:** `renter`, `landlord`, `occupant`
- **Date:** `15-01-2024`, `01/15/2024`, `2024/01/15`

---

## Quick Start Steps

1. **Download Template** → Click "Bulk Upload" button
2. **Select Type** → Choose Residents/Security/Staff
3. **Download** → Click "Download Template"
4. **Fill Data** → Open Excel, replace sample data
5. **Save File** → Save as .xlsx or .xls
6. **Upload** → Choose file and click "Upload & Process"
7. **Review** → Check results and fix any errors

---

## Pro Tips

💡 **Start Small:** Test with 2-3 rows first  
💡 **Keep Headers:** Never delete or modify the first row  
💡 **Use Samples:** Review sample data for correct format  
💡 **Check Required:** All fields marked with * must be filled  
💡 **Unique Logins:** Each login name must be unique  
💡 **Valid Mobile:** Must be 10 digits starting with 6, 7, 8, or 9  
💡 **Save Backup:** Keep a copy before uploading  
💡 **Fix Errors:** Read error messages carefully and correct data  

---

## Need Help?

📖 **Full Guide:** See `BULK_UPLOAD_GUIDE.md` for detailed instructions  
🔧 **Troubleshooting:** Check error messages and validation rules  
👤 **Support:** Contact your system administrator
