import * as encryption from './encryption';

const STORAGE_KEYS = {
    USERS: 'sge_users',
    SOCIETIES: 'sge_societies',
    VISITORS: 'sge_visitors',
    CURRENT_USER: 'sge_current_user',
    CURRENT_ROLE: 'sge_current_role',
    NOTICES: 'sge_notices',
    PRE_APPROVALS: 'sge_pre_approvals',
    VEHICLES: 'sge_vehicles',
    COMPLAINTS: 'sge_complaints',
    AMENITIES: 'sge_amenities',
    BOOKINGS: 'sge_bookings',
    STAFF: 'sge_staff',
    PAYMENTS: 'sge_payments',
    SOS_ALERTS: 'sge_sos_alerts',
    DOCUMENTS: 'sge_documents'
};

// Initialize default data structure
const initializeStorage = () => {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        setItem(STORAGE_KEYS.USERS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SOCIETIES)) {
        setItem(STORAGE_KEYS.SOCIETIES, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.VISITORS)) {
        setItem(STORAGE_KEYS.VISITORS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTICES)) {
        setItem(STORAGE_KEYS.NOTICES, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRE_APPROVALS)) {
        setItem(STORAGE_KEYS.PRE_APPROVALS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.VEHICLES)) { setItem(STORAGE_KEYS.VEHICLES, []); }
    if (!localStorage.getItem(STORAGE_KEYS.COMPLAINTS)) { setItem(STORAGE_KEYS.COMPLAINTS, []); }
    if (!localStorage.getItem(STORAGE_KEYS.AMENITIES)) { setItem(STORAGE_KEYS.AMENITIES, []); }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) { setItem(STORAGE_KEYS.BOOKINGS, []); }
    if (!localStorage.getItem(STORAGE_KEYS.STAFF)) { setItem(STORAGE_KEYS.STAFF, []); }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) { setItem(STORAGE_KEYS.PAYMENTS, []); }
    if (!localStorage.getItem(STORAGE_KEYS.SOS_ALERTS)) { setItem(STORAGE_KEYS.SOS_ALERTS, []); }
    if (!localStorage.getItem(STORAGE_KEYS.DOCUMENTS)) { setItem(STORAGE_KEYS.DOCUMENTS, []); }
};

// Generic storage operations
const getItem = (key) => {
    try {
        const item = localStorage.getItem(key);
        if (!item) return null;

        // Check if data is encrypted
        if (encryption.isEncrypted(item)) {
            const decrypted = encryption.decrypt(item);
            return decrypted;
        } else {
            // Migration: If data is not encrypted, parse it, then encrypt and save it back
            try {
                const parsed = JSON.parse(item);
                // Encrypt and save back for future use
                setItem(key, parsed);
                return parsed;
            } catch (e) {
                // If it's not JSON either, return as is (might be a simple string)
                return item;
            }
        }
    } catch (error) {
        console.error(`Error reading ${key} from localStorage:`, error);
        return null;
    }
};

const setItem = (key, value) => {
    try {
        console.log(`Storage: Setting item for key: ${key}`);

        // Check localStorage quota
        const storageUsage = JSON.stringify(localStorage).length;
        const storageLimit = 5 * 1024 * 1024; // 5MB typical limit
        console.log(`Storage: Current usage: ${storageUsage} bytes, Limit: ${storageLimit} bytes`);

        if (storageUsage > storageLimit * 0.9) {
            console.warn('Storage: Approaching localStorage limit');
            // Try to clear some old data or notify user
            throw new Error('Storage quota exceeded. Please clear browser data.');
        }

        const encrypted = encryption.encrypt(value);
        if (encrypted) {
            localStorage.setItem(key, encrypted);
            console.log(`Storage: Successfully set item for key: ${key}`);
            return true;
        } else {
            console.error(`Storage: Encryption failed for key: ${key}`);
            throw new Error('Encryption failed');
        }
    } catch (error) {
        console.error(`Error writing ${key} to localStorage:`, error);

        if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
            throw new Error('Storage quota exceeded. Please clear browser cache and try again.');
        } else if (error.message.includes('SecurityError')) {
            throw new Error('Storage access denied. Please check browser settings.');
        } else {
            throw new Error(`Storage write error: ${error.message}`);
        }
    }
};

// User operations
export const getUsers = () => getItem(STORAGE_KEYS.USERS) || [];

export const setUsers = (users) => setItem(STORAGE_KEYS.USERS, users);

export const getUserById = (id) => {
    const users = getUsers();
    return users.find(user => user.id === id);
};

export const getUserByEmail = (email) => {
    const users = getUsers();
    return users.find(user => user.email && user.email.toLowerCase() === email.toLowerCase());
};

export const getUserByLoginName = (loginName) => {
    const users = getUsers();
    return users.find(user => user.loginName?.toLowerCase() === loginName.toLowerCase());
};

export const addUser = (user) => {
    const users = getUsers();
    users.push(user);
    return setUsers(users);
};

export const updateUser = (id, updates) => {
    const users = getUsers();
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        return setUsers(users);
    }
    return false;
};

export const deleteUser = (id) => {
    const users = getUsers();
    const filteredUsers = users.filter(user => user.id !== id);
    return setUsers(filteredUsers);
};

// Society operations
export const getSocieties = () => getItem(STORAGE_KEYS.SOCIETIES) || [];

export const setSocieties = (societies) => setItem(STORAGE_KEYS.SOCIETIES, societies);

export const getSocietyById = (id) => {
    const societies = getSocieties();
    return societies.find(society => society.id === id);
};

export const addSociety = (society) => {
    const societies = getSocieties();
    societies.push(society);
    return setSocieties(societies);
};

export const updateSociety = (id, updates) => {
    const societies = getSocieties();
    const index = societies.findIndex(society => society.id === id);
    if (index !== -1) {
        societies[index] = { ...societies[index], ...updates };
        return setSocieties(societies);
    }
    return false;
};

export const deleteSociety = (id) => {
    const societies = getSocieties();
    const filteredSocieties = societies.filter(society => society.id !== id);
    return setSocieties(filteredSocieties);
};

// Visitor operations
export const getVisitors = () => getItem(STORAGE_KEYS.VISITORS) || [];

export const setVisitors = (visitors) => setItem(STORAGE_KEYS.VISITORS, visitors);

export const getVisitorById = (id) => {
    const visitors = getVisitors();
    return visitors.find(visitor => visitor.id === id);
};

export const getVisitorsBySociety = (societyId) => {
    const visitors = getVisitors();
    return visitors.filter(visitor => visitor.societyId === societyId);
};

export const getVisitorsByResident = (residentId) => {
    const visitors = getVisitors();
    return visitors.filter(visitor => visitor.residentId === residentId);
};

export const addVisitor = (visitor) => {
    try {
        console.log('Storage: Adding visitor to localStorage:', visitor);
        const visitors = getVisitors();
        console.log('Storage: Current visitors count:', visitors.length);
        visitors.push(visitor);
        const result = setVisitors(visitors);
        console.log('Storage: Set visitors result:', result);
        return result;
    } catch (error) {
        console.error('Storage: Error adding visitor:', error);
        throw new Error(`Storage error: ${error.message}`);
    }
};
export const updateVisitor = (id, updates) => {
    const visitors = getVisitors();
    const index = visitors.findIndex(visitor => visitor.id === id);
    if (index !== -1) {
        visitors[index] = { ...visitors[index], ...updates };
        return setVisitors(visitors);
    }
    return false;
};

// Notice operations
export const getNotices = () => getItem(STORAGE_KEYS.NOTICES) || [];
export const setNotices = (notices) => setItem(STORAGE_KEYS.NOTICES, notices);
export const addNotice = (notice) => {
    const notices = getNotices();
    notices.push(notice);
    return setNotices(notices);
};
export const deleteNotice = (id) => {
    const notices = getNotices();
    return setNotices(notices.filter(n => n.id !== id));
};

// Pre-approval operations
export const getPreApprovals = () => getItem(STORAGE_KEYS.PRE_APPROVALS) || [];
export const setPreApprovals = (preApprovals) => setItem(STORAGE_KEYS.PRE_APPROVALS, preApprovals);
export const addPreApproval = (preApproval) => {
    const preApprovals = getPreApprovals();
    preApprovals.push(preApproval);
    return setPreApprovals(preApprovals);
};
export const updatePreApproval = (id, updates) => {
    const preApprovals = getPreApprovals();
    const index = preApprovals.findIndex(p => p.id === id);
    if (index !== -1) {
        preApprovals[index] = { ...preApprovals[index], ...updates };
        return setPreApprovals(preApprovals);
    }
    return false;
};
export const deletePreApproval = (id) => {
    const preApprovals = getPreApprovals();
    return setPreApprovals(preApprovals.filter(p => p.id !== id));
};

// Generic CRUD fallbacks for localStorage
const getCollectionKey = (collection) => {
    const map = {
        'vehicles': STORAGE_KEYS.VEHICLES,
        'complaints': STORAGE_KEYS.COMPLAINTS,
        'amenities': STORAGE_KEYS.AMENITIES,
        'bookings': STORAGE_KEYS.BOOKINGS,
        'staff': STORAGE_KEYS.STAFF,
        'payments': STORAGE_KEYS.PAYMENTS,
        'sos_alerts': STORAGE_KEYS.SOS_ALERTS
    };
    return map[collection];
};

export const getData = (collection) => {
    const key = getCollectionKey(collection);
    return key ? getItem(key) || [] : [];
};

export const addData = (collection, data) => {
    const key = getCollectionKey(collection);
    if (!key) return false;
    const items = getItem(key) || [];
    const newItem = { id: generateId(), createdAt: new Date().toISOString(), ...data };
    items.push(newItem);
    return setItem(key, items) ? newItem : false;
};

export const updateData = (collection, id, updates) => {
    const key = getCollectionKey(collection);
    if (!key) return false;
    const items = getItem(key) || [];
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) {
        items[index] = { ...items[index], ...updates };
        setItem(key, items);
        return items[index];
    }
    return false;
};

export const deleteData = (collection, id) => {
    const key = getCollectionKey(collection);
    if (!key) return false;
    const items = getItem(key) || [];
    const filtered = items.filter(i => i.id !== id);
    return setItem(key, filtered);
};

// Current user session
export const getCurrentUser = () => getItem(STORAGE_KEYS.CURRENT_USER);

export const setCurrentUser = (user) => setItem(STORAGE_KEYS.CURRENT_USER, user);

export const clearCurrentUser = () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_ROLE);
};

export const clearCurrentRole = () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_ROLE);
};

export const getCurrentRole = () => getItem(STORAGE_KEYS.CURRENT_ROLE);

export const setCurrentRole = (role) => setItem(STORAGE_KEYS.CURRENT_ROLE, role);

// Check if superadmin exists and is active
export const hasSuperadmin = () => {
    const users = getUsers();
    return users.some(user =>
        user.roles.some(role => role.role === 'superadmin' && !user.isResigned)
    );
};

// Generate unique ID
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Initialize storage on module load
initializeStorage();

// ===== Backup & Restore Functions =====

/**
 * Create a backup of all data
 * @returns {Object} Backup data object with metadata
 */
export const createBackup = () => {
    try {
        const backup = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            data: {
                users: getUsers(),
                societies: getSocieties(),
                visitors: getVisitors(),
                notices: getNotices(),
                preApprovals: getPreApprovals()
            }
        };
        return backup;
    } catch (error) {
        console.error('Error creating backup:', error);
        throw new Error('Failed to create backup: ' + error.message);
    }
};

/**
 * Export backup to JSON file
 * @param {Object} backup - Backup data object
 * @param {string} filename - Optional filename (default: includes timestamp)
 */
export const exportBackupToFile = (backup = null, filename = null) => {
    try {
        const backupData = backup || createBackup();

        // Create filename with timestamp if not provided
        if (!filename) {
            const date = new Date();
            const timestamp = date.toISOString().replace(/[:.]/g, '-').slice(0, -5);
            filename = `sge-backup-${timestamp}.json`;
        }

        // Convert to JSON string
        const jsonString = JSON.stringify(backupData, null, 2);

        // Create blob and download
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return { success: true, filename };
    } catch (error) {
        console.error('Error exporting backup:', error);
        throw new Error('Failed to export backup: ' + error.message);
    }
};

/**
 * Validate backup data structure
 * @param {Object} backupData - Backup data to validate
 * @returns {{valid: boolean, errors: string[]}}
 */
export const validateBackupData = (backupData) => {
    const errors = [];

    if (!backupData || typeof backupData !== 'object') {
        errors.push('Invalid backup format: not an object');
        return { valid: false, errors };
    }

    if (!backupData.data || typeof backupData.data !== 'object') {
        errors.push('Invalid backup format: missing data object');
        return { valid: false, errors };
    }

    const { data } = backupData;
    const requiredKeys = ['users', 'societies', 'visitors', 'notices', 'preApprovals'];

    for (const key of requiredKeys) {
        if (!(key in data)) {
            errors.push(`Missing required data key: ${key}`);
        } else if (!Array.isArray(data[key])) {
            errors.push(`Invalid data format: ${key} should be an array`);
        }
    }

    // Additional validation for critical data structures
    if (Array.isArray(data.users)) {
        data.users.forEach((user, index) => {
            if (!user.id) errors.push(`User at index ${index} missing id`);
            if (!user.roles || !Array.isArray(user.roles)) {
                errors.push(`User at index ${index} missing roles array`);
            }
        });
    }

    if (Array.isArray(data.societies)) {
        data.societies.forEach((society, index) => {
            if (!society.id) errors.push(`Society at index ${index} missing id`);
            if (!society.name) errors.push(`Society at index ${index} missing name`);
        });
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * Restore data from backup
 * @param {Object} backupData - Backup data to restore
 * @param {boolean} createAutoBackup - Whether to create auto-backup before restore (default: true)
 * @returns {{success: boolean, message: string, errors?: string[]}}
 */
export const restoreFromBackup = (backupData, createAutoBackup = true) => {
    try {
        // Validate backup data
        const validation = validateBackupData(backupData);
        if (!validation.valid) {
            return {
                success: false,
                message: 'Backup data validation failed',
                errors: validation.errors
            };
        }

        // Create automatic backup before restore if requested
        if (createAutoBackup) {
            try {
                const autoBackup = createBackup();
                const autoBackupFilename = `sge-auto-backup-before-restore-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)}.json`;
                const autoBackupJson = JSON.stringify(autoBackup, null, 2);
                // Store in localStorage as a fallback
                localStorage.setItem('sge_last_auto_backup', autoBackupJson);
                localStorage.setItem('sge_last_auto_backup_time', new Date().toISOString());
            } catch (backupError) {
                console.warn('Failed to create auto-backup:', backupError);
                // Continue with restore even if auto-backup fails
            }
        }

        // Restore data
        const { data } = backupData;

        // Clear existing data and restore
        setUsers(data.users || []);
        setSocieties(data.societies || []);
        setVisitors(data.visitors || []);
        setNotices(data.notices || []);
        setPreApprovals(data.preApprovals || []);

        return {
            success: true,
            message: 'Data restored successfully'
        };
    } catch (error) {
        console.error('Error restoring backup:', error);
        return {
            success: false,
            message: 'Failed to restore backup: ' + error.message
        };
    }
};

/**
 * Import backup from file
 * @param {File} file - File object to import
 * @returns {Promise<{success: boolean, backup?: Object, message?: string, errors?: string[]}>}
 */
export const importBackupFromFile = async (file) => {
    return new Promise((resolve) => {
        try {
            if (!file) {
                resolve({ success: false, message: 'No file provided' });
                return;
            }

            if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
                resolve({ success: false, message: 'Invalid file type. Please select a JSON file.' });
                return;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const backupData = JSON.parse(e.target.result);
                    const validation = validateBackupData(backupData);

                    if (!validation.valid) {
                        resolve({
                            success: false,
                            message: 'Invalid backup file format',
                            errors: validation.errors
                        });
                        return;
                    }

                    resolve({
                        success: true,
                        backup: backupData
                    });
                } catch (parseError) {
                    resolve({
                        success: false,
                        message: 'Failed to parse JSON file: ' + parseError.message
                    });
                }
            };

            reader.onerror = () => {
                resolve({
                    success: false,
                    message: 'Failed to read file'
                });
            };

            reader.readAsText(file);
        } catch (error) {
            resolve({
                success: false,
                message: 'Error importing file: ' + error.message
            });
        }
    });
};

/**
 * Get auto-backup from localStorage if available
 * @returns {Object|null}
 */
export const getAutoBackup = () => {
    try {
        const autoBackupJson = localStorage.getItem('sge_last_auto_backup');
        const autoBackupTime = localStorage.getItem('sge_last_auto_backup_time');

        if (autoBackupJson) {
            return {
                data: JSON.parse(autoBackupJson),
                timestamp: autoBackupTime
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting auto-backup:', error);
        return null;
    }
};

export { STORAGE_KEYS };

// Additional exports needed by DataContext
export const getVehicles = () => getItem(STORAGE_KEYS.VEHICLES) || [];
export const getComplaints = () => getItem(STORAGE_KEYS.COMPLAINTS) || [];
export const getAmenities = () => getItem(STORAGE_KEYS.AMENITIES) || [];
export const getBookings = () => getItem(STORAGE_KEYS.BOOKINGS) || [];
export const getStaff = () => getItem(STORAGE_KEYS.STAFF) || [];
export const getPayments = () => getItem(STORAGE_KEYS.PAYMENTS) || [];
export const getSOSAlerts = () => getItem(STORAGE_KEYS.SOS_ALERTS) || [];
export const getDocuments = () => getItem(STORAGE_KEYS.DOCUMENTS) || [];
