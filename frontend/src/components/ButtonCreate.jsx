import '../stylesheets/ButtonCreate.css'

function ButtonCreate({ handleClick }) {
  return (
      <div className='button-create'>
        <button
            onClick={() => handleClick()}>
          Create
        </button>
      </div>
  );
}

export default ButtonCreate;