const { h, Component } = require('preact');
const styles = require('./Section.css');

const EMBEDDED_ATTRIBUTE = 'embedded';

const embedExternalContent = window.ABC ? ABC.News.embedExternalLinks.embedExternalContent : () => {};

let revealDelay = 0;

class Section extends Component {
  constructor(props) {
    super(props);

    // this.onRevelaled = this.onRevelaled.bind(this);
  }

  // maybeReveal() {
  //   setTimeout(() => {
  //     if (this.wasAlreadyRevealed || window.getComputedStyle(this.base).display === 'none') {
  //       return;
  //     }

  //     this.wasAlreadyRevealed = true;
  //     this.base.style.setProperty('animation-delay', `${0.125 * revealDelay++}s`);
  //     this.base.addEventListener('animationend', this.onRevelaled);
  //     this.base.classList.add(styles.reveal);
  //   }, 0);
  // }

  // onRevelaled() {
  //   revealDelay--;

  //   if (this.base) {
  //     this.base.style.setProperty('animation-delay', null);
  //     this.base.removeEventListener('animationend', this.onRevelaled);
  //     this.base.classList.remove(styles.reveal);
  //   }
  // }

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

    // this.maybeReveal();
  }

  // componentDidUpdate() {
  //   this.maybeReveal();
  // }

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
      <div key={key} className={`${className ? `${className} ` : ''}u-richtext`} {...props}>
        {children}
      </div>
    );
  }
}

module.exports = Section;
