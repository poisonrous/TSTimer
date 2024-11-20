import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import BtnOption from '../components/BtnOption';
import Statistics from '../components/Stats';
import User from '../components/User';
import Users from '../components/Users';
import Collections from '../components/Collections';
import FAQs from '../components/FAQs';
import '../stylesheets/Panel.css';
import { DataProvider } from '../context/DataContext';

const AdminPanel = ({ onLogout, userAccess }) => {
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
      <DataProvider>
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
            {(userAccess==0)&&<BtnOption
                text="Users"
                iconName="users"
                selected={selectedOption === "users"}
                handleClick={handleOptionClick}
            />}
            {/*<BtnOption
            text="Collections"
            iconName="collections"
            selected={selectedOption === "collections"}
            handleClick={handleOptionClick}
          />*/}
            {(userAccess==1 || userAccess==0) &&<BtnOption
                text="FAQs"
                iconName="faqs"
                selected={selectedOption === "faqs"}
                handleClick={handleOptionClick}
            />}
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
            {selectedOption === "users" ? <Users /> : null}
            {selectedOption === "collections" ? <Collections /> : null}
            {selectedOption === "faqs" ? <FAQs /> : null}
          </article>
        </div>
      </DataProvider>
  );
};

export default AdminPanel;
