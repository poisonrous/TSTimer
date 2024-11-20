import React, { useEffect } from 'react';
import Swal from 'sweetalert2';
import { IoLockClosedOutline } from "react-icons/io5";

const PasswordModal = ({ onClose, onConfirm }) => {
  useEffect(() => {
    Swal.fire({
      title: 'Enter Your Password',
      html: `
        <div class="swal-form-group">
          <IoLockClosedOutline />
          <input type="password" id="swal-input" class="swal2-input" placeholder="Password"/>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      reverseButtons: true,
      preConfirm: () => {
        const password = Swal.getPopup().querySelector('#swal-input').value;
        if (!password) {
          Swal.showValidationMessage('Please enter your password');
        }
        return password;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        onConfirm(result.value);
      }
      onClose();
    });

    return () => {
      Swal.close();
    };
  }, [onClose, onConfirm]);

  return null;
};

export default PasswordModal;
