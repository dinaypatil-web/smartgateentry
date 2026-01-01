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
    LayoutDashboard, UserCheck, History, Ban,
    Check, X, Unlock, Eye, Phone, MapPin, FileText, Users,
    Ticket, Plus, Calendar, Clock, Share2, Trash2, Megaphone
} from 'lucide-react';
import { formatDateTime, getInitials } from '../../utils/validators';
import MyRoles from '../shared/MyRoles';

const sidebarItems = [
    {
        title: 'Main',
        items: [
            { path: '', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/pending', label: 'Pending Approvals', icon: UserCheck },
            { path: '/invites', label: 'Invites', icon: Ticket },
            { path: '/notices', label: 'Notice Board', icon: Megaphone },
            { path: '/history', label: 'Visit History', icon: History },
            { path: '/blocked', label: 'Blocked Visitors', icon: Ban },
            { path: '/my-roles', label: 'My Roles', icon: Users }
        ]
    }
];

// Dashboard Overview
const DashboardHome = () => {
    const { currentUser, currentRole } = useAuth();
    const { visitors, getSocietyById } = useData();

    const society = getSocietyById(currentRole?.societyId);

    const myVisitors = visitors.filter(v => v.residentId === currentUser?.id);
    const pendingVisitors = myVisitors.filter(v => v.status === 'pending');
    const approvedToday = myVisitors.filter(v => {
        const today = new Date().toDateString();
        return v.status === 'approved' && new Date(v.entryTime).toDateString() === today;
    });
    const blockedVisitors = myVisitors.filter(v => v.status === 'blocked' || v.status === 'pending_unblock');

    return (
        <div>
            <div className="alert alert-info mb-6">
                <span>
                    <strong>{society?.name}</strong> • Block {currentRole?.block}, Flat {currentRole?.flatNumber}
                </span>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <UserCheck size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{pendingVisitors.length}</div>
                        <div className="stat-label">Pending Approvals</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <Check size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{approvedToday.length}</div>
                        <div className="stat-label">Approved Today</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <Ban size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{blockedVisitors.length}</div>
                        <div className="stat-label">Blocked Visitors</div>
                    </div>
                </div>
            </div>

            {pendingVisitors.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <UserCheck size={20} />
                            Pending Visitor Approvals
                        </h3>
                    </div>
                    <p className="text-muted">
                        You have {pendingVisitors.length} visitor(s) waiting for your approval.
                    </p>
                </div>
            )}
        </div>
    );
};

// Pending Approvals
const PendingPage = () => {
    const { currentUser } = useAuth();
    const { visitors, updateVisitor } = useData();
    const [selectedVisitor, setSelectedVisitor] = useState(null);
    const [showBlockConfirm, setShowBlockConfirm] = useState(null);

    const pendingVisitors = visitors.filter(v =>
        v.residentId === currentUser?.id && v.status === 'pending'
    );

    const handleApprove = (visitorId) => {
        updateVisitor(visitorId, { status: 'approved' });
    };

    const handleReject = (visitorId) => {
        updateVisitor(visitorId, { status: 'rejected' });
    };

    const handleBlock = (visitorId) => {
        updateVisitor(visitorId, {
            status: 'blocked',
            blockedBy: currentUser.id
        });
        setShowBlockConfirm(null);
    };

    return (
        <div>
            <h2 className="mb-6">Pending Approvals</h2>

            {pendingVisitors.length === 0 ? (
                <EmptyState
                    icon={UserCheck}
                    title="No Pending Visitors"
                    description="All visitor requests have been handled."
                />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--space-4)' }}>
                    {pendingVisitors.map(visitor => (
                        <div key={visitor.id} className="card">
                            <div className="flex gap-4" style={{ alignItems: 'flex-start' }}>
                                {visitor.photo ? (
                                    <img
                                        src={visitor.photo}
                                        alt={visitor.name}
                                        className="visitor-photo-large"
                                    />
                                ) : (
                                    <div className="header-avatar" style={{ width: 100, height: 100, fontSize: '2rem' }}>
                                        {getInitials(visitor.name)}
                                    </div>
                                )}

                                <div style={{ flex: 1 }}>
                                    <h4 style={{ marginBottom: 'var(--space-2)' }}>{visitor.name}</h4>
                                    <div className="text-sm text-muted" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                                        <div className="flex gap-2" style={{ alignItems: 'center' }}>
                                            <Phone size={14} /> {visitor.contactNumber}
                                        </div>
                                        <div className="flex gap-2" style={{ alignItems: 'center' }}>
                                            <MapPin size={14} /> {visitor.comingFrom}
                                        </div>
                                        <div className="flex gap-2" style={{ alignItems: 'center' }}>
                                            <FileText size={14} /> {visitor.purpose}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4" style={{ flexWrap: 'wrap' }}>
                                <button
                                    className="btn btn-sm"
                                    onClick={() => setSelectedVisitor(visitor)}
                                >
                                    <Eye size={14} />
                                    Details
                                </button>
                                <div style={{ flex: 1 }} />
                                <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => handleApprove(visitor.id)}
                                >
                                    <Check size={14} />
                                    Approve
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleReject(visitor.id)}
                                >
                                    <X size={14} />
                                    Reject
                                </button>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setShowBlockConfirm(visitor)}
                                    style={{ color: 'var(--gray-400)' }}
                                >
                                    <Ban size={14} />
                                    Block
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Visitor Details Modal */}
            <Modal
                isOpen={!!selectedVisitor}
                onClose={() => setSelectedVisitor(null)}
                title="Visitor Details"
            >
                {selectedVisitor && (
                    <div>
                        <div className="flex gap-4 mb-6" style={{ alignItems: 'center' }}>
                            {selectedVisitor.photo ? (
                                <img
                                    src={selectedVisitor.photo}
                                    alt={selectedVisitor.name}
                                    className="visitor-photo-large"
                                />
                            ) : (
                                <div className="header-avatar" style={{ width: 100, height: 100, fontSize: '2rem' }}>
                                    {getInitials(selectedVisitor.name)}
                                </div>
                            )}
                            <div>
                                <h3>{selectedVisitor.name}</h3>
                                <span className="badge badge-pending">{selectedVisitor.gender}</span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                            <div className="flex-between">
                                <span className="text-muted">Contact:</span>
                                <span>{selectedVisitor.contactNumber}</span>
                            </div>
                            <div className="flex-between">
                                <span className="text-muted">Coming From:</span>
                                <span>{selectedVisitor.comingFrom}</span>
                            </div>
                            <div className="flex-between">
                                <span className="text-muted">Purpose:</span>
                                <span>{selectedVisitor.purpose}</span>
                            </div>
                            <div className="flex-between">
                                <span className="text-muted">ID Proof:</span>
                                <span>{selectedVisitor.idProof}</span>
                            </div>
                            <div className="flex-between">
                                <span className="text-muted">Entry Time:</span>
                                <span>{formatDateTime(selectedVisitor.entryTime)}</span>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                className="btn btn-success flex-1"
                                onClick={() => { handleApprove(selectedVisitor.id); setSelectedVisitor(null); }}
                            >
                                <Check size={18} />
                                Approve
                            </button>
                            <button
                                className="btn btn-danger flex-1"
                                onClick={() => { handleReject(selectedVisitor.id); setSelectedVisitor(null); }}
                            >
                                <X size={18} />
                                Reject
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Block Confirmation */}
            <ConfirmModal
                isOpen={!!showBlockConfirm}
                onClose={() => setShowBlockConfirm(null)}
                onConfirm={() => handleBlock(showBlockConfirm?.id)}
                title="Block Visitor"
                message={`Are you sure you want to block ${showBlockConfirm?.name}? Blocked visitors cannot be approved until unblocked.`}
                confirmText="Block"
                variant="danger"
            />
        </div>
    );
};

// Visit History
const HistoryPage = () => {
    const { currentUser } = useAuth();
    const { visitors, updateVisitor } = useData();
    const [showBlockConfirm, setShowBlockConfirm] = useState(null);

    const myVisitors = visitors
        .filter(v => v.residentId === currentUser?.id && v.status !== 'pending')
        .sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime));

    return (
        <div>
            <h2 className="mb-6">Visit History</h2>

            {myVisitors.length === 0 ? (
                <EmptyState
                    icon={History}
                    title="No Visit History"
                    description="Your past visitor approvals will appear here."
                />
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Visitor</th>
                                    <th>Purpose</th>
                                    <th>Entry Time</th>
                                    <th>Exit Time</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myVisitors.map(visitor => (
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
                                                <div>
                                                    <div className="font-medium">{visitor.name}</div>
                                                    <div className="text-xs text-muted">{visitor.contactNumber}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-muted">{visitor.purpose}</td>
                                        <td className="text-sm text-muted">{formatDateTime(visitor.entryTime)}</td>
                                        <td className="text-sm text-muted">
                                            {visitor.exitTime ? formatDateTime(visitor.exitTime) : '—'}
                                        </td>
                                        <td>
                                            <StatusBadge status={visitor.status} />
                                        </td>
                                        <td>
                                            {visitor.status !== 'blocked' && visitor.status !== 'pending_unblock' && (
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => setShowBlockConfirm(visitor)}
                                                    style={{ color: 'var(--gray-400)' }}
                                                >
                                                    <Ban size={14} />
                                                    Block
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!showBlockConfirm}
                onClose={() => setShowBlockConfirm(null)}
                onConfirm={() => {
                    updateVisitor(showBlockConfirm.id, {
                        status: 'blocked',
                        blockedBy: currentUser.id
                    });
                    setShowBlockConfirm(null);
                }}
                title="Block Visitor"
                message={`Are you sure you want to block ${showBlockConfirm?.name}? Blocked visitors cannot be approved until unblocked.`}
                confirmText="Block"
                variant="danger"
            />
        </div>
    );
};

// Blocked Visitors
const BlockedPage = () => {
    const { currentUser } = useAuth();
    const { visitors, updateVisitor } = useData();
    const [unblockConfirm, setUnblockConfirm] = useState(null);

    const blockedVisitors = visitors.filter(v =>
        v.residentId === currentUser?.id && (v.status === 'blocked' || v.status === 'pending_unblock')
    );

    const handleUnblock = (visitorId) => {
        updateVisitor(visitorId, {
            status: 'pending_unblock', // Needs admin approval
            unblockRequestedBy: currentUser.id
        });
        setUnblockConfirm(null);
    };

    return (
        <div>
            <h2 className="mb-6">Blocked Visitors</h2>

            {blockedVisitors.length === 0 ? (
                <EmptyState
                    icon={Ban}
                    title="No Blocked Visitors"
                    description="Visitors you block will appear here."
                />
            ) : (
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Visitor</th>
                                    <th>Contact</th>
                                    <th>Blocked On</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {blockedVisitors.map(visitor => (
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
                                        <td className="text-sm text-muted">{formatDateTime(visitor.entryTime)}</td>
                                        <td>
                                            {visitor.status === 'pending_unblock' ? (
                                                <StatusBadge status={visitor.status} />
                                            ) : (
                                                <button
                                                    className="btn btn-warning btn-sm"
                                                    onClick={() => setUnblockConfirm(visitor)}
                                                >
                                                    <Unlock size={14} />
                                                    Request Unblock
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!unblockConfirm}
                onClose={() => setUnblockConfirm(null)}
                onConfirm={() => handleUnblock(unblockConfirm?.id)}
                title="Request Unblock"
                message={`Request to unblock ${unblockConfirm?.name}? This will need approval from the administrator.`}
                confirmText="Request Unblock"
                variant="primary"
            />
        </div>
    );
};

// Main Dashboard Layout
const ResidentDashboard = () => {
    return (
        <div className="app-container">
            <Sidebar items={sidebarItems} basePath="/resident" />
            <div className="main-content">
                <Header title="Resident Dashboard" />
                <div className="page-content">
                    <Routes>
                        <Route path="/" element={<DashboardHome />} />
                        <Route path="/pending" element={<PendingPage />} />
                        <Route path="/invites" element={<InvitesPage />} />
                        <Route path="/notices" element={<NoticeBoardPage />} />
                        <Route path="/history" element={<HistoryPage />} />
                        <Route path="/blocked" element={<BlockedPage />} />
                        <Route path="/my-roles" element={<MyRoles />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

// Pre-Approval / Invites Management
const InvitesPage = () => {
    const { currentUser, currentRole } = useAuth();
    const { addPreApproval, updatePreApproval, preApprovals } = useData();
    const [showAddInvite, setShowAddInvite] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        contactNumber: '',
        purpose: '',
        expectedDate: new Date().toISOString().split('T')[0],
        type: 'guest' // guest, delivery, service
    });

    const myInvites = preApprovals.filter(p => p.residentId === currentUser?.id);

    const handleSubmit = (e) => {
        e.preventDefault();
        addPreApproval({
            ...formData,
            residentId: currentUser.id,
            societyId: currentRole.societyId,
            passCode: Math.floor(100000 + Math.random() * 900000).toString() // Generate 6 digit code
        });
        setShowAddInvite(false);
        setFormData({ name: '', contactNumber: '', purpose: '', expectedDate: new Date().toISOString().split('T')[0], type: 'guest' });
    };

    const handleCancelInvite = (id) => {
        updatePreApproval(id, { status: 'cancelled' });
    };

    return (
        <div>
            <div className="flex-between mb-6">
                <h2>My Invites & Pre-Approvals</h2>
                <button className="btn btn-primary" onClick={() => setShowAddInvite(true)}>
                    <Plus size={18} />
                    New Invite
                </button>
            </div>

            {myInvites.length === 0 ? (
                <EmptyState
                    icon={Ticket}
                    title="No Active Invites"
                    description="Generate pre-approval passes for your guests to skip the wait at the gate."
                />
            ) : (
                <div className="grid-2">
                    {myInvites.map(invite => (
                        <div key={invite.id} className="card animate-slideUp">
                            <div className="flex-between mb-4">
                                <div className="flex gap-3">
                                    <div className="stat-icon" style={{ width: 40, height: 40, background: 'var(--bg-glass-heavy)' }}>
                                        <Ticket size={20} />
                                    </div>
                                    <div>
                                        <div className="font-semibold">{invite.name}</div>
                                        <div className="text-xs text-muted">{invite.type.toUpperCase()}</div>
                                    </div>
                                </div>
                                <StatusBadge status={invite.status} />
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex gap-2 text-sm text-muted">
                                    <Calendar size={14} />
                                    {invite.expectedDate}
                                </div>
                                <div className="flex gap-2 text-sm text-muted">
                                    <FileText size={14} />
                                    {invite.purpose}
                                </div>
                            </div>

                            {invite.status === 'valid' && (
                                <div className="p-3 bg-glass border border-dashed border-primary-500 rounded-lg text-center mb-4">
                                    <div className="text-xs text-primary-400 mb-1">PASS CODE</div>
                                    <div className="text-2xl font-bold tracking-widest text-primary-500">{invite.passCode}</div>
                                </div>
                            )}

                            {invite.status === 'valid' && (
                                <div className="flex gap-2">
                                    <button className="btn btn-ghost btn-sm flex-1">
                                        <Share2 size={14} />
                                        Share
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleCancelInvite(invite.id)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={showAddInvite}
                onClose={() => setShowAddInvite(false)}
                title="Create Visitor Pass"
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Visitor Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="Full name"
                        />
                    </div>
                    <div className="form-group">
                        <label>Contact Number</label>
                        <input
                            type="tel"
                            className="form-control"
                            value={formData.contactNumber}
                            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                            required
                            placeholder="10-digit mobile"
                        />
                    </div>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Expected Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={formData.expectedDate}
                                onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Guest Type</label>
                            <select
                                className="form-control"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="guest">Guest / Relative</option>
                                <option value="delivery">Delivery</option>
                                <option value="service">Service Provider</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Purpose of Visit</label>
                        <textarea
                            className="form-control"
                            value={formData.purpose}
                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                            placeholder="e.g. Dinner, Repair works, etc."
                        />
                    </div>
                    <div className="flex gap-3 justify-end mt-6">
                        <button type="button" className="btn btn-ghost" onClick={() => setShowAddInvite(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Generate Pass
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

// Notice Board component (to be used by all dashboards)
const NoticeBoardPage = () => {
    return (
        <div>
            <h2 className="mb-6">Society Notice Board</h2>
            <NoticeBoard />
        </div>
    );
};

export default ResidentDashboard;
