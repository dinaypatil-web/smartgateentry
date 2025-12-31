// Storage utility functions for localStorage operations

const STORAGE_KEYS = {
    USERS: 'sge_users',
    SOCIETIES: 'sge_societies',
    VISITORS: 'sge_visitors',
    CURRENT_USER: 'sge_current_user',
    CURRENT_ROLE: 'sge_current_role',
    NOTICES: 'sge_notices',
    PRE_APPROVALS: 'sge_pre_approvals'
};

// Initialize default data structure
const initializeStorage = () => {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SOCIETIES)) {
        localStorage.setItem(STORAGE_KEYS.SOCIETIES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.VISITORS)) {
        localStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTICES)) {
        localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRE_APPROVALS)) {
        localStorage.setItem(STORAGE_KEYS.PRE_APPROVALS, JSON.stringify([]));
    }
};

// Generic storage operations
const getItem = (key) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error(`Error reading ${key} from localStorage:`, error);
        return null;
    }
};

const setItem = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error writing ${key} to localStorage:`, error);
        return false;
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
    const visitors = getVisitors();
    visitors.push(visitor);
    return setVisitors(visitors);
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

export { STORAGE_KEYS };
