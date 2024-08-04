import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#DF4E79',
    },
    secondary: {
      main: '#f50057',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(27deg, rgba(223,78,121,1) 0%, rgba(82,110,132,1) 78%, rgba(63,99,125,1) 100%)',
          border: 0,
          borderRadius: 3,
          boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
          color: 'white',
          height: 48,
          padding: '0 30px',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 46,
          height: 27,
          padding: 0,
          margin: 8,
        },
        switchBase: {
          padding: 1,
          '&.Mui-checked, &.MuiSwitch-colorPrimary.Mui-checked, &.MuiSwitch-colorSecondary.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              opacity: 1,
              border: 'none',
            },
          },
        },
        thumb: {
          width: 24,
          height: 24,
        },
        track: {
          borderRadius: 13,
          border: '1px solid #bdbdbd',
          backgroundColor: '#fafafa',
          opacity: 1,
          transition: 'background-color 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Josefin Sans", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Dosis", "Helvetica", "Arial", sans-serif',
    },
    h2: {
      fontFamily: '"Dosis", "Helvetica", "Arial", sans-serif',
    },
    h3: {
      fontFamily: '"Dosis", "Helvetica", "Arial", sans-serif',
    },
    h4: {
      fontFamily: '"Dosis", "Helvetica", "Arial", sans-serif',
    },
    h5: {
      fontFamily: '"Dosis", "Helvetica", "Arial", sans-serif',
    },
    h6: {
      fontFamily: '"Dosis", "Helvetica", "Arial", sans-serif',
    },
  },
  shape: {
    borderRadius: 4,
  },
});

export default theme;
