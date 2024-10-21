import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';
import About from './pages/about';
import Faq from './pages/faq';
import { useEffect } from 'react';

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get('access_token');

  useEffect(() => {
    if (!accessToken) {
      console.log('Llamada a /api/log-visit');
      fetch('/api/log-visit', { method: 'POST' })
          .then(response => response.json())
          .then(data => console.log(data.message))
          .catch(error => console.error('Error:', error));
    }
  }, [accessToken]);

  return (
      <Router>
        <NavigationBar />
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/about" element={<About />} />
          <Route exact path="/faq" element={<Faq />} />
        </Routes>
        <Footer />
      </Router>
  );
}

export default App;