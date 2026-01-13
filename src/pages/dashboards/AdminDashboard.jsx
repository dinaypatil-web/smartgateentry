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
import NoticeForm from '../../components/NoticeForm'; // Added NoticeForm import
import {
    LayoutDashboard, Users, UserPlus, Shield, Eye, EyeOff,
    Plus, Edit, Trash2, Key, Check, X, UserX, ClipboardList, UserCheck, Unlock, Megaphone, ShieldAlert, CheckCircle2, Clock, Building2, Contact, BookOpen, BarChart2, TrendingUp, PieChart, ShieldCheck, Mail, Info
} from 'lucide-react';
import { formatDateTime, getInitials, getRoleLabel } from '../../utils/validators';
import { t } from '../../utils/i18n';
import MyRoles from '../shared/MyRoles';
import InactiveSocietyOverlay from '../../components/InactiveSocietyOverlay';

const sidebarItems = [
    {
        title: 'Main',
        items: [
            { path: '', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/residents', label: 'Residents', icon: Users },
            { path: '/security', label: 'Security Personnel', icon: Shield },
            { path: '/amenities', label: 'Manage Amenities', icon: Building2 },
            { path: '/staff', label: 'Staff Management', icon: Contact },
            { path: '/docs', label: 'Society Documents', icon: BookOpen },
            { path: '/visitor-log', label: 'Visitor Log', icon: ClipboardList },
            { path: '/complaints', label: 'Resident Complaints', icon: ShieldAlert },
            { path: '/unblock-requests', label: 'Unblock Requests', icon: Unlock },
            { path: '/notices', label: t('notices'), icon: Megaphone },
            { path: '/analytics', label: t('analytics'), icon: BarChart2 },
            { path: '/integrations', label: 'Integrations', icon: ShieldCheck },
            { path: '/my-roles', label: 'My Roles', icon: Users }
        ]
    }
];

// Dashboard Overview
const DashboardHome = () => {
    const { currentRole, currentUser, refreshCurrentUser } = useAuth();
    const {
        visitors, users, complaints, amenities, bookings,
        getPendingResidents, getPendingSecurity, updateUser
    } = useData();

    // Stats calculations
    const roleSocietyId = currentRole?.societyId || currentRole?.societyid;
    const societyVisitors = visitors.filter(v => (v.societyId === roleSocietyId || v.societyid === roleSocietyId));
    const societyResidents = users.filter(u => u.roles.some(r => r.role === 'resident' && (r.societyId === roleSocietyId || r.societyid === roleSocietyId)));
    const societyComplaints = complaints.filter(c => (c.societyId === roleSocietyId || c.societyid === roleSocietyId));
    const societyAmenities = amenities.filter(a => (a.societyId === roleSocietyId || a.societyid === roleSocietyId));
    const societyBookings = bookings.filter(b => (b.societyId === roleSocietyId || b.societyid === roleSocietyId));

    const resolvedComplaints = societyComplaints.filter(c => c.status === 'resolved');
    const openComplaints = societyComplaints.filter(c => c.status === 'open');

    // Pending approvals for workflow
    const pendingResidents = getPendingResidents(roleSocietyId);
    const pendingSecurity = getPendingSecurity(roleSocietyId);
    const allPending = [
        ...pendingResidents.map(u => ({ ...u, type: 'resident' })),
        ...pendingSecurity.map(u => ({ ...u, type: 'security' }))
    ];

    const handleApproveRole = async (userId, type) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            const updatedRoles = user.roles.map(r => {
                if (r.role === type && (r.societyId === roleSocietyId || r.societyid === roleSocietyId)) {
                    return { ...r, status: 'approved' };
                }
                return r;
            });
            await updateUser(userId, { roles: updatedRoles });
            if (userId === currentUser?.id) {
                await refreshCurrentUser();
            }
        }
    };

    const handleRejectRole = async (userId, type) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            const updatedRoles = user.roles.map(r => {
                if (r.role === type && (r.societyId === roleSocietyId || r.societyid === roleSocietyId)) {
                    return { ...r, status: 'rejected' };
                }
                return r;
            });
            await updateUser(userId, { roles: updatedRoles });
            if (userId === currentUser?.id) {
                await refreshCurrentUser();
            }
        }
    };

    // Visual data for "charts"
    const statsData = [
        { label: 'Visitors', count: societyVisitors.length, icon: UserPlus, color: 'var(--primary-500)' },
        { label: 'Residents', count: societyResidents.length, icon: Users, color: 'var(--success-500)' },
        { label: 'Complaints', count: societyComplaints.length, icon: ShieldAlert, color: 'var(--error-500)' },
        { label: 'Bookings', count: societyBookings.length, icon: Building2, color: 'var(--warning-500)' },
    ];

    return (
        <div className="animate-fadeIn">
            <h2 className="mb-6">{t('dashboard')} & {t('analytics')}</h2>

            <div className="stats-grid mb-8">
                {statsData.map(stat => (
                    <div key={stat.label} className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                            <stat.icon size={24} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stat.count}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {allPending.length > 0 && (
                <div className="card mb-8 animate-slideUp" style={{ borderLeft: '4px solid var(--warning-500)' }}>
                    <div className="flex-between mb-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <Clock size={18} className="text-warning-500" />
                            Pending Approvals Needed
                        </h3>
                        <span className="badge badge-warning">{allPending.length} pending</span>
                    </div>
                    <div className="table-container">
                        <table className="table table-sm">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role Requested</th>
                                    <th>Contact</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allPending.map(user => (
                                    <tr key={`${user.id}-${user.type}`}>
                                        <td>
                                            <div className="flex gap-2 items-center">
                                                <div className="header-avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>
                                                    {getInitials(user.name)}
                                                </div>
                                                <span className="font-medium text-sm">{user.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`text-xs font-bold uppercase ${user.type === 'resident' ? 'text-primary-400' : 'text-secondary-400'}`}>
                                                {user.type}
                                            </span>
                                        </td>
                                        <td className="text-xs text-muted">{user.email || user.mobile}</td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button
                                                    className="btn btn-success btn-xs"
                                                    onClick={() => handleApproveRole(user.id, user.type)}
                                                >
                                                    <Check size={12} /> Approve
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-xs"
                                                    onClick={() => handleRejectRole(user.id, user.type)}
                                                >
                                                    <X size={12} /> Reject
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

            <div className="grid-2 gap-6">
                <div className="card">
                    <div className="flex-between mb-6">
                        <h3 className="font-bold flex items-center gap-2">
                            <BarChart2 size={18} className="text-primary-500" />
                            Helpdesk Resolution
                        </h3>
                    </div>
                    <div className="space-y-4">
                        <div className="analytics-row">
                            <div className="flex-between mb-1 text-sm">
                                <span>Resolved</span>
                                <span className="font-bold">{resolvedComplaints.length}</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill bg-success-500" style={{ width: `${(resolvedComplaints.length / (societyComplaints.length || 1)) * 100}%` }}></div>
                            </div>
                        </div>
                        <div className="analytics-row">
                            <div className="flex-between mb-1 text-sm">
                                <span>Pending / Open</span>
                                <span className="font-bold">{openComplaints.length}</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill bg-error-500" style={{ width: `${(openComplaints.length / (societyComplaints.length || 1)) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-glass flex gap-4 text-xs">
                        <div className="flex items-center gap-1"><TrendingUp size={14} className="text-success-500" /> +12% this week</div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex-between mb-6">
                        <h3 className="font-bold flex items-center gap-2">
                            <PieChart size={18} className="text-primary-500" />
                            Amenity Popularity
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {societyAmenities.slice(0, 3).map(amenity => {
                            const amenityBookings = societyBookings.filter(b => b.amenityId === amenity.id);
                            const perc = (amenityBookings.length / (societyBookings.length || 1)) * 100;
                            return (
                                <div key={amenity.id} className="analytics-row">
                                    <div className="flex-between mb-1 text-sm">
                                        <span>{amenity.name}</span>
                                        <span className="font-bold">{Math.round(perc)}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${perc}%`, backgroundColor: 'var(--primary-500)' }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .progress-bar { height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden; }
                .progress-fill { height: 100%; transition: width 0.5s ease-out; }
                .btn-xs { padding: 4px 8px; font-size: 10px; height: auto; }
            ` }} />
        </div>
    );
};

// Unblock Requests Management
const UnblockRequestsPage = () => {
    const { currentRole } = useAuth();
    const { visitors, users, updateVisitor } = useData();

    const requests = visitors.filter(v => {
        const visitorSocietyId = v.societyId || v.societyid;
        return visitorSocietyId === currentRole?.societyId && v.status === 'pending_unblock';
    });

    const getResidentName = (residentId) => {
        const resident = users.find(u => u.id === residentId);
        return resident?.name || 'Unknown';
    };

    const handleApproveUnblock = (visitorId) => {
        // When admin approves unblock, reset status to pending 
        // so resident can then approve/reject/block again if needed
        updateVisitor(visitorId, {
            status: 'pending',
            unblockApprovedBy: currentRole?.userId // Track who approved
        });
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
                                        <td className="text-muted">{visitor.contactNumber || visitor.contactnumber}</td>
                                        <td className="text-muted">{getResidentName(visitor.unblockRequestedBy || visitor.residentId || visitor.residentid)}</td>
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

    const roleSocietyId = currentRole?.societyId || currentRole?.societyid;
    const residents = users.filter(u =>
        u.roles.some(r => r.role === 'resident' && (r.societyId === roleSocietyId || r.societyid === roleSocietyId))
    );

    const handleApprove = async (userId, roleIndex) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            const updatedRoles = [...user.roles];
            updatedRoles[roleIndex] = { ...updatedRoles[roleIndex], status: 'approved' };
            await updateUser(userId, { roles: updatedRoles });
        }
    };

    const handleReject = async (userId, roleIndex) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            const updatedRoles = [...user.roles];
            updatedRoles[roleIndex] = { ...updatedRoles[roleIndex], status: 'rejected' };
            await updateUser(userId, { roles: updatedRoles });
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
                                        r.role === 'resident' && (r.societyId === roleSocietyId || r.societyid === roleSocietyId)
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const result = await createSecurityUser(formData, currentRole?.societyId, currentUser.id);

        if (!result.success) {
            setError(result.error);
            return;
        }

        setShowModal(false);
        setFormData({ name: '', mobile: '', loginName: '', password: '' });
    };

    const handleDelete = async (userId) => {
        await deleteUserById(userId);
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
    const { currentRole } = useAuth();
    const { isSocietyActive, getSocietyById, loading } = useData();

    const roleSocietyId = currentRole?.societyId || currentRole?.societyid;
    const isActive = isSocietyActive(roleSocietyId);
    const society = getSocietyById(roleSocietyId);

    return (
        <div className="app-container">
            {!loading && !isActive && <InactiveSocietyOverlay societyName={society?.name} />}
            <Sidebar items={sidebarItems} basePath="/admin" />
            <div className="main-content">
                <Header title="Administrator Dashboard" />
                <div className="page-content">
                    <Routes>
                        <Route path="/" element={<DashboardHome />} />
                        <Route path="/residents" element={<ResidentsPage />} />
                        <Route path="/security" element={<SecurityPage />} />
                        <Route path="/amenities" element={<AmenitiesAdminPage />} />
                        <Route path="/staff" element={<StaffAdminPage />} />
                        <Route path="/docs" element={<DocumentsAdminPage />} />
                        <Route path="/visitor-log" element={<VisitorLogPage />} />
                        <Route path="/complaints" element={<ComplaintsAdminPage />} />
                        <Route path="/unblock-requests" element={<UnblockRequestsPage />} />
                        <Route path="/notices" element={<NoticesPage />} />
                        <Route path="/analytics" element={<AnalyticsPage />} />
                        <Route path="/integrations" element={<IntegrationsPage />} />
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addNotice({
                ...formData,
                societyId: currentRole?.societyId
            });
            setShowAddNotice(false);
            setFormData({ title: '', content: '', priority: 'normal' });
        } catch (error) {
            console.error('Error adding notice:', error);
        }
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
                size="xl"
            >
                <NoticeForm
                    onSubmit={handleSubmit}
                    onCancel={() => setShowAddNotice(false)}
                />
            </Modal>
        </div>
    );
};

// Analytics & Reports
const AnalyticsPage = () => {
    const { visitors, complaints, amenities, bookings, currentRole } = useData();
    const roleSocietyId = currentRole?.societyId || currentRole?.societyid;

    // Filter data for this society
    const societyVisitors = visitors.filter(v => (v.societyId === roleSocietyId || v.societyid === roleSocietyId));
    const societyComplaints = complaints.filter(c => (c.societyId === roleSocietyId || c.societyid === roleSocietyId));
    const societyBookings = bookings.filter(b => (b.societyId === roleSocietyId || b.societyid === roleSocietyId));

    // Stats
    const resolvedCount = societyComplaints.filter(c => c.status === 'resolved').length;
    const pendingCount = societyComplaints.length - resolvedCount;

    // Visitor trends (last 7 days simulation based on actual data if possible)
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toDateString();
        const count = societyVisitors.filter(v => new Date(v.entryTime).toDateString() === dateStr).length;
        return { label: d.toLocaleDateString(undefined, { weekday: 'short' }), count };
    }).reverse();

    return (
        <div className="animate-fadeIn">
            <h2 className="mb-6">{t('analytics')} & Detailed Reports</h2>

            <div className="grid-2 mb-8">
                <div className="card">
                    <h3 className="mb-6 flex-between">
                        <span>Visitor Footfall (7 Days)</span>
                        <TrendingUp size={18} className="text-success-500" />
                    </h3>
                    <div className="chart-container" style={{ height: 200, position: 'relative' }}>
                        <svg viewBox="0 0 100 40" className="w-full h-full" overflow="visible">
                            {/* Simple line chart path */}
                            <polyline
                                fill="none"
                                stroke="var(--primary-500)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={last7Days.map((d, i) => `${(i * 100) / 6},${40 - (d.count * 5)}`).join(' ')}
                            />
                            {/* Area fill */}
                            <path
                                fill="var(--primary-500)"
                                fillOpacity="0.1"
                                d={`M0,40 ${last7Days.map((d, i) => `L${(i * 100) / 6},${40 - (d.count * 5)}`).join(' ')} L100,40 Z`}
                            />
                        </svg>
                        <div className="flex-between mt-4 text-xs text-muted">
                            {last7Days.map(d => <span key={d.label}>{d.label}</span>)}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="mb-6">Complaint Resolution Time</h3>
                    <div className="space-y-6">
                        <div className="analytics-row">
                            <div className="flex-between mb-2">
                                <span className="text-sm">Resolved Rate</span>
                                <span className="text-sm font-bold">{Math.round((resolvedCount / (societyComplaints.length || 1)) * 100)}%</span>
                            </div>
                            <div className="progress-bar" style={{ height: 12 }}>
                                <div className="progress-fill bg-success-500" style={{ width: `${(resolvedCount / (societyComplaints.length || 1)) * 100}%` }}></div>
                            </div>
                        </div>
                        <div className="grid-2 text-center">
                            <div className="p-3 bg-glass rounded-lg">
                                <div className="text-2xl font-bold text-success-500">{resolvedCount}</div>
                                <div className="text-xs text-muted">Resolved</div>
                            </div>
                            <div className="p-3 bg-glass rounded-lg">
                                <div className="text-2xl font-bold text-warning-500">{pendingCount}</div>
                                <div className="text-xs text-muted">Awaiting</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 className="mb-6">Amenity Utilization Analysis</h3>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Amenity Name</th>
                                <th>Total Bookings</th>
                                <th>Popularity</th>
                                <th>Revenue (Est)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {amenities.filter(a => a.societyId === roleSocietyId || a.societyid === roleSocietyId).map(amenity => {
                                const bCount = societyBookings.filter(b => b.amenityId === amenity.id).length;
                                return (
                                    <tr key={amenity.id}>
                                        <td className="font-medium">{amenity.name}</td>
                                        <td>{bCount}</td>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="progress-bar" style={{ width: 100 }}>
                                                    <div className="progress-fill" style={{ width: `${Math.min(100, bCount * 10)}%` }}></div>
                                                </div>
                                                <span className="text-xs">{bCount * 10}%</span>
                                            </div>
                                        </td>
                                        <td className="text-success-500">₹{bCount * 500}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Integrations & Smart Hub (Simulated)
const IntegrationsPage = () => {
    const integrations = [
        { id: 'whatsapp', name: 'WhatsApp Alerts', icon: Mail, status: 'active', desc: 'Real-time notifications for SOS and visitors.' },
        { id: 'boom', name: 'Boom Barrier', icon: ShieldCheck, status: 'simulated', desc: 'Automated gate control for verified residents.' },
        { id: 'cctv', name: 'Smart CCTV', icon: Eye, status: 'inactive', desc: 'AI recognition for suspicious activities.' },
        { id: 'sms', name: 'SMS Gateway', icon: Mail, status: 'active', desc: 'Fallback notifications for low-data areas.' }
    ];

    return (
        <div className="animate-fadeIn">
            <h2 className="mb-6">Smart Hub & Integrations</h2>
            <div className="alert alert-info mb-8">
                <Info size={18} />
                <span>Integration modules allow you to connect physical hardware and software gateways. Status <strong>"Simulated"</strong> indicates demo mode active.</span>
            </div>

            <div className="grid-2">
                {integrations.map(int => (
                    <div key={int.id} className="card">
                        <div className="flex-between mb-4">
                            <div className="flex gap-4 items-center">
                                <div className="stat-icon" style={{ width: 48, height: 48, background: 'var(--bg-glass)', color: 'var(--primary-400)' }}>
                                    <int.icon size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold">{int.name}</h4>
                                    <p className="text-xs text-muted">{int.desc}</p>
                                </div>
                            </div>
                            <span className={`badge badge-${int.status}`}>{int.status}</span>
                        </div>
                        <div className="flex-between pt-4 border-t border-glass">
                            <button className="btn btn-ghost btn-sm" disabled={int.status === 'inactive'}>Config</button>
                            <button className="btn btn-primary btn-sm" disabled={int.status === 'active'}>
                                {int.status === 'inactive' ? 'Connect' : 'Running'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;

// Documents Management for Admin
const DocumentsAdminPage = () => {
    const { currentRole } = useAuth();
    const { documents, addDataItem, deleteDataItem } = useData();
    const [showAdd, setShowAdd] = useState(false);
    const [formData, setFormData] = useState({ title: '', category: 'Circulars', url: '' });

    const societyDocs = documents.filter(d => (d.societyId === currentRole.societyId || d.societyid === currentRole.societyId));

    const handleSubmit = async (e) => {
        e.preventDefault();
        await addDataItem('documents', {
            ...formData,
            societyId: currentRole.societyId,
            createdAt: new Date().toISOString()
        });
        setShowAdd(false);
        setFormData({ title: '', category: 'Circulars', url: '' });
    };

    return (
        <div>
            <div className="flex-between mb-6">
                <h2>Manage Society Documents</h2>
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                    <Plus size={18} />
                    Upload Document
                </button>
            </div>

            {societyDocs.length === 0 ? (
                <EmptyState icon={BookOpen} title="No Documents" description="Upload bylaws, rules, or circulars for residents." />
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Uploaded On</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {societyDocs.map(doc => (
                                    <tr key={doc.id}>
                                        <td className="font-semibold">{doc.title}</td>
                                        <td><span className="text-xs font-bold uppercase text-primary-400">{doc.category}</span></td>
                                        <td className="text-muted text-sm">{new Date(doc.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className="table-actions">
                                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-xs text-primary-500">
                                                    View
                                                </a>
                                                <button className="btn btn-ghost btn-xs text-error-600" onClick={() => deleteDataItem('documents', doc.id)}>
                                                    <Trash2 size={14} />
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

            <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Upload Society Document">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Document Title *</label>
                        <input type="text" className="form-input" placeholder="e.g. Society Bye-Laws 2024" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select className="form-select" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                            <option value="Bye-Laws">Bye-Laws</option>
                            <option value="Circulars">Circulars</option>
                            <option value="Rules">Rules & Regulations</option>
                            <option value="Forms">Forms</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Document URL (PDF/Doc) *</label>
                        <input type="url" className="form-input" placeholder="https://example.com/document.pdf" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} required />
                        <p className="text-xs text-muted mt-1">Provide a link to the hosted document file.</p>
                    </div>
                    <button type="submit" className="btn btn-primary w-full mt-4">Publish Document</button>
                </form>
            </Modal>
        </div>
    );
};

// Staff Management for Admin
const StaffAdminPage = () => {
    const { currentRole } = useAuth();
    const { staff, addDataItem, deleteDataItem } = useData();
    const [showAdd, setShowAdd] = useState(false);
    const [formData, setFormData] = useState({ name: '', role: '', mobile: '', isGateAllowed: true });

    const societyStaff = staff.filter(s => (s.societyId === currentRole.societyId || s.societyid === currentRole.societyId));

    const handleSubmit = async (e) => {
        e.preventDefault();
        await addDataItem('staff', {
            ...formData,
            societyId: currentRole.societyId,
            createdAt: new Date().toISOString(),
            atGate: false
        });
        setShowAdd(false);
        setFormData({ name: '', role: '', mobile: '', isGateAllowed: true });
    };

    return (
        <div>
            <div className="flex-between mb-6">
                <h2>Manage Society Staff</h2>
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                    <Plus size={18} />
                    Register Staff
                </button>
            </div>

            {societyStaff.length === 0 ? (
                <EmptyState icon={Contact} title="No Staff" description="Register staff members like sweepers, plumbers, and daily help." />
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Staff Member</th>
                                    <th>Role</th>
                                    <th>Mobile</th>
                                    <th>Gate Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {societyStaff.map(member => (
                                    <tr key={member.id}>
                                        <td>
                                            <div className="flex gap-3 items-center">
                                                <div className="header-avatar" style={{ width: 36, height: 36 }}>{getInitials(member.name)}</div>
                                                <span className="font-semibold">{member.name}</span>
                                            </div>
                                        </td>
                                        <td className="uppercase text-xs font-bold text-primary-400">{member.role}</td>
                                        <td className="text-muted">{member.mobile}</td>
                                        <td>
                                            <div className="flex gap-2 items-center">
                                                <span className={`gate-status-dot ${member.atGate ? 'active' : ''}`}></span>
                                                <span className="text-xs">{member.atGate ? 'Inside' : 'Outside'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="btn btn-ghost btn-sm text-error-600" onClick={() => deleteDataItem('staff', member.id)}>
                                                    <Trash2 size={14} /> Remove
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

            <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Register New Staff Member">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input type="text" className="form-input" placeholder="e.g. Ramesh Kumar" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <input type="text" className="form-input" placeholder="e.g. Plumber, Maid" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Mobile</label>
                            <input type="tel" className="form-input" placeholder="10-digit number" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} required />
                        </div>
                    </div>
                    <div className="checkbox-group mb-4">
                        <input type="checkbox" id="gate-allowed" checked={formData.isGateAllowed} onChange={(e) => setFormData({ ...formData, isGateAllowed: e.target.checked })} />
                        <label htmlFor="gate-allowed" className="text-sm">Allow automatic gate entry verification</label>
                    </div>
                    <button type="submit" className="btn btn-primary w-full mt-4">Register Staff</button>
                </form>
            </Modal>
            <style dangerouslySetInnerHTML={{
                __html: `
                .gate-status-dot { width: 8px; height: 8px; border-radius: 50%; background: #6b7280; }
                .gate-status-dot.active { background: #10b981; box-shadow: 0 0 10px #10b981; }
            ` }} />
        </div>
    );
};

// Amenities Management for Admin
const AmenitiesAdminPage = () => {
    const { currentRole } = useAuth();
    const { amenities, addDataItem, deleteDataItem } = useData();
    const [showAdd, setShowAdd] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', capacity: '', rules: '' });

    const societyAmenities = amenities.filter(a => (a.societyId === currentRole.societyId || a.societyid === currentRole.societyId));

    const handleSubmit = async (e) => {
        e.preventDefault();
        await addDataItem('amenities', {
            ...formData,
            societyId: currentRole.societyId,
            createdAt: new Date().toISOString()
        });
        setShowAdd(false);
        setFormData({ name: '', description: '', capacity: '', rules: '' });
    };

    return (
        <div>
            <div className="flex-between mb-6">
                <h2>Manage Society Amenities</h2>
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                    <Plus size={18} />
                    Add Amenity
                </button>
            </div>

            {societyAmenities.length === 0 ? (
                <EmptyState icon={Building2} title="No Amenities" description="Add amenities like Gym, Pool, or Clubhouse for residents to book." />
            ) : (
                <div className="grid-3">
                    {societyAmenities.map(amenity => (
                        <div key={amenity.id} className="card amenity-card">
                            <div className="flex-between mb-4">
                                <div className="p-3 bg-primary-900/40 rounded-xl text-primary-400">
                                    <Building2 size={24} />
                                </div>
                                <button className="btn-icon text-error-600" onClick={() => deleteDataItem('amenities', amenity.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <h3 className="text-xl font-bold mb-1">{amenity.name}</h3>
                            <p className="text-sm text-muted mb-4 line-clamp-2">{amenity.description}</p>
                            <div className="pt-4 border-t border-glass text-xs font-semibold text-muted uppercase tracking-widest">
                                Capacity: {amenity.capacity} people
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Create New Amenity">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Amenity Name *</label>
                        <input type="text" className="form-input" placeholder="e.g. Swimming Pool, Elite Gym" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-input" rows="3" placeholder="Brief details about the facility" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Max Capacity (per slot)</label>
                        <input type="text" className="form-input" placeholder="e.g. 15 people" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Rules & Guidelines</label>
                        <textarea className="form-input" rows="3" placeholder="e.g. Proper attire, no food..." value={formData.rules} onChange={(e) => setFormData({ ...formData, rules: e.target.value })}></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary w-full mt-4">Create Amenity</button>
                </form>
            </Modal>
        </div>
    );
};

// Complaints Management for Admin
const ComplaintsAdminPage = () => {
    const { currentRole } = useAuth();
    const { complaints, users, updateDataItem } = useData();
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [filter, setFilter] = useState('open');

    const societyComplaints = complaints
        .filter(c => (c.societyId === currentRole.societyId || c.societyid === currentRole.societyId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const filteredComplaints = societyComplaints.filter(c => filter === 'all' ? true : c.status === filter);

    const getResidentInfo = (residentId) => {
        const resident = users.find(u => u.id === residentId);
        if (!resident) return { name: 'Unknown', flat: 'N/A' };
        const role = resident.roles.find(r => r.role === 'resident' && r.societyId === currentRole.societyId);
        return { name: resident.name, flat: `${role?.block || ''}-${role?.flatNumber || ''}` };
    };

    const handleUpdateStatus = async (id, status) => {
        await updateDataItem('complaints', id, { status, remarks, updatedAt: new Date().toISOString() });
        setSelectedComplaint(null);
        setRemarks('');
    };

    return (
        <div>
            <div className="flex-between mb-6">
                <h2>Resident Complaints</h2>
                <div className="tabs" style={{ marginBottom: 0 }}>
                    {['open', 'in_progress', 'resolved', 'all'].map(f => (
                        <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                            {f.replace('_', ' ').toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {filteredComplaints.length === 0 ? (
                <EmptyState icon={ShieldAlert} title="No Complaints Found" description={`There are no ${filter} complaints at the moment.`} />
            ) : (
                <div className="space-y-4">
                    {filteredComplaints.map(complaint => {
                        const resident = getResidentInfo(complaint.residentId);
                        return (
                            <div key={complaint.id} className={`card complaint-card ${complaint.priority}`}>
                                <div className="flex-between">
                                    <div className="flex gap-4">
                                        <div className="header-avatar" style={{ width: 44, height: 44 }}>{getInitials(resident.name)}</div>
                                        <div>
                                            <div className="flex gap-2 items-center">
                                                <h3 className="font-bold">{complaint.title}</h3>
                                                <StatusBadge status={complaint.status} />
                                                {complaint.priority === 'urgent' && <span className="urgent-tag">URGENT</span>}
                                            </div>
                                            <div className="text-sm text-muted">Raised by {resident.name} (Flat {resident.flat}) • {formatDateTime(complaint.createdAt)}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedComplaint(complaint); setRemarks(complaint.remarks || ''); }}>
                                            Respond / Update
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-glass rounded-lg text-sm">{complaint.description}</div>
                                {complaint.remarks && (
                                    <div className="mt-4 p-3 bg-secondary-900/20 border-l-2 border-secondary-500 text-sm italic">
                                        <strong>Admin:</strong> {complaint.remarks}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <Modal isOpen={!!selectedComplaint} onClose={() => setSelectedComplaint(null)} title="Update Complaint Status">
                {selectedComplaint && (
                    <div className="space-y-4">
                        <div className="p-4 bg-soft rounded-lg">
                            <div className="text-xs font-bold text-muted mb-1">COMPLAINT</div>
                            <div className="font-semibold">{selectedComplaint.title}</div>
                            <div className="text-sm mt-1">{selectedComplaint.description}</div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Response / Remarks</label>
                            <textarea className="form-input" rows="4" placeholder="Enter remarks for the resident..." value={remarks} onChange={(e) => setRemarks(e.target.value)}></textarea>
                        </div>
                        <div className="grid-3 gap-3">
                            <button className="btn btn-warning" onClick={() => handleUpdateStatus(selectedComplaint.id, 'in_progress')}>
                                <Clock size={16} /> Mark In-Progress
                            </button>
                            <button className="btn btn-success" onClick={() => handleUpdateStatus(selectedComplaint.id, 'resolved')}>
                                <CheckCircle2 size={16} /> Mark Resolved
                            </button>
                            <button className="btn btn-secondary" onClick={() => handleUpdateStatus(selectedComplaint.id, 'open')}>
                                Re-open
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <style dangerouslySetInnerHTML={{
                __html: `
                .complaint-card.urgent { border-left: 4px solid var(--error-500); }
                .urgent-tag { background: var(--error-600); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 800; }
            ` }} />
        </div>
    );
};
