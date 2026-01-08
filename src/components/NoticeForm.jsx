import React, { useState } from 'react';
import { Megaphone, AlertCircle, Send, X, Clock } from 'lucide-react';

const NoticeForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        priority: 'normal'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="notice-form-container">
            <div className="form-preview-split">
                {/* Form Section */}
                <form onSubmit={handleSubmit} className="notice-form-main">
                    <div className="form-group mb-4">
                        <label className="form-label">Notice Title</label>
                        <input
                            type="text"
                            name="title"
                            className="form-input"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Annual General Meeting"
                            autoComplete="off"
                        />
                    </div>

                    <div className="form-group mb-4">
                        <label className="form-label">Priority Level</label>
                        <div className="priority-selector">
                            <label className={`priority-option ${formData.priority === 'normal' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="priority"
                                    value="normal"
                                    checked={formData.priority === 'normal'}
                                    onChange={handleChange}
                                />
                                <div className="priority-dot normal"></div>
                                <span>Normal</span>
                            </label>
                            <label className={`priority-option ${formData.priority === 'urgent' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="priority"
                                    value="urgent"
                                    checked={formData.priority === 'urgent'}
                                    onChange={handleChange}
                                />
                                <div className="priority-dot urgent"></div>
                                <span>Urgent</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-group mb-4">
                        <label className="form-label">Notice Content</label>
                        <textarea
                            name="content"
                            className="form-textarea"
                            rows="6"
                            value={formData.content}
                            onChange={handleChange}
                            required
                            placeholder="Write your announcement details here..."
                        ></textarea>
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            <X size={18} />
                            Discard
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={!formData.title || !formData.content}>
                            <Send size={18} />
                            Publish Notice
                        </button>
                    </div>
                </form>

                {/* Preview Section */}
                <div className="notice-preview-section">
                    <div className="preview-header">
                        <Clock size={16} />
                        <span>Live Preview</span>
                    </div>

                    <div className="preview-content">
                        <div className={`preview-card ${formData.priority}`}>
                            <div className="preview-card-header">
                                <div className="preview-icon">
                                    <Megaphone size={20} />
                                </div>
                                <div className="preview-meta">
                                    <span className="preview-title">{formData.title || 'Notice Title'}</span>
                                    <span className="preview-date">{new Date().toLocaleDateString()}</span>
                                </div>
                                {formData.priority === 'urgent' && (
                                    <div className="urgent-tag">
                                        <AlertCircle size={12} />
                                        <span>URGENT</span>
                                    </div>
                                )}
                            </div>
                            <div className="preview-body">
                                {formData.content || 'Your notice content goes here. Start typing in the form to see it exactly as the residents will see it.'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .notice-form-container {
                    width: 100%;
                }
                .form-preview-split {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 2rem;
                    align-items: start;
                }
                
                @media (max-width: 992px) {
                    .form-preview-split {
                        grid-template-columns: 1fr;
                    }
                }

                .priority-selector {
                    display: flex;
                    gap: 1rem;
                    background: var(--bg-glass);
                    padding: 4px;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border-color);
                }

                .priority-option {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.5rem;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    position: relative;
                }

                .priority-option input {
                    position: absolute;
                    opacity: 0;
                }

                .priority-option.active {
                    background: var(--bg-tertiary);
                    box-shadow: var(--shadow-sm);
                    border: 1px solid var(--border-active);
                }

                .priority-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }

                .priority-dot.normal { background: var(--primary-500); }
                .priority-dot.urgent { background: var(--error-500); }

                .notice-preview-section {
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: var(--radius-xl);
                    border: 1px dashed var(--border-color);
                    padding: 1.5rem;
                }

                .preview-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin-bottom: 1rem;
                }

                .preview-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    padding: 1.25rem;
                    transition: all var(--transition-base);
                }

                .preview-card.urgent {
                    border-left: 4px solid var(--error-500);
                }

                .preview-card-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .preview-icon {
                    width: 36px;
                    height: 36px;
                    background: var(--gradient-primary);
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                }

                .preview-card.urgent .preview-icon {
                    background: linear-gradient(135deg, var(--error-500), var(--error-600));
                }

                .preview-meta {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .preview-title {
                    font-weight: 600;
                    color: var(--text-primary);
                    font-size: 1rem;
                    line-height: 1.2;
                }

                .preview-date {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                }

                .urgent-tag {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: var(--error-50);
                    color: var(--error-600);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.6rem;
                    font-weight: 700;
                }

                .preview-body {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    line-height: 1.5;
                    white-space: pre-wrap;
                }
            ` }} />
        </div>
    );
};

export default NoticeForm;
