import { Megaphone, Trash2, Link as LinkIcon, Image as ImageIcon, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import EmptyState from './EmptyState';

const NoticeBoard = ({ isAdmin = false }) => {
    const { currentRole } = useAuth();
    const { getNoticesBySociety, deleteNotice } = useData();
    const notices = getNoticesBySociety(currentRole?.societyId);

    return (
        <div className="space-y-4">
            {notices.length === 0 ? (
                <EmptyState
                    icon={Megaphone}
                    title="No Active Notices"
                    description="Important announcements from your society admin will appear here."
                />
            ) : (
                notices.map(notice => (
                    <div key={notice.id} className="card animate-fadeIn">
                        <div className="flex-between mb-3">
                            <div className="flex gap-3 align-start">
                                <div className={`stat-icon ${notice.priority === 'urgent' ? 'bg-error-500' : 'bg-primary-500'}`} style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Megaphone size={20} color="white" />
                                </div>
                                <div>
                                    <div className="font-semibold text-lg">{notice.title}</div>
                                    <div className="text-xs text-muted">{new Date(notice.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                            {isAdmin && (
                                <button className="btn btn-ghost btn-sm text-error-500" onClick={() => deleteNotice(notice.id)}>
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                        <div className="text-secondary leading-relaxed">
                            {notice.content}
                        </div>

                        {notice.attachments && notice.attachments.length > 0 && (
                            <div className="mt-4 grid gap-2">
                                {notice.attachments.map((att, index) => (
                                    <a
                                        key={index}
                                        href={att.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-soft rounded-lg border border-border flex gap-3 items-center hover:bg-muted transition-colors"
                                        style={{ textDecoration: 'none', color: 'inherit', background: 'var(--bg-tertiary)' }}
                                    >
                                        <div className="w-10 h-10 rounded bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-primary-500">
                                            {att.type === 'image' && <ImageIcon size={20} />}
                                            {att.type === 'pdf' && <FileText size={20} className="text-error-500" />}
                                            {att.type === 'link' && <LinkIcon size={20} className="text-info-500" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate text-sm">{att.name}</div>
                                            <div className="text-xs text-muted flex items-center gap-1">
                                                {att.type === 'link' ? 'Open Link' : 'View Attachment'}
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                        {notice.priority === 'urgent' && (
                            <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-error-500 uppercase tracking-wider">
                                <span className="flex h-2 w-2 rounded-full bg-error-500 animate-pulse"></span>
                                Urgent Notice
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default NoticeBoard;
