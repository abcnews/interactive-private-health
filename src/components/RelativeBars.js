import { h } from 'preact';
import { FORMATS } from './App.config';
import styles from './RelativeBars.css';

const RelativeBars = ({ items, color }) => {
  const names = Object.keys(items);
  const maxPct = names.reduce((memo, name) => Math.max(memo, items[name]), 0);

  return (
    <div className={styles.root}>
      {names.map(name => (
        <div>
          <div className={styles.name}>{name}</div>
          <div className={styles.value}>
            <div
              className={styles.bar}
              style={{
                width: FORMATS.percentage(items[name] / maxPct),
                backgroundColor: color
              }}
            >
              <span className={styles.label}>{FORMATS.percentage(items[name])}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RelativeBars;
