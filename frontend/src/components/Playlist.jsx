import Track from "./Track";
import '../stylesheets/Playlist.css';
import Button from "./Button";
import { useState } from 'react';

function Playlist(props) {
  // Estado global para manejar cuál pista se está reproduciendo
  const [currentPlaying, setCurrentPlaying] = useState(null);

  // Función para pausar todas las canciones
  const pauseAllTracks = () => {
    const allAudios = document.getElementsByTagName('audio');
    for (let audio of allAudios) {
      audio.pause();
      audio.currentTime = 0; // Resetear el tiempo del audio
    }
    setCurrentPlaying(null); // Actualizar el estado global
  };

  return (
      <div className='playlist-container'>
        <div className='playlist-info-container'>
          <p className='playlist-info'>{props.items.length} songs, {props.length}</p>
          <Button
              text='Save'
              handleClick={props.handleClickSave} // Usar la función pasada como prop
          />
        </div>
        <div className='playlist'>
          {props.items.map((track, index) => (
              <Track
                  key={index}
                  cover={track.src}
                  name={track.name}
                  artist={track.artist}
                  length={Math.floor(track.duration / 60) + ':' + ('0' + Math.floor(track.duration % 60)).slice(-2)}
                  previewUrl={track.preview_url}
                  pauseAllTracks={pauseAllTracks} // Pasar la función para pausar todas las canciones
                  isPlaying={currentPlaying === index} // Pasar el estado de reproducción actual
                  setCurrentPlaying={() => setCurrentPlaying(index)} // Establecer la pista actual
              />
          ))}
        </div>
      </div>
  );
}

export default Playlist;
