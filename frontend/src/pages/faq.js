import Question from '../components/Question'
import { useState } from 'react';
import App from './app'

const Faq = () => {

  const [openQuestionIndex, setOpenQuestionIndex] = useState(null);

  const handleQuestionClick = (index) => {
    setOpenQuestionIndex(openQuestionIndex === index ? null : index);
  };

  const questions = [
    { question: 'How precise are the playlists?', answer: "We try to show an accurate result when this exists, but it's not always possible, thus your playlist could be up to 20 longer or shorter than requested."},
    { question: 'Why can\'t I get an exact result?', answer: "When working with a finite set of numbers (in this case, the length of every track), there's also a finite combinations and sums you can make, so not every length is reachable using only Taylor Swift songs."},
    { question: 'Why only Taylor Swift songs?', answer: "Even though using a wider catalogue would've made it easier to achieve more specific timeframes, the true is it's kinda impossible to use all tracks from every artist on a single app. There's millions of songs in Spotify, which would affect the perfomance of the website. I'm not even sure if there's a method to call ALL songs through the Spotify API.\nTaylor Swift has the advantage of having a huge catalogue, but it remains finite, which is exactly what I needed. But the short answer is that I'm a swiftie :)"},
    { question: 'How does it work?', answer: 'The first step of the app is converting the timeframe to miliseconds. Then it makes a call to the Spotify API to get an array of all Taylor Swift songs and uses an algorithm to calculate the closest sum it can make to the timeframe based on the length of the songs. It arranges the result in a new array and then creates a playlist that the user can save to their library. You can check the code here.'},
    { question: 'Can you make it work for this artist?', answer: "I might! I'd like to make a similar website for some of my favorite artists, and maybe some other popular ones. But I'm not sure when that will be or if I will ever make it for that specific artist you're thinking of, so why not go ahead and make it yourself?"}
  ];

  return (
      <App>
      <div className='Faq'>
        <h1>Frequently Asked Questions</h1>
        <p>If your question isn't here, <a href={'mailto: abreurosalinda@gmail.com'}>contact me</a> and I'll be happy to answer!</p>
        {questions.map((q, index) => (
            <Question
                key={index}
                question={q.question}
                answer={q.answer}
                isOpen={openQuestionIndex === index}
                onClick={() => handleQuestionClick(index)}
            />
        ))}
      </div>
      </App>
  );
}

export default Faq;