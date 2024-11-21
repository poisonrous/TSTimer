import { useState } from 'react';
import Swal from 'sweetalert2';
import { AiOutlineUser, AiOutlineMail } from 'react-icons/ai';
import { IoPhonePortraitOutline, IoLockClosedOutline } from 'react-icons/io5';
import { FaUserShield } from 'react-icons/fa';
import { CgRename } from "react-icons/cg";

const AddUserModal = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const password = "changeme";
  const [access, setAccess] = useState(2);
  const [nameError, setNameError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const handleNameKeyPress = (e) => {
    const regex = /^[a-zA-Z\s]*$/;
    if (!regex.test(e.key) || (e.key === ' ' && e.target.value.slice(-1) === ' ')) {
      e.preventDefault();
    }
  };

  const handleUsernameKeyPress = (e) => {
    const regex = /^[a-zA-Z0-9]*$/;
    if (!regex.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleEmailKeyPress = (e) => {
    const regex = /^[\w@.-]*$/;
    if (!regex.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePhoneKeyPress = (e) => {
    const regex = /^[\d+]*$/;
    if (!regex.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleNameChange = (e) => {
    let value = e.target.value;
    setName(value);
    let displayValue = value.trimEnd();

    if (displayValue.length < 6) {
      setNameError('Name should be 6 characters or longer');
    } else if (displayValue.length > 20) {
      setNameError('Name should be no more than 20 characters');
    } else {
      setNameError('');
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    if (value.length > 20) {
      e.preventDefault();
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value.length > 50) {
      e.preventDefault();
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    if (value.length > 20) {
      e.preventDefault();
    }
  };


  const handleSave = async () => {
    if (name.length < 3 || username.length < 3 || email.length < 5 || phone.length < 5) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'All fields must meet minimum length requirements.',
      });
      return;
    }

    const newUser = { name, username, email, phone, password, access };

    Swal.fire({
      title: 'Confirm Save',
      text: 'Are you sure you want to save this new user?',
      icon: 'warning',
      showCancelButton: true,
      reverseButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await onSave(newUser);
          onClose();
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'The new user has been saved.',
          });
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'An error occurred while saving the user.',
          });
        }
      }
    });
  };

  return (
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={onClose}>&times;</span>
          <h2>Add New User</h2>
          <div className="form-group">
            <AiOutlineUser className="icon"/>
            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={handleNameChange}
                onKeyPress={handleNameKeyPress}
                maxLength={20} // Limita a 20 caracteres
            />
            <div>  {nameError && <p className={'error-add'}>{nameError}</p>}
            </div>
          </div>
          <div className="form-group">
            <CgRename className="icon"/>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={handleUsernameChange}
                onKeyPress={handleUsernameKeyPress}
                maxLength={20} // Limita a 20 caracteres
            />
            <div>  {usernameError && <p className={'error-add'}>{usernameError}</p>}
            </div>
          </div>
          <div className="form-group">
            <AiOutlineMail className="icon"/>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                onKeyPress={handleEmailKeyPress}
                maxLength={50} // Limita a 50 caracteres
            />
            <div>  {emailError && <p className={'error-add'}>{emailError}</p>}
            </div>
          </div>
          <div className="form-group">
            <IoPhonePortraitOutline className="icon"/>
            <input
                type="text"
                placeholder="Phone"
                value={phone}
                onChange={handlePhoneChange}
                onKeyPress={handlePhoneKeyPress}
                maxLength={20} // Limita a 20 caracteres
            />
            <div>  {phoneError && <p className={'error-add'}>{phoneError}</p>}
            </div>
          </div>
          <div className="form-group">
            <IoLockClosedOutline className="icon"/>
            <input type="text" value={password} disabled/>
            <div> <p className={'error-add'}>Default password. User will be able to change it later.</p>
            </div>
          </div>
          <div className="form-group">
            <FaUserShield className="icon"/>
            <select className="dropdown-button" value={access} onChange={(e) => setAccess(parseInt(e.target.value))}>
              <option value={0}>Super</option>
              <option value={1}>R&W</option>
              <option value={2}>Read-only</option>
            </select>
          </div>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
  );
};

export default AddUserModal;
