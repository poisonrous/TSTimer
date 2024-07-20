import '../stylesheets/Track.css'
import { FaPlay } from 'react-icons/fa';

function Track(props) {
  return (<div className='track-info'>
    <img src={props.cover} width='50px' />
      <div className='labels'>
      <label className='track-name'>{props.name}</label>
      <label className='artist-name'>{props.artist}</label>
      <label className='track-length'>{props.length}</label>
      </div>
          <FaPlay className='icono-play' />
  </div>
  );
}

export default Track;