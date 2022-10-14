import { h, Component } from 'preact';
import styles from './Section.css';

class Section extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (this.props.elements) {
      this.props.elements.forEach(element => {
        this.base.appendChild(element);
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

export default Section;
