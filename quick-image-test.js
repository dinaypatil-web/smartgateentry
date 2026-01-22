// Quick Image Storage Test - Run this in browser console
// Copy and paste this entire script into your browser console on the app page

console.log('🔍 QUICK IMAGE STORAGE TEST');
console.log('=' .repeat(40));

// Test 1: Check if we're using Supabase
const checkStorage = () => {
    const url = import.meta?.env?.VITE_SUPABASE_URL;
    const isConfigured = url && url !== 'https://your-project.supabase.co';
    
    console.log('📊 Storage Configuration:');
    console.log('  Supabase URL:', url || 'Not found');
    console.log('  Using Supabase:', isConfigured ? '✅ Yes' : '❌ No (using localStorage)');
    
    return isConfigured;
};

// Test 2: Check visitors table
const checkVisitorsTable = async () => {
    console.log('\n📋 Checking Visitors Table:');
    
    try {
        // Try to import supabase
        const { supabase } = await import('./src/config/supabase.js');
        
        // Test connection
        const { data, error } = await supabase.from('visitors').select('*').limit(1);
        
        if (error) {
            console.log('❌ Table access failed:', error.message);
            return false;
        }
        
        const columns = data.length > 0 ? Object.keys(data[0]) : [];
        console.log('  Available columns:', columns.join(', '));
        console.log('  Has photo column:', columns.includes('photo') ? '✅ Yes' : '❌ No');
        
        return columns.includes('photo');
    } catch (err) {
        console.log('❌ Cannot access table:', err.message);
        return false;
    }
};

// Test 3: Check existing visitor images
const checkExistingImages = async () => {
    console.log('\n🖼️ Checking Existing Images:');
    
    try {
        const { supabase } = await import('./src/config/supabase.js');
        
        const { data, error } = await supabase
            .from('visitors')
            .select('id, name, photo')
            .not('photo', 'is', null)
            .limit(5);
        
        if (error) {
            console.log('❌ Cannot check images:', error.message);
            return;
        }
        
        console.log(`  Found ${data.length} visitors with photos`);
        
        data.forEach((visitor, index) => {
            const isValid = visitor.photo && visitor.photo.startsWith('data:image/');
            const size = visitor.photo ? visitor.photo.length : 0;
            
            console.log(`  ${index + 1}. ${visitor.name}: ${isValid ? '✅' : '❌'} ${size} chars`);
        });
        
    } catch (err) {
        console.log('❌ Error checking images:', err.message);
    }
};

// Test 4: Create a test image
const createTestImage = () => {
    console.log('\n🎨 Creating Test Image:');
    
    const canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    
    // Draw a simple test pattern
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 25, 25);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(25, 0, 25, 25);
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(0, 25, 25, 25);
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(25, 25, 25, 25);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    console.log(`  Test image created: ${dataUrl.length} characters`);
    console.log(`  Format valid: ${dataUrl.startsWith('data:image/') ? '✅' : '❌'}`);
    
    return dataUrl;
};

// Test 5: Test image storage
const testImageStorage = async (testImage) => {
    console.log('\n💾 Testing Image Storage:');
    
    try {
        const { supabase } = await import('./src/config/supabase.js');
        
        const testVisitor = {
            id: `test_${Date.now()}`,
            name: 'Test Image Visitor',
            photo: testImage,
            societyid: 'test_society',
            residentid: 'test_resident',
            status: 'pending',
            entrytime: new Date().toISOString()
        };
        
        console.log('  Attempting to store test visitor...');
        
        const { data, error } = await supabase
            .from('visitors')
            .insert(testVisitor)
            .select()
            .single();
        
        if (error) {
            console.log('❌ Storage failed:', error.message);
            
            if (error.message.includes('column "photo" does not exist')) {
                console.log('💡 Fix: Run this SQL: ALTER TABLE visitors ADD COLUMN photo text;');
            }
            
            return false;
        }
        
        console.log('✅ Storage successful!');
        
        // Test retrieval
        const { data: retrieved } = await supabase
            .from('visitors')
            .select('photo')
            .eq('id', testVisitor.id)
            .single();
        
        if (retrieved && retrieved.photo === testImage) {
            console.log('✅ Retrieval successful!');
        } else {
            console.log('❌ Retrieval failed - image data mismatch');
        }
        
        // Clean up
        await supabase.from('visitors').delete().eq('id', testVisitor.id);
        console.log('🧹 Test data cleaned up');
        
        return true;
        
    } catch (err) {
        console.log('❌ Storage test error:', err.message);
        return false;
    }
};

// Run all tests
const runQuickTest = async () => {
    console.log('Starting quick image storage test...\n');
    
    const usingSupabase = checkStorage();
    
    if (!usingSupabase) {
        console.log('\n⚠️ Not using Supabase - images will be stored in localStorage');
        console.log('This may cause issues with image persistence and sharing between devices.');
        return;
    }
    
    const hasPhotoColumn = await checkVisitorsTable();
    await checkExistingImages();
    
    if (hasPhotoColumn) {
        const testImage = createTestImage();
        await testImageStorage(testImage);
    } else {
        console.log('\n❌ Cannot test storage - photo column missing');
        console.log('💡 Run this SQL to fix: ALTER TABLE visitors ADD COLUMN photo text;');
    }
    
    console.log('\n' + '='.repeat(40));
    console.log('✅ Quick test complete!');
    console.log('If you see errors above, check IMAGE_STORAGE_TROUBLESHOOTING.md for solutions.');
};

// Make available globally and auto-run
window.runQuickImageTest = runQuickTest;
runQuickTest();