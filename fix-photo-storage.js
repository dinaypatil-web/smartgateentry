// Photo Storage Fix Script
// Run this in browser console to diagnose and fix photo storage issues

console.log('🔧 PHOTO STORAGE FIX SCRIPT');
console.log('=' .repeat(50));

// Step 1: Verify Supabase Configuration
const verifySupabaseConfig = async () => {
    console.log('\n1️⃣ Verifying Supabase Configuration...');
    
    try {
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        console.log(`   URL: ${url}`);
        console.log(`   Key: ${key ? 'Present' : 'Missing'}`);
        
        if (!url || url === 'https://your-project.supabase.co') {
            console.log('❌ Supabase URL not configured');
            return false;
        }
        
        if (!key) {
            console.log('❌ Supabase key not configured');
            return false;
        }
        
        console.log('✅ Supabase configuration looks good');
        return true;
    } catch (err) {
        console.log('❌ Error checking configuration:', err.message);
        return false;
    }
};

// Step 2: Test Database Connection and Schema
const testDatabaseSchema = async () => {
    console.log('\n2️⃣ Testing Database Schema...');
    
    try {
        const { supabase } = await import('./src/config/supabase.js');
        
        // Test if we can access the visitors table
        const { data, error } = await supabase
            .from('visitors')
            .select('*')
            .limit(1);
        
        if (error) {
            console.log('❌ Cannot access visitors table:', error.message);
            return false;
        }
        
        // Check if photo column exists
        const columns = data.length > 0 ? Object.keys(data[0]) : [];
        console.log(`   Available columns: ${columns.join(', ')}`);
        
        if (!columns.includes('photo')) {
            console.log('❌ Photo column missing!');
            console.log('💡 Run this SQL in Supabase SQL Editor:');
            console.log('   ALTER TABLE visitors ADD COLUMN photo text;');
            return false;
        }
        
        console.log('✅ Photo column exists');
        return true;
    } catch (err) {
        console.log('❌ Database schema test failed:', err.message);
        return false;
    }
};

// Step 3: Test Photo Storage with Real App Function
const testPhotoStorage = async () => {
    console.log('\n3️⃣ Testing Photo Storage...');
    
    try {
        // Create a test image
        const canvas = document.createElement('canvas');
        canvas.width = 50;
        canvas.height = 50;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 50, 50);
        const testPhoto = canvas.toDataURL('image/jpeg', 0.8);
        
        console.log(`   Created test photo: ${testPhoto.length} characters`);
        
        // Import the app's addVisitor function
        const { addVisitor } = await import('./src/utils/supabaseApi.js');
        
        // Create test visitor data (matching the app's structure)
        const testVisitorData = {
            name: 'Photo Storage Test',
            photo: testPhoto,
            societyId: 'test_society_' + Date.now(),
            residentId: 'test_resident_' + Date.now(),
            contactNumber: '1234567890',
            purpose: 'Testing photo storage',
            gender: 'male',
            idProof: 'Test ID',
            comingFrom: 'Test Location'
        };
        
        console.log('   Attempting to store visitor with photo...');
        
        // Call the app's addVisitor function
        const result = await addVisitor(testVisitorData);
        
        if (!result || !result.id) {
            console.log('❌ addVisitor returned no result');
            return false;
        }
        
        console.log(`✅ Visitor created with ID: ${result.id}`);
        
        // Verify the photo was stored
        const { supabase } = await import('./src/config/supabase.js');
        const { data: storedVisitor, error } = await supabase
            .from('visitors')
            .select('id, name, photo')
            .eq('id', result.id)
            .single();
        
        if (error) {
            console.log('❌ Error retrieving stored visitor:', error.message);
            return false;
        }
        
        if (!storedVisitor.photo) {
            console.log('❌ Photo was not stored in database!');
            console.log('   Visitor data:', storedVisitor);
            return false;
        }
        
        if (storedVisitor.photo !== testPhoto) {
            console.log('❌ Stored photo does not match original!');
            console.log(`   Original: ${testPhoto.substring(0, 50)}...`);
            console.log(`   Stored: ${storedVisitor.photo.substring(0, 50)}...`);
            return false;
        }
        
        console.log('✅ Photo stored and retrieved successfully!');
        console.log(`   Stored photo size: ${storedVisitor.photo.length} characters`);
        
        // Clean up test data
        await supabase.from('visitors').delete().eq('id', result.id);
        console.log('🧹 Test data cleaned up');
        
        return true;
        
    } catch (err) {
        console.log('❌ Photo storage test failed:', err.message);
        console.log('   Stack trace:', err.stack);
        return false;
    }
};

// Step 4: Check Existing Visitors for Photo Issues
const checkExistingVisitors = async () => {
    console.log('\n4️⃣ Checking Existing Visitors...');
    
    try {
        const { supabase } = await import('./src/config/supabase.js');
        
        const { data, error } = await supabase
            .from('visitors')
            .select('id, name, photo, createdat')
            .order('createdat', { ascending: false })
            .limit(10);
        
        if (error) {
            console.log('❌ Error checking existing visitors:', error.message);
            return;
        }
        
        console.log(`   Found ${data.length} recent visitors:`);
        
        let withPhotos = 0;
        let withoutPhotos = 0;
        let invalidPhotos = 0;
        
        data.forEach((visitor, index) => {
            const hasPhoto = visitor.photo && visitor.photo.length > 0;
            const isValidPhoto = hasPhoto && visitor.photo.startsWith('data:image/');
            
            if (hasPhoto && isValidPhoto) {
                withPhotos++;
                console.log(`   ✅ ${visitor.name}: Valid photo (${visitor.photo.length} chars)`);
            } else if (hasPhoto && !isValidPhoto) {
                invalidPhotos++;
                console.log(`   ⚠️ ${visitor.name}: Invalid photo format`);
            } else {
                withoutPhotos++;
                console.log(`   ❌ ${visitor.name}: No photo`);
            }
        });
        
        console.log(`\n   Summary:`);
        console.log(`   - With valid photos: ${withPhotos}`);
        console.log(`   - Without photos: ${withoutPhotos}`);
        console.log(`   - With invalid photos: ${invalidPhotos}`);
        
    } catch (err) {
        console.log('❌ Error checking existing visitors:', err.message);
    }
};

// Step 5: Test Camera Capture Simulation
const testCameraCaptureFlow = () => {
    console.log('\n5️⃣ Testing Camera Capture Flow...');
    
    try {
        // Simulate what the camera capture does
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        
        // Draw a test pattern (simulating camera capture)
        const gradient = ctx.createLinearGradient(0, 0, 640, 480);
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(0.5, '#00ff00');
        gradient.addColorStop(1, '#0000ff');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 640, 480);
        
        // Add some text (simulating a person's face)
        ctx.fillStyle = '#ffffff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('TEST VISITOR', 320, 240);
        
        // Convert to JPEG (same as camera)
        const photoData = canvas.toDataURL('image/jpeg', 0.9);
        
        console.log(`   Simulated camera capture:`);
        console.log(`   - Size: ${photoData.length} characters`);
        console.log(`   - Format: ${photoData.substring(0, 30)}...`);
        console.log(`   - Valid format: ${photoData.startsWith('data:image/jpeg') ? '✅' : '❌'}`);
        console.log(`   - Size OK: ${photoData.length < 1048576 ? '✅' : '❌ (too large)'}`);
        
        return photoData;
        
    } catch (err) {
        console.log('❌ Camera capture simulation failed:', err.message);
        return null;
    }
};

// Step 6: Provide Specific Fixes
const provideFixes = () => {
    console.log('\n6️⃣ Recommended Fixes...');
    
    console.log(`
🔧 COMMON FIXES:

1. If photo column is missing:
   ALTER TABLE visitors ADD COLUMN photo text;

2. If images are too large:
   - Use Simple Camera mode instead of Advanced
   - Reduce image quality in camera settings
   - Images should be < 1MB (1,048,576 characters)

3. If Supabase connection fails:
   - Check .env file has correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   - Verify Supabase project is active
   - Check browser network tab for failed requests

4. If field mapping issues:
   - Photo field should be mapped to lowercase 'photo' in database
   - Check console for field mapping logs

5. If validation fails:
   - Ensure photo data starts with 'data:image/'
   - Check for JavaScript errors in console
   - Verify camera permissions are granted
    `);
};

// Main Fix Function
const runPhotoStorageFix = async () => {
    console.log('Starting photo storage diagnosis and fix...\n');
    
    const configOK = await verifySupabaseConfig();
    if (!configOK) {
        console.log('\n❌ Fix Supabase configuration first');
        provideFixes();
        return;
    }
    
    const schemaOK = await testDatabaseSchema();
    if (!schemaOK) {
        console.log('\n❌ Fix database schema first');
        provideFixes();
        return;
    }
    
    const cameraPhoto = testCameraCaptureFlow();
    if (!cameraPhoto) {
        console.log('\n❌ Camera capture simulation failed');
        return;
    }
    
    const storageOK = await testPhotoStorage();
    if (!storageOK) {
        console.log('\n❌ Photo storage is not working');
        provideFixes();
        return;
    }
    
    await checkExistingVisitors();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ PHOTO STORAGE IS WORKING!');
    console.log('If you still have issues:');
    console.log('1. Clear browser cache and reload');
    console.log('2. Check browser console for JavaScript errors');
    console.log('3. Try using Simple Camera mode');
    console.log('4. Ensure camera permissions are granted');
    console.log('=' .repeat(50));
};

// Make available globally
window.runPhotoStorageFix = runPhotoStorageFix;

// Auto-run
console.log('Photo Storage Fix Script loaded. Running...\n');
runPhotoStorageFix();