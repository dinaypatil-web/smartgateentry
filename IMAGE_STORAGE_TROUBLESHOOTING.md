# Image Storage Troubleshooting Guide

## Issue: Images not saving to database or not displaying on Resident login

This guide helps diagnose and fix image storage and retrieval issues in the Society Gate Entry app.

## Quick Diagnosis

### Step 1: Run Debug Script
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Copy and paste the contents of `debug-image-storage.js`
4. Run: `window.debugImageStorage.runAllTests()`

### Step 2: Check Results
The debug script will test:
- ✅ Supabase configuration
- ✅ Database connection
- ✅ Visitor table schema
- ✅ Image storage capability
- ✅ Image retrieval capability

## Common Issues & Solutions

### 1. Supabase Not Configured
**Symptoms:**
- Console shows "Supabase not configured properly"
- App falls back to localStorage

**Solution:**
```bash
# Check .env file has correct values
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Photo Column Missing
**Symptoms:**
- Error: `column "photo" does not exist`
- Images not saving

**Solution:**
Run this SQL in Supabase SQL Editor:
```sql
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS photo text;
```

### 3. Images Too Large
**Symptoms:**
- Error: "payload too large" or "row size"
- Storage fails for high-resolution images

**Solution:**
The app now includes automatic image compression. If issues persist:
1. Use "Simple Camera" mode
2. Reduce image quality in camera settings
3. Consider using Supabase Storage instead of database storage

### 4. Invalid Image Format
**Symptoms:**
- Images save but don't display
- Console shows "Image cannot be displayed"

**Solution:**
1. Ensure camera captures in JPEG format
2. Validate image data starts with `data:image/`
3. Re-capture photos using the app's camera

### 5. Network/Connection Issues
**Symptoms:**
- Intermittent save failures
- "Network error" messages

**Solution:**
1. Check internet connection
2. Verify Supabase project is active
3. Check browser network tab for failed requests

## Manual Testing Steps

### Test Image Capture
1. Go to Security Dashboard → New Visitor Entry
2. Click "Live Camera Capture"
3. Take a photo
4. Check browser console for any errors
5. Verify photo appears in preview

### Test Image Storage
1. Fill out visitor form with photo
2. Submit form
3. Check console for storage success/failure
4. Verify visitor appears in Active Visits with photo

### Test Image Retrieval
1. Go to Resident Dashboard
2. Check if visitor photos appear in pending approvals
3. Verify photos display correctly (not broken images)

## Database Schema Verification

Run this SQL to ensure proper schema:

```sql
-- Check if photo column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'visitors' AND column_name = 'photo';

-- Add photo column if missing
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS photo text;

-- Check sample data
SELECT id, name, 
       CASE 
         WHEN photo IS NULL THEN 'No photo'
         WHEN photo LIKE 'data:image/%' THEN 'Valid image'
         ELSE 'Invalid image data'
       END as photo_status,
       LENGTH(photo) as photo_size
FROM visitors 
LIMIT 5;
```

## Performance Optimization

### For Large Images
1. **Enable Compression**: The app now automatically compresses images > 1MB
2. **Use Supabase Storage**: For production, consider moving to Supabase Storage buckets
3. **Implement Thumbnails**: Generate smaller thumbnails for list views

### Database Storage vs File Storage

**Current (Database Storage):**
- ✅ Simple implementation
- ✅ Atomic transactions
- ❌ Limited size (1MB recommended)
- ❌ Slower queries with large images

**Recommended (Supabase Storage):**
- ✅ Unlimited file sizes
- ✅ CDN delivery
- ✅ Better performance
- ❌ More complex implementation

## Migration to Supabase Storage

If you want to move images to Supabase Storage buckets:

1. **Create Storage Bucket:**
```sql
-- In Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public) 
VALUES ('visitor-photos', 'visitor-photos', true);
```

2. **Update Schema:**
```sql
-- Change photo column to store URLs instead of base64
ALTER TABLE visitors ADD COLUMN photo_url text;
-- Keep photo column for backward compatibility during migration
```

3. **Update Upload Logic:**
```javascript
// Upload to storage bucket instead of database
const uploadToStorage = async (file, visitorId) => {
  const { data, error } = await supabase.storage
    .from('visitor-photos')
    .upload(`${visitorId}.jpg`, file);
  
  if (error) throw error;
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('visitor-photos')
    .getPublicUrl(`${visitorId}.jpg`);
    
  return publicUrl;
};
```

## Monitoring & Logging

### Enable Debug Logging
Add to your component:
```javascript
// Enable detailed logging
const DEBUG_IMAGES = true;

const logImageOperation = (operation, data) => {
  if (DEBUG_IMAGES) {
    console.log(`[IMAGE] ${operation}:`, {
      ...data,
      photo: data.photo ? `${data.photo.length} chars` : 'none'
    });
  }
};
```

### Check Browser Storage
```javascript
// Check localStorage usage
const checkStorageUsage = () => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length;
    }
  }
  console.log(`LocalStorage usage: ${(total / 1024 / 1024).toFixed(2)} MB`);
};
```

## Contact Support

If issues persist after following this guide:

1. **Collect Debug Info:**
   - Run debug script and save output
   - Check browser console for errors
   - Note specific error messages

2. **Provide Details:**
   - Browser type and version
   - Device type (mobile/desktop)
   - Image size and format
   - Steps to reproduce

3. **Temporary Workaround:**
   - Use file upload instead of camera
   - Try different browser
   - Use smaller images
   - Skip photo temporarily

## Prevention

### Best Practices
1. **Image Size Limits**: Keep images under 500KB
2. **Format Validation**: Always validate image format
3. **Error Handling**: Implement comprehensive error handling
4. **User Feedback**: Provide clear error messages
5. **Fallback Options**: Offer multiple capture methods

### Regular Maintenance
1. **Monitor Storage**: Check database size regularly
2. **Clean Old Data**: Remove old visitor records
3. **Update Dependencies**: Keep Supabase client updated
4. **Test Regularly**: Verify image functionality after updates