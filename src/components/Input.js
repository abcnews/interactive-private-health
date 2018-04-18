const { h, Component } = require('preact');
const styles = require('./Input.css');

class Input extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.onInput = this.onInput.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);

    this.state = { value: null };
  }

  onInput({ target: { value = null } }) {
    if (value !== this.props.value) {
      this.setState({ value });
    }
  }

  onKeyDown(event) {
    if (event.keyCode === 13) {
      return this.onChange(event);
    }

    if (event.keyCode === 75 && event.target.type === 'number' && event.target.value.length < 4) {
      event.target.value = `${event.target.value}000`; // k
    }
  }

  onChange({ target: { value = null } }) {
    this.setState({ value: null });

    if (value === this.props.value) {
      return;
    }

    this.props.onChange({ name: this.props.name, value: value ? value : null });
  }

  render({ type, name, value, placeholder, attributes = {} }) {
    return (
      <div className={`${styles.root}${this.state.value !== null ? ` ${styles.editing}` : ''}`} data-name={name}>
        <input
          name={name}
          type={type || 'text'}
          value={this.state.value !== null ? this.state.value : value}
          placeholder={placeholder}
          onBlur={this.onChange}
          onInput={this.onInput}
          onKeyDown={this.onKeyDown}
          {...attributes}
        />
      </div>
    );
  }
}

module.exports = Input;
