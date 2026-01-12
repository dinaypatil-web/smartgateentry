import React, { useState, useRef } from 'react';
import { Megaphone, AlertCircle, Send, X, Clock, Paperclip, Link as LinkIcon, Image as ImageIcon, FileText, Trash2, Plus } from 'lucide-react';

const NoticeForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        priority: 'normal'
    });
    const [attachments, setAttachments] = useState([]);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("File too large. Max 5MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const type = file.type.startsWith('image/') ? 'image' : 'pdf';
            setAttachments([...attachments, {
                type,
                url: e.target.result,
                name: file.name
            }]);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleAddLink = () => {
        if (!linkUrl) return;
        setAttachments([...attachments, {
            type: 'link',
            url: linkUrl,
            name: linkUrl
        }]);
        setLinkUrl('');
        setShowLinkInput(false);
    };

    const removeAttachment = (index) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ ...formData, attachments });
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

                    <div className="form-group mb-4">
                        <label className="form-label">Attachments</label>

                        {attachments.length > 0 && (
                            <div className="attachment-list mb-3">
                                {attachments.map((att, index) => (
                                    <div key={index} className="attachment-item">
                                        <div className="flex gap-2 items-center overflow-hidden">
                                            {att.type === 'image' && <ImageIcon size={16} className="text-primary-500" />}
                                            {att.type === 'pdf' && <FileText size={16} className="text-error-500" />}
                                            {att.type === 'link' && <LinkIcon size={16} className="text-info-500" />}
                                            <span className="text-sm truncate">{att.name}</span>
                                        </div>
                                        <button type="button" onClick={() => removeAttachment(index)} className="text-muted hover:text-error-500">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*,application/pdf"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />

                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Paperclip size={14} />
                                Attach File
                            </button>

                            <button
                                type="button"
                                className={`btn btn-sm ${showLinkInput ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setShowLinkInput(!showLinkInput)}
                            >
                                <LinkIcon size={14} />
                                Add Link
                            </button>
                        </div>

                        {showLinkInput && (
                            <div className="flex gap-2 mt-2 animate-fadeIn">
                                <input
                                    type="url"
                                    className="form-input text-sm"
                                    placeholder="https://example.com"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                />
                                <button type="button" className="btn btn-primary btn-sm" onClick={handleAddLink}>
                                    <Plus size={14} />
                                </button>
                            </div>
                        )}
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

                                {attachments.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-border">
                                        <div className="text-xs font-semibold text-muted mb-2 uppercase tracking-wider">Attachments</div>
                                        <div className="space-y-2">
                                            {attachments.map((att, index) => (
                                                <div key={index} className="p-2 bg-background rounded-lg border border-border flex gap-3 items-center">
                                                    <div className="w-8 h-8 rounded bg-soft flex items-center justify-center flex-shrink-0">
                                                        {att.type === 'image' && <ImageIcon size={16} />}
                                                        {att.type === 'pdf' && <FileText size={16} />}
                                                        {att.type === 'link' && <LinkIcon size={16} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium truncate">{att.name}</div>
                                                        <div className="text-xs text-muted capitalize">{att.type}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
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

                .attachment-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .attachment-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.5rem;
                    background: var(--bg-soft);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-color);
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
