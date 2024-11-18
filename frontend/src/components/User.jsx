import { useEffect, useState } from 'react';
import { AiOutlineUser, AiOutlineMail } from "react-icons/ai";
import { CgRename } from "react-icons/cg";
import { IoLockClosedOutline, IoPhonePortraitOutline } from "react-icons/io5";
import PasswordModal from './PasswordModal'; // Importa el modal de contraseña

const User = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [modalContext, setModalContext] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/user', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        setName(data.name);
        setUsername(data.username);
        setEmail(data.email);
        setPhone(data.phone);
        setUserId(data._id); // Asegurarse de tener el ID del usuario
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleSaveInfo = async (password) => {
    const updatedUser = { userId, name, username, password };
    try {
      const response = await fetch('http://localhost:5000/api/user/update-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
        credentials: 'include',
      });
      const data = await response.json();
      console.log('Información personal guardada con éxito:', data);
    } catch (error) {
      console.error('Error al guardar la información personal del usuario:', error);
    }
  };

  const handleSaveContact = async (password) => {
    const updatedUser = { userId, email, phone, password };
    try {
      const response = await fetch('http://localhost:5000/api/user/update-contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
        credentials: 'include',
      });
      const data = await response.json();
      console.log('Información de contacto guardada con éxito:', data);
    } catch (error) {
      console.error('Error al guardar la información de contacto del usuario:', error);
    }
  };

  const handleSavePassword = async (password) => {
    if (newPassword !== confirmPassword) {
      return console.error('Las contraseñas no coinciden');
    }

    const updatedUser = { userId, newPassword, password };
    try {
      const response = await fetch('http://localhost:5000/api/user/update-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
        credentials: 'include',
      });
      const data = await response.json();
      console.log('Contraseña guardada con éxito:', data);
    } catch (error) {
      console.error('Error al guardar la contraseña del usuario:', error);
    }
  };

  const handleDeleteAccount = async (password) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/delete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al borrar lógicamente el usuario');
      }

      const data = await response.json();
      console.log('Cuenta eliminada con éxito:', data);
    } catch (error) {
      console.error('Error al borrar lógicamente la cuenta:', error);
    }
  };

  const handleOpenPasswordModal = (context) => {
    setModalContext(context);
    setShowPasswordModal(true);
  };

  const handleConfirmPassword = (password) => {
    if (modalContext === 'info') {
      handleSaveInfo(password);
    } else if (modalContext === 'contact') {
      handleSaveContact(password);
    } else if (modalContext === 'password') {
      handleSavePassword(password);
    } else if (modalContext === 'delete') {
      handleDeleteAccount(password);
    }
  };

  return (
      <div>
        <div className={'section'}>
          <h1>About you</h1>
          <div className={'row'}>
            <div className="form-group">
              <i className="icon-form">
                <AiOutlineUser />
              </i>
              <input
                  id={"name"}
                  type={"text"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <i className="icon-form">
                <CgRename />
              </i>
              <input
                  id={"username"}
                  type={"text"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <button className={'form-button'} onClick={() => handleOpenPasswordModal('info')}>Save</button>
        </div>
        <div className={'section'}>
          <h1>Contact info</h1>
          <div className={'row'}>
            <div className="form-group">
              <i className="icon-form">
                <AiOutlineMail />
              </i>
              <input
                  id={"email"}
                  type={"text"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <i className="icon-form">
                <IoPhonePortraitOutline />
              </i>
              <input
                  id={"phone"}
                  type={"text"}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
          <button className={'form-button'} onClick={() => handleOpenPasswordModal('contact')}>Save</button>
        </div>
        <div className={'section'}>
          <h1>Change your password</h1>
          <div className={'row'}>
            <div className="form-group">
              <i className="icon-form">
                <IoLockClosedOutline />
              </i>
              <input
                  id={"newpass"}
                  type={"password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <i className="icon-form">
                <IoLockClosedOutline />
              </i>
              <input
                  id={"confirmpass"}
                  type={"password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <button className={'form-button'} onClick={() => handleOpenPasswordModal('password')}>Save</button>
        </div>
        <div className={'section delete'}>
          <h1>Delete account</h1>
          <p>This is a dangerous function and cannot be undone.</p>
          <button className={'form-button'} onClick={() => handleOpenPasswordModal('delete')}>Delete</button>
        </div>
        {showPasswordModal && (
            <PasswordModal
                onClose={() => setShowPasswordModal(false)}
                onConfirm={handleConfirmPassword}
            />
        )}
      </div>
  );
};

export default User;
