import '../stylesheets/Button.css'

function Button({ text, handleClick }){
//TO-DO: add the save class to change the color of the button
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