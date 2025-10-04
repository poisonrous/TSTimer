import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/home';
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';
import About from './pages/about';
import Faq from './pages/faq';
import Admin from './pages/admin';
import { useEffect, useState } from 'react';

function NavigationBarWrapper() {
  const location = useLocation();

  if (location.pathname === '/r-admin') {
    return null;
  }

  return <NavigationBar />;
}

function App() {
  const SERVER = import.meta.env.VITE_SERVER_URL;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get('access_token');


  useEffect(() => {
    if (!accessToken && !isAuthenticated) { // Solo registrar visita si el usuario no está autenticado
      fetch(`${SERVER}/api/log-visit`, { method: 'POST', credentials: 'include' })
          .then(response => response.json())
          .then(data => console.log(data.message))
          .catch(error => console.error('Error:', error));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      navigator.sendBeacon('/api/end-visit', JSON.stringify({}), { credentials: 'include' });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
      <Router>
        <NavigationBarWrapper />
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/about" element={<About />} />
          <Route exact path="/faq" element={<Faq />} />
          <Route exact path="/r-admin" element={<Admin />} />
        </Routes>
        <Footer />
      </Router>
  );
}

export default App;
