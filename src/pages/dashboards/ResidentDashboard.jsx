import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Modal, { ConfirmModal } from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import NoticeBoard from '../../components/NoticeBoard';
import AddToDirectoryPrompt from '../../components/AddToDirectoryPrompt';
import CommonDirectory from '../../components/CommonDirectory';
import CommunityBoard from '../../components/CommunityBoard';
import {
    LayoutDashboard, UserCheck, History, Ban,
    Check, X, Unlock, Eye, Phone, MapPin, FileText, Users,
    Ticket, Plus, Calendar, Clock, Share2, Trash2, Megaphone, Car, AlertTriangle, Building2, CheckCircle2, ClipboardList, ShieldAlert, Contact, BookOpen, FileImage, Briefcase, Package
} from 'lucide-react';
import { formatDateTime, getInitials } from '../../utils/validators';
import MyRoles from '../shared/MyRoles';
import NoticeForm from '../../components/NoticeForm';
import InviteForm from '../../components/InviteForm';
import InactiveSocietyOverlay from '../../components/InactiveSocietyOverlay';

const sidebarItems = [
    {
        title: 'Main',
        items: [
            { path: '', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/pending', label: 'Pending Approvals', icon: UserCheck },
            { path: '/invites', label: 'Invites', icon: Ticket },
            { path: '/vehicles', label: 'My Vehicles', icon: Car },
            { path: '/amenities', label: 'Amenities', icon: Building2 },
            { path: '/directory', label: 'Common Directory', icon: Briefcase },
            { path: '/community-board', label: 'Community Board', icon: Package },
            { path: '/staff', label: 'Staff Directory', icon: Contact },
            { path: '/docs', label: 'Knowledge Hub', icon: BookOpen },
            { path: '/complaints', label: 'Helpdesk', icon: ClipboardList },
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
    const { visitors, getSocietyById, refreshData } = useData();
    const [lastRefresh, setLastRefresh] = useState(Date.now());

    const society = getSocietyById(currentRole?.societyId);

    const handleRefresh = async () => {
        console.log('ResidentDashboard: Manual refresh triggered on home page');
        await refreshData();
        setLastRefresh(Date.now());
    };

    const myVisitors = visitors.filter(v => {
        // Handle both camelCase and lowercase field names
        const visitorResidentId = v.residentId || v.residentid;
        return visitorResidentId === currentUser?.id;
    });
    const pendingVisitors = myVisitors.filter(v => v.status === 'pending');
    const approvedToday = myVisitors.filter(v => {
        const today = new Date().toDateString();
        // Handle both camelCase and lowercase field names for entryTime
        const entryTime = v.entryTime || v.entrytime;
        return v.status === 'approved' && new Date(entryTime).toDateString() === today;
    });
    const blockedVisitors = myVisitors.filter(v => v.status === 'blocked' || v.status === 'pending_unblock');

    return (
        <div>
            <div className="flex-between mb-6">
                <div className="alert alert-info" style={{ marginBottom: 0 }}>
                    <span>
                        <strong>{society?.name}</strong> • Block {currentRole?.block}, Flat {currentRole?.flatNumber}
                    </span>
                </div>
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleRefresh}
                    title="Last refreshed: {new Date(lastRefresh).toLocaleTimeString()}"
                >
                    <Calendar size={16} />
                    Refresh
                </button>
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
    const { currentUser, currentRole } = useAuth();
    const { visitors, updateVisitor, refreshData, addDataItem } = useData();
    const [selectedVisitor, setSelectedVisitor] = useState(null);
    const [showBlockConfirm, setShowBlockConfirm] = useState(null);
    const [lastRefresh, setLastRefresh] = useState(Date.now());
    const [showDirectoryPrompt, setShowDirectoryPrompt] = useState(null);

    // Auto-refresh every 30 seconds to check for new visitors
    useEffect(() => {
        const interval = setInterval(async () => {
            console.log('ResidentDashboard: Auto-refresh checking for new visitors...');
            await refreshData();
            setLastRefresh(Date.now());
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [refreshData]);

    const pendingVisitors = visitors.filter(v => {
        // Handle both camelCase and lowercase field names
        const visitorResidentId = v.residentId || v.residentid;
        console.log('ResidentDashboard: Filtering visitor:', v, 'residentId match:', visitorResidentId === currentUser?.id);
        console.log('ResidentDashboard: Visitor fields:', {
            contactNumber: v.contactNumber || v.contactnumber,
            comingFrom: v.comingFrom || v.comingfrom,
            idProof: v.idProof || v.idproof,
            purpose: v.purpose
        });
        return visitorResidentId === currentUser?.id && v.status === 'pending';
    });

    const handleRefresh = async () => {
        console.log('ResidentDashboard: Manual refresh triggered');
        await refreshData();
        setLastRefresh(Date.now());
    };

    // Check if visitor should be suggested for directory
    const shouldSuggestDirectory = (visitor) => {
        const serviceKeywords = [
            'plumber', 'electrician', 'carpenter', 'painter', 'cleaning', 'cleaner',
            'pest', 'repair', 'ac', 'appliance', 'internet', 'cable', 'doctor',
            'nurse', 'tutor', 'teacher', 'healthcare', 'medical', 'service'
        ];
        
        const purpose = (visitor.purpose || '').toLowerCase();
        return serviceKeywords.some(keyword => purpose.includes(keyword));
    };

    const handleApprove = async (visitorId) => {
        await updateVisitor(visitorId, { status: 'approved' });
        
        // Check if we should suggest adding to directory
        const visitor = visitors.find(v => v.id === visitorId);
        if (visitor && shouldSuggestDirectory(visitor)) {
            setShowDirectoryPrompt(visitor);
        }
    };

    const handleAddToDirectory = async (directoryData) => {
        try {
            const societyId = currentRole?.societyId || currentRole?.societyid;
            await addDataItem('common_directory', {
                ...directoryData,
                societyId: societyId,
                addedBy: currentUser.id,
                addedByName: currentUser.name,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                verified: false,
                ratings: [],
                averageRating: 0
            });
            setShowDirectoryPrompt(null);
            alert('Service provider added to Common Directory!');
        } catch (error) {
            console.error('Error adding to directory:', error);
            alert('Failed to add to directory. Please try again.');
        }
    };

    const handleReject = (visitorId) => {
        updateVisitor(visitorId, { status: 'rejected' });
    };

    const handleBlock = (visitorId) => {
        updateVisitor(visitorId, {
            status: 'blocked',
            blockedBy: currentUser.id,
            blockedDate: new Date().toISOString()
        });
        setShowBlockConfirm(null);
    };

    return (
        <div>
            <div className="flex-between mb-6">
                <h2>Pending Approvals</h2>
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleRefresh}
                    title="Last refreshed: {new Date(lastRefresh).toLocaleTimeString()}"
                >
                    <Calendar size={16} />
                    Refresh
                </button>
            </div>

            {pendingVisitors.length === 0 ? (
                <EmptyState
                    icon={UserCheck}
                    title="No Pending Visitors"
                    description="All visitor requests have been handled. Click refresh to check for new visitors."
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
                                            <Phone size={14} /> {visitor.contactNumber || visitor.contactnumber || 'Not provided'}
                                        </div>
                                        <div className="flex gap-2" style={{ alignItems: 'center' }}>
                                            <MapPin size={14} /> {visitor.comingFrom || visitor.comingfrom || 'Not provided'}
                                        </div>
                                        <div className="flex gap-2" style={{ alignItems: 'center' }}>
                                            <FileText size={14} /> {visitor.purpose || 'Not provided'}
                                        </div>
                                        <div className="flex gap-2" style={{ alignItems: 'center' }}>
                                            <FileText size={14} /> ID: {visitor.idProof || visitor.idproof || 'Not provided'}
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
                                <span>{selectedVisitor.contactNumber || selectedVisitor.contactnumber || 'Not provided'}</span>
                            </div>
                            <div className="flex-between">
                                <span className="text-muted">Coming From:</span>
                                <span>{selectedVisitor.comingFrom || selectedVisitor.comingfrom || 'Not provided'}</span>
                            </div>
                            <div className="flex-between">
                                <span className="text-muted">Purpose:</span>
                                <span>{selectedVisitor.purpose || 'Not provided'}</span>
                            </div>
                            <div className="flex-between">
                                <span className="text-muted">ID Proof:</span>
                                <span>{selectedVisitor.idProof || selectedVisitor.idproof || 'Not provided'}</span>
                            </div>
                            <div className="flex-between">
                                <span className="text-muted">Entry Time:</span>
                                <span>{formatDateTime(selectedVisitor.entryTime || selectedVisitor.entrytime)}</span>
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

            {/* Add to Directory Prompt */}
            {showDirectoryPrompt && (
                <AddToDirectoryPrompt
                    visitor={showDirectoryPrompt}
                    onAdd={handleAddToDirectory}
                    onSkip={() => setShowDirectoryPrompt(null)}
                    onClose={() => setShowDirectoryPrompt(null)}
                />
            )}
        </div>
    );
};

// Visit History
const HistoryPage = () => {
    const { currentUser } = useAuth();
    const { visitors, updateVisitor, refreshData } = useData();
    const [showBlockConfirm, setShowBlockConfirm] = useState(null);
    const [lastRefresh, setLastRefresh] = useState(Date.now());

    const handleRefresh = async () => {
        console.log('HistoryPage: Manual refresh triggered');
        await refreshData();
        setLastRefresh(Date.now());
    };

    const myVisitors = visitors
        .filter(v => {
            // Handle both camelCase and lowercase field names
            const visitorResidentId = v.residentId || v.residentid;
            console.log('HistoryPage: Filtering visitor:', v, 'residentId match:', visitorResidentId === currentUser?.id);
            return visitorResidentId === currentUser?.id && v.status !== 'pending';
        })
        .sort((a, b) => {
            // Handle both camelCase and lowercase field names for entryTime
            const aEntryTime = a.entryTime || a.entrytime;
            const bEntryTime = b.entryTime || b.entrytime;
            return new Date(bEntryTime) - new Date(aEntryTime);
        });

    return (
        <div>
            <div className="flex-between mb-6">
                <h2>Visit History</h2>
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleRefresh}
                    title="Last refreshed: {new Date(lastRefresh).toLocaleTimeString()}"
                >
                    <Calendar size={16} />
                    Refresh
                </button>
            </div>

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
                                                    <div className="text-xs text-muted">{visitor.contactNumber || visitor.contactnumber || 'Not provided'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-muted">{visitor.purpose || 'Not provided'}</td>
                                        <td className="text-sm text-muted">{formatDateTime(visitor.entryTime || visitor.entrytime)}</td>
                                        <td className="text-sm text-muted">
                                            {visitor.exitTime || visitor.exittime ? formatDateTime(visitor.exitTime || visitor.exittime) : '—'}
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
                onConfirm={async () => {
                    await updateVisitor(showBlockConfirm.id, {
                        status: 'blocked',
                        blockedBy: currentUser.id,
                        blockedDate: new Date().toISOString()
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

    const blockedVisitors = visitors.filter(v => {
        const visitorResidentId = v.residentId || v.residentid;
        return visitorResidentId === currentUser?.id && (v.status === 'blocked' || v.status === 'pending_unblock');
    });

    const handleUnblock = (visitorId) => {
        updateVisitor(visitorId, {
            status: 'pending_unblock', // Needs admin approval
            unblockRequestedBy: currentUser.id,
            unblockRequestedDate: new Date().toISOString()
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
                                        <td className="text-muted">{visitor.contactNumber || visitor.contactnumber}</td>
                                        <td className="text-sm text-muted">{formatDateTime(visitor.blockedDate || visitor.blockeddate || visitor.entryTime || visitor.entrytime)}</td>
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
    const { currentUser, currentRole, triggerSOS, isSocietyActive, getSocietyById, loading } = useData();
    const [isSOSActive, setIsSOSActive] = useState(false);
    const [sosTimer, setSosTimer] = useState(null);
    const [sosProgress, setSosProgress] = useState(0);

    const roleSocietyId = currentRole?.societyId || currentRole?.societyid;
    const isActive = isSocietyActive(roleSocietyId);
    const society = getSocietyById(roleSocietyId);

    const startSOSTimer = () => {
        setSosProgress(0);
        const timer = setInterval(() => {
            setSosProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    handleTriggerSOS();
                    return 100;
                }
                return prev + 5;
            });
        }, 100);
        setSosTimer(timer);
    };

    const stopSOSTimer = () => {
        if (sosTimer) clearInterval(sosTimer);
        setSosTimer(null);
        setSosProgress(0);
    };

    const handleTriggerSOS = async () => {
        await triggerSOS(currentUser.id, currentRole.societyId, "Emergency alert triggered by resident");
        setIsSOSActive(true);
        setTimeout(() => setIsSOSActive(false), 5000);
    };

    return (
        <div className="app-container">
            {!loading && !isActive && <InactiveSocietyOverlay societyName={society?.name} />}
            <Sidebar items={sidebarItems} basePath="/resident" />
            <div className="main-content">
                <Header title="Resident Dashboard" />
                <div className="page-content">
                    <Routes>
                        <Route path="/" element={<DashboardHome />} />
                        <Route path="/pending" element={<PendingPage />} />
                        <Route path="/invites" element={<InvitesPage />} />
                        <Route path="/vehicles" element={<VehiclesPage />} />
                        <Route path="/amenities" element={<AmenitiesPage />} />
                        <Route path="/directory" element={<CommonDirectory />} />
                        <Route path="/community-board" element={<CommunityBoard />} />
                        <Route path="/staff" element={<StaffPage />} />
                        <Route path="/docs" element={<KnowledgeHubPage />} />
                        <Route path="/complaints" element={<ComplaintsPage />} />
                        <Route path="/notices" element={<NoticeBoardPage />} />
                        <Route path="/history" element={<HistoryPage />} />
                        <Route path="/blocked" element={<BlockedPage />} />
                        <Route path="/my-roles" element={<MyRoles />} />
                    </Routes>
                </div>
            </div>

            {/* SOS FAB */}
            <div
                className={`sos-fab ${isSOSActive ? 'active' : ''}`}
                onMouseDown={startSOSTimer}
                onMouseUp={stopSOSTimer}
                onMouseLeave={stopSOSTimer}
                onTouchStart={startSOSTimer}
                onTouchEnd={stopSOSTimer}
            >
                <div className="sos-progress" style={{ height: `${sosProgress}%` }}></div>
                <div className="sos-icon">
                    <AlertTriangle size={32} />
                    <span>SOS</span>
                </div>
                {isSOSActive && <div className="sos-status">ALERT SENT!</div>}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .sos-fab {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    width: 80px;
                    height: 80px;
                    background: var(--error-600);
                    border-radius: 50%;
                    box-shadow: 0 10px 25px rgba(220, 38, 38, 0.4);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    z-index: 1000;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    user-select: none;
                }

                .sos-fab:active {
                    transform: scale(0.9);
                }

                .sos-fab.active {
                    background: #000;
                    transform: scale(1.1);
                    animation: pulse-sos 1s infinite;
                }

                @keyframes pulse-sos {
                    0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
                    70% { box-shadow: 0 0 0 20px rgba(220, 38, 38, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
                }

                .sos-icon {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                    position: relative;
                    z-index: 2;
                }

                .sos-icon span {
                    font-size: 0.75rem;
                    font-weight: 800;
                    letter-spacing: 0.1em;
                }

                .sos-progress {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    background: rgba(0, 0, 0, 0.3);
                    transition: height 0.1s linear;
                    z-index: 1;
                }

                .sos-status {
                    position: absolute;
                    top: -40px;
                    right: 0;
                    background: #000;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    white-space: nowrap;
                }
            ` }} />
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addPreApproval({
                ...formData,
                residentId: currentUser.id,
                societyId: currentRole.societyId,
                passCode: Math.floor(100000 + Math.random() * 900000).toString() // Generate 6 digit code
            });
            setShowAddInvite(false);
            setFormData({ name: '', contactNumber: '', purpose: '', expectedDate: new Date().toISOString().split('T')[0], type: 'guest' });
        } catch (error) {
            console.error('Error adding pre-approval:', error);
        }
    };

    const handleCancelInvite = async (id) => {
        await updatePreApproval(id, { status: 'cancelled' });
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
                size="xl"
            >
                <InviteForm
                    onSubmit={handleSubmit}
                    onCancel={() => setShowAddInvite(false)}
                />
            </Modal>
        </div>
    );
};

// Vehicles Management Page
const VehiclesPage = () => {
    const { currentUser, currentRole } = useAuth();
    const { vehicles, addDataItem, deleteDataItem } = useData();
    const [showAdd, setShowAdd] = useState(false);
    const [formData, setFormData] = useState({ plateNumber: '', type: 'car', make: '', model: '' });

    const myVehicles = vehicles.filter(v => (v.residentId === currentUser.id || v.residentid === currentUser.id));

    const handleSubmit = async (e) => {
        e.preventDefault();
        await addDataItem('vehicles', { ...formData, residentId: currentUser.id, societyId: currentRole.societyId });
        setShowAdd(false);
        setFormData({ plateNumber: '', type: 'car', make: '', model: '' });
    };

    return (
        <div>
            <div className="flex-between mb-6">
                <h2>My Registered Vehicles</h2>
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                    <Plus size={18} />
                    Register Vehicle
                </button>
            </div>
            {myVehicles.length === 0 ? (
                <EmptyState icon={Car} title="No Vehicles Registered" description="Register your vehicles so security can easily identify and verify your entry." />
            ) : (
                <div className="grid-3">
                    {myVehicles.map(vehicle => (
                        <div key={vehicle.id} className="card vehicle-card animate-slideUp">
                            <div className="flex-between mb-4">
                                <div className={`vehicle-badge ${vehicle.type}`}>
                                    <Car size={20} />
                                    <span className="uppercase font-bold">{vehicle.type}</span>
                                </div>
                                <button className="btn-icon text-error-600" onClick={() => deleteDataItem('vehicles', vehicle.id)}><Trash2 size={16} /></button>
                            </div>
                            <div className="plate-number-box">{vehicle.plateNumber}</div>
                            <div className="vehicle-info"><span className="text-muted">{vehicle.make}</span><span className="font-semibold">{vehicle.model}</span></div>
                        </div>
                    ))}
                </div>
            )}
            <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Register New Vehicle">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Plate Number *</label>
                        <input type="text" className="form-input uppercase" placeholder="e.g. MH 12 AB 1234" value={formData.plateNumber} onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })} required />
                    </div>
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Type</label>
                            <select className="form-select" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                                <option value="car">Car / SUV</option>
                                <option value="bike">Two Wheeler</option>
                                <option value="ev">Electric Vehicle</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Make</label>
                            <input type="text" className="form-input" placeholder="e.g. Toyota, Honda" value={formData.make} onChange={(e) => setFormData({ ...formData, make: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Model</label>
                        <input type="text" className="form-input" placeholder="e.g. Camry, Civic" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
                    </div>
                    <button type="submit" className="btn btn-primary w-full mt-4">Register Vehicle</button>
                </form>
            </Modal>
            <style dangerouslySetInnerHTML={{
                __html: `
                .vehicle-card { border: 2px solid transparent; transition: all 0.2s; position: relative; }
                .vehicle-card:hover { border-color: var(--primary-500); }
                .vehicle-badge { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; }
                .vehicle-badge.car { background: var(--primary-100); color: var(--primary-700); }
                .vehicle-badge.bike { background: var(--warning-100); color: var(--warning-700); }
                .vehicle-badge.ev { background: var(--success-100); color: var(--success-700); }
                .plate-number-box { font-family: 'Inter', monospace; font-size: 1.5rem; font-weight: 800; letter-spacing: 0.1em; color: var(--text-main); margin: 1rem 0; padding: 0.5rem; background: var(--bg-secondary); border: 2px solid var(--border-color); border-radius: 8px; text-align: center; }
                .vehicle-info { display: flex; justify-content: space-between; font-size: 0.875rem; }
            ` }} />
        </div>
    );
};

// Helpdesk / Complaints Page
const ComplaintsPage = () => {
    const { currentUser, currentRole } = useAuth();
    const { complaints, addDataItem, updateDataItem } = useData();
    const [showAdd, setShowAdd] = useState(false);
    const [formData, setFormData] = useState({ category: 'plumbing', title: '', description: '', priority: 'normal' });
    const [attachments, setAttachments] = useState([]);

    const myComplaints = complaints.filter(c => (c.residentId === currentUser.id || c.residentid === currentUser.id));

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf';
            const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
            
            if (!isValidType) {
                alert(`${file.name} is not a valid file type. Only images and PDFs are allowed.`);
                return false;
            }
            if (!isValidSize) {
                alert(`${file.name} is too large. Maximum file size is 5MB.`);
                return false;
            }
            return true;
        });

        // Convert files to base64
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                setAttachments(prev => [...prev, {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: event.target.result
                }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await addDataItem('complaints', {
            ...formData,
            residentId: currentUser.id,
            societyId: currentRole.societyId,
            status: 'open',
            attachments: attachments,
            createdAt: new Date().toISOString()
        });
        setShowAdd(false);
        setFormData({ category: 'plumbing', title: '', description: '', priority: 'normal' });
        setAttachments([]);
    };

    return (
        <div>
            <div className="flex-between mb-6">
                <div>
                    <h2>Helpdesk & Complaints</h2>
                    <p className="text-muted text-sm">Raise issues and track their resolution status</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                    <Plus size={18} />
                    New Ticket
                </button>
            </div>

            {myComplaints.length === 0 ? (
                <EmptyState icon={ClipboardList} title="No Complaints Yet" description="If you have any issues with society services, raise a ticket here." />
            ) : (
                <div className="space-y-4">
                    {myComplaints.map(complaint => (
                        <div key={complaint.id} className="card complaint-card animate-slideUp">
                            <div className="flex-between gap-4">
                                <div className="flex gap-4">
                                    <div className={`category-icon-box ${complaint.category}`}>
                                        <ShieldAlert size={24} />
                                    </div>
                                    <div>
                                        <div className="flex gap-2 items-center">
                                            <h3 className="text-lg font-bold">{complaint.title}</h3>
                                            <StatusBadge status={complaint.status} />
                                            {complaint.priority === 'urgent' && <span className="badge badge-error">URGENT</span>}
                                        </div>
                                        <div className="text-sm text-muted mt-1">#{complaint.id.slice(0, 8)} • {formatDateTime(complaint.createdAt)}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold uppercase">{complaint.category}</div>
                                </div>
                            </div>
                            <div className="mt-4 p-4 bg-glass rounded-lg text-sm">{complaint.description}</div>
                            
                            {/* Display Attachments */}
                            {complaint.attachments && complaint.attachments.length > 0 && (
                                <div className="mt-4">
                                    <div className="text-xs font-bold text-muted mb-2">ATTACHMENTS ({complaint.attachments.length})</div>
                                    <div className="flex gap-2 flex-wrap">
                                        {complaint.attachments.map((file, idx) => (
                                            <a
                                                key={idx}
                                                href={file.data}
                                                download={file.name}
                                                className="flex items-center gap-2 px-3 py-2 bg-glass rounded-lg text-sm hover:bg-primary-900/30 transition-colors"
                                                style={{ textDecoration: 'none' }}
                                            >
                                                {file.type.startsWith('image/') ? (
                                                    <FileImage size={16} />
                                                ) : (
                                                    <FileText size={16} />
                                                )}
                                                <span>{file.name}</span>
                                                <span className="text-xs text-muted">({(file.size / 1024).toFixed(1)}KB)</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {complaint.remarks && (
                                <div className="mt-4 p-4 bg-primary-900/30 border-l-4 border-primary-500 rounded-r-lg">
                                    <div className="text-xs font-bold text-primary-400 mb-1">ADMIN REMARKS</div>
                                    <div className="text-sm">{complaint.remarks}</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setAttachments([]); }} title="Raise New Support Request">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Subject *</label>
                        <input type="text" className="form-input" placeholder="Brief title of the issue" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                    </div>
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select className="form-select" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                <option value="plumbing">Plumbing</option>
                                <option value="electrical">Electrical</option>
                                <option value="security">Security</option>
                                <option value="cleaning">Cleaning / Housekeeping</option>
                                <option value="parking">Parking</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <select className="form-select" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                                <option value="normal">Normal</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description *</label>
                        <textarea className="form-input" rows="4" placeholder="Describe the issue in detail..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required></textarea>
                    </div>
                    
                    {/* File Attachments */}
                    <div className="form-group">
                        <label className="form-label">Attachments (Images/PDF)</label>
                        <div style={{
                            border: '2px dashed var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-4)',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = 'var(--primary-500)';
                            e.currentTarget.style.background = 'var(--primary-900/10)';
                        }}
                        onDragLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.background = 'transparent';
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.background = 'transparent';
                            const files = e.dataTransfer.files;
                            handleFileChange({ target: { files } });
                        }}
                        onClick={() => document.getElementById('complaint-file-input').click()}>
                            <FileText size={32} style={{ margin: '0 auto 8px', color: 'var(--text-secondary)' }} />
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Click to upload or drag and drop
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                                Images (JPG, PNG) or PDF (Max 5MB each)
                            </div>
                        </div>
                        <input
                            id="complaint-file-input"
                            type="file"
                            accept="image/*,.pdf"
                            multiple
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        
                        {/* Display Selected Files */}
                        {attachments.length > 0 && (
                            <div style={{ marginTop: 'var(--space-3)' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: 'var(--space-2)', color: 'var(--text-secondary)' }}>
                                    SELECTED FILES ({attachments.length})
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                    {attachments.map((file, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: 'var(--space-2) var(--space-3)',
                                            background: 'var(--bg-glass)',
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: '0.875rem'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                {file.type.startsWith('image/') ? (
                                                    <FileImage size={16} />
                                                ) : (
                                                    <FileText size={16} />
                                                )}
                                                <span>{file.name}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                    ({(file.size / 1024).toFixed(1)}KB)
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(idx)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: 'var(--error-500)',
                                                    padding: '4px'
                                                }}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <button type="submit" className="btn btn-primary w-full mt-4">Submit Complaint</button>
                </form>
            </Modal>

            <style dangerouslySetInnerHTML={{
                __html: `
                .complaint-card { border-left: 4px solid var(--border-color); }
                .category-icon-box { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: var(--bg-tertiary); color: var(--primary-400); }
                .category-icon-box.plumbing { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .category-icon-box.electrical { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .badge-error { background: var(--error-600); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 800; }
            ` }} />
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

// Knowledge Hub / Documents Page
const KnowledgeHubPage = () => {
    const { currentRole } = useAuth();
    const { documents } = useData();

    const societyDocs = documents.filter(d => (d.societyId === currentRole.societyId || d.societyid === currentRole.societyId));

    const categories = ['All', 'Bye-Laws', 'Circulars', 'Rules', 'Forms'];
    const [filter, setFilter] = useState('All');

    const filteredDocs = filter === 'All' ? societyDocs : societyDocs.filter(d => d.category === filter);

    return (
        <div>
            <div className="flex-between mb-6">
                <div>
                    <h2>Society Knowledge Hub</h2>
                    <p className="text-muted text-sm">Access important society documents and guidelines</p>
                </div>
            </div>

            <div className="tabs mb-8">
                {categories.map(cat => (
                    <button key={cat} className={`tab ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>
                        {cat}
                    </button>
                ))}
            </div>

            {filteredDocs.length === 0 ? (
                <EmptyState icon={BookOpen} title="No Documents" description="There are no documents in this category yet." />
            ) : (
                <div className="grid-3">
                    {filteredDocs.map(doc => (
                        <div key={doc.id} className="card doc-card animate-slideUp">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary-900/20 rounded-xl text-primary-400">
                                    <FileText size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold mb-1">{doc.title}</h3>
                                    <div className="flex-between">
                                        <span className="text-xs font-bold uppercase text-muted tracking-wider">{doc.category}</span>
                                        <span className="text-xs text-muted">{new Date(doc.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-xs flex-1">
                                            View PDF
                                        </a>
                                        <button className="btn btn-ghost btn-xs">
                                            Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .doc-card { transition: all 0.3s; border: 1px solid var(--border-color); }
                .doc-card:hover { border-color: var(--primary-500); transform: translateY(-3px); box-shadow: var(--shadow-glow-sm); }
            ` }} />
        </div>
    );
};

// Staff Directory Page
const StaffPage = () => {
    const { currentRole } = useAuth();
    const { staff } = useData();

    const societyStaff = staff.filter(s => (s.societyId === currentRole.societyId || s.societyid === currentRole.societyId));

    return (
        <div>
            <div className="flex-between mb-6">
                <div>
                    <h2>Society Staff Directory</h2>
                    <p className="text-muted text-sm">Verified daily help and society maintenance staff</p>
                </div>
            </div>

            {societyStaff.length === 0 ? (
                <EmptyState icon={Contact} title="No Staff Registered" description="The society hasn't added any staff members yet." />
            ) : (
                <div className="grid-3">
                    {societyStaff.map(member => (
                        <div key={member.id} className="card staff-card animate-slideUp">
                            <div className="flex gap-4">
                                {member.photo ? (
                                    <img src={member.photo} alt={member.name} className="staff-avatar" />
                                ) : (
                                    <div className="staff-avatar-placeholder">{getInitials(member.name)}</div>
                                )}
                                <div>
                                    <h3 className="font-bold">{member.name}</h3>
                                    <div className="text-primary-400 text-sm font-semibold uppercase">{member.role}</div>
                                    <div className="flex gap-2 text-muted text-xs mt-2">
                                        <Phone size={12} />
                                        {member.mobile}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-glass flex justify-between items-center">
                                <span className={`gate-status-dot ${member.atGate ? 'active' : ''}`}></span>
                                <span className="text-xs text-muted">{member.atGate ? 'Currently INSIDE' : 'Currently OUTSIDE'}</span>
                                <button className="btn btn-ghost btn-xs">View History</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .staff-card { transition: all 0.3s; border: 1px solid var(--border-color); }
                .staff-card:hover { border-color: var(--primary-500); transform: translateY(-3px); }
                .staff-avatar { width: 64px; height: 64px; border-radius: 16px; object-fit: cover; }
                .staff-avatar-placeholder { width: 64px; height: 64px; border-radius: 16px; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; font-weight: bold; color: var(--primary-400); font-size: 1.25rem; }
                .gate-status-dot { width: 8px; height: 8px; border-radius: 50%; background: #6b7280; }
                .gate-status-dot.active { background: #10b981; box-shadow: 0 0 10px #10b981; }
            ` }} />
        </div>
    );
};

// Amenities Booking Page
const AmenitiesPage = () => {
    const { currentRole, currentUser } = useAuth();
    const { amenities, bookings, addDataItem, deleteDataItem } = useData();
    const [selectedAmenity, setSelectedAmenity] = useState(null);
    const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSlot, setSelectedSlot] = useState('');

    const slots = [
        "06:00 - 08:00", "08:00 - 10:00", "10:00 - 12:00",
        "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00", "20:00 - 22:00"
    ];

    const societyAmenities = amenities.filter(a => (a.societyId === currentRole.societyId || a.societyid === currentRole.societyId));
    const myBookings = bookings.filter(b => (b.residentId === currentUser.id || b.residentid === currentUser.id));

    const handleBook = async () => {
        if (!selectedSlot) return;
        await addDataItem('bookings', {
            amenityId: selectedAmenity.id,
            residentId: currentUser.id,
            societyId: currentRole.societyId,
            date: bookingDate,
            slot: selectedSlot,
            status: 'confirmed',
            createdAt: new Date().toISOString()
        });
        setSelectedAmenity(null);
        setSelectedSlot('');
    };

    return (
        <div>
            <div className="flex-between mb-6">
                <div>
                    <h2>Amenities & Facilities</h2>
                    <p className="text-muted text-sm">Book society facilities for your use</p>
                </div>
            </div>

            <div className="tabs mb-8">
                <button className="tab active">Available Amenities</button>
                <button className="tab">My Bookings ({myBookings.length})</button>
            </div>

            {societyAmenities.length === 0 ? (
                <EmptyState icon={Building2} title="No Amenities Listed" description="The society hasn't listed any amenities yet." />
            ) : (
                <div className="grid-3">
                    {societyAmenities.map(amenity => (
                        <div key={amenity.id} className="card amenity-card animate-slideUp">
                            <div className="amenity-image-placeholder">
                                <Building2 size={48} />
                            </div>
                            <div className="p-5">
                                <h3 className="text-xl font-bold mb-2">{amenity.name}</h3>
                                <p className="text-sm text-muted mb-4 line-clamp-2">{amenity.description}</p>
                                <div className="flex-between text-xs font-semibold uppercase tracking-wider text-primary-400 mb-4">
                                    <span>Capacity: {amenity.capacity}</span>
                                    <span>Rules: {amenity.rules ? 'View' : 'None'}</span>
                                </div>
                                <button className="btn btn-primary w-full" onClick={() => setSelectedAmenity(amenity)}>
                                    Book Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={!!selectedAmenity} onClose={() => setSelectedAmenity(null)} title={`Book ${selectedAmenity?.name}`}>
                {selectedAmenity && (
                    <div className="space-y-6">
                        <div className="p-4 bg-glass rounded-xl border border-primary-500/20">
                            <h4 className="font-bold text-primary-400 mb-1">AMENITY RULES</h4>
                            <p className="text-sm opacity-80">{selectedAmenity.rules || "Standard society rules apply."}</p>
                        </div>

                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Select Date</label>
                                <input type="date" className="form-input" min={new Date().toISOString().split('T')[0]} value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Time Slot</label>
                                <select className="form-select" value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)}>
                                    <option value="">Select a slot</option>
                                    {slots.map(slot => (
                                        <option key={slot} value={slot}>{slot}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="alert alert-info py-3 px-4 text-sm">
                            <CheckCircle2 size={16} />
                            <span>Booking will be automatically confirmed based on availability.</span>
                        </div>

                        <button className="btn btn-primary btn-lg w-full mt-2" onClick={handleBook} disabled={!selectedSlot}>
                            Confirm Booking
                        </button>
                    </div>
                )}
            </Modal>

            <style dangerouslySetInnerHTML={{
                __html: `
                .amenity-card { padding: 0; overflow: hidden; border: 1px solid var(--border-color); transition: all 0.3s; }
                .amenity-card:hover { transform: translateY(-5px); border-color: var(--primary-500); box-shadow: var(--shadow-glow-sm); }
                .amenity-image-placeholder { height: 160px; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; color: var(--primary-500); position: relative; }
                .amenity-image-placeholder::after { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 50%; background: linear-gradient(to top, var(--bg-card), transparent); }
            ` }} />
        </div>
    );
};
