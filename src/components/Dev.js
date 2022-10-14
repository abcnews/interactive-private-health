import { h } from 'preact';
import styles from './Dev.css';

const Dev = ({ inputs, outputs }) => (
  <div key="dev" className={styles.root}>
    <pre>{JSON.stringify({ inputs, outputs }, 2, 2)}</pre>
  </div>
);

export default Dev;
