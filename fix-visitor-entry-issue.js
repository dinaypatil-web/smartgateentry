// Comprehensive fix for visitor entry data saving issues
// This script addresses the problem where visitor fields are not being saved

console.log('=== VISITOR ENTRY FIX SCRIPT ===');

// 1. Enhanced field mapping function
const createEnhancedFieldMapping = () => {
    return {
        // Visitor-specific field mappings
        name: 'name',
        gender: 'gender', 
        idProof: 'idproof',
        comingFrom: 'comingfrom',
        purpose: 'purpose',
        contactNumber: 'contactnumber',
        residentId: 'residentid',
        societyId: 'societyid',
        entryTime: 'entrytime',
        exitTime: 'exittime',
        createdBy: 'createdby',
        createdAt: 'createdat',
        photo: 'photo',
        status: 'status'
    };
};

// 2. Improved toDb function with explicit field mapping
const improvedToDb = (data) => {
    if (!data) return data;
    
    const fieldMap = createEnhancedFieldMapping();
    const mapped = {};
    
    Object.keys(data).forEach(key => {
        // Use explicit mapping if available
        if (fieldMap[key]) {
            mapped[fieldMap[key]] = data[key];
        } else {
            // Fallback to lowercase
            mapped[key.toLowerCase()] = data[key];
        }
    });
    
    // Ensure critical fields are not lost
    if (data.residentId && !mapped.residentid) {
        mapped.residentid = data.residentId;
    }
    if (data.societyId && !mapped.societyid) {
        mapped.societyid = data.societyId;
    }
    if (data.contactNumber && !mapped.contactnumber) {
        mapped.contactnumber = data.contactNumber;
    }
    
    console.log('Enhanced field mapping:', {
        original: Object.keys(data),
        mapped: Object.keys(mapped),
        criticalFields: {
            residentid: mapped.residentid,
            societyid: mapped.societyid,
            contactnumber: mapped.contactnumber,
            idproof: mapped.idproof,
            comingfrom: mapped.comingfrom
        }
    });
    
    return mapped;
};

// 3. Enhanced visitor validation
const validateVisitorData = (visitorData) => {
    const errors = [];
    
    // Required fields
    if (!visitorData.name || visitorData.name.trim() === '') {
        errors.push('Visitor name is required');
    }
    
    if (!visitorData.residentId) {
        errors.push('Resident selection is required');
    }
    
    if (!visitorData.societyId) {
        errors.push('Society ID is missing');
    }
    
    // Optional but important fields validation
    const optionalFields = ['gender', 'idProof', 'comingFrom', 'purpose', 'contactNumber'];
    optionalFields.forEach(field => {
        if (visitorData[field] === undefined || visitorData[field] === null) {
            console.warn(`Optional field '${field}' is missing or null`);
        }
    });
    
    // Contact number format validation (if provided)
    if (visitorData.contactNumber && !/^\d{10}$/.test(visitorData.contactNumber.replace(/\D/g, ''))) {
        console.warn('Contact number format may be invalid:', visitorData.contactNumber);
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors,
        warnings: []
    };
};

// 4. Enhanced visitor creation function
const createVisitorWithValidation = async (formData, currentUser, currentRole, addVisitorFunction) => {
    try {
        console.log('Creating visitor with enhanced validation...');
        console.log('Form data received:', formData);
        
        // Step 1: Validate form data
        const validation = validateVisitorData(formData);
        if (!validation.isValid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
        
        // Step 2: Prepare complete visitor data
        const visitorData = {
            // Core visitor information
            name: formData.name?.trim(),
            gender: formData.gender || 'male',
            idProof: formData.idProof?.trim() || '',
            comingFrom: formData.comingFrom?.trim() || '',
            purpose: formData.purpose?.trim() || '',
            contactNumber: formData.contactNumber?.trim() || '',
            
            // Required associations
            residentId: formData.residentId,
            societyId: currentRole?.societyId,
            createdBy: currentUser?.id,
            
            // Photo (if provided)
            photo: formData.photo || null,
            
            // System fields (will be added by addVisitor function)
            // status: 'pending',
            // entryTime: new Date().toISOString(),
            // exitTime: null
        };
        
        console.log('Prepared visitor data:', {
            ...visitorData,
            photo: visitorData.photo ? `Photo data (${visitorData.photo.length} chars)` : 'No photo'
        });
        
        // Step 3: Verify all critical fields are present
        const criticalFields = ['name', 'residentId', 'societyId', 'createdBy'];
        const missingCritical = criticalFields.filter(field => !visitorData[field]);
        
        if (missingCritical.length > 0) {
            throw new Error(`Missing critical fields: ${missingCritical.join(', ')}`);
        }
        
        // Step 4: Call the actual addVisitor function
        console.log('Calling addVisitor function...');
        const result = await addVisitorFunction(visitorData);
        
        console.log('Visitor created successfully:', result);
        return result;
        
    } catch (error) {
        console.error('Enhanced visitor creation failed:', error);
        throw error;
    }
};

// 5. Form data extraction helper
const extractFormData = (formElement) => {
    const formData = new FormData(formElement);
    const data = {};
    
    // Extract all form fields
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Handle select elements specifically
    const selects = formElement.querySelectorAll('select');
    selects.forEach(select => {
        data[select.name] = select.value;
    });
    
    console.log('Extracted form data:', data);
    return data;
};

// 6. Debug helper for form submission
const debugFormSubmission = (formData, currentUser, currentRole) => {
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('1. Form Data:', formData);
    console.log('2. Current User:', currentUser);
    console.log('3. Current Role:', currentRole);
    
    // Check for common issues
    const issues = [];
    
    if (!formData.name) issues.push('Missing visitor name');
    if (!formData.residentId) issues.push('Missing resident selection');
    if (!currentRole?.societyId) issues.push('Missing society ID from role');
    if (!currentUser?.id) issues.push('Missing user ID');
    
    if (issues.length > 0) {
        console.error('Issues found:', issues);
        return false;
    }
    
    console.log('Form submission validation passed ✓');
    return true;
};

// 7. Export functions for use in the app
window.visitorEntryFix = {
    improvedToDb,
    validateVisitorData,
    createVisitorWithValidation,
    extractFormData,
    debugFormSubmission,
    createEnhancedFieldMapping
};

console.log('Visitor entry fix functions loaded. Use window.visitorEntryFix to access them.');
console.log('To apply the fix, modify the SecurityDashboard handleSubmit function to use createVisitorWithValidation.');