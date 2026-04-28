
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.tsx';
import Hero from './components/Hero';
import ShopHighlights from './components/ShopHighlights';
import VisitInfo from './components/VisitInfo';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import BookingPage from './components/BookingPage';
import CollectablesPage from './components/CollectablesPage';
import OrderStatusPage from './components/OrderStatusPage';
import AdminPage from './components/AdminPage';
import PressPage from './components/PressPage';
import GalleryPage from './components/GalleryPage';
import CalendarPage from './components/CalendarPage';
import EventRegistrationPage from './components/EventRegistrationPage';
import AboutPage from './components/AboutPage';
import CollectionPage from './components/CollectionPage';
import MembershipPage from './components/MembershipPage';
import VolunteerPage from './components/VolunteerPage';
import InternPage from './components/InternPage';
import MuseumGalleryScroll from './components/MuseumGalleryScroll';
import CuratorChat from './components/CuratorChat';
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
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/collection" element={<CollectionPage />} />
                  <Route path="/membership" element={<MembershipPage />} />
                  <Route path="/press" element={<PressPage />} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/events" element={<CalendarPage />} />
                  <Route path="/events/:eventId/register" element={<EventRegistrationPage />} />
                  <Route path="/volunteer" element={<VolunteerPage />} />
                  <Route path="/intern" element={<InternPage />} />
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
