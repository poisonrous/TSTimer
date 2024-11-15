import CardNumber from '../components/CardNumber';
import { FaUsers } from "react-icons/fa";
import { FaMusic } from "react-icons/fa6";
import { MdLibraryMusic } from "react-icons/md";



const Stats = () => {
  return (
      <div>
        <div className={"statistics-first-row"}>
        <CardNumber
            number={"111"}
            descriptor={"Playlists created"}
            Icon={MdLibraryMusic}
        />
        <CardNumber
            number={"111"}
            descriptor={"Visitors"}
            Icon={FaUsers}
        />
        <CardNumber
            number={"111"}
            descriptor={"Minutes of music"}
            Icon={FaMusic}
        />
        </div>
      </div>
  );
};
export default Stats;