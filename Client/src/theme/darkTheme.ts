import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#006547', // Green
        },
        secondary: {
            main: '#FFDB00', // Yellow
        },
        background: {
            default: '#212620', // Dark Gray
            paper: '#212620', // Dark Gray
        },
        text: {
            primary: '#FFFFFF', // White
            secondary: '#FFDB00', // Yellow
        },
    },
});

export default darkTheme;