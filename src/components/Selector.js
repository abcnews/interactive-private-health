const { h, Component } = require('preact');
const styles = require('./Selector.css');

const NO_OPTION = '---';
const NO_OPTION_LABEL = '– – –';
const NO_OPTION_FOLLOWING_BUTTONS_LABEL = 'More';

class Selector extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  onKeyDown(event) {
    const isLeft = event.keyCode === 37;
    const isRight = event.keyCode === 39;

    if (!isLeft && !isRight) {
      return;
    }

    const activeElement = document.activeElement;
    const focusableElements = Array.prototype.slice.call(this.base.querySelectorAll('button, select'));
    const activeElementIndex = focusableElements.indexOf(activeElement);

    event.preventDefault();

    // [1]
    if (activeElement.tagName === 'SELECT') {
      this._selectedIndex = activeElement.selectedIndex;
      setTimeout(() => {
        activeElement.selectedIndex = this._selectedIndex;
        this._selectedIndex = null;
      }, 0);
    }

    if (isLeft && activeElementIndex > 0) {
      return focusableElements[activeElementIndex - 1].focus();
    }

    if (isRight && activeElementIndex > -1 && activeElementIndex + 1 < focusableElements.length) {
      return focusableElements[activeElementIndex + 1].focus();
    }
  }

  onChange(event) {
    // [1]
    if (this._selectedIndex) {
      return;
    }

    const value = event.target.value || event.target.dataset.value;

    this.props.onChange({ name: this.props.name, value: value && value !== this.props.value ? value : null });
  }

  componentDidUpdate() {
    if (this.props.value !== null && this.props.choices.indexOf(this.props.value) === -1) {
      this.props.onChange({ name: this.props.name, value: null });
    }
  }

  render({ name, value, choices, asButtons = 0, noOptionLabel, shouldLock }) {
    let buttonChoices = choices.length < 3 ? choices : asButtons > 0 ? choices.slice(0, asButtons) : [];
    let optionChoices = choices.length >= 3 ? [null].concat(choices.slice(asButtons)) : [];

    return (
      <div className={styles.root} data-name={name} onKeyDown={this.onKeyDown}>
        {buttonChoices
          .map(choice => (
            <button
              className={`${choice === value ? ` ${styles.chosen}` : ''}${
                choice == +choice ? ` ${styles.number}` : ''
              }`}
              data-value={choice}
              onClick={this.onChange}
              disabled={shouldLock && value !== null}
            >
              {choice}
            </button>
          ))
          .concat(
            optionChoices.length
              ? [
                  <div
                    className={`${styles.dropdown}${
                      value && buttonChoices.indexOf(value) === -1
                        ? ` ${styles.chosen}${value == +value ? ` ${styles.number}` : ''}`
                        : ''
                    }`}
                    data-label={
                      value && buttonChoices.indexOf(value) === -1
                        ? value
                        : noOptionLabel
                          ? noOptionLabel
                          : buttonChoices.length
                            ? NO_OPTION_FOLLOWING_BUTTONS_LABEL
                            : NO_OPTION_LABEL
                    }
                  >
                    <select onChange={this.onChange} disabled={shouldLock && value !== null}>
                      {optionChoices.map(choice => (
                        <option value={choice || ''} selected={choice === value}>
                          {choice || NO_OPTION}
                        </option>
                      ))}
                    </select>
                    <div className={styles.innerFocusRing} />
                  </div>
                ]
              : []
          )}
      </div>
    );
  }
}

module.exports = Selector;

/*
[1] Firefox decrements/increments select values on left/right arrow presses, so we
    need to revert those unintended changes when we're using left/right to change focus.
*/
