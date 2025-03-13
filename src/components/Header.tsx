import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import React from 'react';
import useAuth from '../hooks/useAuth';

const Header: React.FC = () => {
  const auth = useAuth();

  return (
    <AppBar position='static'>
      <Toolbar>
        <Typography variant='h6' sx={{ flexGrow: 1 }}>
          2FA
        </Typography>

        {auth?.isAuthenticated && (
          <Button color={'inherit'} onClick={auth.logout}>
            Log out
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
