import { useState } from 'react';
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

  const handleSave = async () => {
    const newUser = { name, username, email, phone, password, access };
    onSave(newUser);
    onClose();
  };

  return (
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={onClose}>&times;</span>
          <h2>Add New User</h2>
          <div className="form-group">
            <AiOutlineUser className="icon" />
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <CgRename className="icon" />
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="form-group">
            <AiOutlineMail className="icon" />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <IoPhonePortraitOutline className="icon" />
            <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <IoLockClosedOutline className="icon" />
            <input type="text" value={password} disabled="true" />
          </div>
          <div className="form-group">
            <FaUserShield className="icon" />
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
