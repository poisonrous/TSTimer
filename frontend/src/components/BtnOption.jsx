import { IoStatsChart } from "react-icons/io5";
import { MdCollectionsBookmark } from "react-icons/md";
import { AiOutlineUserAdd, AiOutlineUser, AiOutlineUsergroupAdd } from "react-icons/ai";
import { LuLogOut } from "react-icons/lu";



function BtnOption({ text, iconName, selected, handleClick }) {
  const iconMap = {
    statistics: <IoStatsChart />,
    user: <AiOutlineUser />,
    users: <AiOutlineUsergroupAdd />,
    newUser: <AiOutlineUserAdd />,
    collections: <MdCollectionsBookmark />,
    logout: <LuLogOut />,
  };

  return (
      <button
          onClick={() => handleClick(iconName)}
          className={`panel-btn ${selected ? "selected" : ""}`}
      >
        <i className="icon-btn">{iconMap[iconName]}</i>
        <p className="text-btn">{text}</p>
      </button>
  );
}

export default BtnOption;
