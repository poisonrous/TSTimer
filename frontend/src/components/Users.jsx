import { useEffect, useState } from 'react';
import AccessModal from './AccessModal';
import AddUserModal from './AddUserModal';
import PasswordModal from './PasswordModal';
import { FaUserShield } from 'react-icons/fa';
import { AiOutlineUser, AiOutlineMail, AiOutlineUserAdd } from 'react-icons/ai';
import { IoPhonePortraitOutline } from 'react-icons/io5';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        const activeUsers = data.filter(user => !user.deletedAt);
        setUsers(activeUsers);
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setShowModal(false);
  };

  const handleSaveAccess = async (userId, access) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/access`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access }),
        credentials: 'include',
      });
      const updatedUser = await response.json();
      setUsers(users.map(user => user._id === updatedUser._id ? updatedUser : user));
    } catch (error) {
      console.error('Error al actualizar acceso del usuario:', error);
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

      if (!response.ok) {
        throw new Error('Error al borrar lógicamente el usuario');
      }

      // Marcar el usuario como eliminado en el estado local
      const updatedUser = await response.json();
      setUsers(users.map(u => u._id === updatedUser.user._id ? updatedUser.user : u));
      console.log('Usuario borrado lógicamente con éxito:', userId);
    } catch (error) {
      console.error('Error al borrar lógicamente el usuario:', error);
    }
  };

  const handleAddUser = async (newUser) => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
        credentials: 'include',
      });
      const addedUser = await response.json();
      setUsers([...users, addedUser]);
    } catch (error) {
      console.error('Error al agregar el usuario:', error);
    }
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
