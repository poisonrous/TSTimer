import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';
import About from './pages/about';
import Faq from './pages/faq';
import { useEffect, useState } from 'react';

function App() {
  console.log(new Date());
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