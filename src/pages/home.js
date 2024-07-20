import '../App.css';
import Timer from '../components/Timer';
import ButtonCreate from "../components/ButtonCreate";
import Playlist from "../components/Playlist";
import {useState} from 'react';

const Home = () => {

  const [showPlaylist, setShowPlaylist] = useState(false);

  const handleClickCreate = () => {
    setShowPlaylist(true);
  };

  return (
      <div className="App">
        <h1>Select the length of your playlist</h1>
        <Timer />
        <p>Any blank field will be assume to contain 00</p>
        <ButtonCreate
            handleClick={handleClickCreate}
        />
        {showPlaylist && <Playlist
            items='40'
            length='1 hour & 13 minutes'
        />}
      </div>
  );
}

export default Home;
