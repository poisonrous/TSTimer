import '../stylesheets/Track.css';
import { FaPlay, FaPause } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';

function Track(props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Resetear el tiempo del audio
      setIsPlaying(false);
      props.setCurrentPlaying(null); // Actualizar el estado global
    } else {
      props.pauseAllTracks(); // Pausar todas las canciones antes de reproducir esta
      audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            props.setCurrentPlaying(); // Establecer esta pista como la actual en reproducción
          })
          .catch(error => console.error('Error al reproducir el audio:', error)); // Añadir manejo de error
    }
  };

  useEffect(() => {
    if (props.isPlaying !== isPlaying) {
      setIsPlaying(props.isPlaying);
      if (!props.isPlaying && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Resetear el tiempo del audio
      }
    }
  }, [props.isPlaying]);

  useEffect(() => {
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.addEventListener('pause', handlePause);
      audioElement.addEventListener('play', handlePlay);
    }

    return () => {
      if (audioElement) {
        audioElement.removeEventListener('pause', handlePause);
        audioElement.removeEventListener('play', handlePlay);
      }
    };
  }, []);

  useEffect(() => {
    // Detener la reproducción si el componente se desmonta
    setIsPlaying(false);
  }, [props.name]);

  return (
      <div className='track-info'>
        <img src={props.cover} width='50px' alt={`Cover de ${props.name}`} />
        <div className='labels'>
          <label className='track-name'>{props.name}</label>
          <label className='artist-name'>{props.artist}</label>
          <label className='track-length'>{props.length}</label>
        </div>
        {isPlaying
            ? <FaPause className='icono-play' onClick={handlePlayPause} />
            : <FaPlay className='icono-play' onClick={handlePlayPause} />
        }
        <audio ref={audioRef} src={props.previewUrl} preload='auto'></audio>
      </div>
  );
}

export default Track;
