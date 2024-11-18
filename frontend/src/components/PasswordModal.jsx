import React, { useState } from 'react';
import { IoLockClosedOutline } from "react-icons/io5";

const PasswordModal = ({ onClose, onConfirm }) => {
  const [password, setPassword] = useState('');

  const handleConfirm = () => {
    onConfirm(password);
    onClose();
  };

  return (
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={onClose}>&times;</span>
          <h2>Enter Your Password</h2>
          <div className="form-group">
            <IoLockClosedOutline/>
          <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
          />
          </div>
          <button onClick={handleConfirm}>Confirm</button>
        </div>
      </div>
  );
};

export default PasswordModal;
