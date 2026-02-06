# Bulk Upload Feature - User Guide

## Overview
The Bulk Upload feature allows Administrators to quickly add multiple Residents, Security Personnel, and Staff Members to the system using Excel files. This eliminates the need to manually enter each person one by one.

## Features
- ✅ Upload Residents with flat details
- ✅ Upload Security Personnel with shift information
- ✅ Upload Staff Members with role and salary details
- ✅ Download pre-formatted Excel templates
- ✅ Automatic data validation
- ✅ Detailed error reporting
- ✅ Sample data included in templates

## How to Use

### Step 1: Access Bulk Upload
1. Login as **Administrator**
2. Navigate to one of these sections:
   - **Residents** page
   - **Security Personnel** page
   - **Staff Management** page
3. Click the **"Bulk Upload"** button (top-right corner)

### Step 2: Download Template
1. Select the upload type (Residents/Security/Staff)
2. Click **"Download Template"** button
3. An Excel file will be downloaded with:
   - Pre-formatted columns
   - Sample data rows
   - Field descriptions

### Step 3: Fill the Excel File
1. Open the downloaded Excel file
2. **Keep the header row** (first row) as is
3. **Delete or replace** the sample data rows
4. Fill in your actual data
5. Follow the field requirements (see below)
6. Save the file

### Step 4: Upload the File
1. Click **"Choose Excel File"** button
2. Select your filled Excel file
3. Click **"Upload & Process"** button
4. Wait for validation and processing

### Step 5: Review Results
- View upload summary (Total/Success/Failed)
- Check validation errors if any
- Fix errors in Excel and re-upload if needed
- Click **"Done"** when finished

## Excel Templates

### 1. Residents Template

**Required Fields (marked with *):**
- **Name*** - Full name of the resident
- **Email*** - Valid email address
- **Mobile*** - 10-digit mobile number (starting with 6-9)
- **Login Name*** - Unique username for login
- **Password*** - Login password (min 6 characters)
- **Flat Number*** - Flat/Unit number (e.g., A-101, B-202)

**Optional Fields:**
- **Wing** - Building wing/block (e.g., A, B, C)
- **Floor** - Floor number
- **Ownership Type** - Either "owner" or "tenant"

**Example:**
```
Name          | Email                  | Mobile      | Login Name  | Password    | Flat Number | Wing | Floor | Ownership Type
John Doe      | john.doe@example.com   | 9876543210  | john.doe    | password123 | A-101       | A    | 1     | owner
Jane Smith    | jane.smith@example.com | 9876543211  | jane.smith  | password123 | B-202       | B    | 2     | tenant
```

### 2. Security Personnel Template

**Required Fields (marked with *):**
- **Name*** - Full name
- **Email*** - Valid email address
- **Mobile*** - 10-digit mobile number
- **Login Name*** - Unique username
- **Password*** - Login password (min 6 characters)

**Optional Fields:**
- **Shift** - Work shift (morning/evening/night)
- **ID Number** - Employee/Security ID

**Example:**
```
Name          | Email                    | Mobile      | Login Name       | Password    | Shift   | ID Number
Ramesh Kumar  | ramesh.kumar@example.com | 9876543212  | ramesh.security  | password123 | morning | SEC001
Suresh Patil  | suresh.patil@example.com | 9876543213  | suresh.security  | password123 | night   | SEC002
```

### 3. Staff Template

**Required Fields (marked with *):**
- **Name*** - Full name
- **Role*** - Job role (cleaner/plumber/electrician/gardener/etc)
- **Mobile*** - 10-digit mobile number

**Optional Fields:**
- **Email** - Email address (if available)
- **ID Number** - Employee ID
- **Shift** - Work shift
- **Salary** - Monthly salary amount
- **Join Date** - Date of joining (format: YYYY-MM-DD)

**Example:**
```
Name           | Role     | Mobile      | Email                    | ID Number | Shift     | Salary | Join Date
Prakash Sharma | cleaner  | 9876543214  | prakash.sharma@email.com | STF001    | morning   | 15000  | 2024-01-15
Vijay Mehta    | plumber  | 9876543215  | vijay.mehta@email.com    | STF002    | full-time | 20000  | 2024-02-01
```

## Validation Rules

### Email Validation
- Must be in valid email format: `user@domain.com`
- Example: ✅ `john@example.com` | ❌ `john@example`

### Mobile Validation
- Must be exactly 10 digits
- Must start with 6, 7, 8, or 9
- Example: ✅ `9876543210` | ❌ `1234567890`

### Ownership Type (Residents only)
- Must be either "owner" or "tenant"
- Case-insensitive
- Example: ✅ `owner`, `Owner`, `OWNER` | ❌ `renter`

### Password
- Minimum 6 characters
- Can contain letters, numbers, and special characters

### Login Name
- Must be unique across the system
- No spaces allowed
- Recommended format: firstname.lastname

## Common Errors and Solutions

### Error: "Email is required"
**Solution:** Fill in the Email column for all rows

### Error: "Invalid email format"
**Solution:** Check email format - must be `user@domain.com`

### Error: "Invalid mobile number"
**Solution:** 
- Ensure 10 digits only
- Must start with 6, 7, 8, or 9
- Remove any spaces, dashes, or country codes

### Error: "Ownership type must be owner or tenant"
**Solution:** Use only "owner" or "tenant" (case-insensitive)

### Error: "Login Name already exists"
**Solution:** Use a unique login name that hasn't been used before

## Tips for Successful Upload

1. **Use the Template**: Always start with the downloaded template
2. **Check Sample Data**: Review the sample rows to understand the format
3. **Required Fields**: Never leave required fields (marked with *) empty
4. **Data Format**: Follow the exact format shown in examples
5. **Test Small**: Start with 2-3 rows to test before uploading hundreds
6. **Review Errors**: If upload fails, carefully read error messages
7. **Fix and Retry**: Correct errors in Excel and upload again
8. **Backup**: Keep a backup of your Excel file before uploading

## Technical Details

### Supported File Formats
- `.xlsx` (Excel 2007 and later)
- `.xls` (Excel 97-2003)

### File Size Limit
- No strict limit, but recommended to keep under 1000 rows per upload
- For larger datasets, split into multiple files

### Processing Time
- Small files (< 50 rows): Few seconds
- Medium files (50-200 rows): 10-30 seconds
- Large files (200+ rows): 30-60 seconds

### Data Storage
- All uploaded data is stored in the database
- Users are created with "approved" status automatically
- Passwords are stored securely

## Security Notes

1. **Password Security**: 
   - Passwords in Excel are temporary
   - Users should change passwords after first login
   - Consider using a default password and asking users to reset

2. **Data Privacy**:
   - Keep Excel files secure
   - Delete files after successful upload
   - Don't share files containing personal information

3. **Access Control**:
   - Only Administrators can perform bulk uploads
   - All uploads are logged with timestamp and admin details

## Troubleshooting

### Upload button not working?
- Check if you're logged in as Administrator
- Ensure you've selected a valid Excel file
- Try refreshing the page

### Template download not working?
- Check browser download settings
- Try a different browser
- Ensure pop-ups are not blocked

### All rows showing errors?
- Verify you're using the correct template
- Check if header row is intact
- Ensure no extra columns or rows

### Some rows uploaded, some failed?
- Review the error report
- Fix failed rows in Excel
- Upload only the failed rows again

## Support

If you encounter issues not covered in this guide:
1. Check the error message carefully
2. Review the validation rules
3. Try with sample data first
4. Contact system administrator

## Version History

- **v1.0** - Initial release with Residents, Security, and Staff upload
- Support for Excel templates with sample data
- Comprehensive validation and error reporting
