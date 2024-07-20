import Track from "./Track";
import '../stylesheets/Playlist.css'
import Button from "./Button";

function Playlist(props) {

  const handleClickSave = () => {
    alert('Este botón redirigiría a la página de autorización de Spotify para obtener los permisos y agregar la playlist al perfil del usuario')
  };

  return (
      <div className='playlist-container'>
        <div className='playlist-info-container'>
        <p className='playlist-info'>{props.items} songs, {props.length}</p>
        <Button
            text='Save'
            handleClick={handleClickSave}
        />
        </div>
        <div className='playlist'>
          <Track
              cover={require(`../test/red.jpeg`)}
              name="Nothing New (feat. Phoebe Bridgers) (Taylor's Version) (From The Vault)"
              artist='Taylor Swift'
              length='4:19'
          />
          <Track
              cover={require(`../test/ttpd.jpeg`)}
              name='So High School'
              artist='Taylor Swift'
              length='3:49'
          />
          <Track
              cover={require(`../test/1989.jpeg`)}
              name="Is It Over Now? (Taylor's Version) (From The Vault)"
              artist='Taylor Swift'
              length='3:50'
          />
        </div>
      </div>
  );
}

export default Playlist;