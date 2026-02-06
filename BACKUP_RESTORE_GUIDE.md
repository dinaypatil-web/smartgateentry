# Backup & Restore - Complete Guide

## Overview

The Backup & Restore feature provides a comprehensive solution for data protection and disaster recovery. It includes smart merge strategies to prevent data loss when restoring backups.

## Key Features

### ✅ Role-Based Access
- **Superadmin**: Full backup of all societies and data
- **Administrator**: Society-specific backup only

### ✅ Data Loss Prevention
- **Smart Merge Strategy**: Combines backup with current data
- **Timestamp-Based Resolution**: Keeps newer records automatically
- **Conflict Detection**: Identifies and resolves data conflicts
- **Comparison Tool**: Preview changes before restoring

### ✅ Backup Types
1. **Full Backup** (Superadmin only): All societies and complete database
2. **Society Backup**: Single society with all related data

### ✅ Restore Strategies
1. **Merge (Recommended)**: Combines backup with current data, preserves newer records
2. **Replace (Caution)**: Overwrites all data with backup (data loss possible)
3. **Skip Existing**: Only adds new records, keeps all current data

### ✅ Excel Conversion (NEW!)
- **Convert to Excel**: Export backup data to Excel format
- **Multi-Sheet Workbook**: Each collection in separate sheet
- **Easy Analysis**: Use Excel, Google Sheets, or any spreadsheet software
- **Reporting**: Create reports and charts from backup data
- **See**: `BACKUP_TO_EXCEL_GUIDE.md` for detailed instructions

## How It Works

### Backup Process

1. **Data Collection**
   - Gathers all data from selected scope (full or society)
   - Includes: Users, Societies, Visitors, Notices, Pre-approvals, Vehicles, Complaints, Amenities, Bookings, Staff, Payments, SOS Alerts, Documents

2. **Metadata Creation**
   - Backup ID and timestamp
   - Creator information
   - Backup type and scope
   - Version information

3. **File Generation**
   - Creates JSON file with all data
   - Includes statistics and metadata
   - Downloads to user's computer

### Restore Process

1. **File Upload**
   - User selects backup JSON file
   - System validates file format and structure

2. **Data Comparison**
   - Compares backup with current data
   - Identifies new records, conflicts, and changes
   - Shows statistics before restore

3. **Strategy Selection**
   - User chooses merge strategy
   - System explains implications of each strategy

4. **Smart Merge** (if Merge strategy selected)
   - For each record:
     - If exists in both: Compare timestamps
     - If backup newer but current has updates: Keep current
     - If backup newer and no updates: Use backup
     - If current newer: Keep current
     - If only in backup: Add it
     - If only in current: Keep it

5. **Data Application**
   - Applies merged data to database
   - Refreshes all data contexts
   - Shows results with conflict report

## Data Loss Prevention Strategies

### 1. Smart Merge Algorithm

The merge algorithm prevents data loss by:

```
For each record in backup:
  IF record exists in current data:
    Compare timestamps:
      - backupTime = record.createdAt
      - currentTime = existing.createdAt
      - currentUpdateTime = existing.updatedAt
      
    IF backupTime > currentTime:
      IF currentUpdateTime > backupTime:
        → Keep current (has newer updates)
      ELSE:
        → Use backup (backup is newer)
    ELSE:
      → Keep current (current is newer)
  ELSE:
    → Add from backup (new record)

For each record in current data:
  IF record NOT in backup:
    → Keep current (created after backup)
```

### 2. Timestamp-Based Resolution

Every record is compared using:
- `createdAt`: When record was first created
- `updatedAt`: When record was last modified
- Backup timestamp: When backup was created

**Decision Logic:**
- If current record was modified after backup → Keep current
- If backup record is newer than current → Use backup
- If timestamps equal → Keep current (safer)

### 3. Conflict Tracking

The system tracks all conflicts and shows:
- Which records were kept from current data
- Which records were updated from backup
- Reason for each decision
- Total conflicts resolved

### 4. Preview Before Restore

Before applying changes, users see:
- **New in Backup**: Records that will be added
- **New in Current**: Records created after backup (will be preserved)
- **Potential Conflicts**: Records that exist in both

## User Guide

### For Superadmin

#### Creating Full Backup

1. Login as Superadmin
2. Navigate to **Backup & Restore** in sidebar
3. Select **"Create Backup"** tab
4. Choose **"Full Backup"**
5. Click **"Create & Download Backup"**
6. File downloads: `Backup_All_YYYY-MM-DD-HH-MM.json`

#### Creating Society Backup

1. Select **"Society Backup"**
2. Choose society from dropdown
3. Click **"Create & Download Backup"**
4. File downloads: `Backup_SocietyName_YYYY-MM-DD-HH-MM.json`

#### Restoring Full Backup

1. Select **"Restore Backup"** tab
2. Click **"Choose Backup File"**
3. Select your backup JSON file
4. Review backup information and comparison
5. Choose restore strategy:
   - **Merge**: Recommended, prevents data loss
   - **Replace**: Caution, will lose new data
   - **Skip**: Only adds new records
6. (Optional) Select specific society to restore
7. Click **"Restore Backup"**
8. Confirm the action
9. Wait for completion
10. Review results and conflicts

### For Administrator

#### Creating Society Backup

1. Login as Administrator
2. Navigate to **Backup & Restore** in sidebar
3. Select **"Create Backup"** tab
4. Society Backup is pre-selected (only option)
5. Your society is auto-selected
6. Click **"Create & Download Backup"**
7. File downloads: `Backup_YourSociety_YYYY-MM-DD-HH-MM.json`

#### Restoring Society Backup

1. Select **"Restore Backup"** tab
2. Click **"Choose Backup File"**
3. Select your society backup JSON file
4. Review backup information
5. Choose restore strategy (Merge recommended)
6. Click **"Restore Backup"**
7. Confirm the action
8. Review results

## Restore Strategies Explained

### Merge Strategy (Recommended) ✅

**What it does:**
- Combines backup data with current data
- Keeps newer records automatically
- Preserves data created after backup
- Resolves conflicts intelligently

**When to use:**
- Regular restore operations
- When you want to recover old data without losing new data
- When unsure about data state
- **This is the safest option**

**Example:**
```
Backup has:
  - User A (created 2024-01-01)
  - User B (created 2024-01-05)

Current has:
  - User A (created 2024-01-01, updated 2024-01-10)
  - User C (created 2024-01-15)

After Merge:
  - User A (kept current - has newer updates)
  - User B (added from backup)
  - User C (kept current - created after backup)
```

### Replace Strategy (Caution) ⚠️

**What it does:**
- Replaces ALL current data with backup data
- Deletes everything not in backup
- **Data created after backup will be LOST**

**When to use:**
- Complete system restore after catastrophic failure
- Rolling back to a known good state
- When you're certain you want to discard all new data
- **Use with extreme caution**

**Example:**
```
Backup has:
  - User A
  - User B

Current has:
  - User A
  - User B
  - User C (created after backup)

After Replace:
  - User A
  - User B
  - User C is DELETED ❌
```

### Skip Existing Strategy ℹ️

**What it does:**
- Only adds records from backup that don't exist
- Keeps ALL current data unchanged
- Never modifies existing records

**When to use:**
- Adding old records without changing current data
- Importing historical data
- When you only want to fill gaps

**Example:**
```
Backup has:
  - User A
  - User B
  - User C

Current has:
  - User A (different data)
  - User D

After Skip:
  - User A (kept current, not changed)
  - User B (added from backup)
  - User C (added from backup)
  - User D (kept current)
```

## Best Practices

### 1. Regular Backups
- **Daily**: For active societies with frequent changes
- **Weekly**: For stable societies
- **Before major changes**: Always backup before bulk operations

### 2. Backup Storage
- Store backups in multiple locations
- Cloud storage (Google Drive, Dropbox)
- External hard drive
- Network storage
- Keep at least 3 recent backups

### 3. Backup Naming
Files are auto-named with timestamp:
- `Backup_SocietyName_2024-02-07-14-30.json`
- Keep original names for easy identification
- Add notes if needed: `Backup_MySociety_2024-02-07_BeforeMigration.json`

### 4. Testing Restores
- Periodically test restore process
- Use test environment if available
- Verify data integrity after restore

### 5. Before Restoring
- ✅ Create a fresh backup of current data first
- ✅ Review backup information and timestamp
- ✅ Check comparison statistics
- ✅ Choose appropriate merge strategy
- ✅ Understand implications of your choice

## Troubleshooting

### Backup Creation Issues

**Problem**: Backup download fails
**Solution**:
- Check browser download settings
- Disable pop-up blocker
- Try different browser
- Check disk space

**Problem**: Backup file is very large
**Solution**:
- This is normal for full backups with lots of data
- Use society-specific backups for smaller files
- Compress file after download if needed

### Restore Issues

**Problem**: "Invalid backup file format"
**Solution**:
- Ensure file is JSON format
- Don't edit backup file manually
- Re-download backup if corrupted
- Check file wasn't truncated during download

**Problem**: "Backup version mismatch"
**Solution**:
- System will attempt restore anyway
- Review results carefully
- May need to update application first

**Problem**: Some data not restored
**Solution**:
- Check merge strategy used
- Review conflict report
- Verify backup contains expected data
- Check if data was filtered by society

### Data Loss Concerns

**Problem**: Worried about losing recent data
**Solution**:
- **Always use Merge strategy**
- Review comparison before restoring
- Create backup of current data first
- Check "New in Current" count

**Problem**: Accidentally used Replace strategy
**Solution**:
- If you created backup before restore, restore that backup
- Check browser downloads for auto-backup (created before restore)
- Contact support if no backup available

## Technical Details

### Backup File Structure

```json
{
  "metadata": {
    "id": "unique-backup-id",
    "type": "full" or "society",
    "societyId": "society-id-if-applicable",
    "createdBy": "user-id",
    "createdByName": "User Name",
    "timestamp": "2024-02-07T14:30:00.000Z",
    "version": "1.0",
    "appVersion": "1.0.0"
  },
  "data": {
    "users": [...],
    "societies": [...],
    "visitors": [...],
    "notices": [...],
    "preApprovals": [...],
    "vehicles": [...],
    "complaints": [...],
    "amenities": [...],
    "bookings": [...],
    "staff": [...],
    "payments": [...],
    "sos_alerts": [...],
    "documents": [...]
  },
  "statistics": {
    "users": 150,
    "societies": 1,
    "visitors": 500,
    "total": 1250
  }
}
```

### Collections Included

All backups include these collections:
- **users**: All user accounts and roles
- **societies**: Society information
- **visitors**: Visitor entry records
- **notices**: Society notices and announcements
- **preApprovals**: Pre-approved visitor passes
- **vehicles**: Registered vehicles
- **complaints**: Helpdesk tickets
- **amenities**: Amenity definitions
- **bookings**: Amenity bookings
- **staff**: Staff members
- **payments**: Payment records
- **sos_alerts**: SOS emergency alerts
- **documents**: Society documents

### Society Filtering

When creating or restoring society-specific backup:
- Includes only records with matching `societyId`
- Includes users with roles in that society
- Includes the society record itself
- Excludes all other societies and their data

## Security Considerations

### Backup Files
- Contain sensitive user data
- Store securely
- Don't share publicly
- Encrypt if storing in cloud
- Delete old backups securely

### Access Control
- Only Superadmin can backup all data
- Administrators limited to their society
- Restore requires same permissions as backup
- All operations are logged

### Data Privacy
- Backup includes personal information
- Follow data protection regulations
- Inform users about backup practices
- Have data retention policy

## FAQ

**Q: How often should I create backups?**
A: Daily for active societies, weekly for stable ones, and always before major changes.

**Q: Can I edit the backup file?**
A: No, manual editing may corrupt the file. Use the application to modify data.

**Q: What happens if I restore an old backup?**
A: With Merge strategy, newer data is preserved. With Replace, you'll lose recent data.

**Q: Can I restore a full backup to a single society?**
A: Yes, Superadmin can select specific society when restoring full backup.

**Q: How do I know which strategy to use?**
A: Use Merge unless you specifically want to discard all new data.

**Q: Will restore affect other societies?**
A: Only if restoring full backup. Society backups only affect that society.

**Q: Can I undo a restore?**
A: Create a backup before restoring, then restore that backup to undo.

**Q: What if backup file is corrupted?**
A: System will show validation errors. Use a different backup file.

**Q: How long does restore take?**
A: Depends on data size. Small: seconds, Medium: 30-60 seconds, Large: 1-2 minutes.

**Q: Will users be logged out during restore?**
A: No, but they should refresh their page to see updated data.

## Support

For issues not covered in this guide:
1. Check error messages carefully
2. Review backup file timestamp and type
3. Verify you have correct permissions
4. Try with a fresh backup
5. Contact system administrator

---

**Remember**: Always use Merge strategy unless you have a specific reason not to. It's designed to prevent data loss and is the safest option for most situations.
