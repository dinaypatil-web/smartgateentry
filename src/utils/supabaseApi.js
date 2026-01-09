
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
    Object.keys(data).forEach(key => {
        // Handle specific field mappings to avoid schema issues
        if (key === 'createdBy') {
            mapped['createdby'] = data[key]; // Use lowercase version
        } else if (key === 'societyId') {
            mapped['societyid'] = data[key];
        } else if (key === 'residentId') {
            mapped['residentid'] = data[key]; // Critical field for resident association
        } else if (key === 'contactNumber') {
            mapped['contactnumber'] = data[key];
        } else if (key === 'idProof') {
            mapped['idproof'] = data[key];
        } else if (key === 'comingFrom') {
            mapped['comingfrom'] = data[key];
        } else if (key === 'entryTime') {
            mapped['entrytime'] = data[key];
        } else if (key === 'exitTime') {
            mapped['exittime'] = data[key];
        } else if (key === 'plateNumber') {
            mapped['platenumber'] = data[key];
        } else if (key === 'assignedTo') {
            mapped['assignedto'] = data[key];
        } else if (key === 'amenityId') {
            mapped['amenityid'] = data[key];
        } else if (key === 'isGateAllowed') {
            mapped['isgateallowed'] = data[key];
        } else if (key === 'permissionFromDate') {
            mapped['permissionfromdate'] = data[key];
        } else if (key === 'permissionToDate') {
            mapped['permissiontodate'] = data[key];
        } else {
            // Default: convert to lowercase
            mapped[key.toLowerCase()] = data[key];
        }
    });
    console.log('Supabase API: Field mapping result:', mapped);
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
        console.log('Supabase: Adding visitor:', visitorData);

        // Critical: Ensure residentId is preserved
        if (!visitorData.residentId) {
            throw new Error('residentId is required for visitor creation');
        }

        // Check table structure first
        const availableColumns = await checkTableStructure(COLLECTIONS.VISITORS);

        const visitorWithId = {
            ...visitorData,
            status: 'pending',
            entryTime: new Date().toISOString(),
            exitTime: null
        };

        // Create data object with only available columns
        let dbData = {};
        if (availableColumns) {
            // Only include fields that exist in the database
            Object.keys(visitorWithId).forEach(key => {
                const lowerKey = key.toLowerCase();
                const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();

                if (availableColumns.includes(key) ||
                    availableColumns.includes(lowerKey) ||
                    availableColumns.includes(snakeKey)) {
                    dbData[lowerKey] = visitorWithId[key];
                }
            });
            console.log('Supabase: Filtered data based on available columns:', dbData);
        } else {
            // Fallback: Use original mapping without problematic fields
            const { createdBy, ...dataWithoutCreatedBy } = visitorWithId;
            dbData = toDb(dataWithoutCreatedBy);
            console.log('Supabase: Using fallback mapping (without createdBy):', dbData);
        }

        // Critical verification: Ensure residentid is included
        if (!dbData.residentid && visitorWithId.residentId) {
            dbData.residentid = visitorWithId.residentId;
            console.log('Supabase: Force-added residentid:', visitorWithId.residentId);
        }

        let { data, error } = await supabase
            .from(COLLECTIONS.VISITORS)
            .insert(dbData)
            .select()
            .single();

        // If first attempt fails, try with minimal required fields only
        if (error && (error.message.includes('column') || error.message.includes('does not exist'))) {
            console.log('Supabase: First attempt failed, trying minimal data...');

            const minimalData = {
                id: visitorWithId.id,
                name: visitorWithId.name,
                status: visitorWithId.status,
                entrytime: visitorWithId.entryTime,
                societyid: visitorWithId.societyId,
                residentid: visitorWithId.residentId // Critical field
            };

            dbData = minimalData;
            console.log('Supabase: Minimal data attempt:', dbData);

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

            // Handle specific column errors
            if (error.message.includes('column') && error.message.includes('does not exist')) {
                throw new Error(`Database schema error: ${error.message}. Available columns: ${availableColumns ? availableColumns.join(', ') : 'unknown'}`);
            } else if (error.message.includes('createdby')) {
                throw new Error(`Database schema error: "createdby" column not found. Available columns: ${availableColumns ? availableColumns.join(', ') : 'unknown'}`);
            } else if (error.message.includes('residentid')) {
                throw new Error(`Database schema error: "residentid" column issue. Available columns: ${availableColumns ? availableColumns.join(', ') : 'unknown'}`);
            } else if (error.message.includes('violates')) {
                throw new Error(`Database constraint error: ${error.message}`);
            } else {
                throw new Error(`Database error: ${error.message}`);
            }
        }

        console.log('Supabase: Visitor added successfully:', data);
        return fromDb(data);
    } catch (error) {
        console.error('Error adding visitor:', error);
        throw error;
    }
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
