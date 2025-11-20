// hooks/user/useTheme.js
import { useState, useEffect } from 'react';

/**
 * Hook para manejar el tema (claro/oscuro)
 */
export const useTheme = () => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Verificar preferencia guardada o preferencia del sistema
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        // Detectar preferencia del sistema
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        // Aplicar clase al body
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // Guardar preferencia
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    return {
        isDarkMode,
        toggleTheme
    };
};

export default useTheme;
