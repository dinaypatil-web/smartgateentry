import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Menu, AlertTriangle, ChevronDown, User, Key, ArrowLeftRight, LogOut } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { getInitials, getRoleLabel } from '../utils/validators';

const Header = ({ title }) => {
    const navigate = useNavigate();
    const { currentUser, currentRole, logout } = useAuth();
    const { getSocietyById, triggerSOS } = useData();
    const { toggleMobileSidebar } = useUI();
    const [isTriggeringSOS, setIsTriggeringSOS] = useState(false);

    const [showDropdown, setShowDropdown] = useState(false);

    const society = currentRole?.societyId ? getSocietyById(currentRole.societyId) : null;
    const approvedRoles = currentUser?.roles?.filter(r => r.status === 'approved') || [];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSwitchRole = () => {
        navigate('/select-role');
        setShowDropdown(false);
    };

    const handleTriggerSOS = async () => {
        if (window.confirm('SEND EMERGENCY SOS ALERT? This will notify all security personnel immediately.')) {
            try {
                setIsTriggeringSOS(true);
                const roleSocietyId = currentRole?.societyId || currentRole?.societyid;
                await triggerSOS(currentUser.id, roleSocietyId, `Emergency SOS triggered by ${currentUser.name} (${currentRole.role})`);
                alert('SOS Alert Sent to Security Team!');
            } catch (error) {
                console.error('Failed to trigger SOS:', error);
                alert('Failed to send SOS alert. Please try again or contact security directly.');
            } finally {
                setIsTriggeringSOS(false);
            }
        }
    };

    return (
        <header className="header">
            <div className="header-left">
                <button
                    className="menu-toggle"
                    onClick={toggleMobileSidebar}
                    aria-label="Toggle Menu"
                >
                    <Menu size={20} />
                </button>
                <h1 className="header-title">{title}</h1>
                {society && (
                    <span className="badge badge-active">{society.name}</span>
                )}
            </div>

            <div className="header-right">
                <button
                    className="btn btn-danger btn-sm pulse"
                    style={{ borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}
                    onClick={handleTriggerSOS}
                    disabled={isTriggeringSOS}
                >
                    <AlertTriangle size={18} />
                    {isTriggeringSOS ? 'SENDING...' : 'SOS'}
                </button>
                <div className="dropdown">
                    <button
                        className="header-user"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <div className="header-avatar">
                            {getInitials(currentUser?.name)}
                        </div>
                        <div className="header-user-info">
                            <div className="header-user-name">{currentUser?.name}</div>
                            <div className="header-user-role">
                                {getRoleLabel(currentRole?.role)}
                            </div>
                        </div>
                        <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                    </button>

                    {showDropdown && (
                        <>
                            <div
                                style={{
                                    position: 'fixed',
                                    inset: 0,
                                    zIndex: 99
                                }}
                                onClick={() => setShowDropdown(false)}
                            />
                            <div className="dropdown-menu">
                                <button className="dropdown-item" onClick={() => {
                                    setShowDropdown(false);
                                    // Profile would go here
                                }}>
                                    <User size={18} />
                                    Profile
                                </button>

                                <button className="dropdown-item" onClick={() => {
                                    setShowDropdown(false);
                                    // Change password would go here
                                }}>
                                    <Key size={18} />
                                    Change Password
                                </button>

                                {approvedRoles.length > 1 && (
                                    <button className="dropdown-item" onClick={handleSwitchRole}>
                                        <ArrowLeftRight size={18} />
                                        Switch Role
                                    </button>
                                )}

                                <div className="dropdown-divider" />

                                <button className="dropdown-item danger" onClick={handleLogout}>
                                    <LogOut size={18} />
                                    Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
