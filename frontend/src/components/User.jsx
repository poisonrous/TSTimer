import { useEffect, useState } from 'react';
import { AiOutlineUser, AiOutlineMail } from "react-icons/ai";
import { CgRename } from "react-icons/cg";
import { IoLockOpenOutline, IoLockClosedOutline, IoPhonePortraitOutline } from "react-icons/io5";

const User = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

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
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
      <div>
        <div className={'section'}>
          <h1>About you</h1>
          <div className={'row'}>
            <div className="form-group">
              <i className="icon-form">
                <AiOutlineUser/>
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
                <CgRename/>
              </i>
              <input
                  id={"username"}
                  type={"text"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <button className={'form-button'}>Save</button>
        </div>
        <div className={'section'}>
          <h1>Contact info</h1>
          <div className={'row'}>
            <div className="form-group">
              <i className="icon-form">
                <AiOutlineMail/>
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
                <IoPhonePortraitOutline/>
              </i>
              <input
                  id={"phone"}
                  type={"text"}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
          <button className={'form-button'}>Save</button>
        </div>
        <div className={'section'}>
          <h1>Change your password</h1>
          <div className={'row'}>
            <div className="form-group">
              <i className="icon-form">
                <IoLockClosedOutline/>
              </i>
              <input
                  id={"newpass"}
                  type={"text"}
              />
            </div>
            <div className="form-group">
              <i className="icon-form">
                <IoLockClosedOutline/>
              </i>
              <input
                  id={"confirmpass"}
                  type={"text"}
              />
            </div>
          </div>
          <button className={'form-button'}>Save</button>
        </div>
        <div className={'section delete'}>
          <h1>Delete account</h1>
          <p>This is a dangerous function and cannot be undone.</p>
          <button className={'form-button'}>Delete</button>
        </div>
      </div>
  );
};

export default User;
