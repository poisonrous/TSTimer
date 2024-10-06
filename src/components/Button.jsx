import '../stylesheets/Button.css'

function Button({ text, handleClick }){
  const isSave = value => {
    if(text=='Save') return true;
  }

  return (
      <div
          className={`button ${isSave({text}) ? 'save' : ''}`}
          onClick={() => handleClick()}
      >
        {text}
      </div>
  );
}

export default Button;