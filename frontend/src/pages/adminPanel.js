import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import BtnOption from '../components/BtnOption';
import Statistics from '../components/Stats';
import User from '../components/User';
import NewUser from '../components/NewUser';
import Collections from '../components/Collections';
import '../stylesheets/Panel.css'

const AdminPanel = ({ onLogout }) => {
  const [selectedOption, setSelectedOption] = useState("statistics");
  const navigate = useNavigate();

  const handleOptionClick = (option) => {
    setSelectedOption(option);

    if (option === "logout") {
      localStorage.removeItem('authToken');
      onLogout();
      navigate('/r-admin');
    }
  };

  return (
      <div className="dashboard-container">
        <aside className={`panel`}>
          <BtnOption
              text="Statistics"
              iconName="statistics"
              selected={selectedOption === "statistics"}
              handleClick={handleOptionClick}
          />
          <BtnOption
              text="Account"
              iconName="user"
              selected={selectedOption === "user"}
              handleClick={handleOptionClick}
          />
          <BtnOption
              text="New user"
              iconName="newUser"
              selected={selectedOption === "newUser"}
              handleClick={handleOptionClick}
          />
          <BtnOption
              text="Collections"
              iconName="collections"
              selected={selectedOption === "collections"}
              handleClick={handleOptionClick}
          />
          <BtnOption
              text="Log Out"
              iconName="logout"
              selected={selectedOption === "logout"}
              handleClick={handleOptionClick}
          />
        </aside>

        <article className="article-content">
          {selectedOption === "statistics" ? <Statistics /> : null}
          {selectedOption === "user" ? <User /> : null}
          {selectedOption === "newUser" ? <NewUser /> : null}
          {selectedOption === "collections" ? <Collections /> : null}
        </article>
      </div>
  );
};

export default AdminPanel;
