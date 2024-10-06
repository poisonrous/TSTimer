import Logo from '../images/TSTimer.png'
import '../stylesheets/NavigationBar.css'
import Button from './Button'
import {NavLink} from 'react-router-dom'

function NavigationBar() {

  const emptyClick= () => {
  };

  return (
      <div className='navigation-bar'>
        <div className='logo-container'>
          <a href='http://localhost:3000/'>
            <img src={Logo}
                 className='tstimer-logo'
                 alt='Logo de TSTimer'
                 href='http://localhost:3000/'
            />
          </a>
        </div>
        <div className='buttons'>
          <NavLink to="/" className='nav'>
            <Button
                text='Home'
                handleClick={emptyClick}
            />
          </NavLink>
          <NavLink to="/about" className='nav'>
            <Button
                text='About'
                handleClick={emptyClick}
            />
          </NavLink>
          <NavLink to="/faq" className='nav'>
            <Button
                text='FAQ'
                handleClick={emptyClick}
            />
          </NavLink>
        </div>
      </div>
);
}

export default NavigationBar;