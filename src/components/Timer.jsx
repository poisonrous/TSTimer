import '../stylesheets/Timer.css'
import Field from './Field'

function Timer() {
  return (
      <div className='timer'>
        <Field unit='HH' max='12' />
        <Field unit='mm' max='59' />
        <Field unit='ss' max='59' />
      </div>
  );
}

export default Timer;