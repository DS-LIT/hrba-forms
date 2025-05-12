import React, { createContext, useState, useContext, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from '../theme';

interface ThemeContextProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => {
        setIsDarkMode((prevMode) => !prevMode);
    };

    const theme = isDarkMode ? darkTheme : lightTheme;

    // Inject theme colors as CSS variables
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', theme.palette.primary.main);
        root.style.setProperty('--secondary-color', theme.palette.secondary.main);
        root.style.setProperty('--background-color', theme.palette.background.default);
        root.style.setProperty('--text-primary-color', theme.palette.text.primary);
        root.style.setProperty('--text-secondary-color', theme.palette.text.secondary);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within a ThemeContextProvider');
    }
    return context;
};