import { Button, Container, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PinCodeDialog from '../components/PinCodeDialog';
import QrCodeDialog from '../components/QrCodeDialog';
import useAuth from '../hooks/useAuth';
import apiService from '../services/apiService';

interface ICredentials {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const [credentials, setCredentials] = useState<ICredentials>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | undefined>();
  const [qrCodeDialogIsOpen, setQrCodeDialogIsOpen] = useState<boolean>(false);
  const [pinCodeDialogIsOpen, setPinCodeDialogIsOpen] =
    useState<boolean>(false);
  const [tempToken, setTempToken] = useState<string | undefined>();
  const [isTwoFactorSetupRequired, setIsTwoFactorSetupRequired] =
    useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setError(undefined);
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const response = await apiService.login(
        credentials.email,
        credentials.password
      );

      if (response.status === 200) {
        auth.login(response.data.token, response.data.refreshToken);
        navigate('/trusted-devices');
      } else if (response.status === 202) {
        setTempToken(response.data.tempToken);
        setIsTwoFactorSetupRequired(response.data.twoFactorSetupRequired);

        if (response.data.twoFactorSetupRequired) {
          setQrCodeDialogIsOpen(true);
        } else {
          setPinCodeDialogIsOpen(true);
        }
      }
    } catch (error) {
      setError(`Failed to sign in: ${error}`);
    }
  };

  const hideQrCodeDialog = (): void => {
    setQrCodeDialogIsOpen(false);
    setPinCodeDialogIsOpen(true);
  };

  const hidePinCodeDialog = (): void => {
    setPinCodeDialogIsOpen(false);
    setTempToken(undefined);
  };

  return (
    <>
      <Container maxWidth='xs'>
        <Typography variant={'h4'} align={'center'} gutterBottom>
          Sign In
        </Typography>

        <TextField
          label={'Email'}
          name={'email'}
          onChange={handleChange}
          margin={'normal'}
          fullWidth
        />
        <TextField
          label={'Password'}
          type={'password'}
          name={'password'}
          onChange={handleChange}
          margin={'normal'}
          fullWidth
        />
        {error && <Typography color={'error'}>{error}</Typography>}

        <Button
          onClick={handleLogin}
          variant={'contained'}
          sx={{ marginTop: 4 }}
          fullWidth
        >
          Sign In
        </Button>
      </Container>
      <QrCodeDialog
        isOpen={qrCodeDialogIsOpen}
        tempToken={tempToken}
        onClose={hideQrCodeDialog}
      />
      <PinCodeDialog
        isOpen={pinCodeDialogIsOpen}
        tempToken={tempToken}
        isTwoFactorSetupRequired={isTwoFactorSetupRequired}
        onClose={hidePinCodeDialog}
      />
    </>
  );
};

export default Login;
