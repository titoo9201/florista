import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Inspiration from './pages/Inspiration';
import Bouquets from './pages/Bouquets';
import CandlesDecor from './pages/CandlesDecor';
import About from './pages/About';
import Contact from './pages/Contact';
import { ContentProvider } from './context/ContentContext';

// The admin panel is only downloaded when someone opens /admin.
const Admin = lazy(() => import('./pages/Admin'));

// Only the Home page exists in the design so far. Other nav paths fall back to Home
// until their pages are designed — add a <Route> per page here.
export default function App() {
  return (
    <ContentProvider>
      <Routes>
        <Route path="admin" element={<Suspense fallback={null}><Admin /></Suspense>} />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="inspiration" element={<Inspiration />} />
          <Route path="bouquets" element={<Bouquets />} />
          <Route path="candles-decor" element={<CandlesDecor />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ContentProvider>
  );
}
