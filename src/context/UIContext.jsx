import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const UIContext = createContext(null);

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};

export const UIProvider = ({ children }) => {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const location = useLocation();

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setMobileSidebarOpen(false);
    }, [location]);

    const toggleMobileSidebar = () => {
        setMobileSidebarOpen(prev => !prev);
    };

    const value = {
        mobileSidebarOpen,
        setMobileSidebarOpen,
        toggleMobileSidebar
    };

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
};

export default UIContext;
