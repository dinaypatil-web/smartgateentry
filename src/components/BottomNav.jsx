import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, User, ShieldAlert, Bell } from 'lucide-react';

const BottomNav = ({ items, basePath }) => {
    if (!items || items.length === 0) return null;

    // Flatten items or pick specific ones for bottom nav
    // Usually we only show the first 4-5 items in a bottom nav
    const navItems = items[0].items.slice(0, 5);

    return (
        <nav className="bottom-nav">
            <div className="bottom-nav-container">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={`${basePath}${item.path}`}
                        className={({ isActive }) =>
                            `bottom-nav-item ${isActive ? 'active' : ''}`
                        }
                        end={item.path === '' || item.path === '/'}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;
