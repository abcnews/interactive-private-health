const { h, Component } = require('preact');
const styles = require('./Section.css');

const EMBEDDED_ATTRIBUTE = 'embedded';

const embedExternalContent = window.ABC ? ABC.News.embedExternalLinks.embedExternalContent : () => {};

class Section extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (this.props.elements) {
      this.props.elements.forEach(element => {
        this.base.appendChild(element);

        if (element.hasAttribute(EMBEDDED_ATTRIBUTE)) {
          return;
        }

        if (element.tagName === 'FIGURE' || element.className.indexOf('inline-content full') > -1) {
          element.setAttribute(EMBEDDED_ATTRIBUTE, '');
          embedExternalContent(element);
        }
      });
    }
  }

  componentWillUnmount() {
    if (this.props.elements) {
      this.props.elements.forEach(element => {
        if (element.parentElement === this.base) {
          this.base.removeChild(element);
        }
      });
    }
  }

  render({ key, elements, className, children, ...props }) {
    return (
      <div key={key} className={`${styles.root}${className ? ` ${className}` : ''} u-richtext`} {...props}>
        {children}
      </div>
    );
  }
}

module.exports = Section;
