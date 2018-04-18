const { h, Component } = require('preact');
const styles = require('./Blocker.css');

module.exports = () => (
  <p className={styles.root}>
    <div>☝️</div>
    <small>To continue reading, please complete the section above</small>
  </p>
);
