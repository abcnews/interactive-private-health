const { h, Component } = require('preact');
const styles = require('./Result.css');

module.exports = ({ children }) => <span className={styles.root}>{children}</span>;
