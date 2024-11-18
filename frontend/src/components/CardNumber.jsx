import React from "react";
import "../stylesheets/Panel.css";

const CardNumber = ({ number, descriptor, Icon, className = "" }) => {
  return (
      <div className={`card stats-numbers ${className}`}>
        {Icon && (
            <div className={"card-icon-container"}>
              <Icon className="card-icon" />
            </div>
        )}
        <div className={"labels"}>
          <h1 className="card-number">{number}</h1>
          <span className="card-descriptor">{descriptor}</span>
        </div>
      </div>
  );
};

export default CardNumber;
