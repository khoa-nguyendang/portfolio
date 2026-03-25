import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import HomePage from './pages/HomePage';
import BlogPage from './pages/BlogPage';
import PostPage from './pages/PostPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<PostPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
