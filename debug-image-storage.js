// Debug script to test image storage and retrieval
// Run this in browser console to diagnose issues

console.log('=== IMAGE STORAGE DEBUG SCRIPT ===');

// 1. Check Supabase Configuration
const checkSupabaseConfig = () => {
    console.log('\n1. SUPABASE CONFIGURATION:');
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('URL:', url);
    console.log('Key exists:', !!key);
    console.log('URL is configured:', url && url !== 'https://your-project.supabase.co');
    
    return url && url !== 'https://your-project.supabase.co' && url.trim() !== '';
};

// 2. Test Database Connection
const testDatabaseConnection = async () => {
    console.log('\n2. DATABASE CONNECTION TEST:');
    try {
        const { supabase } = await import('./src/config/supabase.js');
        const { data, error } = await supabase.from('visitors').select('id').limit(1);
        
        if (error) {
            console.error('Database connection error:', error);
            return false;
        }
        
        console.log('Database connection: SUCCESS');
        console.log('Sample data:', data);
        return true;
    } catch (err) {
        console.error('Database connection failed:', err);
        return false;
    }
};

// 3. Check Visitor Table Schema
const checkVisitorSchema = async () => {
    console.log('\n3. VISITOR TABLE SCHEMA:');
    try {
        const { supabase } = await import('./src/config/supabase.js');
        const { data, error } = await supabase.from('visitors').select('*').limit(1);
        
        if (error) {
            console.error('Schema check error:', error);
            return null;
        }
        
        if (data && data.length > 0) {
            const columns = Object.keys(data[0]);
            console.log('Available columns:', columns);
            console.log('Has photo column:', columns.includes('photo'));
            return columns;
        } else {
            console.log('No data in visitors table');
            return [];
        }
    } catch (err) {
        console.error('Schema check failed:', err);
        return null;
    }
};

// 4. Test Image Storage
const testImageStorage = async () => {
    console.log('\n4. IMAGE STORAGE TEST:');
    
    // Create a small test image (1x1 pixel red dot)
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 1, 1);
    const testImage = canvas.toDataURL('image/jpeg', 0.8);
    
    console.log('Test image size:', testImage.length, 'characters');
    console.log('Test image preview:', testImage.substring(0, 50) + '...');
    
    try {
        const { addVisitor } = await import('./src/utils/supabaseApi.js');
        
        const testVisitor = {
            id: 'test_' + Date.now(),
            name: 'Test Visitor',
            photo: testImage,
            societyId: 'test_society',
            residentId: 'test_resident',
            status: 'pending'
        };
        
        console.log('Attempting to store test visitor with image...');
        const result = await addVisitor(testVisitor);
        console.log('Storage test: SUCCESS', result);
        
        return result;
    } catch (err) {
        console.error('Storage test: FAILED', err);
        return null;
    }
};

// 5. Test Image Retrieval
const testImageRetrieval = async (visitorId) => {
    console.log('\n5. IMAGE RETRIEVAL TEST:');
    
    if (!visitorId) {
        console.log('No visitor ID provided, skipping retrieval test');
        return;
    }
    
    try {
        const { getVisitorById } = await import('./src/utils/supabaseApi.js');
        const visitor = await getVisitorById(visitorId);
        
        if (visitor && visitor.photo) {
            console.log('Retrieval test: SUCCESS');
            console.log('Retrieved image size:', visitor.photo.length, 'characters');
            console.log('Image starts with data:image:', visitor.photo.startsWith('data:image/'));
            
            // Test if image can be displayed
            const img = new Image();
            img.onload = () => console.log('Image can be displayed: SUCCESS');
            img.onerror = () => console.error('Image cannot be displayed: FAILED');
            img.src = visitor.photo;
            
            return visitor;
        } else {
            console.error('Retrieval test: FAILED - No photo found');
            return null;
        }
    } catch (err) {
        console.error('Retrieval test: FAILED', err);
        return null;
    }
};

// 6. Run All Tests
const runAllTests = async () => {
    console.log('Starting comprehensive image storage tests...\n');
    
    const isConfigured = checkSupabaseConfig();
    if (!isConfigured) {
        console.error('❌ Supabase not configured properly');
        return;
    }
    
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
        console.error('❌ Database connection failed');
        return;
    }
    
    const schema = await checkVisitorSchema();
    if (!schema || !schema.includes('photo')) {
        console.error('❌ Photo column missing from visitors table');
        return;
    }
    
    const storedVisitor = await testImageStorage();
    if (storedVisitor) {
        await testImageRetrieval(storedVisitor.id);
    }
    
    console.log('\n=== TEST COMPLETE ===');
};

// Export for manual execution
window.debugImageStorage = {
    checkSupabaseConfig,
    testDatabaseConnection,
    checkVisitorSchema,
    testImageStorage,
    testImageRetrieval,
    runAllTests
};

console.log('Debug functions available as window.debugImageStorage');
console.log('Run window.debugImageStorage.runAllTests() to start');