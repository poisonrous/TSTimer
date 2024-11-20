import { useContext, useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { AiOutlineUser, AiOutlineMail } from "react-icons/ai";
import { CgRename } from "react-icons/cg";
import { IoLockClosedOutline, IoPhonePortraitOutline } from "react-icons/io5";
import PasswordModal from './PasswordModal';
import { DataContext } from '../context/DataContext';

const User = () => {
  const { userData, loading, fetchUserData } = useContext(DataContext);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [newpassError, setNewpassError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [modalContext, setModalContext] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (userData) {
      setName(userData.name);
      setUsername(userData.username);
      setEmail(userData.email);
      setPhone(userData.phone);
      setUserId(userData._id);
    }
  }, [userData]);

  const handleSaveInfo = async (password) => {
    if (nameError || usernameError) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "You're entering invalid data",
      });
      return;
    }

    const updatedUser = { userId, name, username, password };
    try {
      const response = await fetch('http://localhost:5000/api/user/update-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.error || 'Wrong password',
        });
        return;
      }

      fetchUserData(); // Recargar datos del usuario después de guardar
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Your personal data has been saved',
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "There's been an error saving your data",
      });
    }
  };

  const handleSaveContact = async (password) => {
    if (emailError || phoneError) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "You're entering invalid data",
      });
      return;
    }

    const updatedUser = { userId, email, phone, password };
    try {
      const response = await fetch('http://localhost:5000/api/user/update-contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.error || 'Wrong password',
        });
        return;
      }
      fetchUserData(); // Recargar datos del usuario después de guardar
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Your contact info has been saved',
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "There's been an error saving your data",
      });
    }
  };

  const handleSavePassword = async (password) => {
    if (passwordError || newPassword.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "You're entering invalid data",
      });
      return;
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

      if (!response.ok) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.error || 'Wrong password',
        });
        return;
      }

      setPasswordError('');
      fetchUserData(); // Recargar datos del usuario después de guardar
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Your password has been changed',
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Your password couldn't been changed",
      });
    }
  };

  const handleDeleteAccount = async () => {
    const { value: confirmed } = await Swal.fire({
      title: 'Are you sure you wanna delete this account?',
      text: 'This is a permanent action and it will log out',
      icon: 'warning',
      input: 'password',
      inputPlaceholder: 'Password',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#d33',
      cancelButtonText: 'Cancel',
      preConfirm: (password) => {
        return new Promise((resolve) => {
          const checkbox = Swal.getPopup().querySelector('input[type="checkbox"]');
          if (!checkbox.checked) {
            Swal.showValidationMessage('You need to confirm this action by clicking the checkbox');
            resolve(null); // Cambiado a null si la casilla no está marcada
          } else {
            resolve(password);
          }
        });
      },
      html:
          "<label><input type='checkbox' />I'm sure about deleting this account</label>",
    });

    if (confirmed) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}/delete`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: confirmed }),
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.error || 'Wrong password',
          });
          return;
        }

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: "This account has been deleted and you're logging out",
        }).then(() => {
          window.location.href = '/r-admin';
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || "We couldn't delete this account",
        });
      }
    }
  };

  const handleOpenPasswordModal = (context) => {
    if (nameError || usernameError) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "You're entering invalid data",
      });
      return;
    }

    if (context === 'contact' && (emailError || phoneError)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "You're entering invalid data",
      });
      return;
    }

    if (context === 'password' && (passwordError || newPassword.length < 6)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "You're entering invalid data",
      });
      return;
    }

    if (context === 'delete') { handleDeleteAccount(); return; }

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

  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
      setNewPassword(value);
    if (value.length < 6) {
      setNewpassError('Password shoudl be 6 characters or longer');
    } else {
      setNewpassError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (newPassword !== value) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (value.length < 6) {
      setNameError('Name should be 6 characters or longer');
    } else {
      setNameError('');
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    if (value.length < 6) {
      setUsernameError('Username should be 6 characters or longer');
    } else {
      setUsernameError('');
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Enter a valid email');
    } else {
      setEmailError('');
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    if (value.length < 10) {
      setPhoneError('Phone should be 10 numbers or longer');
    } else {
      setPhoneError('');
    }
  };

  if (loading.user) {
    return <p>Loading user data...</p>;
  }

  return (
      <div>
        <div className={'section'}>
          <h1>About you</h1>
          <div className={'row'}>
            <div>
              <div className="form-group">
                <i className="icon-form">
                  <AiOutlineUser />
                </i>
                <input
                    id={"name"}
                    type={"text"}
                    value={name}
                    onChange={handleNameChange}
                />
              </div>
              {nameError && <p className={'error-field'}>{nameError}</p>}
            </div>
            <div>
              <div className="form-group">
                <i className="icon-form">
                  <CgRename />
                </i>
                <input
                    id={"username"}
                    type={"text"}
                    value={username}
                    onChange={handleUsernameChange}
                />
              </div>
              {usernameError && <p className={'error-field'}>{usernameError}</p>}
            </div>
          </div>
          <button className={'form-button'} onClick={() => handleOpenPasswordModal('info')}>Save</button>
        </div>
        <div className={'section'}>
          <h1>Contact info</h1>
          <div className={'row'}>
            <div>
              <div className="form-group">
                <i className="icon-form">
                  <AiOutlineMail />
                </i>
                <input
                    id={"email"}
                    type={"text"}
                    value={email}
                    onChange={handleEmailChange}
                />
              </div>
              {emailError && <p className={'error-field'}>{emailError}</p>}
            </div>
            <div>
              <div className="form-group">
                <i className="icon-form">
                  <IoPhonePortraitOutline />
                </i>
                <input
                    id={"phone"}
                    type={"text"}
                    value={phone}
                    onChange={handlePhoneChange}
                />
              </div>
              {phoneError && <p className={'error-field'}>{phoneError}</p>}
            </div>
          </div>
          <button className={'form-button'} onClick={() => handleOpenPasswordModal('contact')}>Save</button>
        </div>
        <div className={'section'}>
          <h1>Change your password</h1>
          <div className={'row'}>
            <div>
              <div className="form-group">
                <i className="icon-form">
                  <IoLockClosedOutline/>
                </i>
                <input
                    id={"newpass"}
                    type={"password"}
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    placeholder="New password (6-16 characters)"
                    maxLength={16}
                />
              </div>
              {newpassError && <p className={'error-field'}>{newpassError}</p>}
            </div>
            <div>
              <div className="form-group">
                <i className="icon-form">
                  <IoLockClosedOutline/>
                </i>
                <input
                    id={"confirmpass"}
                    type={"password"}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="Confirm new password"
                    maxLength={16}
                />
              </div>
              {passwordError && <p className={'error-field'}>{passwordError}</p>}
            </div>
          </div>
          <button className={'form-button'} onClick={() => handleOpenPasswordModal('password')}>Save</button>
        </div>
        <div className={'section delete'}>
          <h1>Delete account</h1>
          <p>This is a dangerous function and cannot be undone.</p>
          <button className={'form-button delete-btn'} onClick={() => handleOpenPasswordModal('delete')}>Delete</button>
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
