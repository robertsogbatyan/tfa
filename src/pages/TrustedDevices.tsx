import {
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import apiService from '../services/apiService';

interface IDevice {
  id: string;
  fingerprint: string;
  createdAt: string;
}

const TrustedDevices = () => {
  const [devices, setDevices] = useState<IDevice[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await apiService.getTrustedDevices();

      setDevices(response.data.content);
    } catch (error) {
      setError('Failed to load the devices');
    }
  };

  const removeDevice = async (deviceId: string) => {
    try {
      await apiService.removeDevice(deviceId);

      setDevices((prevDevices: IDevice[]) =>
        prevDevices.filter((device: IDevice) => device.id !== deviceId)
      );
    } catch (error) {
      setError('Failed to remove the device');
    }
  };

  return (
    <Container>
      <Typography variant={'h4'} gutterBottom>
        Trusted Devices
      </Typography>
      {error && <Typography color='error'>{error}</Typography>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fingerprint</TableCell>
              <TableCell>Created at</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {devices.map((device: IDevice) => (
              <TableRow key={device.id}>
                <TableCell>{device.fingerprint}</TableCell>
                <TableCell>
                  {new Date(device.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant={'contained'}
                    color={'error'}
                    onClick={() => removeDevice(device.id)}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TrustedDevices;
