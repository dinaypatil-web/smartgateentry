import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Home, Shield, Building2, Users, KeyRound, LogOut } from 'lucide-react';
import { getRoleLabel } from '../utils/validators';

const RoleSelector = () => {
    const navigate = useNavigate();
    const { currentUser, selectRole, logout } = useAuth();
    const { getSocietyById } = useData();

    const approvedRoles = currentUser?.roles?.filter(r => r.status === 'approved') || [];

    const getRoleIcon = (role) => {
        switch (role) {
            case 'superadmin':
                return Shield;
            case 'administrator':
                return Building2;
            case 'resident':
                return Users;
            case 'security':
                return KeyRound;
            default:
                return Users;
        }
    };

    const handleRoleSelect = (role) => {
        selectRole(role);

        switch (role.role) {
            case 'superadmin':
                navigate('/superadmin');
                break;
            case 'administrator':
                navigate('/admin');
                break;
            case 'resident':
                navigate('/resident');
                break;
            case 'security':
                navigate('/security');
                break;
            default:
                navigate('/');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        if (approvedRoles.length === 1) {
            handleRoleSelect(approvedRoles[0]);
        }
    }, [approvedRoles]);

    if (approvedRoles.length === 1) {
        return (
            <div className="auth-container">
                <div className="auth-card text-center">
                    <div className="auth-logo">
                        <div className="auth-logo-icon animate-pulse">
                            <Home size={28} />
                        </div>
                    </div>
                    <p className="text-muted">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="role-selector">
            <div className="role-selector-card animate-slideUp">
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <Home size={28} />
                    </div>
                    <span className="auth-logo-text">GateEntry</span>
                </div>

                <h1 className="auth-title">Select Dashboard</h1>
                <p className="auth-subtitle">
                    Welcome back, {currentUser?.name}! Choose a role to continue.
                </p>

                <div className="role-grid">
                    {approvedRoles.map((role, index) => {
                        const Icon = getRoleIcon(role.role);
                        const society = role.societyId ? getSocietyById(role.societyId) : null;

                        return (
                            <div
                                key={`${role.role}-${role.societyId || index}`}
                                className="role-option"
                                onClick={() => handleRoleSelect(role)}
                            >
                                <div className="role-option-icon">
                                    <Icon size={24} />
                                </div>
                                <div className="role-option-content">
                                    <div className="role-option-title">
                                        {getRoleLabel(role.role)}
                                    </div>
                                    <div className="role-option-subtitle">
                                        {society ? society.name : 'Global Access'}
                                        {role.role === 'resident' && role.block && (
                                            <span> • Block {role.block}, Flat {role.flatNumber}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button
                    onClick={handleLogout}
                    className="btn btn-ghost w-full mt-6"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default RoleSelector;
