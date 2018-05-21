const { h, Component } = require('preact');
const styles = require('./AdaptiveFlow.css');

module.exports = ({ children, partitioned }) => (
  <div className={`${styles.root}${partitioned ? ` ${styled.partitioned}` : ''}`}>{children}</div>
);
