import { useContext, useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import AccessModal from './AccessModal';
import AddUserModal from './AddUserModal';
import { FaUserShield } from 'react-icons/fa';
import { AiOutlineUser, AiOutlineMail, AiOutlineUserAdd } from 'react-icons/ai';
import { IoPhonePortraitOutline } from 'react-icons/io5';
import { DataContext } from '../context/DataContext';

const Users = () => {
  const { users, handleSaveAccess, handleAddUser, fetchUsers, userData } = useContext(DataContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setShowModal(false);
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleOpenDeleteModal = (user) => {
    setUserToDelete(user);
    confirmDeleteUser(user);
  };

  const confirmDeleteUser = async (user) => {
    const { value: password } = await Swal.fire({
      title: user._id === userData._id ? 'Are you sure you wanna delete your own account?' : `Are you sure you wanna delete ${user.username}?`,
      text: user._id === userData._id ?
          'This is your account and it will log out' :
          'This is a permanent action',
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
            resolve(null);
          } else {
            resolve(password);
          }
        });
      },
      html:
          "<label><input type='checkbox' />I'm sure about deleting this account</label>",
    });

    if (password) {
      handleDelete(user._id, password);
    }
  };

  const handleDelete = async (userId, password) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/delete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
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

      console.log('Cuenta eliminada con éxito:', data);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: "This account has been deleted and you're logging out",
      }).then(() => {
        if (userId === userData._id) {
          fetch('http://localhost:5000/api/logout', {
            method: 'POST',
            credentials: 'include'
          }).then(() => {
            window.location.href = '/r-admin';
          });
        }
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || "We couldn't delete this account",
      });
    }
  };

  return (
      <div>
        <button className="dropdown-button" onClick={handleOpenAddModal}>
          <div className={"icon-container"}>
            <AiOutlineUserAdd className="icon-dropdown"/>
          </div>
          <div className={"labels-dropdown"}>
            <span className="title">Add new user</span>
          </div>
        </button>
        <div className="users-map">
          {users.map((user) => (
              <div key={user._id} className="card users">
                <h3>{user.username}</h3>
                <p>
                  <FaUserShield className="icon"/> {user.access == 0 ? 'Super' : user.access == 1 ? 'R&W' : 'Read-only'}
                </p>
                <p>
                  <AiOutlineUser className="icon"/> {user.name}
                </p>
                <p>
                  <AiOutlineMail className="icon"/> {user.email}
                </p>
                <p>
                  <IoPhonePortraitOutline className="icon"/> {user.phone}
                </p>
                <button className={'users-button delete-btn'} onClick={() => handleOpenDeleteModal(user)}>Delete</button>
                <button className={'users-button'} onClick={() => handleOpenModal(user)}>Change access</button>
              </div>
          ))}
        </div>
        {showModal && selectedUser && (
            <AccessModal
                user={selectedUser}
                onClose={handleCloseModal}
                onSave={handleSaveAccess}
            />
        )}
        {showAddModal && (
            <AddUserModal
                onClose={handleCloseAddModal}
                onSave={handleAddUser}
            />
        )}
      </div>
  );
};

export default Users;
