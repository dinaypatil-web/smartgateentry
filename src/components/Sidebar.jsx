import { NavLink } from 'react-router-dom';
import { Home, X } from 'lucide-react';
import { useUI } from '../context/UIContext';

const Sidebar = ({ items, basePath }) => {
    const { mobileSidebarOpen, setMobileSidebarOpen } = useUI();

    return (
        <>
            <aside className={`sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
                <button
                    className="sidebar-close"
                    onClick={() => setMobileSidebarOpen(false)}
                    aria-label="Close Menu"
                >
                    <X size={20} />
                </button>

                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">
                            <Home size={22} />
                        </div>
                        <span className="sidebar-logo-text">GateEntry</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {items.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="nav-section">
                            {section.title && (
                                <div className="nav-section-title">{section.title}</div>
                            )}
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={`${basePath}${item.path}`}
                                    className={({ isActive }) =>
                                        `nav-item ${isActive ? 'active' : ''}`
                                    }
                                    end={item.path === '' || item.path === '/'}
                                    onClick={() => setMobileSidebarOpen(false)}
                                >
                                    <item.icon size={20} />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>
            </aside>
            <div
                className="sidebar-backdrop"
                onClick={() => setMobileSidebarOpen(false)}
            />
        </>
    );
};

export default Sidebar;
