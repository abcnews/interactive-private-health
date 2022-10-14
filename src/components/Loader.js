import { h } from 'preact';
import styles from './Loader.css';

const Loader = ({ inverted, overlay, children }) => (
  <div className={`${styles.root}${inverted ? ` ${styles.isInverted}` : ''}${overlay ? ` ${styles.isOverlay}` : ''}`}>
    {children}
  </div>
);

export default Loader;
