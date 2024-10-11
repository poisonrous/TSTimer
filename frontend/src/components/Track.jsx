import '../stylesheets/Track.css';
import { FaPlay, FaPause } from 'react-icons/fa'; // Añadir ícono de pausa
import { useState, useRef, useEffect } from 'react';

function Track(props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Asegúrate de resetear el tiempo del audio
      setIsPlaying(false);
    } else {
      const allAudios = document.getElementsByTagName('audio');
      for (let audio of allAudios) {
        audio.pause();
        audio.currentTime = 0; // Reset audio to the beginning
      }
      audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(error => console.error('Error al reproducir el audio:', error)); // Añadir manejo de error
    }
  };

  useEffect(() => {
    // Detener la reproducción si el componente se desmonta
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
      <div className='track-info'>
        <img src={props.cover} width='50px' alt={`Cover de ${props.name}`} />
        <div className='labels'>
          <label className='track-name'>{props.name}</label>
          <label className='artist-name'>{props.artist}</label>
          <label className='track-length'>{props.length}</label>
        </div>
        {isPlaying
            ? <FaPause className='icono-pause' onClick={handlePlayPause} />
            : <FaPlay className='icono-play' onClick={handlePlayPause} />
        }
        <audio ref={audioRef} src={props.previewUrl} preload='auto'></audio>
      </div>
  );
}

export default Track;
