
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './api/components/Header.tsx';
import Hero from './api/components/Hero';
import ShopHighlights from './api/components/ShopHighlights';
import VisitInfo from './api/components/VisitInfo';
import Footer from './api/components/Footer';
import LoadingScreen from './api/components/LoadingScreen';
import BookingPage from './api/components/BookingPage';
import CollectablesPage from './api/components/CollectablesPage';
import OrderStatusPage from './api/components/OrderStatusPage';
import AdminPage from './api/components/AdminPage';
import PressPage from './api/components/PressPage';
import GalleryPage from './api/components/GalleryPage';
import VideoTestimonialsPage from './api/components/VideoTestimonialsPage';
import MuseumGalleryScroll from './api/components/MuseumGalleryScroll';
import CuratorChat from './api/components/CuratorChat';
import { DataProvider } from './services/DataContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const HomePage = () => (
  <>
    <Hero />
    <div id="main-content" className="relative z-10 bg-white">
      <ShopHighlights />
      <VisitInfo />
      <MuseumGalleryScroll />
    </div>
  </>
);

const Layout: React.FC = () => {
    return (
        <div className="font-sans text-black selection:bg-black selection:text-white">
            <Header />
            <main className="min-h-[70vh]">
              <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<CollectablesPage />} />
                  <Route path="/order-status" element={<OrderStatusPage />} />
                  <Route path="/booking" element={<BookingPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/press" element={<PressPage />} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/testimonies" element={<VideoTestimonialsPage />} />
              </Routes>
            </main>
            <Footer />
            <CuratorChat />
        </div>
    );
};

const App: React.FC = () => {
  return (
    <DataProvider>
        <Router>
            <ScrollToTop />
            <LoadingScreen />
            <Layout />
        </Router>
    </DataProvider>
  );
};

export default App;
