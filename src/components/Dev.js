const { h, Component } = require('preact');
const styles = require('./Dev.css');

module.exports = ({ inputs, outputs }) => (
  <div key="dev" className={styles.root}>
    <pre>{JSON.stringify({ inputs, outputs }, 2, 2)}</pre>
  </div>
);
