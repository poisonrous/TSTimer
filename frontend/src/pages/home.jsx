import '../App.css';
import Timer from '../components/Timer';
import ButtonCreate from "../components/ButtonCreate";
import Playlist from "../components/Playlist";
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import App from './app';

const Home = () => {

  const SERVER = import.meta.env.VITE_SERVER_URL;

  const [hh, setHh] = useState(0);
  const [mm, setMm] = useState(0);
  const [ss, setSs] = useState(0);
  const [songs, setSongs] = useState([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [reload, setReload] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [hasError, setHasError] = useState(false);

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
      }
    }

    // Configurar el cliente WebSocket
    const ws = new WebSocket(`wss:${SERVER}:8080`);
    ws.onmessage = function(event) {
      const message = JSON.parse(event.data);
      console.log('URL de previsualización recibida:', message.preview_url);
      setSongs((prevSongs) => prevSongs.map(song =>
          song.spotifyId === message.spotifyId ? { ...song, preview_url: message.preview_url } : song
      ));
    };

    ws.onopen = function() {
      ws.send('Cliente conectado');
    };

    return () => {
      ws.close(); // Cerrar la conexión WebSocket al desmontar el componente
    };
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

      const response = await fetch(`${SERVER}/api/playlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiempo: input }),
      });
      const data = await response.json();
      Swal.close();

      if (Array.isArray(data)) {
        setSongs(data);
        // Calcular la duración total de la playlist generada
        const total = data.reduce((acc, song) => acc + song.duration, 0);
        setTotalDuration(total);
        localStorage.setItem('totalDuration', total);
        localStorage.setItem('hh', hh); // Mantener la hora en localStorage
        localStorage.setItem('mm', mm); // Mantener los minutos en localStorage
        localStorage.setItem('ss', ss); // Mantener los segundos en localStorage
        setShowPlaylist(true);
        // Llamar a handlePostPlaylist para registrar la playlist
        await handlePostPlaylist(data, total);
        setHasError(false);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      Swal.close();
      console.error('Error al enviar el tiempo al servidor:', error);
      Swal.fire({ icon: 'error', text: "There's been an error sending your request... But you can try again." });
      setHasError(true);
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
      sendInput(input);
    } else {
      Swal.fire({
        text: "C'mon, you can't even fit Taylor's shortest song in that timeframe. Let's do better!"
      });
    }
    // Eliminar setReload(!reload) ya que puede no ser necesario
  };

  const handlePostPlaylist = async (tracks, totalDuration) => {
    try {
      const playlistName = 'TSTimer';
      const description = 'Playlist generated by TSTimer.';
      const response = await fetch(`${SERVER}/api/post-playlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          playlistName: playlistName,
          description: description,
          tracks: tracks,
          requestedDuration: input,
          actualDuration: totalDuration
        })
      });
      const data = await response.json();
      console.log('Playlist registrada:', data);

      // Guarda el playlistId en el localStorage
      localStorage.setItem('playlistId', data.playlistId);
    } catch (error) {
      console.error('Error al registrar la playlist:', error);
    }
  };

  const handleClickSave = () => {
    localStorage.setItem('tracks', JSON.stringify(songs));
    localStorage.setItem('playlistSaved', 'false'); // Restablecer estado de guardado
    window.location.href = `${SERVER}/login`; // Redirigir a la autenticación
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
      const playlistId = localStorage.getItem('playlistId'); // Obtener el playlistId del localStorage

      const response = await fetch(`${SERVER}/api/save-playlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          playlistId: playlistId, // Incluir playlistId en la solicitud
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
