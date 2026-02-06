import { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as storage from '../utils/storage';
import * as storageApi from '../utils/storageApi';
import * as notificationService from '../utils/notificationService';

const DataContext = createContext(null);

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

export const DataProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [societies, setSocieties] = useState([]);
    const [visitors, setVisitors] = useState([]);
    const [notices, setNotices] = useState([]);
    const [preApprovals, setPreApprovals] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [staff, setStaff] = useState([]);
    const [payments, setPayments] = useState([]);
    const [sosAlerts, setSosAlerts] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const pendingSosResolutions = useRef(new Set());

    // Load data on mount - use async API if Firebase is configured
    useEffect(() => {
        refreshData();

        // Subscribe to SOS alerts for real-time notification
        const unsubscribeSOS = storageApi.subscribeToCollection('sos_alerts', (data) => {
            console.log('DataContext: Real-time SOS update received', data?.length);

            // Cleanup pending resolutions if the backend confirms they are resolved
            data.forEach(alert => {
                if (alert.status === 'resolved' && pendingSosResolutions.current.has(alert.id)) {
                    pendingSosResolutions.current.delete(alert.id);
                }
            });

            // Update state, enforcing 'resolved' status for any pending items to prevent UI flickering
            setSosAlerts(data.map(alert =>
                pendingSosResolutions.current.has(alert.id) ? { ...alert, status: 'resolved' } : alert
            ));
        });

        // Subscribe to visitors for real-time entry/exit tracking
        const unsubscribeVisitors = storageApi.subscribeToCollection('visitors', (data) => {
            console.log('DataContext: Real-time visitors update received', data?.length);
            setVisitors(data);
        });

        // Subscribe to notices for instant updates
        const unsubscribeNotices = storageApi.subscribeToCollection('notices', (data) => {
            console.log('DataContext: Real-time notices update received', data?.length);
            setNotices(data);
        });

        return () => {
            if (unsubscribeSOS) unsubscribeSOS();
            if (unsubscribeVisitors) unsubscribeVisitors();
            if (unsubscribeNotices) unsubscribeNotices();
        };
    }, []);

    const refreshData = async () => {
        try {
            console.log('DataContext: Starting data refresh...');
            setLoading(true);
            if (storageApi.isUsingOnlineStorage()) {
                // Use async API calls for online storage
                console.log('DataContext: Using online storage for refresh');
                const [
                    usersData, societiesData, visitorsData, noticesData, preApprovalsData,
                    vehiclesData, complaintsData, amenitiesData, bookingsData, staffData, paymentsData, sosData, documentsData
                ] = await Promise.all([
                    storageApi.getUsers(),
                    storageApi.getSocieties(),
                    storageApi.getVisitors(),
                    storageApi.getNotices(),
                    storageApi.getPreApprovals(),
                    storageApi.getVehicles(),
                    storageApi.getComplaints(),
                    storageApi.getAmenities(),
                    storageApi.getBookings(),
                    storageApi.getStaff(),
                    storageApi.getPayments(),
                    storageApi.getData('sos_alerts'),
                    storageApi.getData('documents')
                ]);
                console.log('DataContext: Refreshed data - Visitors:', visitorsData?.length, 'Users:', usersData?.length);
                setUsers(usersData);
                setSocieties(societiesData);
                setVisitors(visitorsData);
                setNotices(noticesData);
                setPreApprovals(preApprovalsData);
                setVehicles(vehiclesData);
                setComplaints(complaintsData);
                setAmenities(amenitiesData);
                setBookings(bookingsData);
                setStaff(staffData);
                setPayments(paymentsData);
                setSosAlerts(sosData);
                setDocuments(documentsData);
            } else {
                // Use synchronous localStorage calls
                console.log('DataContext: Using local storage for refresh');
                setUsers(storage.getUsers());
                setSocieties(storage.getSocieties());
                setVisitors(storage.getVisitors());
                setNotices(storage.getNotices());
                setPreApprovals(storage.getPreApprovals());
                setVehicles(storage.getVehicles());
                setComplaints(storage.getComplaints());
                setAmenities(storage.getAmenities());
                setBookings(storage.getBookings());
                setStaff(storage.getStaff());
                setPayments(storage.getPayments());
                setSosAlerts(storage.getData('sos_alerts'));
                setDocuments(storage.getData('documents') || []);
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setLoading(false);
            console.log('DataContext: Data refresh completed');
        }
    };

    // User operations
    const addUser = async (userData) => {
        const user = {
            id: storage.generateId(),
            ...userData,
            createdAt: new Date().toISOString()
        };
        if (storageApi.isUsingOnlineStorage()) {
            await storageApi.addUser(user);
        } else {
            storage.addUser(user);
        }
        await refreshData();
        return user;
    };

    const updateUser = async (id, updates) => {
        if (storageApi.isUsingOnlineStorage()) {
            await storageApi.updateUser(id, updates);
        } else {
            storage.updateUser(id, updates);
        }
        await refreshData();
    };

    const deleteUserById = async (id) => {
        if (storageApi.isUsingOnlineStorage()) {
            await storageApi.deleteUser(id);
        } else {
            storage.deleteUser(id);
        }
        await refreshData();
    };

    const getUserById = async (id) => {
        if (storageApi.isUsingOnlineStorage()) {
            return await storageApi.getUserById(id);
        }
        return storage.getUserById(id);
    };

    const getUserByEmail = async (email) => {
        if (storageApi.isUsingOnlineStorage()) {
            return await storageApi.getUserByEmail(email);
        }
        return storage.getUserByEmail(email);
    };

    const getUserByLoginName = async (loginName) => {
        if (storageApi.isUsingOnlineStorage()) {
            return await storageApi.getUserByLoginName(loginName);
        }
        return storage.getUserByLoginName(loginName);
    };

    // Society operations
    const addSociety = async (societyData) => {
        const society = {
            id: storage.generateId(),
            ...societyData,
            createdAt: new Date().toISOString()
        };
        if (storageApi.isUsingOnlineStorage()) {
            await storageApi.addSociety(society);
        } else {
            storage.addSociety(society);
        }
        await refreshData();
        return society;
    };

    const updateSociety = async (id, updates) => {
        if (storageApi.isUsingOnlineStorage()) {
            await storageApi.updateSociety(id, updates);
        } else {
            storage.updateSociety(id, updates);
        }
        await refreshData();
    };

    const deleteSociety = async (id) => {
        if (storageApi.isUsingOnlineStorage()) {
            await storageApi.deleteSociety(id);
        } else {
            storage.deleteSociety(id);
        }
        await refreshData();
    };

    // Synchronous version that reads from state (for use in components)
    const getSocietyById = (id) => {
        return societies.find(s => s.id === id) || null;
    };

    // Async version for fresh fetch (when needed)
    const fetchSocietyById = async (id) => {
        if (storageApi.isUsingOnlineStorage()) {
            return await storageApi.getSocietyById(id);
        }
        return storage.getSocietyById(id);
    };

    // Check if society is within permission date range
    const isSocietyActive = (societyId) => {
        // If no societyId is provided, we can't deactivate anything based on it
        if (!societyId) return true;

        const society = getSocietyById(societyId);

        // If societies list is empty or society not found, we assume active for now
        // to prevent blocking UI while data is still loading
        if (societies.length === 0 || !society) return true;

        const now = new Date();
        const fromDateVal = society.permissionFromDate || society.permissionfromdate;
        const toDateVal = society.permissionToDate || society.permissiontodate;

        // If no date range is set, default to active
        if (!fromDateVal || !toDateVal) return true;

        const from = new Date(fromDateVal);
        const to = new Date(toDateVal);

        return now >= from && now <= to;
    };

    const ensureSocietyActive = (societyId) => {
        if (!isSocietyActive(societyId)) {
            const society = getSocietyById(societyId);
            throw new Error(`Permission period for "${society?.name || 'this society'}" has ended. Operations are suspended.`);
        }
    };

    // Visitor operations
    const addVisitor = async (visitorData) => {
        try {
            ensureSocietyActive(visitorData.societyId);
            console.log('DataContext: Adding visitor:', visitorData);

            const visitor = {
                id: storage.generateId(),
                ...visitorData,
                status: 'pending',
                entryTime: new Date().toISOString(),
                exitTime: null
            };

            console.log('DataContext: Prepared visitor object:', visitor);

            if (storageApi.isUsingOnlineStorage()) {
                console.log('DataContext: Using online storage');
                const result = await storageApi.addVisitor(visitor);
                console.log('DataContext: Online storage result:', result);
            } else {
                console.log('DataContext: Using local storage');
                const result = storage.addVisitor(visitor);
                console.log('DataContext: Local storage result:', result);
            }

            // Send WhatsApp notification to resident
            try {
                const resident = users.find(u => u.id === visitor.residentId);
                if (resident && resident.mobile) {
                    console.log('Sending visitor entry notification to resident:', resident.name);
                    await notificationService.notifyVisitorEntry(visitor, resident);
                }
            } catch (notifError) {
                console.error('Failed to send visitor notification:', notifError);
                // Don't fail the visitor creation if notification fails
            }

            // Force refresh to ensure all components get updated data
            console.log('DataContext: Refreshing data after visitor creation...');
            await refreshData();
            console.log('DataContext: Data refreshed successfully');

            // Additional delay to ensure state is updated
            await new Promise(resolve => setTimeout(resolve, 100));

            return visitor;
        } catch (error) {
            console.error('DataContext: Error in addVisitor:', error);
            throw error;
        }
    };

    const updateVisitor = async (id, updates) => {
        // Find existing visitor to get societyId for check
        const visitor = visitors.find(v => v.id === id);
        if (visitor) {
            ensureSocietyActive(visitor.societyId || visitor.societyid);
        }

        if (storageApi.isUsingOnlineStorage()) {
            await storageApi.updateVisitor(id, updates);
        } else {
            storage.updateVisitor(id, updates);
        }
        
        // Send notification if visitor status changed to approved or rejected
        try {
            if (updates.status === 'approved' || updates.status === 'rejected') {
                const resident = users.find(u => u.id === visitor.residentId || u.id === visitor.residentid);
                if (resident && visitor.contactNumber) {
                    if (updates.status === 'approved') {
                        await notificationService.notifyVisitorApproved(visitor, resident);
                    } else {
                        await notificationService.notifyVisitorRejected(visitor, resident);
                    }
                }
            }
        } catch (notifError) {
            console.error('Failed to send visitor status notification:', notifError);
        }
        
        await refreshData();
    };

    const getVisitorById = async (id) => {
        if (storageApi.isUsingOnlineStorage()) {
            return await storageApi.getVisitorById(id);
        }
        return storage.getVisitorById(id);
    };

    const getVisitorsByResident = (residentId) => {
        return visitors.filter(v => v.residentId === residentId);
    };

    const getVisitorsBySociety = (societyId) => {
        return visitors.filter(v => v.societyId === societyId);
    };

    // Notice operations
    const addNotice = async (noticeData) => {
        ensureSocietyActive(noticeData.societyId);
        const notice = {
            id: storage.generateId(),
            ...noticeData,
            createdAt: new Date().toISOString()
        };
        if (storageApi.isUsingOnlineStorage()) {
            await storageApi.addNotice(notice);
        } else {
            storage.addNotice(notice);
        }
        
        // Send WhatsApp notification to all society residents
        try {
            const society = societies.find(s => s.id === notice.societyId);
            const societyResidents = users.filter(u =>
                u.roles.some(r => r.role === 'resident' && r.societyId === notice.societyId && r.status === 'approved')
            );
            
            if (society && societyResidents.length > 0) {
                console.log(`Sending notice notification to ${societyResidents.length} residents`);
                await notificationService.notifyNewNotice(notice, society, societyResidents);
            }
        } catch (notifError) {
            console.error('Failed to send notice notifications:', notifError);
        }
        
        await refreshData();
        return notice;
    };

    const deleteNotice = async (id) => {
        if (storageApi.isUsingOnlineStorage()) {
            await storageApi.deleteNotice(id);
        } else {
            storage.deleteNotice(id);
        }
        await refreshData();
    };

    const getNoticesBySociety = (societyId) => {
        return notices.filter(n => n.societyId === societyId);
    };

    // Pre-approval operations
    const addPreApproval = async (data) => {
        ensureSocietyActive(data.societyId);
        const preApproval = {
            id: storage.generateId(),
            ...data,
            status: 'valid',
            createdAt: new Date().toISOString()
        };
        if (storageApi.isUsingOnlineStorage()) {
            await storageApi.addPreApproval(preApproval);
        } else {
            storage.addPreApproval(preApproval);
        }
        await refreshData();
        return preApproval;
    };

    const updatePreApproval = async (id, updates) => {
        const pre = preApprovals.find(p => p.id === id);
        if (pre) {
            ensureSocietyActive(pre.societyId || pre.societyid);
        }

        if (storageApi.isUsingOnlineStorage()) {
            await storageApi.updatePreApproval(id, updates);
        } else {
            storage.updatePreApproval(id, updates);
        }
        await refreshData();
    };

    const getPreApprovalsBySociety = (societyId) => {
        return preApprovals.filter(p => p.societyId === societyId);
    };


    const getPreApprovalsByResident = (residentId) => {
        return preApprovals.filter(p => p.residentId === residentId);
    };

    // Role-specific queries
    const getSuperadmin = () => {
        return users.find(u =>
            u.roles.some(r => r.role === 'superadmin') && !u.isResigned
        );
    };

    const hasSuperadmin = () => {
        return users.some(u =>
            u.roles.some(r => r.role === 'superadmin') && !u.isResigned
        );
    };

    const getAdministratorsBySociety = (societyId) => {
        return users.filter(u =>
            u.roles.some(r => r.role === 'administrator' && (r.societyId === societyId || r.societyid === societyId))
        );
    };

    const getResidentsBySociety = (societyId) => {
        return users.filter(u =>
            u.roles.some(r => r.role === 'resident' && (r.societyId === societyId || r.societyid === societyId))
        );
    };

    const getSecurityBySociety = (societyId) => {
        return users.filter(u =>
            u.roles.some(r => r.role === 'security' && (r.societyId === societyId || r.societyid === societyId))
        );
    };

    const getPendingAdministrators = () => {
        return users.filter(u =>
            u.roles.some(r => r.role === 'administrator' && r.status === 'pending')
        );
    };

    const getPendingResidents = (societyId) => {
        return users.filter(user =>
            user.roles.some(role =>
                role.role === 'resident' && (role.societyId === societyId || role.societyid === societyId) && role.status === 'pending'
            )
        );
    };

    const getPendingSecurity = (societyId) => {
        return users.filter(user =>
            user.roles.some(role =>
                role.role === 'security' && (role.societyId === societyId || role.societyid === societyId) && role.status === 'pending'
            )
        );
    };

    // Generic CRUD handlers
    const addDataItem = async (collection, data) => {
        const newItem = await storageApi.addData(collection, data);
        await refreshData();
        return newItem;
    };

    const updateDataItem = async (collection, id, updates) => {
        const updated = await storageApi.updateData(collection, id, updates);
        await refreshData();
        return updated;
    };

    const deleteDataItem = async (collection, id) => {
        await storageApi.deleteData(collection, id);
        await refreshData();
    };

    // Simulated Integrations (Advanced Features)
    const simulateNotification = (type, target, message) => {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`%c[SIMULated ${type}] %cTo: ${target} %cMsg: ${message}`,
            'color: #6366f1; font-weight: bold;',
            'color: #8b5cf6;',
            'color: var(--text-primary);',
            `at ${timestamp}`
        );
        // In a real app, this would call a Twilio/Msg91/WhatsApp API
    };

    const triggerSOS = async (userId, societyId, message) => {
        const alertData = {
            id: storage.generateId(),
            residentId: userId,
            societyId: societyId,
            message: message || 'Emergency SOS Alert!',
            status: 'active',
            createdAt: new Date().toISOString()
        };
        console.log('DataContext: Triggering SOS ALERT:', alertData);
        const result = await addDataItem('sos_alerts', alertData);

        // Simulate immediate WhatsApp/SMS alerts to security
        simulateNotification('WHATSAPP', 'Security Team', `🚨 EMERGENCY SOS: ${message}`);
        simulateNotification('SMS', 'Head Guard', `SOS Alert from Society. Check dashboard immediately!`);

        return result;
    };

    const resolveSOS = async (alertId, resolvedBy, residentId = null) => {
        // Track pending resolutions to prevent race conditions/flickering
        if (alertId) pendingSosResolutions.current.add(alertId);

        // Optimistic update for instant UI response
        const resolvedAt = new Date().toISOString();
        setSosAlerts(prev => prev.map(alert => {
            const isMatch = (alert.id === alertId || (residentId && (alert.residentId === residentId || alert.residentid === residentId)));
            if (isMatch) {
                if (alert.id) pendingSosResolutions.current.add(alert.id); // Add batch IDs to pending
                return { ...alert, status: 'resolved', resolvedBy, resolvedAt };
            }
            return alert;
        }));

        const user = users.find(u => u.id === resolvedBy);
        simulateNotification('EMAIL', 'Admin', `SOS Alert ${alertId} has been resolved by ${user?.name || resolvedBy}.`);

        try {
            // Primary attempt: Resolve by ID
            let result = null;
            if (alertId) {
                result = await updateDataItem('sos_alerts', alertId, {
                    status: 'resolved',
                    resolvedBy: resolvedBy,
                    resolvedAt: resolvedAt
                });
            }

            // Fallback: If no ID or update didn't return data (zombie alert?), clear all active for resident
            // This acts as a robust 'Clear Queue' mechanism
            if ((!result || Object.keys(result).length === 0) && residentId) {
                console.log('DataContext: Primary resolve failed/incomplete. Attempting fallback cleanup by residentId:', residentId);

                // Get active alerts for this resident - requires scanning loaded alerts or DB
                // Since this is a fallback, we'll try to update any we find in local state that match
                const activeForResident = sosAlerts.filter(a =>
                    (a.residentId === residentId || a.residentid === residentId) && a.status === 'active'
                );

                for (const alert of activeForResident) {
                    if (alert.id) {
                        await updateDataItem('sos_alerts', alert.id, {
                            status: 'resolved',
                            resolvedBy: resolvedBy,
                            resolvedAt: resolvedAt
                        });
                    }
                }
            }

            return result;
        } catch (error) {
            console.error('Failed to resolve SOS in backend:', error);
            await refreshData();
            throw error;
        }
    };

    const value = {
        // State
        users,
        societies,
        visitors,
        notices,
        preApprovals,
        vehicles,
        complaints,
        amenities,
        bookings,
        staff,
        payments,
        sosAlerts,
        documents,
        loading,

        // Generic CRUD
        addDataItem,
        updateDataItem,
        deleteDataItem,

        // SOS
        triggerSOS,
        resolveSOS,

        // User operations
        addUser,
        updateUser,
        deleteUserById,
        getUserById,
        getUserByEmail,
        getUserByLoginName,

        // Society operations
        addSociety,
        updateSociety,
        deleteSociety,
        getSocietyById,
        isSocietyActive,

        // Visitor operations
        addVisitor,
        updateVisitor,
        getVisitorById,
        getVisitorsBySociety,
        getVisitorsByResident,

        // Notice operations
        addNotice,
        deleteNotice,
        getNoticesBySociety,

        // Pre-approval operations
        addPreApproval,
        updatePreApproval,
        getPreApprovalsBySociety,
        getPreApprovalsByResident,

        // Role-specific queries
        getSuperadmin,
        hasSuperadmin,
        getAdministratorsBySociety,
        getResidentsBySociety,
        getSecurityBySociety,
        getPendingAdministrators,
        getPendingResidents,
        getPendingSecurity,

        // Refresh
        refreshData
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export default DataContext;
