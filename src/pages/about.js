import '../stylesheets/About.css'
import { FaSpotify, FaReact, FaNode } from 'react-icons/fa';
const About = () => {
  return (
      <div className='About'>
        <h1>About this project</h1>
        <p>This project was made as an assignment for the Fundamentals of Web Applications course at UCLA
          (Barquisimeto, Venezuela).
          It's a playlist generator that uses the Spotify API to give back a playlist with the closest length to the
          one requested by the user.</p>
        <h2>About me</h2>
        <p>Hi! My name is Rosalinda and I'm a 23 years old programmer from Venezuela.
          I'm getting my degree in Telematics Engineering and want to specialize in software development.
          This was made as a assigment for one of my courses and kinda for fun too. Hope you like it!</p>
        <h2>Technologies and Tools</h2>
        <div className={'technologies'}>
          <div className={'tech'}>
            <FaSpotify className={'tech-icon'}/>
            <h3>Spotify</h3>
            <p>The Spotify API is used to get the songs and length, then it's used again to create the playlist and save
              it to the user's library.</p>
          </div>

          <div className={'tech'}>
            <FaReact className={'tech-icon'}/>
            <h3>React</h3>
            <p>This JavaScript framework is used for the frontend. It's been using for creating components such as the buttons,
              question cards, the apparence of the timer and even the track themselves.</p>
          </div>

          <div className={'tech'}>
            <FaNode className={'tech-icon'}/>
            <h3>NodeJs</h3>
            <p>This technology is used in the backend for making the API calls, connecting to the server and manage the database.</p>
          </div>
        </div>
      </div>
  );
}

export default About;