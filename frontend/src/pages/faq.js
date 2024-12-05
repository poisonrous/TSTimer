import React, { useState, useEffect } from 'react';
import Question from '../components/Question';
import App from './app';

const Faq = () => {
  const [openQuestionIndex, setOpenQuestionIndex] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/faqs');
        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error('Error al obtener las preguntas:', error);
      }
    };

    fetchQuestions();
  }, []);

  const handleQuestionClick = (index) => {
    setOpenQuestionIndex(openQuestionIndex === index ? null : index);
  };

  return (
      <App>
        <div className='Faq'>
          <h1>Frequently Asked Questions</h1>
          <p>If your question isn't here, <a href='mailto: abreurosalinda@gmail.com'>contact me</a> and I'll be happy to answer!</p>
          {questions.map((q, index) => (
              q.visible === true && (  <Question
                  key={index}
                  question={q.question}
                  answer={q.answer}
                  isOpen={openQuestionIndex === index}
                  onClick={() => handleQuestionClick(index)}
              />
              )
          ))}
        </div>
      </App>
  );
};

export default Faq;
