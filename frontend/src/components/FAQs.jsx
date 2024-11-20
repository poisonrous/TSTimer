import React, { useState, useContext, useEffect } from 'react';
import FaqCrud from '../components/FaqCrud';
import { FaFileCircleQuestion } from "react-icons/fa6";
import { DataContext } from '../context/DataContext';

const FAQs = () => {
  const { faqs, handleSaveFaq, handleDeleteFaq, handleToggleFaqVisibility, fetchFaqs, loading } = useContext(DataContext);
  const [openQuestionIndex, setOpenQuestionIndex] = useState(null);
  const [newQuestion, setNewQuestion] = useState(null);

  useEffect(() => {
    if (faqs.length === 0) {
      fetchFaqs();
    }
  }, [fetchFaqs, faqs.length]);

  const handleQuestionClick = (index) => {
    setOpenQuestionIndex(openQuestionIndex === index ? null : index);
  };

  const handleSave = async (id, newQuestion, newAnswer) => {
    await handleSaveFaq(id, newQuestion, newAnswer);
  };

  const handleDelete = async (id) => {
    if (id) {
      await handleDeleteFaq(id);
    } else {
      setNewQuestion(null);
    }
  };

  const handleToggleVisibility = async (id, currentVisibility) => {
    await handleToggleFaqVisibility(id, currentVisibility);
  };

  const addNewQuestion = () => {
    setNewQuestion({ question: '', answer: '', visible: true });
    setOpenQuestionIndex(null);
  };

  if (loading.faqs) {
    return <p>Loading FAQs...</p>;
  }

  return (
      <div>
        <button className="dropdown-button" style={{ marginBottom: "20px" }} onClick={addNewQuestion}>
          <div className={"icon-container"}>
            <FaFileCircleQuestion className="icon-dropdown" />
          </div>
          <div className={"labels-dropdown"}>
            <span className="title">Add question</span>
          </div>
        </button>
        {newQuestion && (
            <FaqCrud
                question={newQuestion.question}
                answer={newQuestion.answer}
                visible={newQuestion.visible}
                isOpen={true}
                isNew={true}
                onClick={() => setOpenQuestionIndex(null)}
                onSave={(newQuestion, newAnswer) => handleSave(null, newQuestion, newAnswer)}
                onDelete={() => handleDelete(null)}
                onToggleVisibility={() => {}}
            />
        )}
        {faqs.map((q, index) => (
            <FaqCrud
                key={q._id}
                question={q.question}
                answer={q.answer}
                visible={q.visible}
                isOpen={openQuestionIndex === index}
                onClick={() => handleQuestionClick(index)}
                onSave={(newQuestion, newAnswer) => handleSave(q._id, newQuestion, newAnswer)}
                onDelete={() => handleDelete(q._id)}
                onToggleVisibility={() => handleToggleVisibility(q._id, q.visible)}
            />
        ))}
      </div>
  );
};

export default FAQs;
