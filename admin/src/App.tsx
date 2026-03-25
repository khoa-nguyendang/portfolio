import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/layouts/AdminLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import PostListPage from '@/pages/PostListPage';
import PostEditorPage from '@/pages/PostEditorPage';
import CategoriesPage from '@/pages/CategoriesPage';
import ContactsPage from '@/pages/ContactsPage';
import SettingsPage from '@/pages/SettingsPage';
export default function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/posts" element={<PostListPage />} />
        <Route path="/posts/new" element={<PostEditorPage />} />
        <Route path="/posts/:id/edit" element={<PostEditorPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
