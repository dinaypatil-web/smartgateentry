// IMMEDIATE PHOTO STORAGE TEST
// Copy and paste this entire script into your browser console while on the app

(async () => {
    console.log('🚀 IMMEDIATE PHOTO STORAGE TEST');
    console.log('=' .repeat(40));
    
    let allTestsPassed = true;
    
    // Test 1: Check Supabase Config
    console.log('\n1. Checking Supabase Configuration...');
    const url = import.meta?.env?.VITE_SUPABASE_URL;
    const key = import.meta?.env?.VITE_SUPABASE_ANON_KEY;
    
    if (!url || url === 'https://your-project.supabase.co') {
        console.log('❌ FAIL: Supabase URL not configured');
        console.log('   Fix: Check your .env file');
        allTestsPassed = false;
    } else {
        console.log('✅ PASS: Supabase URL configured');
    }
    
    if (!key) {
        console.log('❌ FAIL: Supabase key missing');
        allTestsPassed = false;
    } else {
        console.log('✅ PASS: Supabase key present');
    }
    
    if (!allTestsPassed) {
        console.log('\n❌ Configuration issues found. Fix these first.');
        return;
    }
    
    // Test 2: Database Connection
    console.log('\n2. Testing Database Connection...');
    try {
        const { supabase } = await import('./src/config/supabase.js');
        const { data, error } = await supabase.from('visitors').select('count').limit(1);
        
        if (error) {
            console.log('❌ FAIL: Cannot connect to database');
            console.log('   Error:', error.message);
            allTestsPassed = false;
        } else {
            console.log('✅ PASS: Database connection successful');
        }
    } catch (err) {
        console.log('❌ FAIL: Database connection error');
        console.log('   Error:', err.message);
        allTestsPassed = false;
    }
    
    if (!allTestsPassed) {
        console.log('\n❌ Database connection failed. Check Supabase project status.');
        return;
    }
    
    // Test 3: Photo Column Check
    console.log('\n3. Checking Photo Column...');
    try {
        const { supabase } = await import('./src/config/supabase.js');
        const { data, error } = await supabase.from('visitors').select('id, name, photo').limit(1);
        
        if (error && error.message.includes('column "photo" does not exist')) {
            console.log('❌ FAIL: Photo column does not exist');
            console.log('   Fix: Run this SQL in Supabase:');
            console.log('   ALTER TABLE visitors ADD COLUMN photo text;');
            allTestsPassed = false;
        } else if (error) {
            console.log('❌ FAIL: Error checking photo column');
            console.log('   Error:', error.message);
            allTestsPassed = false;
        } else {
            console.log('✅ PASS: Photo column exists');
        }
    } catch (err) {
        console.log('❌ FAIL: Photo column check error');
        console.log('   Error:', err.message);
        allTestsPassed = false;
    }
    
    if (!allTestsPassed) {
        console.log('\n❌ Photo column issues found. Run the SQL fix above.');
        return;
    }
    
    // Test 4: Create Test Image
    console.log('\n4. Creating Test Image...');
    let testImage;
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        // Create a simple test pattern
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 50, 50);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(50, 0, 50, 50);
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(0, 50, 50, 50);
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(50, 50, 50, 50);
        
        testImage = canvas.toDataURL('image/jpeg', 0.8);
        
        console.log('✅ PASS: Test image created');
        console.log(`   Size: ${testImage.length} characters`);
        console.log(`   Format: ${testImage.substring(0, 30)}...`);
        
        if (!testImage.startsWith('data:image/')) {
            console.log('❌ FAIL: Invalid image format');
            allTestsPassed = false;
        }
        
        if (testImage.length > 1048576) {
            console.log('⚠️  WARN: Image might be too large');
        }
        
    } catch (err) {
        console.log('❌ FAIL: Cannot create test image');
        console.log('   Error:', err.message);
        allTestsPassed = false;
    }
    
    if (!allTestsPassed) {
        console.log('\n❌ Image creation failed.');
        return;
    }
    
    // Test 5: Test Photo Storage
    console.log('\n5. Testing Photo Storage...');
    try {
        const { addVisitor } = await import('./src/utils/supabaseApi.js');
        
        const testVisitorData = {
            name: 'Photo Test Visitor',
            photo: testImage,
            societyId: 'test_society_' + Date.now(),
            residentId: 'test_resident_' + Date.now(),
            contactNumber: '1234567890',
            purpose: 'Photo storage test',
            gender: 'male'
        };
        
        console.log('   Attempting to store visitor with photo...');
        const result = await addVisitor(testVisitorData);
        
        if (!result || !result.id) {
            console.log('❌ FAIL: addVisitor returned no result');
            allTestsPassed = false;
        } else {
            console.log('✅ PASS: Visitor created successfully');
            console.log(`   Visitor ID: ${result.id}`);
            
            // Verify photo was stored
            const { supabase } = await import('./src/config/supabase.js');
            const { data: stored, error } = await supabase
                .from('visitors')
                .select('photo')
                .eq('id', result.id)
                .single();
            
            if (error) {
                console.log('❌ FAIL: Cannot retrieve stored visitor');
                console.log('   Error:', error.message);
                allTestsPassed = false;
            } else if (!stored.photo) {
                console.log('❌ FAIL: Photo was not stored in database!');
                console.log('   This is the main issue - photo field is empty');
                allTestsPassed = false;
            } else if (stored.photo !== testImage) {
                console.log('❌ FAIL: Stored photo does not match original');
                allTestsPassed = false;
            } else {
                console.log('✅ PASS: Photo stored and retrieved correctly!');
                console.log(`   Stored photo size: ${stored.photo.length} characters`);
            }
            
            // Clean up
            await supabase.from('visitors').delete().eq('id', result.id);
            console.log('   Test data cleaned up');
        }
        
    } catch (err) {
        console.log('❌ FAIL: Photo storage test failed');
        console.log('   Error:', err.message);
        console.log('   Stack:', err.stack);
        allTestsPassed = false;
    }
    
    // Final Results
    console.log('\n' + '='.repeat(40));
    if (allTestsPassed) {
        console.log('🎉 ALL TESTS PASSED!');
        console.log('Photo storage should be working correctly.');
        console.log('If you still have issues:');
        console.log('1. Clear browser cache and reload');
        console.log('2. Try using Simple Camera mode');
        console.log('3. Check for JavaScript errors in console');
    } else {
        console.log('❌ SOME TESTS FAILED');
        console.log('Photo storage is not working correctly.');
        console.log('Review the failed tests above and apply the suggested fixes.');
    }
    console.log('='.repeat(40));
})();