import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Modal, { ConfirmModal } from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import NoticeBoard from '../../components/NoticeBoard';
import {
    LayoutDashboard, Users, UserPlus, Shield, Eye, EyeOff,
    Plus, Edit, Trash2, Key, Check, X, UserX, ClipboardList, UserCheck, Unlock, Megaphone
} from 'lucide-react';
import { formatDateTime, getInitials, getRoleLabel } from '../../utils/validators';
import MyRoles from '../shared/MyRoles';

const sidebarItems = [
    {
        title: 'Main',
        items: [
            { path: '', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/residents', label: 'Residents', icon: Users },
            { path: '/security', label: 'Security Personnel', icon: Shield },
            { path: '/visitor-log', label: 'Visitor Log', icon: ClipboardList },
            { path: '/unblock-requests', label: 'Unblock Requests', icon: Unlock },
            { path: '/notices', label: 'Notice Board', icon: Megaphone },
            { path: '/my-roles', label: 'My Roles', icon: Users }
        ]
    }
];

// Dashboard Overview
const DashboardHome = () => {
    const { currentRole } = useAuth();
    const { users, visitors, getSocietyById } = useData();

    const society = getSocietyById(currentRole?.societyId);

    const societyResidents = users.filter(u =>
        u.roles.some(r => r.role === 'resident' && r.societyId === currentRole?.societyId)
    );

    const pendingResidents = societyResidents.filter(u =>
        u.roles.some(r => r.role === 'resident' && r.societyId === currentRole?.societyId && r.status === 'pending')
    );

    const societySecurity = users.filter(u =>
        u.roles.some(r => r.role === 'security' && r.societyId === currentRole?.societyId)
    );

    const todayVisitors = visitors.filter(v => {
        const today = new Date().toDateString();
        return v.societyId === currentRole?.societyId &&
            new Date(v.entryTime).toDateString() === today;
    });

    return (
        <div>
            <div className="alert alert-info mb-6">
                <span>Managing: <strong>{society?.name}</strong></span>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{societyResidents.length}</div>
                        <div className="stat-label">Total Residents</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <UserPlus size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{pendingResidents.length}</div>
                        <div className="stat-label">Pending Approvals</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <Shield size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{societySecurity.length}</div>
                        <div className="stat-label">Security Personnel</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, var(--info-500), var(--info-600))' }}>
                        <Unlock size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{visitors.filter(v => v.societyId === currentRole?.societyId && v.status === 'pending_unblock').length}</div>
                        <div className="stat-label">Unblock Requests</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Unblock Requests Management
const UnblockRequestsPage = () => {
    const { currentRole } = useAuth();
    const { visitors, users, updateVisitor } = useData();

    const requests = visitors.filter(v =>
        v.societyId === currentRole?.societyId && v.status === 'pending_unblock'
    );

    const getResidentName = (residentId) => {
        const resident = users.find(u => u.id === residentId);
        return resident?.name || 'Unknown';
    };

    const handleApproveUnblock = (visitorId) => {
        updateVisitor(visitorId, { status: 'unblocked' });
    };

    const handleRejectUnblock = (visitorId) => {
        updateVisitor(visitorId, { status: 'blocked' }); // Stay blocked
    };

    return (
        <div>
            <h2 className="mb-6">Visitor Unblock Requests</h2>

            {requests.length === 0 ? (
                <EmptyState
                    icon={Unlock}
                    title="No Unblock Requests"
                    description="When residents request to unblock a visitor, it will appear here."
                />
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Visitor</th>
                                    <th>Contact</th>
                                    <th>Requested By</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(visitor => (
                                    <tr key={visitor.id}>
                                        <td>
                                            <div className="flex gap-3" style={{ alignItems: 'center' }}>
                                                {visitor.photo ? (
                                                    <img
                                                        src={visitor.photo}
                                                        alt={visitor.name}
                                                        style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div className="header-avatar" style={{ width: 40, height: 40, fontSize: '0.75rem' }}>
                                                        {getInitials(visitor.name)}
                                                    </div>
                                                )}
                                                <span className="font-medium">{visitor.name}</span>
                                            </div>
                                        </td>
                                        <td className="text-muted">{visitor.contactNumber}</td>
                                        <td className="text-muted">{getResidentName(visitor.unblockRequestedBy || visitor.residentId)}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleApproveUnblock(visitor.id)}
                                                >
                                                    <Check size={14} />
                                                    Approve Unblock
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleRejectUnblock(visitor.id)}
                                                >
                                                    <X size={14} />
                                                    Reject Request
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// Residents Management
const ResidentsPage = () => {
    const { currentRole } = useAuth();
    const { users, updateUser, deleteUserById, getSocietyById } = useData();
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const residents = users.filter(u =>
        u.roles.some(r => r.role === 'resident' && r.societyId === currentRole?.societyId)
    );

    const handleApprove = (userId, roleIndex) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            const updatedRoles = [...user.roles];
            updatedRoles[roleIndex] = { ...updatedRoles[roleIndex], status: 'approved' };
            updateUser(userId, { roles: updatedRoles });
        }
    };

    const handleReject = (userId, roleIndex) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            const updatedRoles = [...user.roles];
            updatedRoles[roleIndex] = { ...updatedRoles[roleIndex], status: 'rejected' };
            updateUser(userId, { roles: updatedRoles });
        }
    };

    const handleDelete = (userId) => {
        // Remove only resident role for this society, not entire user
        const user = users.find(u => u.id === userId);
        if (user) {
            const updatedRoles = user.roles.filter(r =>
                !(r.role === 'resident' && r.societyId === currentRole?.societyId)
            );
            if (updatedRoles.length === 0) {
                deleteUserById(userId);
            } else {
                updateUser(userId, { roles: updatedRoles });
            }
        }
        setDeleteConfirm(null);
    };

    return (
        <div>
            <h2 className="mb-6">Manage Residents</h2>

            {residents.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No Residents"
                    description="No residents have signed up for this society yet."
                />
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Contact</th>
                                    <th>Block</th>
                                    <th>Flat</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {residents.map(resident => {
                                    const roleIndex = resident.roles.findIndex(r =>
                                        r.role === 'resident' && r.societyId === currentRole?.societyId
                                    );
                                    const role = resident.roles[roleIndex];

                                    return (
                                        <tr key={resident.id}>
                                            <td>
                                                <div className="flex gap-3" style={{ alignItems: 'center' }}>
                                                    <div className="header-avatar" style={{ width: 36, height: 36, fontSize: '0.75rem' }}>
                                                        {getInitials(resident.name)}
                                                    </div>
                                                    <span className="font-medium">{resident.name}</span>
                                                </div>
                                            </td>
                                            <td className="text-sm">
                                                <div>{resident.email}</div>
                                                <div className="text-muted">{resident.mobile}</div>
                                            </td>
                                            <td>{role?.block || '—'}</td>
                                            <td>{role?.flatNumber || '—'}</td>
                                            <td>
                                                <StatusBadge status={role?.status} />
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    {role?.status === 'pending' ? (
                                                        <>
                                                            <button
                                                                className="btn btn-success btn-sm"
                                                                onClick={() => handleApprove(resident.id, roleIndex)}
                                                            >
                                                                <Check size={14} />
                                                                Approve
                                                            </button>
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => handleReject(resident.id, roleIndex)}
                                                            >
                                                                <X size={14} />
                                                                Reject
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            onClick={() => setDeleteConfirm(resident)}
                                                            style={{ color: 'var(--error-500)' }}
                                                        >
                                                            <UserX size={14} />
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => handleDelete(deleteConfirm?.id)}
                title="Remove Resident"
                message={`Are you sure you want to remove ${deleteConfirm?.name} from this society?`}
                confirmText="Remove"
                variant="danger"
            />
        </div>
    );
};

// Security Personnel Management
const SecurityPage = () => {
    const { currentUser, currentRole, createSecurityUser, changePassword } = useAuth();
    const { users, deleteUserById, updateUser } = useData();
    const [showModal, setShowModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        loginName: '',
        password: ''
    });

    const securityPersonnel = users.filter(u =>
        u.roles.some(r => r.role === 'security' && r.societyId === currentRole?.societyId)
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const result = createSecurityUser(formData, currentRole?.societyId, currentUser.id);

        if (!result.success) {
            setError(result.error);
            return;
        }

        setShowModal(false);
        setFormData({ name: '', mobile: '', loginName: '', password: '' });
    };

    const handleDelete = (userId) => {
        deleteUserById(userId);
        setDeleteConfirm(null);
    };

    const handleResetPassword = () => {
        if (!newPassword || newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        updateUser(showPasswordModal.id, { password: newPassword });
        setShowPasswordModal(null);
        setNewPassword('');
    };

    return (
        <div>
            <div className="flex-between mb-6">
                <h2>Security Personnel</h2>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} />
                    Add Security
                </button>
            </div>

            {securityPersonnel.length === 0 ? (
                <EmptyState
                    icon={Shield}
                    title="No Security Personnel"
                    description="Add security personnel to manage visitor entries."
                    action={
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <Plus size={18} />
                            Add Security
                        </button>
                    }
                />
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Mobile</th>
                                    <th>Login Name</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {securityPersonnel.map(security => (
                                    <tr key={security.id}>
                                        <td className="font-medium">{security.name}</td>
                                        <td className="text-muted">{security.mobile}</td>
                                        <td className="text-muted">{security.loginName}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => setShowPasswordModal(security)}
                                                >
                                                    <Key size={14} />
                                                    Reset Password
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => setDeleteConfirm(security)}
                                                    style={{ color: 'var(--error-500)' }}
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Security Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setError(''); }}
                title="Add Security Personnel"
            >
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-error">{error}</div>}

                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter full name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mobile Number</label>
                        <input
                            type="tel"
                            className="form-input"
                            placeholder="10-digit number"
                            value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Login Name</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Unique login name"
                            value={formData.loginName}
                            onChange={(e) => setFormData({ ...formData, loginName: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-input"
                                placeholder="Set password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                style={{ paddingRight: '48px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer'
                                }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary flex-1">
                            Create Security Account
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Reset Password Modal */}
            <Modal
                isOpen={!!showPasswordModal}
                onClose={() => { setShowPasswordModal(null); setNewPassword(''); setError(''); }}
                title="Reset Password"
            >
                <p className="text-muted mb-4">
                    Reset password for <strong>{showPasswordModal?.name}</strong>
                </p>

                {error && <div className="alert alert-error">{error}</div>}

                <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                        type="password"
                        className="form-input"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                    />
                </div>

                <div className="flex gap-3 mt-6">
                    <button className="btn btn-secondary" onClick={() => setShowPasswordModal(null)}>
                        Cancel
                    </button>
                    <button className="btn btn-primary flex-1" onClick={handleResetPassword}>
                        Reset Password
                    </button>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => handleDelete(deleteConfirm?.id)}
                title="Delete Security Personnel"
                message={`Are you sure you want to delete ${deleteConfirm?.name}? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

// Visitor Log
const VisitorLogPage = () => {
    const { currentRole } = useAuth();
    const { visitors, users, getSocietyById } = useData();

    const societyVisitors = visitors
        .filter(v => v.societyId === currentRole?.societyId)
        .sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime));

    const getResidentName = (residentId) => {
        const resident = users.find(u => u.id === residentId);
        return resident?.name || 'Unknown';
    };

    return (
        <div>
            <h2 className="mb-6">Visitor Log</h2>

            {societyVisitors.length === 0 ? (
                <EmptyState
                    icon={ClipboardList}
                    title="No Visitors Yet"
                    description="Visitor entries will appear here once security adds them."
                />
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Visitor</th>
                                    <th>Purpose</th>
                                    <th>Visiting</th>
                                    <th>Entry Time</th>
                                    <th>Exit Time</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {societyVisitors.map(visitor => (
                                    <tr key={visitor.id}>
                                        <td>
                                            <div className="flex gap-3" style={{ alignItems: 'center' }}>
                                                {visitor.photo ? (
                                                    <img
                                                        src={visitor.photo}
                                                        alt={visitor.name}
                                                        className="visitor-photo"
                                                        style={{ width: 40, height: 40 }}
                                                    />
                                                ) : (
                                                    <div className="header-avatar" style={{ width: 40, height: 40, fontSize: '0.75rem' }}>
                                                        {getInitials(visitor.name)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium">{visitor.name}</div>
                                                    <div className="text-xs text-muted">{visitor.contactNumber}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-muted">{visitor.purpose}</td>
                                        <td className="text-muted">{getResidentName(visitor.residentId)}</td>
                                        <td className="text-sm text-muted">{formatDateTime(visitor.entryTime)}</td>
                                        <td className="text-sm text-muted">
                                            {visitor.exitTime ? formatDateTime(visitor.exitTime) : '—'}
                                        </td>
                                        <td>
                                            <StatusBadge status={visitor.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// Main Dashboard Layout
const AdminDashboard = () => {
    return (
        <div className="app-container">
            <Sidebar items={sidebarItems} basePath="/admin" />
            <div className="main-content">
                <Header title="Administrator Dashboard" />
                <div className="page-content">
                    <Routes>
                        <Route path="/" element={<DashboardHome />} />
                        <Route path="/residents" element={<ResidentsPage />} />
                        <Route path="/security" element={<SecurityPage />} />
                        <Route path="/visitor-log" element={<VisitorLogPage />} />
                        <Route path="/unblock-requests" element={<UnblockRequestsPage />} />
                        <Route path="/notices" element={<NoticesPage />} />
                        <Route path="/my-roles" element={<MyRoles />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

// Notices Management for Admin
const NoticesPage = () => {
    const { currentRole } = useAuth();
    const { addNotice } = useData();
    const [showAddNotice, setShowAddNotice] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        priority: 'normal'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addNotice({
            ...formData,
            societyId: currentRole?.societyId
        });
        setShowAddNotice(false);
        setFormData({ title: '', content: '', priority: 'normal' });
    };

    return (
        <div>
            <div className="flex-between mb-6">
                <h2>Society Notice Board</h2>
                <button className="btn btn-primary" onClick={() => setShowAddNotice(true)}>
                    <Plus size={18} />
                    Post New Notice
                </button>
            </div>

            <NoticeBoard isAdmin={true} />

            <Modal
                isOpen={showAddNotice}
                onClose={() => setShowAddNotice(false)}
                title="Post New Notice"
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Notice Title</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            placeholder="e.g. Water Supply Interruption"
                        />
                    </div>
                    <div className="form-group">
                        <label>Priority</label>
                        <select
                            className="form-control"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        >
                            <option value="normal">Normal</option>
                            <option value="urgent">Urgent / Important</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Content</label>
                        <textarea
                            className="form-control"
                            rows="5"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            required
                            placeholder="Detail your announcement here..."
                        />
                    </div>
                    <div className="flex gap-3 justify-end mt-6">
                        <button type="button" className="btn btn-ghost" onClick={() => setShowAddNotice(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Post Notice
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminDashboard;
