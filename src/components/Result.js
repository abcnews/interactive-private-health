import { h } from 'preact';
import styles from './Result.css';

const Result = ({ children }) => <span className={styles.root}>{children}</span>;

export default Result;
