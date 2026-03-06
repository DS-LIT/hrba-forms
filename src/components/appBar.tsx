// filepath: c:\dev\hrba-forms\src\components\appBar.tsx
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeContext } from '../context/themeContext';
import { Link } from 'react-router-dom';

export default function SearchAppBar() {
    const { isDarkMode, toggleTheme } = useThemeContext();

    return (
        <Box sx={{ flexGrow: 1 }} className="appBar">
            <AppBar position="static">
                <Toolbar>
                    <Link to="/" className='navCol logo'>
                        <Box
                            component="img"
                            src="/hrba-logo.png" // Replace with your logo path
                            alt="Logo"
                            sx={{
                                height: 40, // Adjust height as needed
                                marginRight: 2, // Add spacing between logo and text
                            }}
                        />
                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
                        >
                            Hills Raiders
                        </Typography>
                    </Link>
                    <Box className="navCol">
                        {/* <Search>
                            <SearchIconWrapper>
                                <SearchIcon />
                            </SearchIconWrapper>
                            <StyledInputBase
                                placeholder="Search…"
                                inputProps={{ 'aria-label': 'search' }}
                            />
                        </Search> */}
                        <IconButton
                            sx={{ ml: 1 }}
                            onClick={toggleTheme}
                            color="inherit"
                        >
                            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
    );
}