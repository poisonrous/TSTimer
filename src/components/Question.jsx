import '../stylesheets/Question.css'
import { useState } from 'react';

function Question({ question, answer, isOpen, onClick }) {

  return (
      <div className={'question-container'}>
        <div className={'question'} onClick={onClick}>
          <h2 className={'question-text'}>{question}</h2>
          <i className="fa fa-question-circle" aria-hidden="true"></i>
        </div>
        {isOpen && (
            <div className={'answer'}>
              <p className={'answer-text'}>{answer}</p>
            </div>
        )}
      </div>
  );
}

export default Question;