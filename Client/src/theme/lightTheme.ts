import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#006547', // Green
        },
        secondary: {
            main: '#FFDB00', // Yellow
        },
        background: {
            default: '#FFFFFF', // White
            paper: '#FFFFFF', // White
        },
        text: {
            primary: '#212620', // Dark Gray
            secondary: '#006547', // Green
        },
        link: {
            main: '#006547', // Blue for links in light mode
        },
    },
});

export default lightTheme;