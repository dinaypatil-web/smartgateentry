// Debug script to test visitor entry data flow
// Run this in browser console on the security dashboard

console.log('=== VISITOR ENTRY DEBUG SCRIPT ===');

// Test 1: Check if Supabase is configured
const checkSupabaseConfig = () => {
    const url = import.meta?.env?.VITE_SUPABASE_URL;
    const key = import.meta?.env?.VITE_SUPABASE_ANON_KEY;
    
    console.log('1. Supabase Configuration:');
    console.log('   URL:', url || 'Not set');
    console.log('   Key:', key ? 'Set' : 'Not set');
    console.log('   Using online storage:', url && url !== 'https://your-project.supabase.co' && url.trim() !== '');
    
    return url && url !== 'https://your-project.supabase.co' && url.trim() !== '';
};

// Test 2: Check current user and role
const checkUserContext = () => {
    console.log('\n2. User Context:');
    
    // Try to get from localStorage
    const currentUser = localStorage.getItem('currentUser');
    const currentRole = localStorage.getItem('currentRole');
    
    console.log('   Current User:', currentUser ? JSON.parse(currentUser) : 'Not found');
    console.log('   Current Role:', currentRole ? JSON.parse(currentRole) : 'Not found');
    
    return { 
        user: currentUser ? JSON.parse(currentUser) : null,
        role: currentRole ? JSON.parse(currentRole) : null
    };
};

// Test 3: Check form data structure
const testFormData = () => {
    console.log('\n3. Testing Form Data Structure:');
    
    const testVisitorData = {
        name: 'Test Visitor',
        gender: 'male',
        idProof: 'Test ID 123',
        comingFrom: 'Test Company',
        purpose: 'Test Purpose',
        contactNumber: '1234567890',
        residentId: 'test-resident-id'
    };
    
    console.log('   Test form data:', testVisitorData);
    
    // Test field mapping
    const toDb = (data) => {
        const mapped = {};
        Object.keys(data).forEach(key => {
            if (key === 'residentId') {
                mapped['residentid'] = data[key];
            } else if (key === 'contactNumber') {
                mapped['contactnumber'] = data[key];
            } else if (key === 'idProof') {
                mapped['idproof'] = data[key];
            } else if (key === 'comingFrom') {
                mapped['comingfrom'] = data[key];
            } else {
                mapped[key.toLowerCase()] = data[key];
            }
        });
        return mapped;
    };
    
    const mappedData = toDb(testVisitorData);
    console.log('   Mapped to DB format:', mappedData);
    
    return { original: testVisitorData, mapped: mappedData };
};

// Test 4: Check visitors table structure (if using Supabase)
const checkTableStructure = async () => {
    console.log('\n4. Checking Database Table Structure:');
    
    if (!checkSupabaseConfig()) {
        console.log('   Skipping - using local storage');
        return;
    }
    
    try {
        // This would need to be run in the actual app context with supabase client
        console.log('   Note: Run this in app context to check table structure');
        console.log('   Expected columns: id, name, gender, contactnumber, idproof, comingfrom, purpose, residentid, societyid, status, entrytime, exittime, photo');
    } catch (error) {
        console.error('   Error checking table structure:', error);
    }
};

// Test 5: Simulate visitor creation
const simulateVisitorCreation = async () => {
    console.log('\n5. Simulating Visitor Creation:');
    
    const { user, role } = checkUserContext();
    
    if (!user || !role) {
        console.error('   Cannot simulate - no user/role context');
        return;
    }
    
    const visitorData = {
        name: 'Debug Test Visitor',
        gender: 'male',
        idProof: 'DEBUG123',
        comingFrom: 'Debug Test',
        purpose: 'Testing visitor entry',
        contactNumber: '9999999999',
        residentId: 'debug-resident-id',
        societyId: role.societyId,
        createdBy: user.id
    };
    
    console.log('   Visitor data to be saved:', visitorData);
    
    // Check for missing required fields
    const requiredFields = ['name', 'residentId', 'societyId'];
    const missingFields = requiredFields.filter(field => !visitorData[field]);
    
    if (missingFields.length > 0) {
        console.error('   Missing required fields:', missingFields);
        return;
    }
    
    console.log('   All required fields present ✓');
    
    // Test field preservation
    console.log('   Field preservation test:');
    console.log('     residentId:', visitorData.residentId);
    console.log('     societyId:', visitorData.societyId);
    console.log('     contactNumber:', visitorData.contactNumber);
    console.log('     idProof:', visitorData.idProof);
    console.log('     comingFrom:', visitorData.comingFrom);
    
    return visitorData;
};

// Test 6: Check localStorage visitor storage
const checkLocalStorage = () => {
    console.log('\n6. Checking Local Storage:');
    
    try {
        const visitors = localStorage.getItem('visitors');
        const parsedVisitors = visitors ? JSON.parse(visitors) : [];
        
        console.log('   Stored visitors count:', parsedVisitors.length);
        
        if (parsedVisitors.length > 0) {
            const lastVisitor = parsedVisitors[parsedVisitors.length - 1];
            console.log('   Last visitor:', lastVisitor);
            
            // Check if all fields are preserved
            const expectedFields = ['name', 'gender', 'idProof', 'comingFrom', 'purpose', 'contactNumber', 'residentId'];
            const missingFields = expectedFields.filter(field => !lastVisitor[field]);
            
            if (missingFields.length > 0) {
                console.warn('   Missing fields in stored visitor:', missingFields);
            } else {
                console.log('   All fields preserved in storage ✓');
            }
        }
    } catch (error) {
        console.error('   Error checking localStorage:', error);
    }
};

// Run all tests
const runDiagnostics = async () => {
    console.log('Starting visitor entry diagnostics...\n');
    
    const isOnline = checkSupabaseConfig();
    checkUserContext();
    testFormData();
    await checkTableStructure();
    await simulateVisitorCreation();
    checkLocalStorage();
    
    console.log('\n=== DIAGNOSTIC SUMMARY ===');
    console.log('Storage mode:', isOnline ? 'Online (Supabase)' : 'Local (localStorage)');
    console.log('Check the logs above for any issues with field mapping or data preservation.');
    console.log('\nTo test actual visitor creation:');
    console.log('1. Fill out the visitor form');
    console.log('2. Open browser console');
    console.log('3. Submit the form and watch for console logs');
    console.log('4. Check if all fields are being passed correctly');
};

// Export for manual execution
window.debugVisitorEntry = runDiagnostics;

// Auto-run if in development
if (window.location.hostname === 'localhost') {
    runDiagnostics();
}