// TypeScript module augmentation for MUI theme to add custom 'link' color to palette
import '@mui/material/styles';

declare module '@mui/material/styles' {
    interface Palette {
        link: {
            main: string;
        };
    }
    interface PaletteOptions {
        link?: {
            main: string;
        };
    }
}
