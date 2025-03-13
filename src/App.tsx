import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';
import AuthState from './data-structures/enum/AuthState';
import Login from './pages/Login';
import TrustedDevices from './pages/TrustedDevices';
import ProtectedRoute from './routes/ProtectedRoute';

const App: React.FC = () => {
  return (
    <>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path='/' element={<Layout />}>
              <Route
                path='/login'
                element={
                  <ProtectedRoute requiredAuthState={AuthState.NOT_SIGNED_IN} />
                }
              >
                <Route index element={<Login />} />
              </Route>

              <Route
                element={
                  <ProtectedRoute requiredAuthState={AuthState.SIGNED_IN} />
                }
              >
                <Route path='/trusted-devices' element={<TrustedDevices />} />
              </Route>

              <Route
                index
                element={<Navigate to='/trusted-devices' replace />}
              />
              <Route
                path={'*'}
                element={<Navigate to='/trusted-devices' replace />}
              />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>

      <ToastContainer position='top-right' autoClose={3000} />
    </>
  );
};

export default App;
