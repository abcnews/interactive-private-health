const { h, Component } = require('preact');
const styles = require('./Input.css');

const NON_NUMERIC_PATTERN = /[^\d.-]/g;
const ESC_KEY = 27;
const K_KEY = 75;

const numeric = value => value.replace(NON_NUMERIC_PATTERN, '');

class Input extends Component {
  constructor(props) {
    super(props);

    this.getInputRef = this.getInputRef.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onInput = this.onInput.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = { value: null };
  }

  getInputRef(el) {
    this._input = el;
  }

  onBlur() {
    if (this.state.value !== null) {
      this._input.focus();

      setTimeout(() => {
        if (!('reportValidity' in this._input) || this._input.reportValidity()) {
          this.onSubmit();
        }
      }, 0);
    }
  }

  onInput() {
    if (this._input.value && this._input.type === 'number') {
      this._input.value = numeric(this._input.value);
    }

    if (this._input.value !== this.props.value) {
      this.setState({ value: this._input.value });
    }
  }

  onKeyDown({ keyCode }) {
    // When the user presses escape, reset `state.value` so `props.value` shows
    if (keyCode === ESC_KEY) {
      return this.setState({ value: null });
    }

    // When the user types 'k' in a number input, and the current absolute value is less than 1000, append '000'
    if (
      keyCode === K_KEY &&
      this._input.type === 'number' &&
      this._input.value.length > 0 &&
      this._input.value.length < 4
    ) {
      this._input.value = `${numeric(this._input.value)}000`;
    }
  }

  onSubmit(event) {
    if (event) {
      event.preventDefault();
    }

    const value = this._input.value;

    this.setState({ value: null });

    if (value === this.props.value) {
      return;
    }

    this.props.onChange({ name: this.props.name, value: value ? value : null });
  }

  render({ type, name, value, placeholder, attributes = {} }) {
    return (
      <div>
        <form
          className={`${styles.root}${this.state.value !== null ? ` ${styles.editing}` : ''}`}
          onSubmit={this.onSubmit}
          data-name={name}
        >
          <input
            ref={this.getInputRef}
            name={name}
            type={type || 'text'}
            value={this.state.value !== null ? this.state.value : value}
            placeholder={placeholder}
            onBlur={this.onBlur}
            onInput={this.onInput}
            onKeyDown={this.onKeyDown}
            {...attributes}
          />
          <button type="submit" tabIndex="-1" />
        </form>
      </div>
    );
  }
}

module.exports = Input;
