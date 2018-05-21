const { h, Component } = require('preact');
const styles = require('./Split.css');

module.exports = ({ children }) => <div className={styles.root}>{children}</div>;
