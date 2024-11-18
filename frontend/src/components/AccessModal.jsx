import '../stylesheets/Modal.css'
import { useState } from 'react';
import Dropdown from './Dropdown';
import { FaUserShield } from 'react-icons/fa';

const AccessModal = ({ user, onClose, onSave }) => {
  const [access, setAccess] = useState(user.access);

  const handleSave = () => {
    onSave(user._id, access);
    onClose();
  };

  const accessOptions = [
    { label: 'Super', value: '0' },
    { label: 'R&W', value: '1' },
    { label: 'Read-only', value: '2' }
  ];

  const selectedOptionLabel = accessOptions.find(option => option.value === access)?.label;

  return (
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={onClose}>&times;</span>
          <h2>Change Access Level for {user.username}</h2>
          <Dropdown
              title="Access Level"
              options={accessOptions.map(option => option.label)}
              selectedOption={selectedOptionLabel}
              onSelect={label => {
                const selectedOption = accessOptions.find(option => option.label === label);
                setAccess(selectedOption.value);
              }}
              Icon={FaUserShield}
          />
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
  );
};

export default AccessModal;
