export const designTokens = {
  // =================================================================
  // TIPOGRAFIA (Typography)
  // =================================================================
  typography: {
    fontFamily: {
      sans: ['Quicksand', 'sans-serif'],
    },
    fontSize: {
      xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem',
      '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem',
    },
    lineHeight: {
      tight: 1.25, snug: 1.375, normal: 1.5, relaxed: 1.625, loose: 2,
    },
  },
  
  // =================================================================
  // ESPAÇAMENTOS (Spacing - TailwindCSS defaults)
  // =================================================================
  spacing: {
    '0': '0', '1': '0.25rem', '2': '0.5rem', '3': '0.75rem', '4': '1rem', '5': '1.25rem',
    '6': '1.5rem', '8': '2rem', '10': '2.5rem', '12': '3rem', '16': '4rem',
    '20': '5rem', '24': '6rem',
  },

  // =================================================================
  // BORDAS E SOMBRAS (Borders and Shadows)
  // =================================================================
  borders: {
    borderRadius: {
      sm: '0.25rem', md: '0.5rem', lg: '1rem', full: '9999px',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', 
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
};