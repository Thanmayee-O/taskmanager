import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Get stored theme choice or fallback to system preference
    try {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
        console.log('Theme initialized from localStorage:', storedTheme);
        return storedTheme;
      }
    } catch (e) {
      console.warn('LocalStorage is not accessible:', e);
    }
    
    try {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      console.log('Theme falling back to system preference (prefers dark):', systemPrefersDark);
      return systemPrefersDark ? 'dark' : 'light';
    } catch (e) {
      console.warn('window.matchMedia prefers-color-scheme is not accessible:', e);
      return 'dark'; // safe default
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    console.log('Applying theme update to DOM:', theme);
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn('Failed to save theme choice to LocalStorage:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    console.log('toggleTheme action triggered');
    setTheme((prevTheme) => {
      const nextTheme = prevTheme === 'dark' ? 'light' : 'dark';
      console.log('Toggling theme from', prevTheme, 'to', nextTheme);
      return nextTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
