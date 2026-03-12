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
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [language, setLanguage] = useState(localStorage.getItem('lang') || 'en');
    const location = useLocation();

    // Persist theme and apply class to document element
    useEffect(() => {
        localStorage.setItem('theme', theme);
        if (theme === 'light') {
            document.documentElement.classList.add('light-theme');
        } else {
            document.documentElement.classList.remove('light-theme');
        }
    }, [theme]);

    // Persist language
    useEffect(() => {
        localStorage.setItem('lang', language);
    }, [language]);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setMobileSidebarOpen(false);
    }, [location]);

    const toggleMobileSidebar = () => {
        setMobileSidebarOpen(prev => !prev);
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const changeLanguage = (lang) => {
        localStorage.setItem('lang', lang);
        setLanguage(lang);
    };

    const value = {
        mobileSidebarOpen,
        setMobileSidebarOpen,
        toggleMobileSidebar,
        theme,
        toggleTheme,
        language,
        changeLanguage
    };

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
};

export default UIContext;
