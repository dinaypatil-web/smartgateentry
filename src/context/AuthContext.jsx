import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as storage from '../utils/storage';
import { useData } from './DataContext';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [currentRole, setCurrentRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const { getUserByEmail, getUserByLoginName, addUser, updateUser, hasSuperadmin } = useData();

    useEffect(() => {
        // Load session from localStorage
        const savedUser = storage.getCurrentUser();
        const savedRole = storage.getCurrentRole();

        if (savedUser) {
            // Refresh user data from storage
            const freshUser = storage.getUserById(savedUser.id);
            if (freshUser) {
                setCurrentUser(freshUser);
                setCurrentRole(savedRole);
            } else {
                // User no longer exists, clear session
                storage.clearCurrentUser();
            }
        }
        setLoading(false);
    }, []);

    const login = (emailOrLoginName, password) => {
        // Try email first
        let user = getUserByEmail(emailOrLoginName);

        // If not found, try loginName (for security personnel)
        if (!user) {
            user = getUserByLoginName(emailOrLoginName);
        }

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        if (user.password !== password) {
            return { success: false, error: 'Invalid password' };
        }

        // Get approved roles
        const approvedRoles = user.roles.filter(r => r.status === 'approved');

        if (approvedRoles.length === 0) {
            return { success: false, error: 'Your account is pending approval' };
        }

        setCurrentUser(user);
        storage.setCurrentUser(user);

        return { success: true, user, hasMultipleRoles: approvedRoles.length > 1 };
    };

    const logout = () => {
        setCurrentUser(null);
        setCurrentRole(null);
        storage.clearCurrentUser();
    };

    const selectRole = (role) => {
        setCurrentRole(role);
        storage.setCurrentRole(role);
    };

    const signup = (userData) => {
        // Check if email already exists
        const existingUser = getUserByEmail(userData.email);

        if (existingUser) {
            // User exists, add new role
            const roleExists = existingUser.roles.some(r =>
                r.role === userData.role &&
                r.societyId === userData.societyId
            );

            if (roleExists) {
                return { success: false, error: 'You already have this role for this society' };
            }

            // Add new role to existing user
            const newRole = {
                role: userData.role,
                societyId: userData.societyId || null,
                status: userData.role === 'superadmin' ? 'approved' : 'pending',
                block: userData.block || null,
                flatNumber: userData.flatNumber || null,
                addedAt: new Date().toISOString()
            };

            const updatedRoles = [...existingUser.roles, newRole];
            updateUser(existingUser.id, { roles: updatedRoles });

            return { success: true, isNewRole: true };
        }

        // New user registration
        if (userData.role === 'superadmin' && hasSuperadmin()) {
            return { success: false, error: 'A superadmin already exists' };
        }

        const newUser = {
            name: userData.name,
            email: userData.email,
            mobile: userData.mobile,
            password: userData.password,
            securityQuestion: userData.securityQuestion,
            securityAnswer: userData.securityAnswer,
            roles: [{
                role: userData.role,
                societyId: userData.societyId || null,
                status: userData.role === 'superadmin' ? 'approved' : 'pending',
                block: userData.block || null,
                flatNumber: userData.flatNumber || null,
                addedAt: new Date().toISOString()
            }],
            isResigned: false
        };

        addUser(newUser);
        return { success: true, isNewUser: true };
    };

    const createSecurityUser = (userData, societyId, createdBy) => {
        // Check if loginName already exists
        const existingUser = getUserByLoginName(userData.loginName);
        if (existingUser) {
            return { success: false, error: 'Login name already exists' };
        }

        const newUser = {
            name: userData.name,
            mobile: userData.mobile,
            loginName: userData.loginName,
            password: userData.password,
            roles: [{
                role: 'security',
                societyId: societyId,
                status: 'approved',
                addedAt: new Date().toISOString()
            }],
            createdBy: createdBy,
            isResigned: false
        };

        addUser(newUser);
        return { success: true };
    };

    const changePassword = (userId, newPassword) => {
        updateUser(userId, { password: newPassword });
        return { success: true };
    };

    const resetPassword = (email, securityAnswer, newPassword) => {
        const user = getUserByEmail(email);
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        if (user.securityAnswer?.toLowerCase() !== securityAnswer?.toLowerCase()) {
            return { success: false, error: 'Security answer is incorrect' };
        }

        updateUser(user.id, { password: newPassword });
        return { success: true };
    };

    const resignSuperadmin = () => {
        if (!currentUser) return { success: false, error: 'Not logged in' };

        const superadminRole = currentUser.roles.find(r => r.role === 'superadmin');
        if (!superadminRole) {
            return { success: false, error: 'You are not a superadmin' };
        }

        updateUser(currentUser.id, { isResigned: true });
        logout();
        return { success: true };
    };

    // Get the current user's role for a specific society
    const getRoleForSociety = (societyId) => {
        if (!currentUser) return null;
        return currentUser.roles.find(r =>
            r.societyId === societyId && r.status === 'approved'
        );
    };

    // Check if current user has a specific role
    const hasRole = (role, societyId = null) => {
        if (!currentUser) return false;
        return currentUser.roles.some(r =>
            r.role === role &&
            r.status === 'approved' &&
            (societyId === null || r.societyId === societyId)
        );
    };

    const removeRole = (role, societyId) => {
        if (!currentUser) return { success: false, error: 'Not logged in' };

        const updatedRoles = currentUser.roles.filter(r =>
            !(r.role === role && r.societyId === societyId)
        );

        if (updatedRoles.length === 0) {
            // Removing last role essentially deletes the user account or leaves them roleless
            // For now, let's allow it but it means they can't login effectively until they get a role?
            // Or maybe we treat it as account deletion/resignation?
            // Requirement says "add/remove roles any time".
            // If they remove all roles, they are just a user with no roles.
        }

        // Update user in storage
        updateUser(currentUser.id, { roles: updatedRoles });

        // Update local state
        const freshUser = { ...currentUser, roles: updatedRoles };
        setCurrentUser(freshUser);
        storage.setCurrentUser(freshUser);

        // If the removed role was the CURRENT active role, we need to switch or logout
        if (currentRole && currentRole.role === role && currentRole.societyId === societyId) {
            setCurrentRole(null);
            storage.clearCurrentRole();
            // The UI should handle redirecting to /select-role or /login
            // forcing a page reload might be easiest to trigger the ProtectedRoute logic
            window.location.reload();
        }

        return { success: true };
    };

    // Refresh current user data
    const refreshCurrentUser = () => {
        if (currentUser) {
            const freshUser = storage.getUserById(currentUser.id);
            if (freshUser) {
                setCurrentUser(freshUser);
                storage.setCurrentUser(freshUser);
            }
        }
    };

    const value = {
        currentUser,
        currentRole,
        loading,
        login,
        logout,
        signup,
        selectRole,
        createSecurityUser,
        changePassword,
        resetPassword,
        resignSuperadmin,
        getRoleForSociety,
        hasRole,
        refreshCurrentUser,
        isAuthenticated: !!currentUser,
        hasSuperadmin,
        removeRole
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
