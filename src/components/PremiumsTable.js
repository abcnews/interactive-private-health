const { h, Component } = require('preact');
const { FORMATS, PREMIUMS_2018 } = require('./App.config');
const styles = require('./PremiumsTable.css');

module.exports = ({ household }) => (
  <table className={styles.root}>
    <thead>
      <tr>
        <th>Hospital cover*</th>
        <th>Whatʼs covered</th>
        <th>{`Average annual cost (${household})`}</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Basic</td>
        <td>
          Lots of restrictions and exclusions, including for heart procedures, plastic surgery, mental health services
          and palliative care
        </td>
        <td>{FORMATS.dollarAmount(PREMIUMS_2018.basic[household])}</td>
      </tr>
      <tr>
        <td>Medium</td>
        <td>
          Includes things not in basic cover; restrictions/exclusions include pregnancy and birth services, IVF,
          cataracts and hip replacements
        </td>
        <td>{FORMATS.dollarAmount(PREMIUMS_2018.medium[household])}</td>
      </tr>
      <tr>
        <td>Top</td>
        <td>No exclusions and restrictions, covers all services where Medicare pays a benefit</td>
        <td>{FORMATS.dollarAmount(PREMIUMS_2018.top[household])}</td>
      </tr>
      <tr>
        <td colspan="3">
          {' '}
          <small>*Public cover (private patient in public hospital, usually with waiting list) is also available</small>
        </td>
      </tr>
    </tbody>
  </table>
);
