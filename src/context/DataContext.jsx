import { createContext, useContext, useState, useEffect } from 'react';
import * as storage from '../utils/storage';

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
    const [loading, setLoading] = useState(true);

    // Load data from localStorage on mount
    useEffect(() => {
        refreshData();
        setLoading(false);
    }, []);

    const refreshData = () => {
        setUsers(storage.getUsers());
        setSocieties(storage.getSocieties());
        setVisitors(storage.getVisitors());
        setNotices(storage.getNotices());
        setPreApprovals(storage.getPreApprovals());
    };

    // User operations
    const addUser = (userData) => {
        const user = {
            id: storage.generateId(),
            ...userData,
            createdAt: new Date().toISOString()
        };
        storage.addUser(user);
        refreshData();
        return user;
    };

    const updateUser = (id, updates) => {
        storage.updateUser(id, updates);
        refreshData();
    };

    const deleteUserById = (id) => {
        storage.deleteUser(id);
        refreshData();
    };

    const getUserById = (id) => storage.getUserById(id);
    const getUserByEmail = (email) => storage.getUserByEmail(email);
    const getUserByLoginName = (loginName) => storage.getUserByLoginName(loginName);

    // Society operations
    const addSociety = (societyData) => {
        const society = {
            id: storage.generateId(),
            ...societyData,
            createdAt: new Date().toISOString()
        };
        storage.addSociety(society);
        refreshData();
        return society;
    };

    const updateSociety = (id, updates) => {
        storage.updateSociety(id, updates);
        refreshData();
    };

    const deleteSociety = (id) => {
        storage.deleteSociety(id);
        refreshData();
    };

    const getSocietyById = (id) => storage.getSocietyById(id);

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
    const addVisitor = (visitorData) => {
        const visitor = {
            id: storage.generateId(),
            ...visitorData,
            status: 'pending',
            entryTime: new Date().toISOString(),
            exitTime: null
        };
        storage.addVisitor(visitor);
        refreshData();
        return visitor;
    };

    const updateVisitor = (id, updates) => {
        storage.updateVisitor(id, updates);
        refreshData();
    };

    const getVisitorById = (id) => storage.getVisitorById(id);

    const getVisitorsByResident = (residentId) => {
        return visitors.filter(v => v.residentId === residentId);
    };

    const getVisitorsBySociety = (societyId) => {
        return visitors.filter(v => v.societyId === societyId);
    };

    // Notice operations
    const addNotice = (noticeData) => {
        const notice = {
            id: storage.generateId(),
            ...noticeData,
            createdAt: new Date().toISOString()
        };
        storage.addNotice(notice);
        refreshData();
        return notice;
    };

    const deleteNotice = (id) => {
        storage.deleteNotice(id);
        refreshData();
    };

    const getNoticesBySociety = (societyId) => {
        return notices.filter(n => n.societyId === societyId);
    };

    // Pre-approval operations
    const addPreApproval = (data) => {
        const preApproval = {
            id: storage.generateId(),
            ...data,
            status: 'valid',
            createdAt: new Date().toISOString()
        };
        storage.addPreApproval(preApproval);
        refreshData();
        return preApproval;
    };

    const updatePreApproval = (id, updates) => {
        storage.updatePreApproval(id, updates);
        refreshData();
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
        return users.filter(u =>
            u.roles.some(r =>
                r.role === 'resident' &&
                r.societyId === societyId &&
                r.status === 'pending'
            )
        );
    };

    const value = {
        // State
        users,
        societies,
        visitors,
        loading,

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
