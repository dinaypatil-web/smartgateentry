# Photo Storage Issue - Step by Step Fix

## Issue: Captured images/photos are not getting stored in Supabase visitors table photo column

### Step 1: Verify Database Schema
1. Open Supabase Dashboard → SQL Editor
2. Run this SQL to check if photo column exists:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'visitors' AND column_name = 'photo';
```

3. If no results, add the photo column:
```sql
ALTER TABLE visitors ADD COLUMN photo text;
```

### Step 2: Test Database Connection
1. Open your app in browser
2. Open Developer Tools (F12) → Console
3. Copy and paste the contents of `fix-photo-storage.js`
4. The script will automatically run and show results

### Step 3: Check Current Issues
Look for these common problems in the console output:

**❌ "Photo column does not exist"**
- Solution: Run the SQL from Step 1

**❌ "Supabase connection failed"**
- Check your `.env` file has correct values:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**❌ "Image too large for database"**
- Use Simple Camera mode instead of Advanced
- Images should be under 1MB

**❌ "Invalid image format"**
- Ensure camera captures in JPEG format
- Photo data should start with `data:image/`

### Step 4: Test Photo Capture Flow
1. Go to Security Dashboard → New Visitor Entry
2. Click "Live Camera Capture"
3. Take a photo
4. Check browser console for any errors
5. Fill out the form and submit
6. Check console for storage success/failure messages

### Step 5: Verify Photo Storage
1. Go to Security Dashboard → Active Visits
2. Check if the visitor appears with a photo
3. Go to Resident Dashboard → Pending Approvals
4. Verify the photo displays correctly

### Step 6: Manual Database Check
In Supabase Dashboard → Table Editor:
1. Open the `visitors` table
2. Look for your test visitor
3. Check if the `photo` column has data
4. Photo data should start with `data:image/jpeg;base64,`

## Quick Fixes

### Fix 1: Missing Photo Column
```sql
-- Run in Supabase SQL Editor
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS photo text;
```

### Fix 2: Clear Browser Cache
1. Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
2. Clear cache and cookies
3. Reload the app

### Fix 3: Use Simple Camera
1. In New Visitor Entry, click camera
2. Switch to "Simple Camera" mode
3. This mode is more reliable for image capture

### Fix 4: Check Permissions
1. Ensure camera permissions are granted
2. Look for camera icon in browser address bar
3. Click and select "Allow"

## Debugging Commands

Run these in browser console for detailed debugging:

```javascript
// Test Supabase connection
const { supabase } = await import('./src/config/supabase.js');
const { data, error } = await supabase.from('visitors').select('count');
console.log('Connection test:', error ? 'Failed' : 'Success');

// Check photo column
const { data: schema } = await supabase.from('visitors').select('*').limit(1);
console.log('Available columns:', Object.keys(schema[0] || {}));

// Test image creation
const canvas = document.createElement('canvas');
canvas.width = 100; canvas.height = 100;
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'red'; ctx.fillRect(0, 0, 100, 100);
const testImage = canvas.toDataURL('image/jpeg', 0.8);
console.log('Test image:', testImage.substring(0, 50) + '...');
```

## Expected Results

When working correctly, you should see:
1. ✅ Photo column exists in database
2. ✅ Camera captures image successfully
3. ✅ Image data is valid (starts with `data:image/`)
4. ✅ Visitor is stored with photo in database
5. ✅ Photo displays in Security and Resident dashboards

## Still Not Working?

If photos still don't save after following these steps:

1. **Check Browser Console**: Look for JavaScript errors
2. **Check Network Tab**: Look for failed API requests
3. **Try Different Browser**: Test in Chrome, Firefox, or Edge
4. **Check Image Size**: Ensure images are under 500KB
5. **Restart App**: Stop and restart your development server

## Contact Information

If the issue persists, provide this information:
- Browser type and version
- Error messages from console
- Results from running `fix-photo-storage.js`
- Screenshot of the issue
- Steps you've already tried