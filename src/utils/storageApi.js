// Unified storage API - uses Supabase when available, falls back to localStorage
import * as localStorage from './storage';
import * as api from './supabaseApi';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    return url && url !== 'https://your-project.supabase.co' && url.trim() !== '';
};

// Use Supabase if configured, otherwise use localStorage
const USE_ONLINE_STORAGE = isSupabaseConfigured();

// Export all storage functions with automatic switching
export const getUsers = async () => {
    if (USE_ONLINE_STORAGE) {
        return await api.getUsers();
    }
    return localStorage.getUsers();
};

export const getUserById = async (id) => {
    if (USE_ONLINE_STORAGE) {
        return await api.getUserById(id);
    }
    return localStorage.getUserById(id);
};

export const getUserByEmail = async (email) => {
    if (USE_ONLINE_STORAGE) {
        return await api.getUserByEmail(email);
    }
    return localStorage.getUserByEmail(email);
};

export const getUserByLoginName = async (loginName) => {
    if (USE_ONLINE_STORAGE) {
        return await api.getUserByLoginName(loginName);
    }
    return localStorage.getUserByLoginName(loginName);
};

export const addUser = async (user) => {
    if (USE_ONLINE_STORAGE) {
        return await api.addUser(user);
    }
    return localStorage.addUser(user);
};

export const updateUser = async (id, updates) => {
    if (USE_ONLINE_STORAGE) {
        return await api.updateUser(id, updates);
    }
    return localStorage.updateUser(id, updates);
};

export const deleteUser = async (id) => {
    if (USE_ONLINE_STORAGE) {
        return await api.deleteUser(id);
    }
    return localStorage.deleteUser(id);
};

// Society operations
export const getSocieties = async () => {
    if (USE_ONLINE_STORAGE) {
        return await api.getSocieties();
    }
    return localStorage.getSocieties();
};

export const getSocietyById = async (id) => {
    if (USE_ONLINE_STORAGE) {
        return await api.getSocietyById(id);
    }
    return localStorage.getSocietyById(id);
};

export const addSociety = async (society) => {
    if (USE_ONLINE_STORAGE) {
        return await api.addSociety(society);
    }
    return localStorage.addSociety(society);
};

export const updateSociety = async (id, updates) => {
    if (USE_ONLINE_STORAGE) {
        return await api.updateSociety(id, updates);
    }
    return localStorage.updateSociety(id, updates);
};

export const deleteSociety = async (id) => {
    if (USE_ONLINE_STORAGE) {
        return await api.deleteSociety(id);
    }
    return localStorage.deleteSociety(id);
};

// Visitor operations
export const getVisitors = async () => {
    if (USE_ONLINE_STORAGE) {
        return await api.getVisitors();
    }
    return localStorage.getVisitors();
};

export const getVisitorById = async (id) => {
    if (USE_ONLINE_STORAGE) {
        return await api.getVisitorById(id);
    }
    return localStorage.getVisitorById(id);
};

export const addVisitor = async (visitor) => {
    if (USE_ONLINE_STORAGE) {
        return await api.addVisitor(visitor);
    }
    return localStorage.addVisitor(visitor);
};

export const updateVisitor = async (id, updates) => {
    if (USE_ONLINE_STORAGE) {
        return await api.updateVisitor(id, updates);
    }
    return localStorage.updateVisitor(id, updates);
};

// Notice operations
export const getNotices = async () => {
    if (USE_ONLINE_STORAGE) {
        return await api.getNotices();
    }
    return localStorage.getNotices();
};

export const addNotice = async (notice) => {
    if (USE_ONLINE_STORAGE) {
        return await api.addNotice(notice);
    }
    return localStorage.addNotice(notice);
};

export const deleteNotice = async (id) => {
    if (USE_ONLINE_STORAGE) {
        return await api.deleteNotice(id);
    }
    return localStorage.deleteNotice(id);
};

// Pre-approval operations
export const getPreApprovals = async () => {
    if (USE_ONLINE_STORAGE) {
        return await api.getPreApprovals();
    }
    return localStorage.getPreApprovals();
};

export const addPreApproval = async (preApproval) => {
    if (USE_ONLINE_STORAGE) {
        return await api.addPreApproval(preApproval);
    }
    return localStorage.addPreApproval(preApproval);
};

export const updatePreApproval = async (id, updates) => {
    if (USE_ONLINE_STORAGE) {
        return await api.updatePreApproval(id, updates);
    }
    return localStorage.updatePreApproval(id, updates);
};

// Generic CRUD operations
export const getData = async (collection) => {
    if (USE_ONLINE_STORAGE) {
        return await api.getData(collection);
    }
    return localStorage.getData(collection);
};

export const addData = async (collection, data) => {
    if (USE_ONLINE_STORAGE) {
        return await api.addData(collection, data);
    }
    return localStorage.addData(collection, data);
};

export const updateData = async (collection, id, updates) => {
    if (USE_ONLINE_STORAGE) {
        return await api.updateData(collection, id, updates);
    }
    return localStorage.updateData(collection, id, updates);
};

export const deleteData = async (collection, id) => {
    if (USE_ONLINE_STORAGE) {
        return await api.deleteData(collection, id);
    }
    return localStorage.deleteData(collection, id);
};

// Module-specific getters for convenience in DataContext
export const getVehicles = () => getData('vehicles');
export const getComplaints = () => getData('complaints');
export const getAmenities = () => getData('amenities');
export const getBookings = () => getData('bookings');
export const getStaff = () => getData('staff');
export const getPayments = () => getData('payments');

export const generateMonthlyBills = async (societyId, month, year, amount, createdBy) => {
    if (USE_ONLINE_STORAGE) {
        return await api.generateMonthlyBills(societyId, month, year, amount, createdBy);
    }
    return localStorage.generateMonthlyBills(societyId, month, year, amount, createdBy);
};

// Current user session (always use localStorage for session)
export const getCurrentUser = () => localStorage.getCurrentUser();
export const setCurrentUser = (user) => localStorage.setCurrentUser(user);
export const clearCurrentUser = () => localStorage.clearCurrentUser();
export const getCurrentRole = () => localStorage.getCurrentRole();
export const setCurrentRole = (role) => localStorage.setCurrentRole(role);
export const clearCurrentRole = () => localStorage.clearCurrentRole();

// Generate ID
export const generateId = () => localStorage.generateId();

// Check if using online storage
export const isUsingOnlineStorage = () => USE_ONLINE_STORAGE;

// Real-time subscriptions
export const subscribeToCollection = (collection, callback) => {
    if (USE_ONLINE_STORAGE) {
        return api.subscribeToCollection(collection, callback);
    }
    return () => { }; // No-op for local storage
};



