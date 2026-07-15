import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { AdminLayout } from '../components/layout/AdminSidebar';
import { ChefLayout } from '../components/layout/ChefLayout';
import { ChefLogin } from '../pages/chef/ChefLogin';
import { KitchenDashboard } from '../pages/chef/KitchenDashboard';
import { Payments } from '../pages/chef/Payments';
import { Dashboard } from '../pages/admin/Dashboard';
import { ManageMenu } from '../pages/admin/ManageMenu';
import { ManageTables } from '../pages/admin/ManageTables';
import { ManageStaff } from '../pages/admin/ManageStaff';
import { Menu } from '../pages/customer/Menu';
import { Cart } from '../pages/customer/Cart';
import { OrderStatus } from '../pages/customer/OrderStatus';
import { Bill } from '../pages/customer/Bill';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chef/login" replace />} />

      <Route path="/chef/login" element={<ChefLogin />} />
      <Route
        path="/chef"
        element={
          <ProtectedRoute roles={['chef', 'admin']} redirectTo="/chef/login">
            <ChefLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<KitchenDashboard />} />
        <Route path="payments" element={<Payments />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']} redirectTo="/chef/login">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="menu" element={<ManageMenu />} />
        <Route path="tables" element={<ManageTables />} />
        <Route path="staff" element={<ManageStaff />} />
      </Route>

      <Route path="/menu/:tableId" element={<Menu />} />
      <Route path="/menu/:tableId/cart" element={<Cart />} />
      <Route path="/menu/:tableId/status" element={<OrderStatus />} />
      <Route path="/menu/:tableId/bill" element={<Bill />} />

      <Route path="*" element={<Navigate to="/chef/login" replace />} />
    </Routes>
  );
}
