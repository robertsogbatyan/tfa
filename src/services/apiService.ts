import axios from 'axios';
import { toast } from 'react-toastify';
import config from '../config';
import storage from '../utils/storage';

const api = axios.create({
  baseURL: config.API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (request) => {
  const token: string | null = storage.getAccessToken();

  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }

  return request;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;

      try {
        const newToken: string | undefined = await refreshAccessToken();

        error.config.headers.Authorization = `Bearer ${newToken}`;

        return api.request(error.config);
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

let refreshAttempts = 0;
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const refreshAccessToken = async (): Promise<string | undefined> => {
  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshSubscribers.push(resolve);
    });
  }

  isRefreshing = true;

  try {
    const token: string | null = storage.getAccessToken();
    const refreshToken: string | null = storage.getRefreshToken();

    if (!token || !refreshToken)
      throw new Error('Access token or refresh token not found');

    const response = await axios.post(
      `${config.API_URL}/api/v1/front-office/auth/refresh`,
      {
        token,
        refreshToken,
      }
    );

    const newAccessToken: string = response.data.accessToken;

    storage.setAccessToken(newAccessToken);

    refreshAttempts = 0;
    refreshSubscribers.forEach((callback) => callback(newAccessToken));
    refreshSubscribers = [];

    return newAccessToken;
  } catch (error) {
    if (++refreshAttempts >= 3) {
      toast.error('Session is expired. Please sign in again');

      storage.clear();
      window.location.href = '/';
    }

    throw error;
  } finally {
    isRefreshing = false;
  }
};

const handleRequest = async (request: Promise<any>) => {
  try {
    const response = await request;
    return response;
  } catch (error: any) {
    throw error.response?.data?.message || 'Something went wrong';
  }
};

const apiService = {
  login: (email: string, password: string) =>
    handleRequest(api.post('/api/v1/front-office/auth', { email, password })),

  generateQrCode: (tempToken: string) =>
    handleRequest(
      api.post('/api/v1/front-office/auth/two-factor/generate-qr-code', {
        tempToken,
      })
    ),

  setup2FA: (totpCode: string, tempToken: string) =>
    handleRequest(
      api.post('/api/v1/front-office/auth/two-factor/set-up', {
        totpCode,
        tempToken,
      })
    ),

  verifyTotp: (totpCode: string, tempToken: string) =>
    handleRequest(
      api.post('/api/v1/front-office/auth/two-factor/verify', {
        totpCode,
        tempToken,
      })
    ),

  getTrustedDevices: () =>
    handleRequest(api.get('/api/v1/front-office/trusted-devices')),

  removeDevice: (deviceId: string) =>
    handleRequest(
      api.delete(`/api/v1/front-office/trusted-devices/${deviceId}`)
    ),
};

export default apiService;
