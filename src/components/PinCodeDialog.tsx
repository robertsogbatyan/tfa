import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import apiService from '../services/apiService';

interface IPinCodeDialogProps {
  isOpen: boolean;
  tempToken?: string;
  isTwoFactorSetupRequired: boolean;
  onClose: () => void;
}

const PinCodeDialog: React.FC<IPinCodeDialogProps> = ({
  isOpen,
  tempToken,
  isTwoFactorSetupRequired,
  onClose,
}) => {
  const navigate = useNavigate();
  const auth = useAuth();

  const [code, setCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(Boolean);
  const [error, setError] = useState<string | undefined>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCode(e.target.value);
  };

  const handleVerify = async () => {
    if (!tempToken) {
      setError('Temporary token is missing');
      return;
    }

    setIsLoading(true);

    try {
      const response = isTwoFactorSetupRequired
        ? await apiService.setup2FA(code, tempToken)
        : await apiService.verifyTotp(code, tempToken);

      auth.login(response.data.token, response.data.refreshToken);
      navigate('/dashboard');
    } catch (error: any) {
      setError(error);
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>PIN code</DialogTitle>

      <DialogContent>
        <TextField
          label={'Enter PIN code'}
          value={code}
          onChange={handleChange}
          disabled={isLoading}
          margin={'normal'}
          fullWidth
        />
        {error && <Typography color={'error'}>{error}</Typography>}
        {isLoading && <CircularProgress />}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleVerify} color={'primary'} disabled={isLoading}>
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PinCodeDialog;
