import React, { useState, useContext, useEffect } from 'react';
import Swal from 'sweetalert2';
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
    if (newQuestion.length < 15 || newAnswer.length < 15) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Both question and answer should be at least 15 characthers long',
      });
      return;
    }

    Swal.fire({
      title: 'Are you sure about the changes?',
      text: 'You can go back and keep editing if not',
      icon: 'warning',
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await handleSaveFaq(id, newQuestion, newAnswer);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Changes have been saved',
        });
      } else if (id === null) {
        // Si es una nueva pregunta y el usuario cancela, se mantiene el editor abierto.
        setOpenQuestionIndex(faqs.length);
      } else {
        setOpenQuestionIndex(faqs.findIndex(faq => faq._id === id));
      }
    });
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure you wanna delete this question?',
      text: 'You can change its visibility if you just wanna hide it',
      icon: 'warning',
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (id) {
          await handleDeleteFaq(id);
        } else {
          setNewQuestion(null);
        }
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'The question has been removed',
        });
      }
    });
  };

  const handleToggleVisibility = async (id, currentVisibility) => {
    Swal.fire({
      title: 'Are you sure about changing the visibility',
      text: `Visitors ${currentVisibility ? "won't" : 'will'} be able to see this question`,
      icon: 'warning',
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText: 'Change',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await handleToggleFaqVisibility(id, currentVisibility);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Visitors ${currentVisibility ? "won't" : 'will'} see this question now`,
        });
      }
    });
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
