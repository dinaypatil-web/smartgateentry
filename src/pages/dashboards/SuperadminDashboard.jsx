import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import BottomNav from '../../components/BottomNav';
import Modal, { ConfirmModal } from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import BackupRestore from '../../components/BackupRestore';
import {
    LayoutDashboard, Building2, Users, UserCheck,
    Plus, Edit, Trash2, Calendar, MapPin, LogOut,
    Shield, Check, X, Database, Download, Upload,
    AlertTriangle, CheckCircle
} from 'lucide-react';
import { formatDate, getRoleLabel } from '../../utils/validators';
import * as storageUtils from '../../utils/storage';

const sidebarItems = [
    {
        title: 'Main',
        items: [
            { path: '', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/societies', label: 'Societies', icon: Building2 },
            { path: '/administrators', label: 'Administrators', icon: Users },
            { path: '/my-roles', label: 'My Roles', icon: UserCheck },
            { path: '/backup', label: 'Backup & Restore', icon: Database }
        ]
    }
];

// Dashboard Overview
const DashboardHome = () => {
    const { currentUser, resignSuperadmin } = useAuth();
    const { societies, users } = useData();
    const [showResignModal, setShowResignModal] = useState(false);

    const pendingAdmins = users.filter(u =>
        u.roles.some(r => r.role === 'administrator' && r.status === 'pending')
    );

    const handleResign = () => {
        resignSuperadmin();
        setShowResignModal(false);
    };

    return (
        <div>
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <Building2 size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{societies.length}</div>
                        <div className="stat-label">Total Societies</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">
                            {users.filter(u => u.roles.some(r => r.role === 'administrator' && r.status === 'approved')).length}
                        </div>
                        <div className="stat-label">Active Administrators</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <UserCheck size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{pendingAdmins.length}</div>
                        <div className="stat-label">Pending Approvals</div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <Shield size={20} />
                        Superadmin Actions
                    </h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                    As the superadmin, you have full control over all societies and administrators.
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                    <button
                        className="btn btn-danger"
                        onClick={() => setShowResignModal(true)}
                    >
                        <LogOut size={18} />
                        Resign as Superadmin
                    </button>
                </div>
            </div>

            <ConfirmModal
                isOpen={showResignModal}
                onClose={() => setShowResignModal(false)}
                onConfirm={handleResign}
                title="Resign as Superadmin"
                message="Are you sure you want to resign? This action cannot be undone. A new superadmin will need to sign up to manage the system."
                confirmText="Yes, Resign"
                variant="danger"
            />
        </div>
    );
};

// Societies Management
const SocietiesPage = () => {
    const { currentUser } = useAuth();
    const { societies, addSociety, updateSociety, deleteSociety } = useData();
    const [showModal, setShowModal] = useState(false);
    const [editingSociety, setEditingSociety] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        permissionFromDate: '',
        permissionToDate: ''
    });

    const resetForm = () => {
        setFormData({
            name: '',
            address: '',
            permissionFromDate: '',
            permissionToDate: ''
        });
        setEditingSociety(null);
    };

    const handleOpenModal = (society = null) => {
        if (society) {
            setEditingSociety(society);
            setFormData({
                name: society.name,
                address: society.address,
                permissionFromDate: (society.permissionFromDate || society.permissionfromdate)?.split('T')[0] || '',
                permissionToDate: (society.permissionToDate || society.permissiontodate)?.split('T')[0] || ''
            });
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const societyData = {
            name: formData.name,
            address: formData.address,
            permissionFromDate: formData.permissionFromDate,
            permissionToDate: formData.permissionToDate,
            createdBy: currentUser.id
        };

        try {
            if (editingSociety) {
                await updateSociety(editingSociety.id, societyData);
            } else {
                await addSociety(societyData);
            }
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Error saving society:', error);
        }
    };

    const handleDelete = async (id) => {
        await deleteSociety(id);
        setDeleteConfirm(null);
    };

    return (
        <div>
            <div className="flex-between mb-6">
                <h2>Manage Societies</h2>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={18} />
                    Add Society
                </button>
            </div>

            {societies.length === 0 ? (
                <EmptyState
                    icon={Building2}
                    title="No Societies Yet"
                    description="Create your first society to get started with visitor management."
                    action={
                        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                            <Plus size={18} />
                            Add Society
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
                                    <th>Address</th>
                                    <th>Permission Period</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {societies.map(society => {
                                    const now = new Date();
                                    const fromDateVal = society.permissionFromDate || society.permissionfromdate;
                                    const toDateVal = society.permissionToDate || society.permissiontodate;

                                    const from = new Date(fromDateVal);
                                    const to = new Date(toDateVal);
                                    const isActive = now >= from && now <= to;

                                    return (
                                        <tr key={society.id}>
                                            <td className="font-medium">{society.name}</td>
                                            <td className="text-muted">{society.address}</td>
                                            <td className="text-sm">
                                                <div className="flex gap-2" style={{ alignItems: 'center' }}>
                                                    <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                                                    {formatDate(society.permissionFromDate || society.permissionfromdate)} - {formatDate(society.permissionToDate || society.permissiontodate)}
                                                </div>
                                            </td>
                                            <td>
                                                <StatusBadge status={isActive ? 'active' : 'pending'} />
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="btn btn-ghost btn-icon btn-sm"
                                                        onClick={() => handleOpenModal(society)}
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost btn-icon btn-sm"
                                                        onClick={() => setDeleteConfirm(society)}
                                                        title="Delete"
                                                        style={{ color: 'var(--error-500)' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
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

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); resetForm(); }}
                title={editingSociety ? 'Edit Society' : 'Add New Society'}
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Society Name</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter society name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Address</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Enter full address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Permission From</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.permissionFromDate}
                                onChange={(e) => setFormData({ ...formData, permissionFromDate: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Permission To</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.permissionToDate}
                                onChange={(e) => setFormData({ ...formData, permissionToDate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary flex-1">
                            {editingSociety ? 'Save Changes' : 'Create Society'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => handleDelete(deleteConfirm?.id)}
                title="Delete Society"
                message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

// Administrators Management
const AdministratorsPage = () => {
    const { users, updateUser, societies, getSocietyById } = useData();
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const administrators = users.filter(u =>
        u.roles.some(r => r.role === 'administrator')
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

    const handleRemove = async () => {
        if (!deleteConfirm) return;
        const { userId, roleIndex } = deleteConfirm;
        const user = users.find(u => u.id === userId);
        if (user) {
            // Remove the administrator role from the user's roles array
            const updatedRoles = user.roles.filter((_, index) => index !== roleIndex);
            await updateUser(userId, { roles: updatedRoles });
        }
        setDeleteConfirm(null);
    };

    return (
        <div>
            <h2 className="mb-6">Manage Administrators</h2>

            {administrators.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No Administrators"
                    description="No one has signed up as an administrator yet."
                />
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Mobile</th>
                                    <th>Society</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {administrators.map(admin =>
                                    admin.roles
                                        .map((role, roleIndex) => ({ role, roleIndex }))
                                        .filter(({ role }) => role.role === 'administrator')
                                        .map(({ role, roleIndex }) => {
                                            const society = getSocietyById(role.societyId);
                                            return (
                                                <tr key={`${admin.id}-${roleIndex}`}>
                                                    <td className="font-medium">{admin.name}</td>
                                                    <td className="text-muted">{admin.email}</td>
                                                    <td className="text-muted">{admin.mobile}</td>
                                                    <td>{society?.name || 'Unknown'}</td>
                                                    <td>
                                                        <StatusBadge status={role.status} />
                                                    </td>
                                                    <td>
                                                        <div className="table-actions">
                                                            {role.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        className="btn btn-success btn-sm"
                                                                        onClick={() => handleApprove(admin.id, roleIndex)}
                                                                    >
                                                                        <Check size={14} />
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-danger btn-sm"
                                                                        onClick={() => handleReject(admin.id, roleIndex)}
                                                                    >
                                                                        <X size={14} />
                                                                        Reject
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button
                                                                className="btn btn-ghost btn-sm"
                                                                onClick={() => setDeleteConfirm({
                                                                    userId: admin.id,
                                                                    roleIndex,
                                                                    adminName: admin.name,
                                                                    societyName: society?.name || 'Unknown'
                                                                })}
                                                                style={{ color: 'var(--error-500)' }}
                                                                title="Remove Administrator"
                                                            >
                                                                <Trash2 size={14} />
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Remove Administrator Confirmation */}
            <ConfirmModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleRemove}
                title="Remove Administrator"
                message={`Are you sure you want to remove "${deleteConfirm?.adminName}" as an administrator for "${deleteConfirm?.societyName}"? They will lose all administrator privileges for this society.`}
                confirmText="Remove"
                variant="danger"
            />
        </div>
    );
};

// My Roles Management (for adding superadmin as admin/resident of societies)
const MyRolesPage = () => {
    const { currentUser, signup, refreshCurrentUser, removeRole, updateRole } = useAuth();
    const { societies, getSocietyById } = useData();
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [formData, setFormData] = useState({
        role: 'administrator',
        societyId: '',
        block: '',
        flatNumber: ''
    });
    const [error, setError] = useState('');

    const myRoles = currentUser?.roles || [];

    const handleOpenModal = (role = null) => {
        if (role) {
            setEditingRole(role);
            setFormData({
                role: role.role,
                societyId: role.societyId || '',
                block: role.block || '',
                flatNumber: role.flatNumber || ''
            });
        } else {
            setEditingRole(null);
            setFormData({ role: 'administrator', societyId: '', block: '', flatNumber: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (editingRole) {
            const result = await updateRole(editingRole.role, editingRole.societyId, {
                block: formData.role === 'resident' ? formData.block : null,
                flatNumber: formData.role === 'resident' ? formData.flatNumber : null
            });

            if (!result.success) {
                setError(result.error);
                return;
            }
        } else {
            const result = await signup({
                name: currentUser.name,
                email: currentUser.email,
                mobile: currentUser.mobile,
                password: currentUser.password,
                role: formData.role,
                societyId: formData.societyId,
                block: formData.role === 'resident' ? formData.block : null,
                flatNumber: formData.role === 'resident' ? formData.flatNumber : null
            }, currentUser);

            if (!result.success) {
                setError(result.error);
                return;
            }
        }

        refreshCurrentUser();
        setShowModal(false);
        setEditingRole(null);
        setFormData({ role: 'administrator', societyId: '', block: '', flatNumber: '' });
    };

    const handleRemoveRole = async (role) => {
        const result = removeRole(role.role, role.societyId);
        if (!result.success) {
            setError(result.error);
        }
        setDeleteConfirm(null);
    };

    return (
        <div>
            <div className="flex-between mb-6">
                <h2>My Roles</h2>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={18} />
                    Add Role
                </button>
            </div>

            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Role</th>
                                <th>Society</th>
                                <th>Details</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myRoles.map((role, index) => {
                                const society = role.societyId ? getSocietyById(role.societyId) : null;
                                const isSuperAdminRole = role.role === 'superadmin';
                                return (
                                    <tr key={index}>
                                        <td className="font-medium">{getRoleLabel(role.role)}</td>
                                        <td>{society?.name || (isSuperAdminRole ? 'System Wide' : 'Unknown')}</td>
                                        <td className="text-muted">
                                            {role.role === 'resident' && role.block ?
                                                `Block ${role.block}, Flat ${role.flatNumber}` : '—'}
                                        </td>
                                        <td>
                                            <StatusBadge status={role.status} />
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                {!isSuperAdminRole && (
                                                    <>
                                                        {role.role === 'resident' && (
                                                            <button
                                                                className="btn btn-ghost btn-icon btn-sm"
                                                                onClick={() => handleOpenModal(role)}
                                                                title="Edit"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                        )}
                                                        <button
                                                            className="btn btn-ghost btn-icon btn-sm"
                                                            onClick={() => setDeleteConfirm(role)}
                                                            title="Remove Role"
                                                            style={{ color: 'var(--error-500)' }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
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

            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingRole(null); }}
                title={editingRole ? 'Edit Role Details' : 'Add New Role'}
            >
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-error">{error}</div>}

                    {!editingRole ? (
                        <>
                            <div className="form-group">
                                <label className="form-label">Role Type</label>
                                <select
                                    className="form-select"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="administrator">Administrator</option>
                                    <option value="resident">Resident</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Society</label>
                                <select
                                    className="form-select"
                                    value={formData.societyId}
                                    onChange={(e) => setFormData({ ...formData, societyId: e.target.value })}
                                    required
                                >
                                    <option value="">Select a society</option>
                                    {societies.map(society => (
                                        <option key={society.id} value={society.id}>
                                            {society.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    ) : (
                        <div className="alert alert-info mb-4">
                            Editing <strong>{getRoleLabel(editingRole.role)}</strong> role for <strong>{editingRole.societyId ? getSocietyById(editingRole.societyId)?.name : 'Global'}</strong>
                        </div>
                    )}

                    {formData.role === 'resident' && (
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Block</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., A, B"
                                    value={formData.block}
                                    onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Flat Number</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., 101"
                                    value={formData.flatNumber}
                                    onChange={(e) => setFormData({ ...formData, flatNumber: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 mt-6">
                        <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingRole(null); }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary flex-1">
                            {editingRole ? 'Save Changes' : 'Add Role'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Remove Role Confirmation */}
            <ConfirmModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => handleRemoveRole(deleteConfirm)}
                title="Remove Role"
                message={`Are you sure you want to remove the role "${getRoleLabel(deleteConfirm?.role)}" for ${deleteConfirm?.societyId ? getSocietyById(deleteConfirm.societyId)?.name : 'Global'}? You will lose access to features associated with this role.`}
                confirmText="Remove Role"
                variant="danger"
            />
        </div>
    );
};

// Data Backup & Restore Page
const DataBackupPage = () => {
    const [showBackupModal, setShowBackupModal] = useState(true);

    return (
        <div>
            {showBackupModal && <BackupRestore onClose={() => setShowBackupModal(false)} />}
        </div>
    );
};

// Main Dashboard Layout
const SuperadminDashboard = () => {
    return (
        <div className="app-container">
            <Sidebar items={sidebarItems} basePath="/superadmin" />
            <div className="main-content">
                <Header title="Superadmin Dashboard" />
                <div className="page-content">
                    <Routes>
                        <Route path="/" element={<DashboardHome />} />
                        <Route path="/societies" element={<SocietiesPage />} />
                        <Route path="/administrators" element={<AdministratorsPage />} />
                        <Route path="/my-roles" element={<MyRolesPage />} />
                        <Route path="/backup" element={<DataBackupPage />} />
                    </Routes>
                </div>
            </div>
            <BottomNav items={sidebarItems} basePath="/superadmin" />
        </div>
    );
};

export default SuperadminDashboard;
