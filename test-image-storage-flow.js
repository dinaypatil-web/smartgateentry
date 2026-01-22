// Test Image Storage Flow - Run this in browser console
// This script tests the exact flow from image capture to database storage

console.log('🔍 TESTING IMAGE STORAGE FLOW');
console.log('=' .repeat(50));

// Step 1: Test Supabase Connection
const testSupabaseConnection = async () => {
    console.log('\n1️⃣ Testing Supabase Connection...');
    
    try {
        // Import supabase client
        const { supabase } = await import('./src/config/supabase.js');
        
        // Test basic connection
        const { data, error } = await supabase.from('visitors').select('count').limit(1);
        
        if (error) {
            console.log('❌ Connection failed:', error.message);
            return false;
        }
        
        console.log('✅ Supabase connection successful');
        return true;
    } catch (err) {
        console.log('❌ Connection error:', err.message);
        return false;
    }
};

// Step 2: Check Photo Column Exists
const checkPhotoColumn = async () => {
    console.log('\n2️⃣ Checking Photo Column...');
    
    try {
        const { supabase } = await import('./src/config/supabase.js');
        
        // Try to select photo column specifically
        const { data, error } = await supabase
            .from('visitors')
            .select('id, name, photo')
            .limit(1);
        
        if (error) {
            if (error.message.includes('column "photo" does not exist')) {
                console.log('❌ Photo column does not exist!');
                console.log('💡 Fix: Run this SQL in Supabase:');
                console.log('   ALTER TABLE visitors ADD COLUMN photo text;');
                return false;
            } else {
                console.log('❌ Error checking photo column:', error.message);
                return false;
            }
        }
        
        console.log('✅ Photo column exists');
        return true;
    } catch (err) {
        console.log('❌ Error checking photo column:', err.message);
        return false;
    }
};

// Step 3: Test Image Creation (Simulate Camera Capture)
const createTestImage = () => {
    console.log('\n3️⃣ Creating Test Image...');
    
    // Create a small test image (same as camera would produce)
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // Draw a test pattern
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 50, 50);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(50, 0, 50, 50);
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(0, 50, 50, 50);
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(50, 50, 50, 50);
    
    // Convert to JPEG data URL (same format as camera)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    console.log(`📸 Test image created:`);
    console.log(`   Size: ${dataUrl.length} characters`);
    console.log(`   Format: ${dataUrl.substring(0, 30)}...`);
    console.log(`   Valid: ${dataUrl.startsWith('data:image/jpeg') ? '✅' : '❌'}`);
    
    return dataUrl;
};

// Step 4: Test Direct Database Insert
const testDirectInsert = async (testImage) => {
    console.log('\n4️⃣ Testing Direct Database Insert...');
    
    try {
        const { supabase } = await import('./src/config/supabase.js');
        
        const testVisitor = {
            id: `test_direct_${Date.now()}`,
            name: 'Direct Insert Test',
            photo: testImage,
            societyid: 'test_society',
            residentid: 'test_resident',
            status: 'pending',
            entrytime: new Date().toISOString()
        };
        
        console.log('📝 Inserting test visitor...');
        
        const { data, error } = await supabase
            .from('visitors')
            .insert(testVisitor)
            .select()
            .single();
        
        if (error) {
            console.log('❌ Direct insert failed:', error.message);
            
            // Specific error handling
            if (error.message.includes('payload too large')) {
                console.log('💡 Issue: Image too large for database');
                console.log('   Try smaller images or implement compression');
            } else if (error.message.includes('column "photo"')) {
                console.log('💡 Issue: Photo column problem');
                console.log('   Run: ALTER TABLE visitors ADD COLUMN photo text;');
            }
            
            return null;
        }
        
        console.log('✅ Direct insert successful!');
        console.log(`   Stored photo size: ${data.photo ? data.photo.length : 0} characters`);
        
        // Test retrieval
        const { data: retrieved } = await supabase
            .from('visitors')
            .select('photo')
            .eq('id', testVisitor.id)
            .single();
        
        if (retrieved && retrieved.photo === testImage) {
            console.log('✅ Photo retrieval successful!');
        } else {
            console.log('❌ Photo retrieval failed');
        }
        
        // Clean up
        await supabase.from('visitors').delete().eq('id', testVisitor.id);
        console.log('🧹 Test data cleaned up');
        
        return data;
    } catch (err) {
        console.log('❌ Direct insert error:', err.message);
        return null;
    }
};

// Step 5: Test App's addVisitor Function
const testAppAddVisitor = async (testImage) => {
    console.log('\n5️⃣ Testing App addVisitor Function...');
    
    try {
        // Import the app's addVisitor function
        const { addVisitor } = await import('./src/utils/supabaseApi.js');
        
        const testVisitorData = {
            name: 'App Function Test',
            photo: testImage,
            societyId: 'test_society',
            residentId: 'test_resident',
            contactNumber: '1234567890',
            purpose: 'Testing',
            gender: 'male'
        };
        
        console.log('📝 Using app addVisitor function...');
        console.log(`   Photo size: ${testImage.length} characters`);
        
        const result = await addVisitor(testVisitorData);
        
        if (result && result.id) {
            console.log('✅ App addVisitor successful!');
            console.log(`   Visitor ID: ${result.id}`);
            console.log(`   Photo stored: ${result.photo ? 'Yes' : 'No'}`);
            console.log(`   Photo size: ${result.photo ? result.photo.length : 0} characters`);
            
            // Clean up
            const { supabase } = await import('./src/config/supabase.js');
            await supabase.from('visitors').delete().eq('id', result.id);
            console.log('🧹 Test data cleaned up');
            
            return result;
        } else {
            console.log('❌ App addVisitor failed - no result returned');
            return null;
        }
        
    } catch (err) {
        console.log('❌ App addVisitor error:', err.message);
        console.log('   Stack:', err.stack);
        return null;
    }
};

// Step 6: Test Field Mapping
const testFieldMapping = async () => {
    console.log('\n6️⃣ Testing Field Mapping...');
    
    try {
        const { toDb, fromDb } = await import('./src/utils/supabaseApi.js');
        
        const testData = {
            name: 'Test Visitor',
            photo: 'data:image/jpeg;base64,test',
            societyId: 'society123',
            residentId: 'resident123'
        };
        
        console.log('📝 Original data:', testData);
        
        const dbData = toDb(testData);
        console.log('📝 Mapped to DB:', dbData);
        
        const appData = fromDb(dbData);
        console.log('📝 Mapped from DB:', appData);
        
        // Check if photo field is preserved
        if (dbData.photo === testData.photo) {
            console.log('✅ Photo field mapping: OK');
        } else {
            console.log('❌ Photo field mapping: FAILED');
            console.log(`   Expected: ${testData.photo}`);
            console.log(`   Got: ${dbData.photo}`);
        }
        
        return true;
    } catch (err) {
        console.log('❌ Field mapping test error:', err.message);
        return false;
    }
};

// Step 7: Check Current Visitors for Photos
const checkCurrentVisitors = async () => {
    console.log('\n7️⃣ Checking Current Visitors...');
    
    try {
        const { supabase } = await import('./src/config/supabase.js');
        
        const { data, error } = await supabase
            .from('visitors')
            .select('id, name, photo, createdat')
            .order('createdat', { ascending: false })
            .limit(5);
        
        if (error) {
            console.log('❌ Error checking visitors:', error.message);
            return;
        }
        
        console.log(`📊 Found ${data.length} recent visitors:`);
        
        data.forEach((visitor, index) => {
            const hasPhoto = visitor.photo && visitor.photo.length > 0;
            const isValidPhoto = hasPhoto && visitor.photo.startsWith('data:image/');
            
            console.log(`   ${index + 1}. ${visitor.name}:`);
            console.log(`      Has photo: ${hasPhoto ? '✅' : '❌'}`);
            console.log(`      Valid format: ${isValidPhoto ? '✅' : '❌'}`);
            if (hasPhoto) {
                console.log(`      Size: ${visitor.photo.length} chars`);
            }
        });
        
    } catch (err) {
        console.log('❌ Error checking current visitors:', err.message);
    }
};

// Main Test Function
const runImageStorageTest = async () => {
    console.log('Starting comprehensive image storage test...\n');
    
    // Test connection
    const connected = await testSupabaseConnection();
    if (!connected) {
        console.log('\n❌ Cannot proceed - Supabase connection failed');
        return;
    }
    
    // Check photo column
    const hasPhotoColumn = await checkPhotoColumn();
    if (!hasPhotoColumn) {
        console.log('\n❌ Cannot proceed - Photo column missing');
        return;
    }
    
    // Create test image
    const testImage = createTestImage();
    
    // Test field mapping
    await testFieldMapping();
    
    // Test direct insert
    const directResult = await testDirectInsert(testImage);
    
    // Test app function
    const appResult = await testAppAddVisitor(testImage);
    
    // Check current visitors
    await checkCurrentVisitors();
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📋 TEST SUMMARY:');
    console.log(`   Supabase Connection: ${connected ? '✅' : '❌'}`);
    console.log(`   Photo Column Exists: ${hasPhotoColumn ? '✅' : '❌'}`);
    console.log(`   Direct Insert: ${directResult ? '✅' : '❌'}`);
    console.log(`   App Function: ${appResult ? '✅' : '❌'}`);
    
    if (directResult && !appResult) {
        console.log('\n🔍 DIAGNOSIS: Direct insert works but app function fails');
        console.log('   Check the addVisitor function in supabaseApi.js');
        console.log('   Look for field mapping or validation issues');
    } else if (!directResult && !appResult) {
        console.log('\n🔍 DIAGNOSIS: Database-level issue');
        console.log('   Check Supabase table schema and permissions');
    } else if (directResult && appResult) {
        console.log('\n✅ DIAGNOSIS: Image storage should be working');
        console.log('   If you still have issues, check the UI flow');
    }
    
    console.log('\n' + '='.repeat(50));
};

// Make available globally
window.runImageStorageTest = runImageStorageTest;

// Auto-run
console.log('Image Storage Test loaded. Running automatically...\n');
runImageStorageTest();