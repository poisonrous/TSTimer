import '../App.css';
import Timer from '../components/Timer';
import ButtonCreate from "../components/ButtonCreate";
import Playlist from "../components/Playlist";
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const Home = () => {
  const [hh, setHh] = useState(0);
  const [mm, setMm] = useState(0);
  const [ss, setSs] = useState(0);
  const [songs, setSongs] = useState(0);
  const [reload, setReload] = useState(false);

  const [showPlaylist, setShowPlaylist] = useState(false);

  let input;

  const handleClickCreate = () => {
    const hours=document.getElementById('hh').value;
    const minutes=document.getElementById('mm').value;
    const seconds=document.getElementById('ss').value;
    setHh(hours);
    setMm(minutes);
    setSs(seconds);
    input = parseInt(60*60*hours)+parseInt(60*minutes)+parseInt(1*seconds);
    console.log('time converted to seconds: ' + input);
    setSongs(Math.floor(input/240));
    if(input >= 131) setShowPlaylist(true);
      else Swal.fire({
        text: "C'mon, you can't even fit Taylor's shortest song in that timeframe. Let's do better!"
    });
    setReload(!reload);
  };

  useEffect(() => {
    // This effect will run every time `reload` changes
  }, [reload]);

  return (
      <div className='App'>
        <h1>Select the length of your playlist</h1>
        <Timer />
        <p>Any blank field will be assume to contain 0</p>
        <ButtonCreate
            handleClick={handleClickCreate}
        />
        {showPlaylist && <Playlist
            items={`${songs}`}
            length={`${hh > 0 ? `${hh} hour${hh > 1 ? 's' : ''}`: ''} ${hh > 0 && mm > 0 ? ' & ' : '' } ${mm > 0 ? `${mm} minute${mm > 1 ? 's' : ''} `: ''}`}
        />}
      </div>
  );
}

export default Home;
