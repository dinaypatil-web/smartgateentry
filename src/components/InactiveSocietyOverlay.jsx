import React from 'react';
import { ShieldAlert, Calendar, Mail } from 'lucide-react';

const InactiveSocietyOverlay = ({ societyName }) => {
    return (
        <div className="inactive-overlay">
            <div className="inactive-card animate-bounce-subtle">
                <div className="inactive-icon">
                    <ShieldAlert size={48} />
                </div>
                <h2>Permission Expired</h2>
                <p>
                    The permission period for <strong>{societyName}</strong> has ended.
                    All operations have been suspended.
                </p>

                <div className="inactive-info">
                    <div className="info-item">
                        <Calendar size={18} />
                        <span>Contact Superadmin for renewal</span>
                    </div>
                </div>

                <div className="inactive-footer">
                    <p>Access will be restored once the permission period is extended.</p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .inactive-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(15, 23, 42, 0.85);
                    backdrop-filter: blur(8px);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }

                .inactive-card {
                    background: var(--bg-primary);
                    max-width: 500px;
                    width: 100%;
                    padding: 3rem;
                    border-radius: 2rem;
                    text-align: center;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    border: 1px solid var(--error-500);
                }

                .inactive-icon {
                    width: 80px;
                    height: 80px;
                    background: var(--error-100);
                    color: var(--error-600);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                }

                .inactive-card h2 {
                    font-size: 2rem;
                    font-weight: 800;
                    color: var(--text-main);
                    margin-bottom: 1rem;
                }

                .inactive-card p {
                    color: var(--text-muted);
                    font-size: 1.1rem;
                    line-height: 1.6;
                    margin-bottom: 2rem;
                }

                .inactive-info {
                    background: var(--bg-secondary);
                    padding: 1.5rem;
                    border-radius: 1rem;
                    margin-bottom: 2rem;
                }

                .info-item {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    color: var(--text-main);
                    font-weight: 600;
                }

                .inactive-footer {
                    font-size: 0.875rem;
                    color: var(--text-muted);
                }

                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                .animate-bounce-subtle {
                    animation: bounce-subtle 4s ease-in-out infinite;
                }
            `}} />
        </div>
    );
};

export default InactiveSocietyOverlay;
