
import { supabase } from '../config/supabase';

const COLLECTIONS = {
    USERS: 'users',
    SOCIETIES: 'societies',
    VISITORS: 'visitors',
    NOTICES: 'notices',
    PRE_APPROVALS: 'preApprovals'
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
    if (!data) return data;
    
    // Known camelCase keys in app
    const camelKeys = [
        'loginName', 'loginPassword', 'createdAt', 'createdBy',
        'permissionFromDate', 'permissionToDate',
        'idProof', 'comingFrom', 'contactNumber', 'residentId', 'societyId', 'entryTime', 'exitTime',
        'visitorName', 'expectedDate', 'passCode', 'isResigned', 'unblockRequestedBy',
        'securityQuestion', 'securityAnswer', 'unblockRequestedDate', 'blockedBy', 'blockedDate'
    ];
    
    // If it's an array, map each item
    if (Array.isArray(data)) {
        return data.map(item => fromDb(item));
    }
    
    const mapped = { ...data };
    
    // Check if we have lowercase versions of camelKeys and map them back
    camelKeys.forEach(key => {
        const lowerKey = key.toLowerCase();
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        
        // Priority: camelCase -> lowercase -> snake_case
        if (mapped[key] === undefined) {
            if (mapped[lowerKey] !== undefined) {
                mapped[key] = mapped[lowerKey];
                delete mapped[lowerKey]; // Remove the lowercase version to avoid confusion
            } else if (mapped[snakeKey] !== undefined) {
                mapped[key] = mapped[snakeKey];
                delete mapped[snakeKey]; // Remove the snake_case version to avoid confusion
            }
        }
    });
    
    console.log('Supabase API: Mapping DB data back to camelCase:', mapped);
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
        const { data, error } = await supabase
            .from(COLLECTIONS.USERS)
            .select('*')
            .eq('loginName', loginName.toLowerCase()) // Note: loginName might need to be loginname if table has lowercase
            .or(`loginname.eq.${loginName.toLowerCase()},loginName.eq.${loginName.toLowerCase()}`) // Try both to be safe?
            .single();
            
        // Simplified query assuming one schema or the other
        // Let's first try standard query. If it fails, we might need more complex logic.
        // But for 'eq', we need the exact column name.
        // Let's assume lowercase for safety if mapped.
        
        // Actually, we can't easily guess the column name for .eq() without mapping.
        // But let's try to query assuming the DB has lowercase columns if the previous operations failed.
        // For now, I will stick to what's likely in the DB: lowercase if unquoted.
        
        // However, we can't change the .eq() key dynamically easily.
        // Let's try to use the most likely one: 'loginname' (lowercase)
        
        const { data: d1, error: e1 } = await supabase
             .from(COLLECTIONS.USERS)
             .select('*')
             .eq('loginname', loginName.toLowerCase())
             .single();
             
        if (!e1) return fromDb(d1);
        
        // If that failed, maybe it IS mixed case?
        const { data: d2, error: e2 } = await supabase
             .from(COLLECTIONS.USERS)
             .select('*')
             .eq('loginName', loginName.toLowerCase())
             .single();
             
        if (!e2) return fromDb(d2);
        
        return null;
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
        return data;
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
        return data;
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
