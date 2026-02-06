import * as XLSX from 'xlsx';

/**
 * Excel Template Definitions
 */
const TEMPLATES = {
    residents: {
        filename: 'Residents_Upload_Template.xlsx',
        sheetName: 'Residents',
        columns: [
            { header: 'Name*', key: 'name', width: 20 },
            { header: 'Email*', key: 'email', width: 25 },
            { header: 'Mobile*', key: 'mobile', width: 15 },
            { header: 'Login Name*', key: 'loginName', width: 20 },
            { header: 'Password*', key: 'password', width: 15 },
            { header: 'Flat Number*', key: 'flatNumber', width: 15 },
            { header: 'Wing', key: 'wing', width: 10 },
            { header: 'Floor', key: 'floor', width: 10 },
            { header: 'Ownership Type', key: 'ownershipType', width: 15, note: 'owner/tenant' },
        ],
        sampleData: [
            {
                name: 'John Doe',
                email: 'john.doe@example.com',
                mobile: '9876543210',
                loginName: 'john.doe',
                password: 'password123',
                flatNumber: 'A-101',
                wing: 'A',
                floor: '1',
                ownershipType: 'owner'
            },
            {
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                mobile: '9876543211',
                loginName: 'jane.smith',
                password: 'password123',
                flatNumber: 'B-202',
                wing: 'B',
                floor: '2',
                ownershipType: 'tenant'
            }
        ]
    },
    security: {
        filename: 'Security_Upload_Template.xlsx',
        sheetName: 'Security',
        columns: [
            { header: 'Name*', key: 'name', width: 20 },
            { header: 'Email*', key: 'email', width: 25 },
            { header: 'Mobile*', key: 'mobile', width: 15 },
            { header: 'Login Name*', key: 'loginName', width: 20 },
            { header: 'Password*', key: 'password', width: 15 },
            { header: 'Shift', key: 'shift', width: 15, note: 'morning/evening/night' },
            { header: 'ID Number', key: 'idNumber', width: 20 },
        ],
        sampleData: [
            {
                name: 'Ramesh Kumar',
                email: 'ramesh.kumar@example.com',
                mobile: '9876543212',
                loginName: 'ramesh.security',
                password: 'password123',
                shift: 'morning',
                idNumber: 'SEC001'
            },
            {
                name: 'Suresh Patil',
                email: 'suresh.patil@example.com',
                mobile: '9876543213',
                loginName: 'suresh.security',
                password: 'password123',
                shift: 'night',
                idNumber: 'SEC002'
            }
        ]
    },
    staff: {
        filename: 'Staff_Upload_Template.xlsx',
        sheetName: 'Staff',
        columns: [
            { header: 'Name*', key: 'name', width: 20 },
            { header: 'Role*', key: 'role', width: 20, note: 'cleaner/plumber/electrician/etc' },
            { header: 'Mobile*', key: 'mobile', width: 15 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'ID Number', key: 'idNumber', width: 20 },
            { header: 'Shift', key: 'shift', width: 15 },
            { header: 'Salary', key: 'salary', width: 15 },
            { header: 'Join Date', key: 'joinDate', width: 15, note: 'YYYY-MM-DD' },
        ],
        sampleData: [
            {
                name: 'Prakash Sharma',
                role: 'cleaner',
                mobile: '9876543214',
                email: 'prakash.sharma@example.com',
                idNumber: 'STF001',
                shift: 'morning',
                salary: '15000',
                joinDate: '2024-01-15'
            },
            {
                name: 'Vijay Mehta',
                role: 'plumber',
                mobile: '9876543215',
                email: 'vijay.mehta@example.com',
                idNumber: 'STF002',
                shift: 'full-time',
                salary: '20000',
                joinDate: '2024-02-01'
            }
        ]
    }
};

/**
 * Generate Excel template for download
 */
export const generateTemplate = (type) => {
    const template = TEMPLATES[type];
    if (!template) {
        throw new Error(`Unknown template type: ${type}`);
    }

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Prepare data with headers
    const headers = template.columns.map(col => col.header);
    const data = [headers, ...template.sampleData.map(row =>
        template.columns.map(col => row[col.key] || '')
    )];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws['!cols'] = template.columns.map(col => ({ wch: col.width }));

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, template.sheetName);

    // Generate and download file
    XLSX.writeFile(wb, template.filename);
};

/**
 * Parse uploaded Excel file
 */
export const parseExcelFile = (file, type) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Get first sheet
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

                // Validate and transform data
                const template = TEMPLATES[type];
                const validatedData = validateAndTransform(jsonData, template, type);

                resolve(validatedData);
            } catch (error) {
                reject(new Error(`Failed to parse Excel file: ${error.message}`));
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsArrayBuffer(file);
    });
};

/**
 * Validate and transform Excel data
 */
const validateAndTransform = (data, template, type) => {
    const errors = [];
    const validRecords = [];

    data.forEach((row, index) => {
        const rowNumber = index + 2; // +2 because Excel is 1-indexed and has header row
        const record = {};
        const rowErrors = [];

        // Map Excel columns to data structure
        template.columns.forEach(col => {
            const value = row[col.header];
            const key = col.key;

            // Check required fields (marked with *)
            if (col.header.includes('*') && (!value || value.toString().trim() === '')) {
                rowErrors.push(`${col.header} is required`);
            } else if (value) {
                record[key] = value.toString().trim();
            }
        });

        // Type-specific validation
        if (type === 'residents') {
            if (record.email && !isValidEmail(record.email)) {
                rowErrors.push('Invalid email format');
            }
            if (record.mobile && !isValidMobile(record.mobile)) {
                rowErrors.push('Invalid mobile number (should be 10 digits)');
            }
            if (record.ownershipType && !['owner', 'tenant'].includes(record.ownershipType.toLowerCase())) {
                rowErrors.push('Ownership type must be "owner" or "tenant"');
            }
        }

        if (type === 'security') {
            if (record.email && !isValidEmail(record.email)) {
                rowErrors.push('Invalid email format');
            }
            if (record.mobile && !isValidMobile(record.mobile)) {
                rowErrors.push('Invalid mobile number (should be 10 digits)');
            }
        }

        if (type === 'staff') {
            if (record.mobile && !isValidMobile(record.mobile)) {
                rowErrors.push('Invalid mobile number (should be 10 digits)');
            }
            if (record.email && record.email !== '' && !isValidEmail(record.email)) {
                rowErrors.push('Invalid email format');
            }
        }

        if (rowErrors.length > 0) {
            errors.push({ row: rowNumber, errors: rowErrors, data: row });
        } else {
            validRecords.push(record);
        }
    });

    return {
        valid: validRecords,
        errors: errors,
        totalRows: data.length,
        validRows: validRecords.length,
        errorRows: errors.length
    };
};

/**
 * Validation helpers
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidMobile = (mobile) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
};

/**
 * Get template info
 */
export const getTemplateInfo = (type) => {
    return TEMPLATES[type];
};

/**
 * Get all available template types
 */
export const getAvailableTemplates = () => {
    return Object.keys(TEMPLATES);
};
