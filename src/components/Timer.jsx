import '../stylesheets/Timer.css'
import Field from './Field'

function Timer() {
  return (
      <div className='timer'>
        <Field unit='HH' />
        <Field unit='mm' />
        <Field unit='ss' />
      </div>
  );
}

export default Timer;