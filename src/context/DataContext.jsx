import { createContext, useContext, useState, useEffect } from 'react';
import * as storage from '../utils/storage';
import * as storageApi from '../utils/storageApi';

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

    // Load data on mount - use async API if Firebase is configured
    useEffect(() => {
        refreshData();
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
        const society = getSocietyById(societyId);
        if (!society) return false;

        const now = new Date();
        const fromDate = new Date(society.permissionFromDate);
        const toDate = new Date(society.permissionToDate);

        return now >= fromDate && now <= toDate;
    };

    // Visitor operations
    const addVisitor = async (visitorData) => {
        try {
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
        if (storageApi.isUsingOnlineStorage()) {
            await storageApi.updateVisitor(id, updates);
        } else {
            storage.updateVisitor(id, updates);
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
            u.roles.some(r => r.role === 'administrator' && r.societyId === societyId)
        );
    };

    const getResidentsBySociety = (societyId) => {
        return users.filter(u =>
            u.roles.some(r => r.role === 'resident' && r.societyId === societyId)
        );
    };

    const getSecurityBySociety = (societyId) => {
        return users.filter(u =>
            u.roles.some(r => r.role === 'security' && r.societyId === societyId)
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
                role.role === 'resident' && role.societyId === societyId && role.status === 'pending'
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

    const triggerSOS = async (residentId, societyId, message) => {
        const alert = await addDataItem('sos_alerts', {
            residentId,
            societyId,
            message,
            status: 'active'
        });
        return alert;
    };

    const resolveSOS = async (id, resolvedBy) => {
        await updateDataItem('sos_alerts', id, {
            status: 'resolved',
            resolvedBy
        });
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
        notices,

        // Pre-approval operations
        addPreApproval,
        updatePreApproval,
        getPreApprovalsBySociety,
        getPreApprovalsByResident,
        preApprovals,

        // Role-specific queries
        getSuperadmin,
        hasSuperadmin,
        getAdministratorsBySociety,
        getResidentsBySociety,
        getSecurityBySociety,
        getPendingAdministrators,
        getPendingResidents,

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
