import { useContext, useState, useEffect } from 'react';
import AccessModal from './AccessModal';
import AddUserModal from './AddUserModal';
import PasswordModal from './PasswordModal';
import { FaUserShield } from 'react-icons/fa';
import { AiOutlineUser, AiOutlineMail, AiOutlineUserAdd } from 'react-icons/ai';
import { IoPhonePortraitOutline } from 'react-icons/io5';
import { DataContext } from '../context/DataContext';

const Users = () => {
  const { users, handleSaveAccess, handleDelete, handleAddUser, fetchUsers } = useContext(DataContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
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

  const handleOpenPasswordModal = (user) => {
    setUserToDelete(user);
    setShowPasswordModal(true);
  };

  const handleConfirmPassword = (password) => {
    if (userToDelete) {
      handleDelete(userToDelete._id, password);
      setUserToDelete(null);
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
              <div key={user._id} className="card">
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
                <button className={'users-button delete-btn'} onClick={() => handleOpenPasswordModal(user)}>Delete</button>
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
        {showPasswordModal && (
            <PasswordModal
                onClose={() => setShowPasswordModal(false)}
                onConfirm={handleConfirmPassword}
            />
        )}
      </div>
  );
};

export default Users;
