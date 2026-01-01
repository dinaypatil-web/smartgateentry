// Validation utility functions

export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

export const validateMobile = (mobile) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(mobile.replace(/[^0-9]/g, ''));
};

export const validatePassword = (password) => {
    // At least 8 characters, one uppercase, one lowercase, one number
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return {
        isValid: minLength && hasUpper && hasLower && hasNumber,
        errors: {
            minLength: !minLength ? 'Password must be at least 8 characters' : null,
            hasUpper: !hasUpper ? 'Password must contain an uppercase letter' : null,
            hasLower: !hasLower ? 'Password must contain a lowercase letter' : null,
            hasNumber: !hasNumber ? 'Password must contain a number' : null
        }
    };
};

export const validateRequired = (value) => {
    return value && value.toString().trim().length > 0;
};

export const validateDate = (dateString) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};

export const isDateInRange = (checkDate, fromDate, toDate) => {
    const check = new Date(checkDate);
    const from = new Date(fromDate);
    const to = new Date(toDate);
    return check >= from && check <= to;
};

export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

export const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getRoleLabel = (role) => {
    const labels = {
        superadmin: 'Super Admin',
        administrator: 'Administrator',
        resident: 'Resident',
        security: 'Security Personnel'
    };
    return labels[role] || role;
};

export const getStatusColor = (status) => {
    const colors = {
        pending: 'warning',
        approved: 'success',
        rejected: 'error',
        blocked: 'blocked',
        active: 'info'
    };
    return colors[status] || 'default';
};
