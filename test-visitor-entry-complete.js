// Comprehensive test script for visitor entry functionality
// Run this in the browser console on the security dashboard to test visitor creation

console.log('=== COMPREHENSIVE VISITOR ENTRY TEST ===');

// Test visitor data with all fields
const createTestVisitorData = () => {
    return {
        name: 'Test Visitor ' + Date.now(),
        gender: 'male',
        idProof: 'TEST123456',
        comingFrom: 'Test Company Ltd',
        purpose: 'Business Meeting',
        contactNumber: '9876543210',
        residentId: 'test-resident-id-' + Date.now() // This should be a real resident ID
    };
};

// Function to test field mapping
const testFieldMapping = () => {
    console.log('\n1. Testing Field Mapping:');
    
    const testData = createTestVisitorData();
    console.log('Original data:', testData);
    
    // Simulate the toDb mapping
    const fieldMappings = {
        'residentId': 'residentid',
        'contactNumber': 'contactnumber',
        'idProof': 'idproof',
        'comingFrom': 'comingfrom',
        'entryTime': 'entrytime',
        'exitTime': 'exittime',
        'createdBy': 'createdby',
        'societyId': 'societyid'
    };
    
    const mapped = {};
    Object.keys(testData).forEach(key => {
        if (fieldMappings[key]) {
            mapped[fieldMappings[key]] = testData[key];
        } else {
            mapped[key.toLowerCase()] = testData[key];
        }
    });
    
    console.log('Mapped data:', mapped);
    
    // Check if all original fields are preserved
    const originalFields = Object.keys(testData);
    const mappedFields = Object.keys(mapped);
    
    console.log('Field preservation check:');
    originalFields.forEach(field => {
        const mappedField = fieldMappings[field] || field.toLowerCase();
        const isPreserved = mapped[mappedField] === testData[field];
        console.log(`  ${field} -> ${mappedField}: ${isPreserved ? '✓' : '✗'}`);
        if (!isPreserved) {
            console.warn(`    Original: ${testData[field]}, Mapped: ${mapped[mappedField]}`);
        }
    });
    
    return { original: testData, mapped };
};

// Function to test visitor creation flow
const testVisitorCreationFlow = async () => {
    console.log('\n2. Testing Visitor Creation Flow:');
    
    // Check if we're in the right context
    if (typeof window === 'undefined') {
        console.error('Must be run in browser context');
        return;
    }
    
    // Get current user and role from localStorage
    const currentUser = localStorage.getItem('currentUser');
    const currentRole = localStorage.getItem('currentRole');
    
    if (!currentUser || !currentRole) {
        console.error('No user/role context found. Please log in first.');
        return;
    }
    
    const user = JSON.parse(currentUser);
    const role = JSON.parse(currentRole);
    
    console.log('User context:', { user: user.name, role: role.role, society: role.societyId });
    
    // Create test visitor data
    const testData = createTestVisitorData();
    testData.societyId = role.societyId;
    testData.createdBy = user.id;
    
    console.log('Test visitor data:', testData);
    
    // Validate required fields
    const requiredFields = ['name', 'residentId', 'societyId', 'createdBy'];
    const missingFields = requiredFields.filter(field => !testData[field]);
    
    if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        return;
    }
    
    console.log('All required fields present ✓');
    
    // Test the complete visitor object that would be created
    const completeVisitor = {
        id: 'test-' + Date.now(),
        ...testData,
        status: 'pending',
        entryTime: new Date().toISOString(),
        exitTime: null
    };
    
    console.log('Complete visitor object:', completeVisitor);
    
    return completeVisitor;
};

// Function to test form validation
const testFormValidation = () => {
    console.log('\n3. Testing Form Validation:');
    
    const testCases = [
        {
            name: 'Valid data',
            data: createTestVisitorData(),
            shouldPass: true
        },
        {
            name: 'Missing name',
            data: { ...createTestVisitorData(), name: '' },
            shouldPass: false
        },
        {
            name: 'Missing residentId',
            data: { ...createTestVisitorData(), residentId: '' },
            shouldPass: false
        },
        {
            name: 'Invalid contact number',
            data: { ...createTestVisitorData(), contactNumber: '123' },
            shouldPass: false
        }
    ];
    
    testCases.forEach(testCase => {
        console.log(`Testing: ${testCase.name}`);
        
        const errors = [];
        
        // Name validation
        if (!testCase.data.name || testCase.data.name.trim() === '') {
            errors.push('Name is required');
        }
        
        // ResidentId validation
        if (!testCase.data.residentId) {
            errors.push('Resident selection is required');
        }
        
        // Contact number validation (if provided)
        if (testCase.data.contactNumber && !/^\d{10}$/.test(testCase.data.contactNumber.replace(/\D/g, ''))) {
            errors.push('Invalid contact number format');
        }
        
        const isValid = errors.length === 0;
        const result = isValid === testCase.shouldPass ? '✓' : '✗';
        
        console.log(`  Result: ${result} (Valid: ${isValid}, Expected: ${testCase.shouldPass})`);
        if (errors.length > 0) {
            console.log(`  Errors: ${errors.join(', ')}`);
        }
    });
};

// Function to test localStorage storage
const testLocalStorage = () => {
    console.log('\n4. Testing Local Storage:');
    
    try {
        // Get current visitors
        const visitors = localStorage.getItem('visitors');
        const parsedVisitors = visitors ? JSON.parse(visitors) : [];
        
        console.log('Current visitors in localStorage:', parsedVisitors.length);
        
        // Create a test visitor for localStorage
        const testVisitor = {
            id: 'test-local-' + Date.now(),
            ...createTestVisitorData(),
            status: 'pending',
            entryTime: new Date().toISOString(),
            exitTime: null
        };
        
        // Test adding to localStorage
        const updatedVisitors = [...parsedVisitors, testVisitor];
        localStorage.setItem('visitors', JSON.stringify(updatedVisitors));
        
        // Verify it was added
        const verifyVisitors = JSON.parse(localStorage.getItem('visitors'));
        const addedVisitor = verifyVisitors.find(v => v.id === testVisitor.id);
        
        if (addedVisitor) {
            console.log('✓ Test visitor added to localStorage successfully');
            
            // Check field preservation
            const originalFields = Object.keys(testVisitor);
            const preservedFields = originalFields.filter(field => addedVisitor[field] === testVisitor[field]);
            
            console.log(`Field preservation: ${preservedFields.length}/${originalFields.length} fields preserved`);
            
            if (preservedFields.length !== originalFields.length) {
                const missingFields = originalFields.filter(field => addedVisitor[field] !== testVisitor[field]);
                console.warn('Fields not preserved correctly:', missingFields);
            }
            
            // Clean up - remove test visitor
            const cleanedVisitors = verifyVisitors.filter(v => v.id !== testVisitor.id);
            localStorage.setItem('visitors', JSON.stringify(cleanedVisitors));
            console.log('Test visitor cleaned up from localStorage');
            
        } else {
            console.error('✗ Test visitor was not added to localStorage');
        }
        
    } catch (error) {
        console.error('localStorage test failed:', error);
    }
};

// Function to check database schema (if using Supabase)
const checkDatabaseSchema = async () => {
    console.log('\n5. Checking Database Schema:');
    
    // Check if Supabase is configured
    const supabaseUrl = import.meta?.env?.VITE_SUPABASE_URL;
    const isOnline = supabaseUrl && supabaseUrl !== 'https://your-project.supabase.co' && supabaseUrl.trim() !== '';
    
    console.log('Storage mode:', isOnline ? 'Online (Supabase)' : 'Local (localStorage)');
    
    if (!isOnline) {
        console.log('Skipping database schema check - using local storage');
        return;
    }
    
    console.log('Expected visitor table columns:');
    const expectedColumns = [
        'id', 'name', 'gender', 'contactnumber', 'idproof', 
        'comingfrom', 'purpose', 'residentid', 'societyid', 
        'status', 'entrytime', 'exittime', 'photo', 'createdby', 'createdat'
    ];
    
    expectedColumns.forEach(col => console.log(`  - ${col}`));
    
    console.log('\nTo verify schema, run this SQL in Supabase:');
    console.log(`
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'visitors' 
ORDER BY column_name;
    `);
};

// Main test function
const runCompleteTest = async () => {
    console.log('Starting comprehensive visitor entry test...\n');
    
    try {
        testFieldMapping();
        await testVisitorCreationFlow();
        testFormValidation();
        testLocalStorage();
        await checkDatabaseSchema();
        
        console.log('\n=== TEST SUMMARY ===');
        console.log('✓ Field mapping test completed');
        console.log('✓ Visitor creation flow test completed');
        console.log('✓ Form validation test completed');
        console.log('✓ Local storage test completed');
        console.log('✓ Database schema check completed');
        
        console.log('\n=== NEXT STEPS ===');
        console.log('1. If using Supabase, verify the database schema matches expected columns');
        console.log('2. Test actual visitor creation through the UI');
        console.log('3. Check browser console for any errors during form submission');
        console.log('4. Verify that all fields are being saved correctly');
        
    } catch (error) {
        console.error('Test failed:', error);
    }
};

// Export for manual execution
window.testVisitorEntry = runCompleteTest;

// Auto-run if in development
if (window.location.hostname === 'localhost' || window.location.hostname.includes('dev')) {
    console.log('Auto-running visitor entry test...');
    runCompleteTest();
} else {
    console.log('Run window.testVisitorEntry() to start the test');
}