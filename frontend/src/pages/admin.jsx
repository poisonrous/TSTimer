import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import AdminPanel from './adminPanel';

const Admin = () => {
    
  const SERVER = import.meta.env.VITE_SERVER_URL;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAccess, setUserAccess] = useState(null); // Nuevo estado para el tipo de acceso del usuario

  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${SERVER}/api/check-session`, {
          method: 'GET',
          credentials: 'include'
        });
        const data = await response.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          setUserAccess(data.access); // Establecer el tipo de acceso del usuario
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkSession();
  }, []);

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    if (/^[a-zA-Z0-9]*$/.test(value) && value.length <= 16) {
      setUsername(value);
      setUsernameError('');
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    if (value.length <= 16) {
      setPassword(value);
      setPasswordError('');
    } else {
      setPasswordError('Password cannot be longer than 16 characters.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    if (username.length < 5) {
      setUsernameError('Username must be at least 5 characters long.');
      return;
    }
    if (password.length < 5) {
      setPasswordError('Password must be at least 5 characters long.');
      return;
    }

    setUsernameError('');
    setPasswordError('');

    try {
      const response = await fetch(`${SERVER}/api/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      setIsAuthenticated(true);
      setUserAccess(data.access); // Establecer el tipo de acceso del usuario
    } catch (error) {
      setGeneralError(error.message);
    }
  };

  if (isAuthenticated) {
    return <AdminPanel onLogout={() => setIsAuthenticated(false)} userAccess={userAccess} />; // Pasar el tipo de acceso al AdminPanel
  }

  return (
      <div className={'Admin'}>
        <div className={'login-card'}>
          <form onSubmit={handleSubmit}>
            <h1>Welcome!</h1>
            <input
                type={'text'}
                placeholder={'username'}
                value={username}
                onChange={handleUsernameChange}
            />
            {usernameError && <p className={'error-field error-login'}>{usernameError}</p>}
            <input
                type={'password'}
                placeholder={'password'}
                value={password}
                onChange={handlePasswordChange}
            />
            {passwordError && <p className={'error-field error-login'}>{passwordError}</p>}
            <button type="submit">Log in</button>
            {generalError && <p className={'error-field error-login'}>{generalError}</p>}
            <NavLink to={'/'}>Go back</NavLink>
          </form>
        </div>
      </div>
  );
};

export default Admin;
