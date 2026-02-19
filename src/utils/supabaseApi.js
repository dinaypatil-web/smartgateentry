
import { supabase } from '../config/supabase';

const COLLECTIONS = {
    USERS: 'users',
    SOCIETIES: 'societies',
    VISITORS: 'visitors',
    NOTICES: 'notices',
    PRE_APPROVALS: 'preapprovals',
    VEHICLES: 'vehicles',
    COMPLAINTS: 'complaints',
    AMENITIES: 'amenities',
    BOOKINGS: 'bookings',
    STAFF: 'staff',
    PAYMENTS: 'payments',
    SOS_ALERTS: 'sos_alerts',
    DOCUMENTS: 'documents'
};

export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Helper to map camelCase keys to lowercase for Supabase DB
// This handles the case where tables were created without quotes (standard Postgres behavior lowercases identifiers)
const toDb = (data) => {
    if (!data) return data;
    const mapped = {};

    // Define explicit field mappings to ensure consistency
    const fieldMappings = {
        'createdBy': 'createdby',
        'societyId': 'societyid',
        'residentId': 'residentid',
        'contactNumber': 'contactnumber',
        'idProof': 'idproof',
        'comingFrom': 'comingfrom',
        'entryTime': 'entrytime',
        'exitTime': 'exittime',
        'plateNumber': 'platenumber',
        'assignedTo': 'assignedto',
        'amenityId': 'amenityid',
        'isGateAllowed': 'isgateallowed',
        'permissionFromDate': 'permissionfromdate',
        'permissionToDate': 'permissiontodate',
        'createdAt': 'createdat',
        'visitorName': 'visitorname',
        'expectedDate': 'expecteddate',
        'passCode': 'passcode',
        'isResigned': 'isresigned',
        'loginName': 'loginname',
        'loginPassword': 'loginpassword',
        'flatNumber': 'flatnumber',
        'securityQuestion': 'securityquestion',
        'securityAnswer': 'securityanswer'
    };

    Object.keys(data).forEach(key => {
        // Use explicit mapping if available
        if (fieldMappings[key]) {
            mapped[fieldMappings[key]] = data[key];
        } else {
            // Default: convert to lowercase
            mapped[key.toLowerCase()] = data[key];
        }
    });

    // Critical validation: Ensure essential visitor fields are not lost
    if (data.residentId && !mapped.residentid) {
        mapped.residentid = data.residentId;
        console.warn('Supabase API: Force-mapped residentId to residentid');
    }
    if (data.societyId && !mapped.societyid) {
        mapped.societyid = data.societyId;
        console.warn('Supabase API: Force-mapped societyId to societyid');
    }
    if (data.contactNumber && !mapped.contactnumber) {
        mapped.contactnumber = data.contactNumber;
        console.warn('Supabase API: Force-mapped contactNumber to contactnumber');
    }
    if (data.idProof && !mapped.idproof) {
        mapped.idproof = data.idProof;
        console.warn('Supabase API: Force-mapped idProof to idproof');
    }
    if (data.comingFrom && !mapped.comingfrom) {
        mapped.comingfrom = data.comingFrom;
        console.warn('Supabase API: Force-mapped comingFrom to comingfrom');
    }

    console.log('Supabase API: Field mapping result:', {
        originalKeys: Object.keys(data),
        mappedKeys: Object.keys(mapped),
        criticalFields: {
            residentid: mapped.residentid,
            societyid: mapped.societyid,
            contactnumber: mapped.contactnumber,
            idproof: mapped.idproof,
            comingfrom: mapped.comingfrom,
            gender: mapped.gender,
            purpose: mapped.purpose
        },
        photo: mapped.photo ? `Photo data (${mapped.photo.length} chars)` : 'No photo'
    });
    return mapped;
};

// Helper to map lowercase DB keys back to camelCase for App
const fromDb = (data) => {
    if (data === null || data === undefined) return data;

    // Known camelCase keys in app
    const camelKeys = [
        'loginName', 'loginPassword', 'createdAt', 'createdBy',
        'permissionFromDate', 'permissionToDate',
        'idProof', 'comingFrom', 'contactNumber', 'residentId', 'societyId', 'entryTime', 'exitTime',
        'visitorName', 'expectedDate', 'passCode', 'isResigned', 'unblockRequestedBy',
        'securityQuestion', 'securityAnswer', 'unblockRequestedDate', 'blockedBy', 'blockedDate',
        'plateNumber', 'assignedTo', 'amenityId', 'isGateAllowed', 'flatNo', 'flatNumber',
        'resolvedBy'
    ];

    // If it's an array, map each item
    if (Array.isArray(data)) {
        return data.map(item => fromDb(item));
    }

    // If it's not an object (primitive), return as is
    if (typeof data !== 'object') {
        return data;
    }

    const mapped = {};

    // First, recursively map all values
    Object.keys(data).forEach(key => {
        mapped[key] = fromDb(data[key]);
    });

    // Then, handle top-level key mapping for this object
    camelKeys.forEach(key => {
        const lowerKey = key.toLowerCase();
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();

        // Priority: Map from DB keys if camelCase key is missing, null, or undefined
        if (mapped[key] === undefined || mapped[key] === null) {
            if (mapped[lowerKey] !== undefined && mapped[lowerKey] !== null) {
                mapped[key] = mapped[lowerKey];
            } else if (mapped[snakeKey] !== undefined && mapped[snakeKey] !== null) {
                mapped[key] = mapped[snakeKey];
            }
        }
    });

    return mapped;
};

// ===== USER OPERATIONS =====
export const getUsers = async () => {
    try {
        const { data, error } = await supabase.from(COLLECTIONS.USERS).select('*');
        if (error) throw error;
        return fromDb(data);
    } catch (error) {
        console.error('Error getting users:', error);
        return [];
    }
};

export const getUserById = async (id) => {
    try {
        const { data, error } = await supabase
            .from(COLLECTIONS.USERS)
            .select('*')
            .eq('id', id)
            .single();
        if (error) return null;
        return fromDb(data);
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
};

export const getUserByEmail = async (email) => {
    try {
        const { data, error } = await supabase
            .from(COLLECTIONS.USERS)
            .select('*')
            .eq('email', email.toLowerCase())
            .single();
        if (error) return null;
        return fromDb(data);
    } catch (error) {
        console.error('Error getting user by email:', error);
        return null;
    }
};

export const getSocietyByIdSync = async (id) => {
    return await getSocietyById(id);
};

export const getUserByLoginName = async (loginName) => {
    try {
        console.log('Supabase API: Getting user by login name:', loginName);
        const { data, error } = await supabase
            .from(COLLECTIONS.USERS)
            .select('*')
            .eq('loginname', loginName.toLowerCase())
            .single();

        if (error) {
            console.error('Supabase API: User not found or error:', error.message);
            return null;
        }

        return fromDb(data);
    } catch (error) {
        console.error('Error getting user by login name:', error);
        return null;
    }
};

export const addUser = async (userData) => {
    try {
        const userWithId = {
            ...userData,
            createdAt: userData.createdAt || new Date().toISOString()
        };

        const dbData = toDb(userWithId);

        const { data, error } = await supabase
            .from(COLLECTIONS.USERS)
            .insert(dbData)
            .select()
            .single();
        if (error) throw error;
        return fromDb(data);
    } catch (error) {
        console.error('Error adding user:', error);
        throw error;
    }
};

export const updateUser = async (id, updates) => {
    try {
        const dbUpdates = toDb(updates);
        const { error } = await supabase
            .from(COLLECTIONS.USERS)
            .update(dbUpdates)
            .eq('id', id);
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

export const deleteUser = async (id) => {
    try {
        const { error } = await supabase
            .from(COLLECTIONS.USERS)
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

// ===== SOCIETY OPERATIONS =====
export const getSocieties = async () => {
    try {
        const { data, error } = await supabase.from(COLLECTIONS.SOCIETIES).select('*');
        if (error) throw error;
        return fromDb(data);
    } catch (error) {
        console.error('Error getting societies:', error);
        return [];
    }
};

export const getSocietyById = async (id) => {
    try {
        const { data, error } = await supabase
            .from(COLLECTIONS.SOCIETIES)
            .select('*')
            .eq('id', id)
            .single();
        if (error) return null;
        return fromDb(data);
    } catch (error) {
        console.error('Error getting society:', error);
        return null;
    }
};

export const addSociety = async (societyData) => {
    try {
        const societyWithId = {
            ...societyData,
            createdAt: societyData.createdAt || new Date().toISOString()
        };
        const dbData = toDb(societyWithId);
        const { data, error } = await supabase
            .from(COLLECTIONS.SOCIETIES)
            .insert(dbData)
            .select()
            .single();
        if (error) throw error;
        return fromDb(data);
    } catch (error) {
        console.error('Error adding society:', error);
        throw error;
    }
};

export const updateSociety = async (id, updates) => {
    try {
        const dbUpdates = toDb(updates);
        const { error } = await supabase
            .from(COLLECTIONS.SOCIETIES)
            .update(dbUpdates)
            .eq('id', id);
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating society:', error);
        throw error;
    }
};

export const deleteSociety = async (id) => {
    try {
        const { error } = await supabase
            .from(COLLECTIONS.SOCIETIES)
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting society:', error);
        throw error;
    }
};

// ===== VISITOR OPERATIONS =====
export const getVisitors = async () => {
    try {
        const { data, error } = await supabase.from(COLLECTIONS.VISITORS).select('*');
        if (error) throw error;
        return fromDb(data);
    } catch (error) {
        console.error('Error getting visitors:', error);
        return [];
    }
};

export const getVisitorById = async (id) => {
    try {
        const { data, error } = await supabase
            .from(COLLECTIONS.VISITORS)
            .select('*')
            .eq('id', id)
            .single();
        if (error) return null;
        return fromDb(data);
    } catch (error) {
        console.error('Error getting visitor:', error);
        return null;
    }
};

// Helper function to check table structure
export const checkTableStructure = async (tableName) => {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

        if (error) {
            console.error(`Error checking table ${tableName}:`, error);
            return null;
        }

        if (data && data.length > 0) {
            const columns = Object.keys(data[0]);
            console.log(`Available columns in ${tableName}:`, columns);
            return columns;
        }

        return null;
    } catch (error) {
        console.error(`Error checking table structure for ${tableName}:`, error);
        return null;
    }
};

export const addVisitor = async (visitorData) => {
    try {
        console.log('Supabase: Adding visitor with enhanced validation:', {
            ...visitorData,
            photo: visitorData.photo ? `Image data (${visitorData.photo.length} chars)` : 'No photo'
        });

        // Enhanced validation for critical fields
        const requiredFields = ['name', 'residentId', 'societyId'];
        const missingFields = requiredFields.filter(field => !visitorData[field]);

        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        // Validate and sanitize data
        const sanitizedData = {
            ...visitorData,
            name: visitorData.name?.trim(),
            gender: visitorData.gender || 'male',
            idProof: visitorData.idProof?.trim() || '',
            comingFrom: visitorData.comingFrom?.trim() || '',
            purpose: visitorData.purpose?.trim() || '',
            contactNumber: visitorData.contactNumber?.trim() || '',
            residentId: visitorData.residentId, // Critical - ensure this is preserved
            societyId: visitorData.societyId   // Critical - ensure this is preserved
        };

        console.log('Supabase: Sanitized visitor data:', {
            ...sanitizedData,
            photo: sanitizedData.photo ? `Image data (${sanitizedData.photo.length} chars)` : 'No photo'
        });

        // Validate and optimize image data
        let optimizedPhoto = null;
        if (sanitizedData.photo) {
            try {
                // Validate image format
                if (!sanitizedData.photo.startsWith('data:image/')) {
                    throw new Error('Invalid image format - must be data URL');
                }

                // Check image size (limit to 1MB base64)
                if (sanitizedData.photo.length > 1048576) {
                    console.warn('Image size too large, compressing...');
                    optimizedPhoto = await compressImage(sanitizedData.photo, 0.7);
                } else {
                    optimizedPhoto = sanitizedData.photo;
                }

                console.log('Image validation passed:', {
                    originalSize: sanitizedData.photo.length,
                    optimizedSize: optimizedPhoto.length,
                    format: optimizedPhoto.substring(0, 30)
                });
            } catch (imageError) {
                console.error('Image processing error:', imageError);
                // Continue without photo rather than failing completely
                optimizedPhoto = null;
            }
        }

        const visitorWithId = {
            ...sanitizedData,
            photo: optimizedPhoto,
            status: 'pending',
            entryTime: new Date().toISOString(),
            exitTime: null
        };

        // Use enhanced field mapping
        let dbData = toDb(visitorWithId);

        console.log('Supabase: Attempting to insert visitor data:', {
            ...dbData,
            photo: dbData.photo ? `Image data (${dbData.photo.length} chars)` : 'No photo'
        });

        // Final validation: Ensure critical fields are mapped correctly
        const criticalFieldCheck = {
            residentid: dbData.residentid,
            societyid: dbData.societyid,
            name: dbData.name,
            status: dbData.status,
            entrytime: dbData.entrytime
        };

        const missingCriticalDb = Object.entries(criticalFieldCheck)
            .filter(([key, value]) => !value)
            .map(([key]) => key);

        if (missingCriticalDb.length > 0) {
            console.error('Supabase: Critical fields missing after mapping:', missingCriticalDb);
            throw new Error(`Database mapping failed for fields: ${missingCriticalDb.join(', ')}`);
        }

        let { data, error } = await supabase
            .from(COLLECTIONS.VISITORS)
            .insert(dbData)
            .select()
            .single();

        // If first attempt fails with column error, try with minimal required fields only as fallback
        if (error && (error.message.includes('column') || error.message.includes('does not exist'))) {
            console.log('Supabase: First attempt failed (likely schema mismatch), trying minimal data...');
            console.warn('Supabase: Schema error details:', error.message);

            const minimalData = {
                id: visitorWithId.id,
                name: visitorWithId.name,
                gender: visitorWithId.gender || 'male',
                contactnumber: visitorWithId.contactNumber || '',
                idproof: visitorWithId.idProof || '',
                comingfrom: visitorWithId.comingFrom || '',
                purpose: visitorWithId.purpose || '',
                status: visitorWithId.status,
                entrytime: visitorWithId.entryTime,
                societyid: visitorWithId.societyId,
                residentid: visitorWithId.residentId, // Critical field
                photo: optimizedPhoto // Include photo in minimal data too
            };

            dbData = minimalData;
            console.log('Supabase: Minimal data attempt:', {
                ...dbData,
                photo: dbData.photo ? `Image data (${dbData.photo.length} chars)` : 'No photo'
            });

            const result = await supabase
                .from(COLLECTIONS.VISITORS)
                .insert(dbData)
                .select()
                .single();

            data = result.data;
            error = result.error;
        }

        if (error) {
            console.error('Supabase: Database error:', error);

            // Provide specific error messages for common issues
            if (error.message.includes('payload too large') || error.message.includes('row size')) {
                throw new Error('Image too large for database storage. Please use a smaller image.');
            } else if (error.message.includes('photo')) {
                throw new Error('Image storage failed. Please try again or contact support.');
            } else if (error.message.includes('residentid')) {
                throw new Error('Invalid resident selection. Please select a valid resident.');
            } else if (error.message.includes('societyid')) {
                throw new Error('Invalid society context. Please refresh and try again.');
            } else {
                throw new Error(`Database error: ${error.message}`);
            }
        }

        console.log('Supabase: Visitor added successfully:', {
            ...data,
            photo: data.photo ? `Image stored (${data.photo.length} chars)` : 'No photo'
        });
        return fromDb(data);
    } catch (error) {
        console.error('Error adding visitor:', error);
        throw error;
    }
};

// Helper function to compress images
const compressImage = async (dataUrl, quality = 0.7) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Calculate new dimensions (max 800x600)
            let { width, height } = img;
            const maxWidth = 800;
            const maxHeight = 600;

            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width *= ratio;
                height *= ratio;
            }

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataUrl);
        };
        img.src = dataUrl;
    });
};

export const updateVisitor = async (id, updates) => {
    try {
        const dbUpdates = toDb(updates);
        const { error } = await supabase
            .from(COLLECTIONS.VISITORS)
            .update(dbUpdates)
            .eq('id', id);
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating visitor:', error);
        throw error;
    }
};

// ===== NOTICE OPERATIONS =====
export const getNotices = async () => {
    try {
        const { data, error } = await supabase.from(COLLECTIONS.NOTICES).select('*');
        if (error) throw error;
        return fromDb(data);
    } catch (error) {
        console.error('Error getting notices:', error);
        return [];
    }
};

export const addNotice = async (noticeData) => {
    try {
        const noticeWithId = {
            ...noticeData,
            createdAt: noticeData.createdAt || new Date().toISOString()
        };
        const dbData = toDb(noticeWithId);
        const { data, error } = await supabase
            .from(COLLECTIONS.NOTICES)
            .insert(dbData)
            .select()
            .single();
        if (error) throw error;
        return fromDb(data);
    } catch (error) {
        console.error('Error adding notice:', error);
        throw error;
    }
};

export const deleteNotice = async (id) => {
    try {
        const { error } = await supabase
            .from(COLLECTIONS.NOTICES)
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting notice:', error);
        throw error;
    }
};

// ===== PRE-APPROVAL OPERATIONS =====
export const getPreApprovals = async () => {
    try {
        const { data, error } = await supabase.from(COLLECTIONS.PRE_APPROVALS).select('*');
        if (error) throw error;
        return fromDb(data);
    } catch (error) {
        console.error('Error getting pre-approvals:', error);
        return [];
    }
};

export const addPreApproval = async (preApprovalData) => {
    try {
        const preApprovalWithId = {
            ...preApprovalData,
            status: 'valid',
            createdAt: preApprovalData.createdAt || new Date().toISOString()
        };
        const dbData = toDb(preApprovalWithId);
        const { data, error } = await supabase
            .from(COLLECTIONS.PRE_APPROVALS)
            .insert(dbData)
            .select()
            .single();
        if (error) throw error;
        return fromDb(data);
    } catch (error) {
        console.error('Error adding pre-approval:', error);
        throw error;
    }
};

export const updatePreApproval = async (id, updates) => {
    try {
        const dbUpdates = toDb(updates);
        const { error } = await supabase
            .from(COLLECTIONS.PRE_APPROVALS)
            .update(dbUpdates)
            .eq('id', id);
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating pre-approval:', error);
        throw error;
    }
};

// ===== GENERIC CRUD OPERATIONS =====

export const getData = async (collection) => {
    try {
        const { data, error } = await supabase
            .from(collection)
            .select('*');
        if (error) throw error;
        return fromDb(data);
    } catch (error) {
        console.error(`Error fetching from ${collection}:`, error);
        throw error;
    }
};

export const addData = async (collection, itemData) => {
    try {
        const dbData = {
            id: generateId(),
            createdAt: new Date().toISOString(),
            ...itemData
        };
        const mapped = toDb(dbData);
        const { data, error } = await supabase
            .from(collection)
            .insert(mapped)
            .select()
            .single();
        if (error) throw error;
        return fromDb(data);
    } catch (error) {
        console.error(`Error adding to ${collection}:`, error);
        throw error;
    }
};

export const updateData = async (collection, id, updates) => {
    try {
        const dbUpdates = toDb(updates);
        const { data, error } = await supabase
            .from(collection)
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return fromDb(data);
    } catch (error) {
        console.error(`Error updating ${collection}:`, error);
        throw error;
    }
};

export const deleteData = async (collection, id) => {
    try {
        const { error } = await supabase
            .from(collection)
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    } catch (error) {
        console.error(`Error deleting from ${collection}:`, error);
        throw error;
    }
};

// ===== PAYMENT OPERATIONS =====
export const getPayments = async (societyId) => {
    try {
        const { data, error } = await supabase
            .from(COLLECTIONS.PAYMENTS)
            .select('*')
            .eq('societyid', societyId);
        if (error) throw error;
        return fromDb(data);
    } catch (error) {
        console.error('Error getting payments:', error);
        return [];
    }
};

export const getResidentPayments = async (residentId) => {
    try {
        const { data, error } = await supabase
            .from(COLLECTIONS.PAYMENTS)
            .select('*')
            .eq('residentid', residentId);
        if (error) throw error;
        return fromDb(data);
    } catch (error) {
        console.error('Error getting resident payments:', error);
        return [];
    }
};

export const generateMonthlyBills = async (societyId, month, year, amount, createdBy) => {
    if (!societyId) throw new Error('Society ID is required to generate bills');
    try {
        // 1. Get all approved residents for this society
        const { data: residents, error: resError } = await supabase
            .from(COLLECTIONS.USERS)
            .select('*');

        if (resError) {
            console.error('Supabase API: Error fetching residents:', resError);
            throw new Error(`Error fetching residents: ${resError.message}`);
        }
        if (!residents) throw new Error('No residents data returned from server');

        const societyResidents = residents.filter(u => {
            try {
                // Roles can be an array, or a JSON string if Supabase driver doesn't auto-parse
                const roles = typeof u.roles === 'string' ? JSON.parse(u.roles) : (u.roles || []);
                return Array.isArray(roles) && roles.some(r =>
                    r.role === 'resident' &&
                    (r.societyId === societyId || r.societyid === societyId) &&
                    r.status === 'approved'
                );
            } catch (e) {
                console.warn(`Supabase API: Error parsing roles for user ${u.id}:`, e);
                return false;
            }
        });

        if (societyResidents.length === 0) return { success: true, count: 0 };

        // 2. Check for existing bills to avoid duplicates
        const { data: existing, error: existError } = await supabase
            .from(COLLECTIONS.PAYMENTS)
            .select('residentid')
            .eq('societyid', societyId)
            .eq('month', month)
            .eq('year', year)
            .eq('type', 'maintenance');

        if (existError) {
            console.error('Supabase API: Error checking existing bills:', existError);
            throw new Error(`Error checking existing bills: ${existError.message}`);
        }
        const existingResidentIds = new Set((existing || []).map(p => p.residentid));

        const billAmount = parseFloat(amount);
        if (isNaN(billAmount)) {
            throw new Error(`Invalid bill amount: ${amount}`);
        }

        // 3. Create bills for residents who don't have one yet
        const newBills = societyResidents
            .filter(r => !existingResidentIds.has(r.id))
            .map(r => toDb({
                id: generateId(),
                residentId: r.id,
                societyId: societyId,
                amount: billAmount,
                month: month,
                year: year,
                status: 'pending',
                type: 'maintenance',
                createdAt: new Date().toISOString(),
                createdBy: createdBy
            }));

        if (newBills.length === 0) return { success: true, count: 0 };

        const { error: insError } = await supabase
            .from(COLLECTIONS.PAYMENTS)
            .insert(newBills);

        if (insError) {
            console.error('Supabase API: Insert failed:', insError);
            throw new Error(`Failed to insert bills: ${insError.message}`);
        }

        return { success: true, count: newBills.length };
    } catch (error) {
        console.error('Error generating monthly bills:', error);
        throw error;
    }
};

// ===== REAL-TIME SUBSCRIPTIONS =====
export const subscribeToCollection = (collectionName, callback) => {
    // Note: Supabase Realtime returns changes, not the full dataset.
    // This simple implementation listens for any change and re-fetches the whole list.
    // This is less efficient but matches the behavior expected by the callback (receiving full list).

    const fetchAndCallback = async () => {
        const { data } = await supabase.from(collectionName).select('*');
        if (data) callback(fromDb(data));
    };

    const channel = supabase
        .channel(`public:${collectionName}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: collectionName }, () => {
            fetchAndCallback();
        })
        .subscribe();

    // Initial fetch
    fetchAndCallback();

    return () => supabase.removeChannel(channel);
};
