import '../App.css';
import Timer from '../components/Timer';
import ButtonCreate from "../components/ButtonCreate";
import Playlist from "../components/Playlist";
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import App from './app'

const Home = () => {

  const [hh, setHh] = useState(0);
  const [mm, setMm] = useState(0);
  const [ss, setSs] = useState(0);
  const [songs, setSongs] = useState([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [reload, setReload] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  let input;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');

    // Inicializar playlistSaved
    if (!localStorage.getItem('playlistSaved')) {
      localStorage.setItem('playlistSaved', 'false');
    }

    if (accessToken) {
      const tracks = JSON.parse(localStorage.getItem('tracks'));
      const duration = localStorage.getItem('totalDuration');
      const hours = localStorage.getItem('hh');
      const minutes = localStorage.getItem('mm');
      const seconds = localStorage.getItem('ss');

      if (tracks) {
        setSongs(tracks);  // Cargar la playlist guardada
        setTotalDuration(parseInt(duration)); // Cargar duración guardada
        setHh(parseInt(hours));
        setMm(parseInt(minutes));
        setSs(parseInt(seconds));
        setShowPlaylist(true);  // Asegurarse de mostrar la playlist
        handleSavePlaylist(accessToken, tracks);
        localStorage.removeItem('tracks'); // Limpiar storage después de guardar
        localStorage.removeItem('totalDuration');
        localStorage.removeItem('hh');
        localStorage.removeItem('mm');
        localStorage.removeItem('ss');
      }
    }
  }, []);

  const sendInput = async (input) => {
    const messages = [
      { title: "Shaking it off...", text: "Creating your playlist now!" },
      { title: "Hang tight!", text: "We're weaving some 'Enchanted' magic." },
      { title: "Just a moment...", text: "We're adding some 'Style' to your playlist!" },
      { title: "Sit tight!", text: "We're 'Fearlessly' creating your playlist." },
      { title: "Hold on...", text: "You're about to get 'Red'-hot tracks!" },
      { title: "Almost there!", text: "Getting your 'Wildest Dreams' playlist ready." },
      { title: "Bear with us...", text: "We're putting your playlist together 'All Too Well'!" }
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    try {
      Swal.fire({
        title: randomMessage.title,
        text: randomMessage.text,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await fetch('http://localhost:5000/api/playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tiempo: input }),
      });
      const data = await response.json();
      Swal.close(); // Cerrar el indicador de carga
      setSongs(data); // Actualizamos el estado con las canciones recibidas

      // Calcular la duración total de la playlist generada
      const total = data.reduce((acc, song) => acc + song.duracion, 0);
      setTotalDuration(total);
      localStorage.setItem('totalDuration', total); // Guardar duración en localStorage
    } catch (error) {
      Swal.close(); // Cerrar el indicador de carga en caso de error
      console.error('Error al enviar el tiempo al servidor:', error);
      Swal.fire({
        icon: 'error',
        text: 'Error al enviar el tiempo al servidor. Inténtalo de nuevo.',
      });
    }
  };

  const handleClickCreate = () => {
    const hours = document.getElementById('hh').value;
    const minutes = document.getElementById('mm').value;
    const seconds = document.getElementById('ss').value;
    setHh(hours);
    setMm(minutes);
    setSs(seconds);
    input = parseInt(60 * 60 * hours) + parseInt(60 * minutes) + parseInt(1 * seconds);
    localStorage.setItem('hh', hours);
    localStorage.setItem('mm', minutes);
    localStorage.setItem('ss', seconds);

    if (input >= 131) {
      setShowPlaylist(true);
      sendInput(input);
    } else {
      Swal.fire({
        text: "C'mon, you can't even fit Taylor's shortest song in that timeframe. Let's do better!"
      });
    }
    setReload(!reload);  // Esto podría no ser necesario si reinicia el estado
  };

  const handleClickSave = () => {
    localStorage.setItem('tracks', JSON.stringify(songs));
    localStorage.setItem('playlistSaved', 'false'); // Restablecer estado de guardado
    window.location.href = 'http://localhost:5000/login'; // Redirigir a la autenticación
  };

  const savePlaylist = () => {
    localStorage.setItem('tracks', JSON.stringify(songs));
    localStorage.setItem('playlistSaved', 'false'); // Restablecer estado de guardado
    window.location.href = 'http://localhost:5000/login'; // Redirigir a la autenticación
  };

  const handleSavePlaylist = async (accessToken, tracks) => {
    const messages = [
      { title: "Setting the stage...", text: "Just a sec, we're saving your playlist magic!" },
      { title: "It's happening...", text: "Your playlist is about to sparkle with Swift tunes." },
      { title: "In the studio...", text: "We're crafting your playlist hit by hit!" },
      { title: "Mic check...", text: "We're tuning up your playlist for perfection!" },
      { title: "Almost ready...", text: "Your playlist is getting the final touch of brilliance!" },
      { title: "Hang tight...", text: "Your playlist is getting the 'Taylor' treatment!" },
      { title: "Just a beat away...", text: "Your playlist is coming together perfectly!" }
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    try {
      Swal.fire({
        title: randomMessage.title,
        text: randomMessage.text,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const playlistName = 'TSTimer';
      const description = 'Playlist generated by TSTimer.';
      const response = await fetch('http://localhost:5000/api/save-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          playlistName: playlistName,
          description: description,
          tracks: tracks
        }),
      });

      const data = await response.json();
      Swal.close(); // Cerrar el indicador de carga
      if (data.message) {
        Swal.fire({
          icon: 'success',
          title: 'Playlist added to your library',
          text: 'Hope you enjoy it!',
        });
        localStorage.setItem('playlistSaved', 'true'); // Marcar como guardada
      } else {
        throw new Error('The playlist could not be saved.'); // Lanzar un error para que sea capturado
      }
    } catch (error) {
      Swal.close(); // Cerrar el indicador de carga en caso de error
      console.error('Error al guardar la playlist:', error.message);
      Swal.fire({
        icon: 'error',
        text: `Error al guardar la playlist: ${error.message}`,
      });
    }
  };

  // Convertir la duración total a un formato legible
  const formatDuration = (duration) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);
    return `${hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}, ` : ''}${minutes} minute${minutes !== 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''}`;
  };

  return (
<App>
      <div className={`Home ${showPlaylist ? 'with-playlist' : ''}`}>
        <h1>Select the length of your playlist</h1>
        <Timer />
        <p>Any blank field will be assume to contain 0</p>
        <ButtonCreate
            handleClick={handleClickCreate}
        />
        {showPlaylist && <Playlist
            items={songs}
            length={formatDuration(totalDuration)} // Duración real de la playlist generada
            handleClickSave={handleClickSave} // Pasar la función handleClickSave como prop
        />}
      </div>
</App>
  );
}

export default Home;
