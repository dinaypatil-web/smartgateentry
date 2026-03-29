import { useEffect, useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, X } from 'lucide-react';

// Generates a pleasant ding-dong chime sound
const playChime = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        const audioCtx = new AudioContext();
        
        const playTone = (freq, delay) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.frequency.value = freq;
            osc.type = 'sine';
            
            gain.gain.setValueAtTime(0, audioCtx.currentTime + delay);
            gain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + delay + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + 1.5);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(audioCtx.currentTime + delay);
            osc.stop(audioCtx.currentTime + delay + 1.5);
        };
        
        playTone(659.25, 0); // E5
        playTone(523.25, 0.4); // C5
    } catch(e) {
        console.warn("Audio playback prevented by browser auto-play policy", e);
    }
};

export default function VisitorNotification() {
    const { visitors, loading } = useData();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const knownVisitorIds = useRef(new Set());
    const isInitialLoad = useRef(true);

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        // Wait until initial data fetch completes before observing changes
        if (!currentUser || !visitors || loading) return;
        
        const residentVisitors = visitors.filter(v => {
            const resId = v.residentId || v.residentid;
            return resId === currentUser.id && v.status === 'pending';
        });

        if (isInitialLoad.current) {
            // Populate known IDs without triggering notifications for the pre-existing ones on page load
            residentVisitors.forEach(v => knownVisitorIds.current.add(v.id));
            isInitialLoad.current = false;
            return;
        }

        const newVisitors = residentVisitors.filter(v => !knownVisitorIds.current.has(v.id));
        
        if (newVisitors.length > 0) {
            // New visitors detected!
            newVisitors.forEach(v => knownVisitorIds.current.add(v.id));
            
            // Add to UI notifications
            setNotifications(prev => [...newVisitors, ...prev].slice(0, 3)); // Keep max 3 visible at once
            
            // Play sound
            playChime();

            // Native browser notification (works when tab is in background)
            if ('Notification' in window && Notification.permission === 'granted') {
                newVisitors.forEach(v => {
                    const notice = new Notification('SmartGate: Visitor Alert', {
                        body: `${v.name} is waiting at the gate for your approval.`,
                        icon: '/favicon.ico',
                        requireInteraction: true
                    });
                    notice.onclick = () => {
                        window.focus();
                        navigate('/resident/pending');
                        notice.close();
                    };
                });
            }
        }
    }, [visitors, currentUser, loading, navigate]);

    // Cleanup notifications that were resolved outside the toast (e.g. approved on the page)
    useEffect(() => {
        setNotifications(prev => {
            return prev.filter(notification => {
                const currentVisitorState = visitors.find(v => v.id === notification.id);
                // If the visitor was removed or their status is no longer pending, remove toast
                if (!currentVisitorState || currentVisitorState.status !== 'pending') {
                    return false;
                }
                return true;
            });
        });
    }, [visitors]);

    const dismiss = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleAction = (id) => {
        dismiss(id);
        navigate('/resident/pending');
    };

    if (notifications.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}>
            {notifications.map(visitor => (
                <div key={visitor.id} style={{
                    background: 'var(--bg-card, #1e293b)',
                    border: '1px solid var(--border-color, #334155)',
                    borderLeft: '4px solid var(--primary-500, #3b82f6)',
                    padding: '16px',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    width: '320px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    animation: 'slideUp 0.3s ease-out forwards'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-primary, #f8fafc)'}}>
                            <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary-400, #60a5fa)', padding: '6px', borderRadius: '50%', display: 'flex' }}>
                                <Bell size={18} />
                            </div>
                            <strong style={{ fontSize: '1rem' }}>New Visitor Alert!</strong>
                        </div>
                        <button onClick={() => dismiss(visitor.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted, #94a3b8)', cursor: 'pointer', padding: '4px' }}>
                            <X size={16} />
                        </button>
                    </div>
                    
                    <div style={{ color: 'var(--text-secondary, #cbd5e1)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                        <strong style={{ color: 'var(--text-primary, #f8fafc)' }}>{visitor.name}</strong> has arrived at the gate and is waiting for approval.
                        <div style={{ marginTop: '4px', fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)' }}>
                            Purpose: {visitor.purpose || 'Not specified'}
                        </div>
                    </div>

                    <button 
                        onClick={() => handleAction(visitor.id)}
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', marginTop: '4px', padding: '8px 0', fontWeight: '500' }}
                    >
                        Review Request
                    </button>
                </div>
            ))}
        </div>
    );
}
