import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/common/MainLayout';
import Home from './pages/Home';
import ArtistHub from './pages/ArtistHub';
import MotoFeed from './pages/MotoFeed';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import { useAuth } from './context/AuthContext';

import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

import Pricing from './pages/Pricing';

// Placeholder components for the new routes
import ArtistProfile from './pages/ArtistProfile';
import Discover from './pages/Discover';
import Library from './pages/Library';
import Profile from './pages/Profile';
import Trending from './pages/Trending';

const Contact = () => <div className="p-12"><h1 className="text-4xl font-black font-display italic uppercase">Contact Us</h1></div>;

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-smash-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-smash-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/moto-feed" element={<MotoFeed />} />
      <Route element={<MainLayout />}>
        <Route index element={user ? <Home /> : <Landing />} />
        <Route path="home" element={user ? <Home /> : <Navigate to="/" />} />
        <Route path="discover" element={<Discover />} />
        <Route path="trending" element={<Trending />} />
        <Route path="library" element={<Library />} />
        <Route path="profile" element={<Profile />} />
        <Route path="artist-hub" element={<ArtistHub />} />
        <Route path="artist/:id" element={<ArtistProfile />} />
        <Route path="search" element={<Discover />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="about" element={<About />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="contact" element={<Contact />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <PlayerProvider>
          <AppContent />
        </PlayerProvider>
      </AuthProvider>
    </Router>
  );
}
