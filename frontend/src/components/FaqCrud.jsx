import '../stylesheets/Question.css';
import { useState, useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Heading from '../utils/Heading'; // Ruta a la extensión personalizada
import Swal from 'sweetalert2';
import { FaSave, FaTimes, FaEdit, FaEye, FaEyeSlash, FaTrash, FaBold, FaItalic, FaLink } from 'react-icons/fa';

function FaqCrud({ question, answer, isOpen, isNew, onClick, onSave, onDelete, onToggleVisibility, visible }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(question);
  const [editedAnswer, setEditedAnswer] = useState(answer);

  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isNew) {
      setIsEditing(true);
    }
  }, [isNew]);

  const questionEditor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Link,
      Bold,
      Italic,
      Heading,
    ],
    content: editedQuestion,
    onUpdate: ({ editor }) => {
      setEditedQuestion(editor.getHTML());
    }
  });

  const answerEditor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Bold,
      Italic,
    ],
    content: editedAnswer,
    onUpdate: ({ editor }) => {
      setEditedAnswer(editor.getHTML());
    }
  });

  const handleSave = () => {
    onSave(editedQuestion, editedAnswer);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (isNew) {
      onDelete();
    } else {
      setIsEditing(false);
    }
  };

  const insertLink = () => {
    Swal.fire({
      title: 'Enter the URL',
      input: 'url',
      inputPlaceholder: 'Enter the URL',
      showCancelButton: true,
      reverseButtons: true,
      inputValidator: (value) => {
        if (!value) {
          return 'You need to write something!';
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        answerEditor.chain().focus().setLink({ href: result.value }).run();
      }
    });
  };

  return (
      <div className={'question-container'}>
        <div className={'question'} onClick={onClick}>
          {isEditing ? (
              <div onClick={e => e.stopPropagation()}>
                <EditorContent editor={questionEditor} className={'question-editor'} />
              </div>
          ) : (
              <h2 className={'question-text'} dangerouslySetInnerHTML={{ __html: question }} />
          )}
          <i className="fa fa-question-circle" aria-hidden="true"></i>
        </div>
        {isOpen && (
            <div className={'answer'}>
              {isEditing ? (
                  <>
                    <div className="editor-toolbar">
                      <button className={'editor-btn'} onClick={() => answerEditor.chain().focus().toggleBold().run()}><FaBold/></button>
                      <button className={'editor-btn'} onClick={() => answerEditor.chain().focus().toggleItalic().run()}><FaItalic/></button>
                      <button className={'editor-btn'} onClick={insertLink}><FaLink/></button>
                    </div>
                    <EditorContent editor={answerEditor} className={'edit-editor'}/>

                    <div className="crud-icons">
                      <i className={'fa fa-save'} onClick={handleSave}/>
                      <i className={'fa fa-times'} onClick={handleCancel}/>
                    </div>
                  </>
              ) : (
                  <>
                    <p className={'answer-text'} dangerouslySetInnerHTML={{__html: answer}}/>
                    <div className="crud-icons">
                      <i className={'fa fa-edit'} onClick={() => setIsEditing(true)}/>
                      <i className={`fa ${visible ? 'fa-eye' : 'fa-eye-slash'}`} aria-hidden="true"
                         onClick={onToggleVisibility}></i>
                      <i className={'fa fa-trash'} onClick={onDelete}/>
                    </div>
                  </>
              )}
            </div>
        )}
      </div>
  );
}

export default FaqCrud;
