const { h, Component } = require('preact');
const styles = require('./Loader.css');

module.exports = ({ inverted, overlay, children }) => (
  <div className={`${styles.root}${inverted ? ` ${styles.isInverted}` : ''}${overlay ? ` ${styles.isOverlay}` : ''}`}>
    {children}
  </div>
);
