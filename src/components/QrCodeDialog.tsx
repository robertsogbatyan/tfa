import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useState } from 'react';
import apiService from '../services/apiService';

interface IQrCodeDialogProps {
  isOpen: boolean;
  tempToken?: string;
  onClose: () => void;
}

const QrCodeDialog: React.FC<IQrCodeDialogProps> = ({
  isOpen,
  tempToken,
  onClose,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | undefined>(
    'https://foo.bar'
  );
  const [isLoading, setIsLoading] = useState<boolean>(Boolean);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!tempToken) {
      setError('Temporary token is missing');
      return;
    }

    (async () => {
      setIsLoading(true);

      try {
        const response = await apiService.generateQrCode(tempToken);

        setQrCodeUrl(response.data.qrCodeUrl);
      } catch (err) {
        setError('Error fetching QR code');
      }

      setIsLoading(false);
    })();
  }, [isOpen, tempToken]);

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Scan QR Code</DialogTitle>

      <DialogContent>
        {qrCodeUrl && <QRCodeCanvas value={qrCodeUrl} size={200} />}
        {error && <Typography color='error'>{error}</Typography>}
        {isLoading && <CircularProgress />}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color={'primary'}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QrCodeDialog;
