import React, { useState } from "react";
import { FaFilter, FaChevronDown } from "react-icons/fa";
import "../stylesheets/Dropdown.css";

const Dropdown = ({ title, options, selectedOption, onSelect, Icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
      <div className="dropdown">
        <button className="dropdown-button" onClick={() => setIsOpen(!isOpen)}>
              <div className={"icon-container"}>
                <Icon className="icon-dropdown" />
              </div>
          <div className={"labels-dropdown"}>
            <span className="title">{title}</span>
            <span className="selected-option">{selectedOption}</span>
          </div>
          <FaChevronDown className={"arrow"} />
        </button>
        {isOpen && (
            <div className="dropdown-content">
              {options.map((option, index) => (
                  <a key={index} href="#" onClick={() => handleSelect(option)}>
                    {option}
                  </a>
              ))}
            </div>
        )}
      </div>
  );
};

export default Dropdown;
