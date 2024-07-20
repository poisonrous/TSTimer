import '../stylesheets/Field.css'

function Field({ unit }) {
//TO-DO: find a way to limit the maxlength of a number input
  return (
      <input
          type='number'
          placeholder={unit}
          name={unit.toLowerCase()}
          //maxLength='2'
          max='99'
          min='0'
      />
  );
}

export default Field;