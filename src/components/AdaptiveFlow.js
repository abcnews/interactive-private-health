const { h, Component } = require('preact');
const styles = require('./AdaptiveFlow.css');

module.exports = ({ children }) => <div className={styles.root}>{children}</div>;
