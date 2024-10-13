import Logo from '../images/TSTimer.png';
import '../stylesheets/NavigationBar.css';
import { NavLink } from 'react-router-dom';
import Button from './Button';
import { slide as Menu } from 'react-burger-menu';
import { useState, useEffect } from 'react';

function NavigationBar() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [menuOpen, setMenuOpen] = useState(false);
  const emptyClick = () => {};

  const updateMedia = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  useEffect(() => {
    window.addEventListener('resize', updateMedia);
    return () => window.removeEventListener('resize', updateMedia);
  }, []);

  const handleStateChange = (state) => {
    setMenuOpen(state.isOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
      <div id="outer-container" className='navigation-bar'>
        <div className='logo-container'>
          <a href='http://localhost:3000/'>
            <img
                src={Logo}
                className='tstimer-logo'
                alt='Logo de TSTimer'
            />
          </a>
        </div>
        {isMobile ? (
            <Menu
                right
                isOpen={menuOpen}
                onStateChange={(state) => handleStateChange(state)}
                customBurgerIcon={<img src="https://img.icons8.com/ios-filled/50/ffffff/menu.png" />}
                width={'60%'}
                pageWrapId={"page-wrap"}
                outerContainerId={"outer-container"}
            >
              <NavLink to="/" className='nav' onClick={closeMenu}>
                Home
              </NavLink>
              <NavLink to="/about" className='nav' onClick={closeMenu}>
                About
              </NavLink>
              <NavLink to="/faq" className='nav' onClick={closeMenu}>
                FAQ
              </NavLink>
            </Menu>
        ) : (
            <div className='buttons'>
              <NavLink to="/" className='nav'>
                <Button text='Home' handleClick={emptyClick} />
              </NavLink>
              <NavLink to="/about" className='nav'>
                <Button text='About' handleClick={emptyClick} />
              </NavLink>
              <NavLink to="/faq" className='nav'>
                <Button text='FAQ' handleClick={emptyClick} />
              </NavLink>
            </div>
        )}
      </div>
  );
}

export default NavigationBar;
