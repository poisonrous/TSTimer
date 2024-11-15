import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import AdminPanel from './adminPanel';

const Admin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    if (/^[a-zA-Z0-9]*$/.test(value) && value.length <= 16) {
      setUsername(value);
      setUsernameError('');
    } else {
      if (!/^[a-zA-Z0-9]*$/.test(value)) {
        setUsernameError('Username can only contain letters and numbers.');
      }
      if (value.length > 16) {
        setUsernameError('Username cannot be longer than 16 characters.');
      }
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
      const response = await fetch('http://localhost:5000/api/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      localStorage.setItem('authToken', data.token);
      setIsAuthenticated(true);
    } catch (error) {
      setGeneralError(error.message);
    }
  };

  if (isAuthenticated) {
    return <AdminPanel onLogout={() => setIsAuthenticated(false)} />;
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
            {usernameError && <p style={{ color: 'red' }}>{usernameError}</p>}
            <input
                type={'password'}
                placeholder={'password'}
                value={password}
                onChange={handlePasswordChange}
            />
            {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
            <button type="submit">Log in</button>
            {generalError && <p style={{ color: 'red' }}>{generalError}</p>}
            <NavLink to={'/'}>Go back</NavLink>
          </form>
        </div>
      </div>
  );
};

export default Admin;
