import '../stylesheets/Footer.css'
import { FaGithub } from 'react-icons/fa';

function Footer() {
  return (
      <footer>
        <p>© 2024 — <a href={'https://github.com/poisonrous'} target={'_blank'}>
          <strong>poisonrous</strong><FaGithub />
        </a></p>
      </footer>
  );
}

export default Footer;