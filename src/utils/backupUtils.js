import * as storage from './storage';
import * as storageApi from './storageApi';
import * as XLSX from 'xlsx';

/**
 * Backup and Restore Utility
 * 
 * Features:
 * - Role-based backup (Superadmin: all data, Admin: society-specific)
 * - Smart restore with merge strategies to prevent data loss
 * - Incremental backup support
 * - Conflict resolution
 * - Backup metadata tracking
 */

/**
 * Backup Strategies
 */
export const BACKUP_TYPES = {
    FULL: 'full',           // Complete database backup
    SOCIETY: 'society',     // Single society backup
    INCREMENTAL: 'incremental' // Only changes since last backup
};

export const MERGE_STRATEGIES = {
    REPLACE: 'replace',     // Replace all data (data loss possible)
    MERGE: 'merge',         // Merge with existing data (recommended)
    SKIP: 'skip',           // Keep existing, skip backup data
    PROMPT: 'prompt'        // Ask user for each conflict
};

/**
 * Collections to backup
 */
const COLLECTIONS = [
    'users',
    'societies',
    'visitors',
    'notices',
    'preApprovals',
    'vehicles',
    'complaints',
    'amenities',
    'bookings',
    'staff',
    'payments',
    'sos_alerts',
    'documents'
];

/**
 * Create backup metadata
 */
const createBackupMetadata = (type, societyId = null, userId, userName) => {
    return {
        id: storage.generateId(),
        type: type,
        societyId: societyId,
        createdBy: userId,
        createdByName: userName,
        timestamp: new Date().toISOString(),
        version: '1.0',
        appVersion: '1.0.0'
    };
};

/**
 * Get all data for backup
 */
const getAllData = async () => {
    const data = {};
    
    if (storageApi.isUsingOnlineStorage()) {
        for (const collection of COLLECTIONS) {
            try {
                data[collection] = await storageApi.getData(collection);
            } catch (error) {
                console.error(`Error fetching ${collection}:`, error);
                data[collection] = [];
            }
        }
    } else {
        data.users = storage.getUsers();
        data.societies = storage.getSocieties();
        data.visitors = storage.getVisitors();
        data.notices = storage.getNotices();
        data.preApprovals = storage.getPreApprovals();
        data.vehicles = storage.getVehicles();
        data.complaints = storage.getComplaints();
        data.amenities = storage.getAmenities();
        data.bookings = storage.getBookings();
        data.staff = storage.getStaff();
        data.payments = storage.getPayments();
        data.sos_alerts = storage.getData('sos_alerts');
        data.documents = storage.getData('documents') || [];
    }
    
    return data;
};

/**
 * Filter data by society
 */
const filterBySociety = (data, societyId) => {
    const filtered = {};
    
    // Society itself
    filtered.societies = data.societies.filter(s => s.id === societyId);
    
    // Users with roles in this society
    filtered.users = data.users.filter(u =>
        u.roles.some(r => r.societyId === societyId || r.societyid === societyId)
    );
    
    // Society-specific data
    filtered.visitors = data.visitors.filter(v => v.societyId === societyId || v.societyid === societyId);
    filtered.notices = data.notices.filter(n => n.societyId === societyId || n.societyid === societyId);
    filtered.preApprovals = data.preApprovals.filter(p => p.societyId === societyId || p.societyid === societyId);
    filtered.vehicles = data.vehicles.filter(v => v.societyId === societyId || v.societyid === societyId);
    filtered.complaints = data.complaints.filter(c => c.societyId === societyId || c.societyid === societyId);
    filtered.amenities = data.amenities.filter(a => a.societyId === societyId || a.societyid === societyId);
    filtered.bookings = data.bookings.filter(b => b.societyId === societyId || b.societyid === societyId);
    filtered.staff = data.staff.filter(s => s.societyId === societyId || s.societyid === societyId);
    filtered.payments = data.payments.filter(p => p.societyId === societyId || p.societyid === societyId);
    filtered.sos_alerts = data.sos_alerts.filter(s => s.societyId === societyId || s.societyid === societyId);
    filtered.documents = data.documents.filter(d => d.societyId === societyId || d.societyid === societyId);
    
    return filtered;
};

/**
 * Create backup
 */
export const createBackup = async (type, societyId, userId, userName) => {
    try {
        console.log(`Creating ${type} backup...`);
        
        // Get all data
        const allData = await getAllData();
        
        // Filter if society-specific
        const backupData = type === BACKUP_TYPES.SOCIETY && societyId
            ? filterBySociety(allData, societyId)
            : allData;
        
        // Create metadata
        const metadata = createBackupMetadata(type, societyId, userId, userName);
        
        // Combine metadata and data
        const backup = {
            metadata: metadata,
            data: backupData,
            statistics: calculateStatistics(backupData)
        };
        
        // Convert to JSON
        const jsonString = JSON.stringify(backup, null, 2);
        
        // Create blob and download
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Generate filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const societyName = societyId 
            ? allData.societies.find(s => s.id === societyId)?.name.replace(/\s+/g, '_') || 'Society'
            : 'All';
        link.download = `Backup_${societyName}_${timestamp}.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('Backup created successfully');
        return { success: true, metadata, statistics: backup.statistics };
    } catch (error) {
        console.error('Backup creation failed:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Calculate backup statistics
 */
const calculateStatistics = (data) => {
    const stats = {};
    for (const collection of COLLECTIONS) {
        stats[collection] = data[collection]?.length || 0;
    }
    stats.total = Object.values(stats).reduce((sum, count) => sum + count, 0);
    return stats;
};

/**
 * Parse backup file
 */
export const parseBackupFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const backup = JSON.parse(e.target.result);
                
                // Validate backup structure
                if (!backup.metadata || !backup.data) {
                    throw new Error('Invalid backup file format');
                }
                
                // Validate version compatibility
                if (backup.metadata.version !== '1.0') {
                    console.warn('Backup version mismatch, attempting to restore anyway');
                }
                
                resolve(backup);
            } catch (error) {
                reject(new Error(`Failed to parse backup file: ${error.message}`));
            }
        };
        
        reader.onerror = () => {
            reject(new Error('Failed to read backup file'));
        };
        
        reader.readAsText(file);
    });
};

/**
 * Merge data with conflict resolution
 * This is the key to preventing data loss
 */
const mergeData = (existingData, backupData, strategy) => {
    const merged = { ...existingData };
    const conflicts = [];
    
    for (const collection of COLLECTIONS) {
        const existing = existingData[collection] || [];
        const backup = backupData[collection] || [];
        
        if (strategy === MERGE_STRATEGIES.REPLACE) {
            // Replace all - potential data loss
            merged[collection] = backup;
        } else if (strategy === MERGE_STRATEGIES.SKIP) {
            // Keep existing - no changes
            merged[collection] = existing;
        } else if (strategy === MERGE_STRATEGIES.MERGE) {
            // Smart merge - recommended
            const mergedCollection = [...existing];
            const existingIds = new Set(existing.map(item => item.id));
            
            for (const backupItem of backup) {
                const existingIndex = mergedCollection.findIndex(item => item.id === backupItem.id);
                
                if (existingIndex >= 0) {
                    // Item exists - check timestamps
                    const existingItem = mergedCollection[existingIndex];
                    const backupTime = new Date(backupItem.createdAt || backupItem.timestamp || 0);
                    const existingTime = new Date(existingItem.createdAt || existingItem.timestamp || 0);
                    
                    if (backupTime > existingTime) {
                        // Backup is newer - but existing might have updates
                        const existingUpdateTime = new Date(existingItem.updatedAt || existingItem.modifiedAt || existingTime);
                        
                        if (existingUpdateTime > backupTime) {
                            // Existing has newer updates - keep existing
                            conflicts.push({
                                collection,
                                id: backupItem.id,
                                reason: 'Existing data has newer updates',
                                action: 'kept_existing'
                            });
                        } else {
                            // Backup is newer - use backup
                            mergedCollection[existingIndex] = backupItem;
                            conflicts.push({
                                collection,
                                id: backupItem.id,
                                reason: 'Backup data is newer',
                                action: 'used_backup'
                            });
                        }
                    } else {
                        // Existing is newer or same - keep existing
                        conflicts.push({
                            collection,
                            id: backupItem.id,
                            reason: 'Existing data is newer or same',
                            action: 'kept_existing'
                        });
                    }
                } else {
                    // New item from backup - add it
                    mergedCollection.push(backupItem);
                }
            }
            
            merged[collection] = mergedCollection;
        }
    }
    
    return { merged, conflicts };
};

/**
 * Restore backup
 */
export const restoreBackup = async (backup, strategy = MERGE_STRATEGIES.MERGE, societyId = null) => {
    try {
        console.log(`Restoring backup with ${strategy} strategy...`);
        
        // Get current data
        const currentData = await getAllData();
        
        // Filter backup data if society-specific restore
        const backupData = societyId
            ? filterBySociety(backup.data, societyId)
            : backup.data;
        
        // Merge data with conflict resolution
        const { merged, conflicts } = mergeData(currentData, backupData, strategy);
        
        // Apply merged data
        if (storageApi.isUsingOnlineStorage()) {
            // Online storage - batch update
            for (const collection of COLLECTIONS) {
                if (merged[collection]) {
                    // Clear and re-add (or use batch update if available)
                    for (const item of merged[collection]) {
                        await storageApi.updateData(collection, item.id, item);
                    }
                }
            }
        } else {
            // Local storage - direct update
            storage.setUsers(merged.users);
            storage.setSocieties(merged.societies);
            storage.setVisitors(merged.visitors);
            storage.setNotices(merged.notices);
            storage.setPreApprovals(merged.preApprovals);
            // Use addData for other collections
            for (const item of merged.vehicles || []) {
                await storage.updateData('vehicles', item.id, item);
            }
            for (const item of merged.complaints || []) {
                await storage.updateData('complaints', item.id, item);
            }
            for (const item of merged.amenities || []) {
                await storage.updateData('amenities', item.id, item);
            }
            for (const item of merged.bookings || []) {
                await storage.updateData('bookings', item.id, item);
            }
            for (const item of merged.staff || []) {
                await storage.updateData('staff', item.id, item);
            }
            for (const item of merged.payments || []) {
                await storage.updateData('payments', item.id, item);
            }
            for (const item of merged.sos_alerts || []) {
                await storage.updateData('sos_alerts', item.id, item);
            }
            for (const item of merged.documents || []) {
                await storage.updateData('documents', item.id, item);
            }
        }
        
        console.log('Backup restored successfully');
        return {
            success: true,
            conflicts: conflicts,
            statistics: calculateStatistics(merged)
        };
    } catch (error) {
        console.error('Backup restore failed:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Compare backup with current data
 */
export const compareBackup = async (backup, societyId = null) => {
    try {
        const currentData = await getAllData();
        const backupData = societyId
            ? filterBySociety(backup.data, societyId)
            : backup.data;
        
        const comparison = {
            collections: {},
            summary: {
                newInBackup: 0,
                newInCurrent: 0,
                conflicts: 0,
                identical: 0
            }
        };
        
        for (const collection of COLLECTIONS) {
            const current = currentData[collection] || [];
            const backupItems = backupData[collection] || [];
            
            const currentIds = new Set(current.map(item => item.id));
            const backupIds = new Set(backupItems.map(item => item.id));
            
            const newInBackup = backupItems.filter(item => !currentIds.has(item.id));
            const newInCurrent = current.filter(item => !backupIds.has(item.id));
            const common = backupItems.filter(item => currentIds.has(item.id));
            
            comparison.collections[collection] = {
                newInBackup: newInBackup.length,
                newInCurrent: newInCurrent.length,
                common: common.length,
                total: Math.max(current.length, backupItems.length)
            };
            
            comparison.summary.newInBackup += newInBackup.length;
            comparison.summary.newInCurrent += newInCurrent.length;
            comparison.summary.conflicts += common.length;
        }
        
        return comparison;
    } catch (error) {
        console.error('Backup comparison failed:', error);
        return null;
    }
};

/**
 * Validate backup file
 */
export const validateBackup = (backup) => {
    const errors = [];
    const warnings = [];
    
    // Check metadata
    if (!backup.metadata) {
        errors.push('Missing backup metadata');
    } else {
        if (!backup.metadata.timestamp) warnings.push('Missing backup timestamp');
        if (!backup.metadata.createdBy) warnings.push('Missing creator information');
    }
    
    // Check data
    if (!backup.data) {
        errors.push('Missing backup data');
    } else {
        for (const collection of COLLECTIONS) {
            if (!Array.isArray(backup.data[collection])) {
                warnings.push(`Collection ${collection} is not an array`);
            }
        }
    }
    
    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Get backup info without loading full data
 */
export const getBackupInfo = (backup) => {
    return {
        metadata: backup.metadata,
        statistics: backup.statistics || calculateStatistics(backup.data),
        size: JSON.stringify(backup).length,
        collections: Object.keys(backup.data).filter(key => 
            Array.isArray(backup.data[key]) && backup.data[key].length > 0
        )
    };
};


/**
 * Convert backup data to Excel format
 * Creates a multi-sheet Excel workbook with one sheet per collection
 */
export const convertBackupToExcel = (backup, filename = null) => {
    try {
        console.log('Converting backup to Excel...');
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Add metadata sheet
        const metadataSheet = createMetadataSheet(backup.metadata, backup.statistics);
        XLSX.utils.book_append_sheet(wb, metadataSheet, 'Backup Info');
        
        // Add data sheets for each collection
        for (const collection of COLLECTIONS) {
            const data = backup.data[collection] || [];
            if (data.length > 0) {
                const sheet = createCollectionSheet(collection, data);
                // Truncate sheet name to 31 chars (Excel limit)
                const sheetName = formatSheetName(collection);
                XLSX.utils.book_append_sheet(wb, sheet, sheetName);
            }
        }
        
        // Generate filename
        const timestamp = new Date(backup.metadata.timestamp).toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const societyName = backup.metadata.societyId 
            ? backup.data.societies?.find(s => s.id === backup.metadata.societyId)?.name.replace(/\s+/g, '_') || 'Society'
            : 'All';
        const excelFilename = filename || `Backup_${societyName}_${timestamp}.xlsx`;
        
        // Write file
        XLSX.writeFile(wb, excelFilename);
        
        console.log('Excel file created successfully');
        return { success: true, filename: excelFilename };
    } catch (error) {
        console.error('Excel conversion failed:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Create metadata sheet
 */
const createMetadataSheet = (metadata, statistics) => {
    const data = [
        ['Backup Information', ''],
        ['', ''],
        ['Backup ID', metadata.id],
        ['Type', metadata.type],
        ['Created By', metadata.createdByName],
        ['Created At', new Date(metadata.timestamp).toLocaleString()],
        ['Version', metadata.version],
        ['', ''],
        ['Statistics', ''],
        ['', ''],
        ['Collection', 'Record Count']
    ];
    
    // Add statistics
    for (const [collection, count] of Object.entries(statistics)) {
        if (collection !== 'total') {
            data.push([collection, count]);
        }
    }
    
    data.push(['', '']);
    data.push(['Total Records', statistics.total]);
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    ws['!cols'] = [
        { wch: 20 },
        { wch: 30 }
    ];
    
    return ws;
};

/**
 * Create sheet for a collection
 */
const createCollectionSheet = (collection, data) => {
    if (data.length === 0) {
        return XLSX.utils.aoa_to_sheet([['No data']]);
    }
    
    // Get all unique keys from all records
    const allKeys = new Set();
    data.forEach(record => {
        Object.keys(record).forEach(key => allKeys.add(key));
    });
    
    // Convert to array and sort (put common fields first)
    const commonFields = ['id', 'name', 'email', 'mobile', 'createdAt', 'updatedAt'];
    const keys = Array.from(allKeys).sort((a, b) => {
        const aIndex = commonFields.indexOf(a);
        const bIndex = commonFields.indexOf(b);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.localeCompare(b);
    });
    
    // Create header row
    const headers = keys;
    
    // Create data rows
    const rows = data.map(record => {
        return keys.map(key => {
            const value = record[key];
            
            // Handle different data types
            if (value === null || value === undefined) {
                return '';
            } else if (typeof value === 'object') {
                // Convert objects/arrays to JSON string
                return JSON.stringify(value);
            } else if (typeof value === 'boolean') {
                return value ? 'Yes' : 'No';
            } else {
                return value;
            }
        });
    });
    
    // Combine headers and rows
    const sheetData = [headers, ...rows];
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    
    // Auto-size columns
    const colWidths = keys.map(key => {
        const maxLength = Math.max(
            key.length,
            ...rows.map(row => {
                const cellIndex = keys.indexOf(key);
                const cellValue = String(row[cellIndex] || '');
                return Math.min(cellValue.length, 50); // Cap at 50
            })
        );
        return { wch: Math.max(10, Math.min(maxLength + 2, 50)) };
    });
    
    ws['!cols'] = colWidths;
    
    return ws;
};

/**
 * Format sheet name (Excel has 31 char limit)
 */
const formatSheetName = (collection) => {
    const nameMap = {
        'users': 'Users',
        'societies': 'Societies',
        'visitors': 'Visitors',
        'notices': 'Notices',
        'preApprovals': 'Pre-Approvals',
        'vehicles': 'Vehicles',
        'complaints': 'Complaints',
        'amenities': 'Amenities',
        'bookings': 'Bookings',
        'staff': 'Staff',
        'payments': 'Payments',
        'sos_alerts': 'SOS Alerts',
        'documents': 'Documents'
    };
    
    const name = nameMap[collection] || collection;
    return name.substring(0, 31); // Excel sheet name limit
};

/**
 * Parse backup file and convert to Excel
 */
export const convertBackupFileToExcel = async (file) => {
    try {
        // Parse backup file
        const backup = await parseBackupFile(file);
        
        // Validate backup
        const validation = validateBackup(backup);
        if (!validation.valid) {
            throw new Error('Invalid backup file: ' + validation.errors.join(', '));
        }
        
        // Convert to Excel
        const result = convertBackupToExcel(backup);
        
        return result;
    } catch (error) {
        console.error('Backup to Excel conversion failed:', error);
        return { success: false, error: error.message };
    }
};
