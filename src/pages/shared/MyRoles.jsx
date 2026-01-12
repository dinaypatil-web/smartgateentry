import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Modal, { ConfirmModal } from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { Plus, Edit, Trash2, Building2, UserCheck, Shield, Users } from 'lucide-react';
import { getRoleLabel } from '../../utils/validators';

const MyRoles = () => {
    const { currentUser, signup, refreshCurrentUser, removeRole, updateRole } = useAuth();
    const { societies, getSocietyById } = useData();
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [formData, setFormData] = useState({
        role: 'resident',
        societyId: '',
        block: '',
        flatNumber: ''
    });
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

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
            setFormData({ role: 'resident', societyId: '', block: '', flatNumber: '' });
        }
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ role: 'resident', societyId: '', block: '', flatNumber: '' });
        setError('');
        setEditingRole(null);
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
        resetForm();
    };

    const handleRemoveRole = (role) => {
        const result = removeRole(role.role, role.societyId);
        if (!result.success) {
            console.error(result.error);
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
                                        <td className="font-medium">
                                            <div className="flex gap-2" style={{ alignItems: 'center' }}>
                                                {role.role === 'superadmin' && <Shield size={16} />}
                                                {role.role === 'administrator' && <Building2 size={16} />}
                                                {role.role === 'resident' && <Users size={16} />}
                                                {role.role === 'security' && <Shield size={16} />}
                                                {getRoleLabel(role.role)}
                                            </div>
                                        </td>
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
                                                            style={{ color: 'var(--error-500)' }}
                                                            title="Remove Role"
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

            {/* Add/Edit Role Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); resetForm(); }}
                title={editingRole ? 'Edit Role Details' : 'Request New Role'}
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
                                    <option value="resident">Resident</option>
                                    <option value="administrator">Administrator</option>
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
                        <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary flex-1">
                            {editingRole ? 'Save Changes' : 'Submit Request'}
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

export default MyRoles;
