import { AiOutlineUser } from "react-icons/ai";


const User = () => {
  return (
      <div>
        <div className={'section'}>
          <div className="form-group">
            <i className="icon-form">
              <AiOutlineUser/>
            </i>
            <input
                id={"name"}
                type={"text"}
            />
          </div>
          <div className="form-group">
            <i className="icon-form">
              <AiOutlineUser/>
            </i>
            <input
                id={"username"}
                type={"text"}
            />
          </div>
        </div>
      </div>
  );
};
export default User;