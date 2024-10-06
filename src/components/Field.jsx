import { useState } from 'react';
import '../stylesheets/Field.css';

function Field({ unit, max  }) {
  //TO-DO: add increment and decrement arrows
  const [value, setValue] = useState("");

  const handleInputChange = (e) => {
    let newValue = e.target.value;

    // Only accept digits
    const regex = /[^0-9]*$/;
    newValue = newValue.replace(regex, '');

    // Max two digits + changing to the next field when limit met
    if (newValue.length > 1) {
      //newValue = newValue.slice(0, 2);
      var elts = document.getElementsByClassName('field')
      Array.from(elts).forEach(function(elt){
        elt.addEventListener("keyup", function(event) {
          if (elt.value.length == 2 || elt.value >= 6 ) {
            if(elt.nextElementSibling) elt.nextElementSibling.focus();
            else newValue = newValue.slice(0, 2);
          }
        });
      })
    }

      // Asegurar que el valor esté entre 0 y el valor maximo permitido
      if (
          newValue === "" ||
          (parseInt(newValue) >= 0 && parseInt(newValue) <= max)
      ) {
        setValue(newValue);
      }
  };
  return (
        <input
            type="text"
            placeholder={unit}
            id={unit.toLowerCase()}
            value={value}
            onInput={handleInputChange}
            class="field"
        />
  );
}

export default Field;