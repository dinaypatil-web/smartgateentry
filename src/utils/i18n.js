const translations = {
    en: {
        dashboard: "Dashboard",
        visitors: "Visitors",
        residents: "Residents",
        security: "Security",
        sos: "SOS",
        emergency: "EMERGENCY ALERT",
        settings: "Settings",
        profile: "Profile",
        logout: "Sign Out",
        analytics: "Analytics",
        notices: "Notices",
        active_visits: "Active Visits",
        staff: "Staff Management"
    },
    hi: {
        dashboard: "डैशबोर्ड",
        visitors: "आगंतुक",
        residents: "निवासी",
        security: "सुरक्षा",
        sos: "एसओएस",
        emergency: "आपातकालीन चेतावनी",
        settings: "सेटिंग्स",
        profile: "प्रोफ़ाइल",
        logout: "साइन आउट",
        analytics: "एनालिटिक्स",
        notices: "सूचना पट्ट",
        active_visits: "सक्रिय विजिट",
        staff: "कर्मचारी प्रबंधन"
    },
    mr: {
        dashboard: "डॅशबोर्ड",
        visitors: "अभ्यागत",
        residents: "रहिवासी",
        security: "सुरक्षा",
        sos: "एसओएस",
        emergency: "आणीबाणीची चेतावणी",
        settings: "सेटिंग्ज",
        profile: "प्रोफाइल",
        logout: "बाहेर पडा",
        analytics: "अॅनालिटिक्स",
        notices: "सूचना फलक",
        active_visits: "सक्रिय भेटी",
        staff: "कर्मचारी व्यवस्थापन"
    }
};

export const getTranslation = (key) => {
    const lang = localStorage.getItem('lang') || 'en';
    return translations[lang]?.[key] || translations['en'][key] || key;
};

export const t = getTranslation;
