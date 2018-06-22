const { h, Component } = require('preact');
const AdaptiveFlow = require('./AdaptiveFlow');
const Blocker = require('./Blocker');
const Dev = require('./Dev');
const Input = require('./Input');
const Poll = require('./Poll');
const PremiumsTable = require('./PremiumsTable');
const ProceduresTable = require('./ProceduresTable');
const RelativeBars = require('./RelativeBars');
const Result = require('./Result');
const Section = require('./Section');
const Selector = require('./Selector');
const Split = require('./Split');
const {
  DEV_STATE,
  FIELDS,
  FIRST_YEAR_LOADING,
  FORMATS,
  JUL_1_MOST_RECENT,
  LINKS,
  LOW_INCOME_THRESHOLD,
  ORDINAL,
  REASONS_FOR_HAVING,
  REASONS_FOR_NOT_HAVING,
  getComputedState
} = require('./App.config');
const styles = require('./App.css');

// console.clear();
// const tests = [
//   {
//     input: { age: '84', ageLastJuly1: '84', isInsured: 'no' },
//     expected: { willAccrueLoading: false, effectiveLoadingYears: 0, loading: 0 }
//   },
//   {
//     input: { age: '84', ageLastJuly1: '83', isInsured: 'no' },
//     expected: { willAccrueLoading: true, effectiveLoadingYears: 53, loading: 0.7 }
//   },
//   {
//     input: { age: '64', ageLastJuly1: '64', isInsured: 'no' },
//     expected: { willAccrueLoading: true, effectiveLoadingYears: 34, loading: 0.68 }
//   },
//   {
//     input: { age: '64', ageLastJuly1: '63', isInsured: 'no' },
//     expected: { willAccrueLoading: true, effectiveLoadingYears: 33, loading: 0.66 }
//   },
//   {
//     input: { age: '33', ageLastJuly1: '33', isInsured: 'no' },
//     expected: { willAccrueLoading: true, effectiveLoadingYears: 3, loading: 0.06 }
//   },
//   {
//     input: { age: '33', ageLastJuly1: '32', isInsured: 'no' },
//     expected: { willAccrueLoading: true, effectiveLoadingYears: 2, loading: 0.04 }
//   },
//   {
//     input: { age: '32', ageLastJuly1: '31', isInsured: 'no' },
//     expected: { willAccrueLoading: true, effectiveLoadingYears: 1, loading: 0.02 }
//   },
//   {
//     input: { age: '31', ageLastJuly1: '31', isInsured: 'no' },
//     expected: { willAccrueLoading: true, effectiveLoadingYears: 1, loading: 0.02 }
//   },
//   {
//     input: { age: '31', ageLastJuly1: '30', isInsured: 'no' },
//     expected: { willAccrueLoading: false, effectiveLoadingYears: 0, loading: 0 }
//   }
// ]
//   .map(x => {
//     const output = getComputedState(x.input);

//     return Object.keys(x.expected).reduce(
//       (memo, key) => {
//         if (x.expected[key] !== output[key]) {
//           memo.failed = true;
//           memo[`${key}E`] = x.expected[key];
//           memo[key] = output[key];
//         }

//         return memo;
//       },
//       { ...x.input }
//     );
//   })
//   .filter(x => x.failed);

// if (tests.length) {
//   console.table(tests);
// } else {
//   console.debug('👌 All tests passed');
// }

class App extends Component {
  constructor(props) {
    super(props);

    this.onVariableChange = this.onVariableChange.bind(this);

    if (props.isDev) {
      window.__prefill__ = () => this.setState(DEV_STATE);
    }

    this.state = Object.keys(FIELDS).reduce((memo, name) => {
      memo[name] = null;

      return memo;
    }, {});
  }

  onVariableChange({ name, value }) {
    const nextState = { [name]: value };

    if (FIELDS[name].resets) {
      FIELDS[name].resets.forEach(name => (nextState[name] = null));
    }

    this.setState(nextState);

    if (name !== 'isWorthIt' || !this.props.api || this.state.isWorthItAudience) {
      return;
    }

    this.props.api.increment({ question: name, answer: value }, (error, response) => {
      if (error || response.error) {
        return;
      }

      this.setState({
        isWorthItAudience: response.value
      });
    });
  }

  has(names) {
    return (
      !Array.isArray(names) ||
      names.every(name => (name in this.computedState ? this.computedState[name] : this.state[name]) != null)
    );
  }

  renderContent(key) {
    return this.props.content[key] && <Section key={`${key}Content`} elements={this.props.content[key]} />;
  }

  renderField(name) {
    const choices =
      typeof FIELDS[name].choices === 'function' ? FIELDS[name].choices(this.state) : FIELDS[name].choices;

    const placeholder =
      typeof FIELDS[name].placeholder === 'function' ? FIELDS[name].placeholder(this.state) : FIELDS[name].placeholder;

    return Array.isArray(choices) ? (
      <Selector
        name={name}
        value={this.state[name]}
        choices={choices}
        asButtons={FIELDS[name].asButtons}
        noOptionLabel={FIELDS[name].noOptionLabel}
        shouldLock={FIELDS[name].shouldLock}
        onChange={this.onVariableChange}
      />
    ) : (
      <Input
        type={FIELDS[name].type}
        name={name}
        value={this.state[name]}
        placeholder={placeholder}
        onChange={this.onVariableChange}
        attributes={FIELDS[name].attributes}
      />
    );
  }

  renderResult(name, format = 'dollarAmount') {
    const value = name in this.computedState ? this.computedState[name] : this.state[name];

    return <Result>{value != null ? FORMATS[format](value) : 'XXXX'}</Result>;
  }

  render({ isDev }) {
    this.computedState = getComputedState(this.state);

    return (
      <div className={styles.root}>
        {this.renderContent('intro')}

        {this.renderContent('precost')}
        <Section key="relationshipField">
          <h4>Are you single or one of a couple?</h4>
          {this.renderField('relationship')}
        </Section>
        <Section key="childrenField">
          <h4>How many dependent children do you have?</h4>
          {this.renderField('children')}
        </Section>
        {this.has(['household']) ? (
          <Section key="costResults">
            <p>These are the levels of cover, moving from lowest to highest cost:</p>
            <PremiumsTable household={this.computedState.household} />
          </Section>
        ) : (
          <Blocker />
        )}
        {this.has(['household']) && this.renderContent('postcost')}

        {this.renderContent('presurcharge')}
        <Section key="incomeField">
          <h4>
            {this.state.relationship === 'couple'
              ? `What's the combined taxable income of you and your partner?`
              : `What’s your taxable income?`}
          </h4>
          {this.renderField('income')}
          <p>
            <small>
              Taxable income should include any reportable fringe benefits and superannuation contributions and also any
              net investment losses.{' '}
              <a href={LINKS.surcharge} target="_blank">
                Find more information on what is included
              </a>.
            </small>
          </p>
        </Section>
        {this.has(['surcharge']) ? (
          <Section key="surchargeResults">
            <h3>
              {`Your Medicare Levy Surcharge is:`}
              <br />
              {this.renderResult('surcharge')}
            </h3>
            <p>
              {`That means the Government charges you `}
              {this.renderResult('surcharge')}
              {this.has(['lowIncomeSaving']) && '*'}
              {` if you don’t have private hospital cover. In comparison, your household cover costs on average:`}
            </p>
            <ul>
              <li>
                {this.renderResult('coverBasic')}
                {' per year for basic cover'}
              </li>
              <li>
                {this.renderResult('coverMedium')}
                {' per year for medium cover'}
              </li>
              <li>
                {this.renderResult('coverTop')}
                {' per year for top cover'}
              </li>
            </ul>
            {this.has(['lowIncomeSaving']) && (
              <p>
                <small>
                  {`* If one of you earns between $1 and `}
                  {FORMATS['dollarAmount'](LOW_INCOME_THRESHOLD)}
                  {` they don't have to pay the levy, which will reduce the surcharge by up to `}
                  {FORMATS['dollarAmount'](this.computedState.lowIncomeSaving)}
                  {'.'}
                </small>
              </p>
            )}
          </Section>
        ) : (
          <Blocker />
        )}
        {this.has(['surcharge']) && this.renderContent('postsurcharge')}

        {this.renderContent('prerebate')}
        <Section key="rebateFields">
          <h4>{`How old are you${this.state.relationship === 'couple' ? ' and your partner' : ''}?`}</h4>
          {this.state.relationship === 'couple' ? (
            <AdaptiveFlow>
              <div>
                <h5>Your age</h5>
                {this.renderField('age')}
              </div>
              <div>
                <h5>Your partner's age</h5>
                {this.renderField('partnerAge')}
              </div>
            </AdaptiveFlow>
          ) : (
            this.renderField('age')
          )}
        </Section>
        {this.has(['rebate']) ? (
          <Section key="rebateResults">
            <h3>
              {`Your${this.state.relationship === 'couple' ? ' combined' : ''} government rebate is:`}
              <br />
              {this.renderResult('rebate', 'percentage')}
            </h3>
            <p>
              {this.computedState.rebate
                ? 'This reduces your average hospital premiums to:'
                : 'Your average hospital premiums are:'}
            </p>
            <ul>
              <li>
                {this.renderResult('reducedCoverBasic')}
                {' per year for basic cover'}
              </li>
              <li>
                {this.renderResult('reducedCoverMedium')}
                {' per year for medium cover'}
              </li>
              <li>
                {this.renderResult('reducedCoverTop')}
                {' per year for top cover'}
              </li>
            </ul>
          </Section>
        ) : (
          <Blocker />
        )}
        {this.has(['rebate']) && this.renderContent('postrebate')}

        {this.renderContent('preloading')}
        <Section key="ageLastJuly1Field">
          <h4>
            {'What age were you on July 1'}
            <sup>st</sup>
            {` ${JUL_1_MOST_RECENT.getFullYear()}`}
          </h4>
          {this.renderField('ageLastJuly1')}
        </Section>
        {this.has(['ageLastJuly1']) &&
          !this.computedState.wasBornBeforeJuly1934 && (
            <Section key="isInsuredField">
              <h4>Do you have private health insurance?</h4>
              {this.renderField('isInsured')}
            </Section>
          )}
        {this.has(['ageLastJuly1']) &&
          !this.computedState.wasBornBeforeJuly1934 &&
          this.state.isInsured === 'yes' && (
            <Section key="whenInsuredField">
              <h4>When did you take out cover?</h4>
              {this.renderField('whenInsured')}
            </Section>
          )}
        {this.has(['ageLastJuly1', 'loading']) && (
          <Section key="loadingResults">
            <h3>
              {`Your Lifetime Health Cover loading ${this.computedState.insuredYears >= 10 ? `wa` : 'i'}s:`}
              <br />
              {this.renderResult('loading', 'percentage')}
            </h3>
            {this.computedState.loadingCode !== 'before1934' &&
              this.computedState.loadingCode !== 'continuous' && (
                <p>
                  {`Let’s look at how much money you've saved and how much extra you'll spend, based on ${
                    this.state.isInsured === 'no' ? 'your decision to not' : 'when you decided to'
                  } take out hospital cover.`}
                  {this.state.relationship !== 'single' && ` We’re assuming for this calculation that you are single.`}
                </p>
              )}
          </Section>
        )}
        {this.has(['ageLastJuly1', 'loading']) &&
          this.computedState.loadingCode === 'continuous' && (
            <Section key="loadingCodeResults">
              <p>
                {`According to your answers, you have had continuous cover since ${
                  this.computedState.wasInsuredBeforeJul2000
                    ? 'July 1st 2000'
                    : 'the July 1st following your 31st birthday'
                }, so you don’t
              have to pay a Lifetime Health Cover loading.`}
                {this.computedState.totalCoverCost && 'But in that time you have paid '}
                {this.computedState.totalCoverCost && this.renderResult('totalCoverCost')}
                {this.computedState.totalCoverCost &&
                  'more than someone the same age as you who did not take out cover.'}
              </p>
            </Section>
          )}
        {this.has(['ageLastJuly1', 'loading']) &&
          this.computedState.loadingCode === 'without' && (
            <Section key="loadingCodeResults">
              <p>
                {`According to your answers, you have had `}
                <Result>{`${this.computedState.effectiveLoadingYears} year${
                  this.computedState.effectiveLoadingYears === 1 ? '' : 's'
                }`}</Result>
                {` over age 30 with no cover, so${
                  this.state.isInsured === 'yes' ? '' : ' if you take out insurance'
                } that means you'${this.computedState.insuredYears >= 10 ? 've already paid' : 'll pay'} `}
                {this.renderResult('totalCoverLoadingCost')}
                {` more for singles medium cover over 10 years than someone who took out hospital cover early enough to avoid the loading. But by not having cover${
                  this.state.isInsured === 'yes' ? '' : ' since the loading was introduced in 2000'
                }, you have saved `}
                {this.renderResult('totalCoverCost')}
                {` in premiums on average compared with someone the same age as
              you.`}
              </p>
            </Section>
          )}
        {this.computedState.loadingCode === 'under31' && (
          <Section key="loadingCodeResults">
            <p>
              {this.state.isInsured === 'yes'
                ? `According to your answers, you are not subject to the Lifetime Health Cover loading. If you hadn't taken out cover, you'd have paid an extra two per cent for every year you delayed having hospital insurance from July 1 after your 31st birthday. That equates to `
                : `According to your answers, you are not yet subject to the Lifetime Health Cover loading. If you don't take out cover before July 1 after you turn 31, you will pay an extra two per cent for every year you delay having hospital insurance. If you do start paying for insurance, you will pay the loading every year for 10 years. That equates to `}
              <Result>{FORMATS.dollarAmount(FIRST_YEAR_LOADING)}</Result>
              {` in the first year for a medium level of hospital cover.`}
            </p>
          </Section>
        )}
        {this.has(['loadingCode']) ? this.renderContent(`loading${this.computedState.loadingCode}`) : <Blocker />}
        {this.has(['loading']) && this.renderContent('postloading')}

        {this.renderContent('preambulance')}
        <Section key="locationField">
          <h4>What state or territory do you live in?</h4>
          {this.renderField('location')}
        </Section>
        {this.has(['locationCode']) ? this.renderContent(`ambulance${this.computedState.locationCode}`) : <Blocker />}
        {this.has(['locationCode']) && this.renderContent('postambulance')}

        {this.renderContent('prewaiting')}
        <Section key="sexField">
          <h4>What sex are you?</h4>
          {this.renderField('sex')}
        </Section>
        {this.has(['waiting']) ? (
          <Section key="waitingResults">
            <p>{`For your age group and sex, ${
              ORDINAL[this.computedState.waiting.length]
            } common procedures and their waiting times are:`}</p>
            <ProceduresTable
              procedures={this.computedState.waiting}
              columns={[
                ['admissions', 'Hospital visits per year', 'amount'],
                ['wait', 'Median waiting time (days)', null]
              ]}
            />
            {this.has(['waitingKids']) && (
              <p>
                Because you have dependent children, here are the common procedures and waiting times for under-18s:
              </p>
            )}
            {this.has(['waitingKids']) && (
              <ProceduresTable
                procedures={this.computedState.waitingKids}
                columns={[
                  ['admissions', 'Hospital visits per year', 'amount'],
                  ['wait', 'Median waiting time (days)', null]
                ]}
              />
            )}
          </Section>
        ) : (
          <Blocker />
        )}
        {this.has(['waiting']) && this.renderContent('postwaiting')}

        {this.renderContent('preneed')}
        {this.has(['topN']) ? (
          <Section key="topNResults">
            <p>{`Here are the top ${
              ORDINAL[this.computedState.topN.length]
            } procedures covered by private health insurance for your age group and sex:`}</p>
            <ProceduresTable
              procedures={this.computedState.topN}
              columns={[
                ['totalCost', 'Total cost', 'dollarAmount'],
                ['oop', 'Median cost paid by patient', 'dollarAmount']
              ]}
            />
            {this.has(['topNKids']) && (
              <p>...and here are the top procedures covered by private health insurance for under-18s:</p>
            )}
            {this.has(['topNKids']) && (
              <ProceduresTable
                procedures={this.computedState.topNKids}
                columns={[
                  ['totalCost', 'Total cost', 'dollarAmount'],
                  ['oop', 'Median cost paid by patient', 'dollarAmount']
                ]}
              />
            )}
            {this.has(['benefits']) && (
              <p>
                {`People your age with private hospital insurance are paid on average $${
                  this.computedState.benefits
                } in benefits each year.`}
              </p>
            )}
          </Section>
        ) : (
          <Blocker />
        )}
        {this.has(['topN']) && this.renderContent('postneed')}

        {this.renderContent('prereasons')}
        {this.has(['coverage']) ? (
          <Section key="coverageResults">
            <p>
              {`For your age group and sex, `}
              {this.renderResult('coverage', 'percentage')}
              {` have hospital cover.`}
            </p>
            <p>
              Let's explore what people say when they're asked to explain their decision about whether to buy private
              health insurance.
            </p>
            <Split>
              <div>
                <label>
                  Reasons for <strong>having</strong> private health insurance
                </label>
                <RelativeBars items={REASONS_FOR_HAVING} color={'#FCBA04'} />
              </div>
              <div>
                <label>
                  Reasons for <strong>not having</strong> private health insurance
                </label>
                <RelativeBars items={REASONS_FOR_NOT_HAVING} color={'#00C6F7'} />
              </div>
            </Split>
          </Section>
        ) : (
          <Blocker />
        )}
        {this.has(['coverage']) && this.renderContent('postreasons')}

        {this.renderContent('prepoll')}
        <Section key="isWorthItField">
          <h4>Is private health insurance worth it?</h4>
          {this.renderField('isWorthIt')}
        </Section>
        {this.has(['isWorthIt']) ? (
          <Poll
            key={'isWorthItPoll'}
            choices={FIELDS.isWorthIt.choices}
            value={this.state.isWorthIt}
            results={this.state.isWorthItAudience}
          />
        ) : (
          <Blocker />
        )}
        {this.has(['isWorthIt']) && this.renderContent('postpoll')}

        {this.renderContent('notes')}

        {isDev && <Dev inputs={this.state} outputs={this.computedState} />}
      </div>
    );
  }
}

module.exports = App;
