import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import BtnOption from '../components/BtnOption';
import Statistics from '../components/Stats';
import User from '../components/User';
import Users from '../components/Users';
import Collections from '../components/Collections';
import FAQs from '../components/FAQs';
import '../stylesheets/Panel.css';
import { RiMenuFold2Fill, RiMenuFold3Fill } from "react-icons/ri";
import { DataProvider } from '../context/DataContext';
import useWindowSize from '../utils/useWindowSize';

const AdminPanel = ({ onLogout, userAccess }) => {
  const [selectedOption, setSelectedOption] = useState("statistics");
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const navigate = useNavigate();

  const size = useWindowSize();
  const isMobile = size.width <= 768;

  useEffect(() => {
    if (!isMobile) setIsPanelOpen(true);
  }, [isMobile]);

  const handleOptionClick = async (option) => {
    setSelectedOption(option);

    if (option === "logout") {
      try {
        const response = await fetch('/api/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Logout failed');
        }

        const data = await response.json();
        console.log(data.message);

        localStorage.removeItem('authToken');
        onLogout();
        navigate('/r-admin');
      } catch (error) {
        console.error('Error during logout:', error);
        // Puedes agregar alguna notificación de error para el usuario aquí
      }
    }
  };

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  return (
      <DataProvider>
        <div className="dashboard-container">
          <button className="toggle-button" onClick={togglePanel}>
            {isPanelOpen ? <RiMenuFold3Fill /> : <RiMenuFold2Fill />}
          </button>
          <aside className={`panel ${isPanelOpen ? "open" : "closed"}`}>
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
            {(userAccess == 0) && <BtnOption
                text="Users"
                iconName="users"
                selected={selectedOption === "users"}
                handleClick={handleOptionClick}
            />}
            {(userAccess == 1 || userAccess == 0) && <BtnOption
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
            {selectedOption === "statistics" && <Statistics />}
            {selectedOption === "user" && <User />}
            {selectedOption === "users" && <Users />}
            {selectedOption === "collections" && <Collections />}
            {selectedOption === "faqs" && <FAQs />}
          </article>
        </div>
      </DataProvider>
  );
};

export default AdminPanel;
