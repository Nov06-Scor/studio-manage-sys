import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import Layout from './components/layout/Layout';
import Notification from './components/Notification';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import CreateOrder from './pages/CreateOrder';
import OrderDetail from './pages/OrderDetail';
import EditOrder from './pages/EditOrder';
import Players from './pages/Players';
import CreatePlayer from './pages/CreatePlayer';
import EditPlayer from './pages/EditPlayer';
import Customers from './pages/Customers';
import Withdrawals from './pages/Withdrawals';
import Finance from './pages/Finance';
import SystemSettings from './pages/SystemSettings';
import Employees from './pages/Employees';
import Handoffs from './pages/Handoffs';
import ServiceContent from './pages/ServiceContent';
import ServiceDetail from './pages/ServiceDetail';
import CreateService from './pages/CreateService';
import EditService from './pages/EditService';
import Profile from './pages/Profile';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Router>
      <Notification />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/create" element={<CreateOrder />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="orders/:id/edit" element={<EditOrder />} />
          <Route path="players" element={<Players />} />
          <Route path="players/create" element={<CreatePlayer />} />
          <Route path="players/:id/edit" element={<EditPlayer />} />
          <Route path="customers" element={<Customers />} />
          <Route path="withdrawals" element={<Withdrawals />} />
          <Route path="finance" element={<Finance />} />
          <Route path="system" element={<SystemSettings />} />
          <Route path="employees" element={<Employees />} />
          <Route path="handoffs" element={<Handoffs />} />
          <Route path="services" element={<ServiceContent />} />
          <Route path="services/create" element={<CreateService />} />
          <Route path="services/:id" element={<ServiceDetail />} />
          <Route path="services/:id/edit" element={<EditService />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}
