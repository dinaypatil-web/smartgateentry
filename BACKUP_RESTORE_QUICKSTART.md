# Backup & Restore - Quick Start Guide

## 🚀 Get Started in 2 Minutes

### Creating a Backup

#### For Superadmin

**Full Backup (All Societies):**
1. Click "Backup & Restore" in sidebar
2. Select "Full Backup" card
3. Click "Create & Download Backup"
4. ✅ Done! File downloads automatically

**Single Society Backup:**
1. Click "Backup & Restore" in sidebar
2. Select "Society Backup" card
3. Choose society from dropdown
4. Click "Create & Download Backup"
5. ✅ Done!

#### For Administrator

1. Click "Backup & Restore" in sidebar
2. Your society is auto-selected
3. Click "Create & Download Backup"
4. ✅ Done!

---

### Restoring a Backup

#### Step-by-Step

1. **Upload File**
   - Click "Restore Backup" tab
   - Click "Choose Backup File"
   - Select your `.json` backup file

2. **Review Information**
   - Check backup date and creator
   - Review statistics:
     - **New in Backup**: Will be added
     - **New in Current**: Will be preserved ✅
     - **Conflicts**: Will be resolved automatically

3. **Choose Strategy**
   - Select **"Merge"** (Recommended) ⭐
     - Combines backup with current data
     - Preserves newer records
     - **No data loss**
   
   - Or "Replace" (Caution) ⚠️
     - Overwrites everything
     - **Data loss possible**
   
   - Or "Skip Existing"
     - Only adds new records
     - Doesn't modify existing

4. **Restore**
   - Click "Restore Backup"
   - Confirm the action
   - Wait for completion
   - ✅ Done!

---

## ⚡ Quick Tips

### ✅ DO
- ✅ Use **Merge** strategy (safest)
- ✅ Create backup before major changes
- ✅ Store backups in multiple locations
- ✅ Review comparison before restoring
- ✅ Create fresh backup before restoring old one

### ❌ DON'T
- ❌ Use Replace unless absolutely necessary
- ❌ Edit backup files manually
- ❌ Ignore the comparison statistics
- ❌ Restore without reviewing backup info

---

## 🎯 Common Scenarios

### Scenario 1: Regular Backup
**Goal**: Create daily backup for safety

```
1. Navigate to Backup & Restore
2. Click "Create & Download Backup"
3. Store file safely
```

**Time**: 10 seconds

---

### Scenario 2: Recover Deleted Data
**Goal**: Restore accidentally deleted records

```
1. Go to "Restore Backup" tab
2. Upload recent backup
3. Select "Merge" strategy
4. Click "Restore Backup"
5. Deleted data is restored ✅
6. New data is preserved ✅
```

**Time**: 30 seconds

---

### Scenario 3: Rollback After Mistake
**Goal**: Undo recent changes

```
1. Upload backup from before the mistake
2. Select "Merge" strategy
3. Restore
4. Old data restored ✅
5. Any good changes after backup preserved ✅
```

**Time**: 30 seconds

---

### Scenario 4: Complete System Restore
**Goal**: Restore to exact state (discard all new data)

```
1. Upload backup
2. Select "Replace" strategy ⚠️
3. Confirm (you'll lose new data)
4. Restore
5. System exactly as it was at backup time
```

**Time**: 1 minute  
**Warning**: Data loss possible!

---

## 📊 Strategy Comparison

| What You Want | Use This Strategy |
|---------------|-------------------|
| Recover old data + keep new data | **Merge** ⭐ |
| Only add missing records | **Skip Existing** |
| Exact restore (lose new data) | **Replace** ⚠️ |

**90% of the time, use Merge!**

---

## 🔍 Understanding the Comparison

When you upload a backup, you'll see:

```
┌─────────────────────────────────────┐
│  Total Rows:        500             │
│  New in Backup:     50  ← Will add  │
│  New in Current:    30  ← Will keep │
│  Conflicts:         420 ← Will resolve│
└─────────────────────────────────────┘
```

**What this means:**
- **50 records** from backup will be added (they're missing in current)
- **30 records** in current will be kept (created after backup)
- **420 records** exist in both (system will keep the newer version)

**With Merge strategy:**
- All 50 new records from backup: ✅ Added
- All 30 new records in current: ✅ Preserved
- All 420 conflicts: ✅ Resolved (newer wins)
- **Result**: No data loss! 🎉

---

## ⚠️ Warning Signs

### 🚨 High "New in Current" Count

```
New in Current: 500 records
```

**Means**: 500 records were created after the backup

**With Merge**: ✅ All 500 preserved  
**With Replace**: ❌ All 500 LOST!

**Action**: Use Merge strategy!

---

### 🚨 Old Backup Date

```
Created: 2024-01-01 (37 days ago)
```

**Means**: Backup is over a month old

**Risk**: Lots of data created since then

**Action**: 
1. Check "New in Current" count
2. Use Merge strategy
3. Consider creating fresh backup first

---

## 🆘 Troubleshooting

### Problem: "Invalid backup file"
**Fix**: 
- Ensure file is `.json` format
- Don't edit backup files
- Re-download if corrupted

### Problem: "Can't download backup"
**Fix**:
- Check browser download settings
- Disable pop-up blocker
- Try different browser

### Problem: "Restore taking too long"
**Fix**:
- Normal for large backups
- Wait for completion
- Don't close browser

### Problem: "Some data not restored"
**Fix**:
- Check which strategy you used
- Review conflict report
- Verify backup contains expected data

---

## 📱 Mobile Users

Backup & Restore works on mobile, but:
- File downloads may go to Downloads folder
- Uploading files uses mobile file picker
- Processing may be slower
- **Recommendation**: Use desktop for backups

---

## 🎓 Pro Tips

1. **Naming Backups**
   - Files auto-named with timestamp
   - Add notes if needed: `Backup_MySociety_2024-02-07_BeforeMigration.json`

2. **Storage**
   - Keep 3 most recent backups
   - Store in cloud (Google Drive, Dropbox)
   - Keep one on external drive

3. **Schedule**
   - Daily: Active societies
   - Weekly: Stable societies
   - Always: Before major changes

4. **Testing**
   - Test restore process monthly
   - Verify backup files aren't corrupted
   - Practice on test data

---

## ✅ Checklist

Before restoring, verify:
- [ ] Created fresh backup of current data
- [ ] Reviewed backup date and creator
- [ ] Checked comparison statistics
- [ ] Understood "New in Current" count
- [ ] Selected appropriate strategy (Merge recommended)
- [ ] Ready to confirm action

---

## 📞 Need Help?

- 📖 **Full Guide**: See `BACKUP_RESTORE_GUIDE.md`
- 🔧 **Technical**: See `BACKUP_RESTORE_IMPLEMENTATION.md`
- 👤 **Support**: Contact your administrator

---

**Remember**: When in doubt, use Merge! It's designed to prevent data loss and works for almost all situations. 🎯
