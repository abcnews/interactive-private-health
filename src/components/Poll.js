const { h, Component } = require('preact');
const CountUp = require('react-countup').default;
const Loader = require('./Loader');
const Section = require('./Section');
const styles = require('./Poll.css');

const Poll = ({ choices, results, value }) => {
  const { counts, total } = choices.reduce(
    (memo, choice) => {
      const count = (results && results[choice]) || 0;

      memo.counts[choice] = count;
      memo.total += count;

      return memo;
    },
    { counts: {}, total: 0 }
  );

  return (
    <Section className={`${styles.root}${results ? ` ${styles.hasResults}` : ''}`} aria-live="polite">
      {!results && <Loader overlay>Your response has been submitted</Loader>}
      <h3>
        {results
          ? `${Math.round(counts[value] / total * 100)}% of respondents agree with you so far`
          : `Let's discover what other respondents think…`}
      </h3>
      <dl>
        {choices.map(choice => (
          <div>
            <dt className={styles.label}>{choice}</dt>
            <dd className={`${styles.value}${value === choice ? ` ${styles.isChosen}` : ''}`}>
              <CountUp
                className={styles.valuePct}
                start={0}
                end={results ? Math.round(counts[choice] / total * 100) : 0}
                duration={0.5}
                suffix={'%'}
              />
              <div
                className={styles.valueBar}
                role="presentation"
                style={{ transform: `scale(${results ? counts[choice] / total : 0}, 1)` }}
              />
            </dd>
          </div>
        ))}
      </dl>
      <p>
        <small>{results ? `from ${total} responses` : 'fetching responses'}</small>
      </p>
    </Section>
  );
};

module.exports = Poll;
