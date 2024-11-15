import Track from "./Track";
import '../stylesheets/Playlist.css';
import Button from "./Button";

function Playlist(props) {
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
              />
          ))}
        </div>
      </div>
  );
}

export default Playlist;
