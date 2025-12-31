import { Inbox } from 'lucide-react';

const EmptyState = ({
    icon: Icon = Inbox,
    title = 'No data',
    description = 'There are no items to display.',
    action
}) => {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                <Icon size={40} />
            </div>
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-text">{description}</p>
            {action && (
                <div className="mt-6">
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
