const YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const TODAY = (now => (now.setHours(0, 0, 0, 0), now))(new Date());
const THIS_YEAR = TODAY.getFullYear();
const JUL_1_THIS_YEAR = new Date(THIS_YEAR, 6, 1);
const JUL_1_2000 = new Date(2000, 6, 1);
const JUL_1_1934 = new Date(1934, 6, 1);
const JUL_1_DIFF = (module.exports.JUL_1_DIFF = TODAY - JUL_1_THIS_YEAR);
const YEARS_SINCE_2000 = Math.floor((TODAY - JUL_1_2000) / YEAR_MS);
const YEARS_SINCE_1934 = Math.floor((TODAY - JUL_1_1934) / YEAR_MS);

const FIELDS = (module.exports.FIELDS = {
  relationship: { choices: ['single', 'couple'] },
  income: {
    type: 'number',
    placeholder: state => `Enter your${state.relationship == 'couple' ? ' combined' : ''} taxable income`,
    attributes: {
      min: 0,
      max: 1e9,
      step: 1000
    }
  },
  children: {
    choices: Array.apply(null, { length: 16 }).map(String.call, String),
    asButtons: 4
  },
  age: {
    type: 'number',
    placeholder: `Enter your age`,
    resets: ['ageOnJul1'],
    attributes: {
      min: 18
    }
  },
  partnerAge: {
    type: 'number',
    placeholder: `Enter your partner's age`,
    attributes: {
      min: 18
    }
  },
  ageOnJul1: {
    choices: state =>
      state.age == null
        ? []
        : JUL_1_DIFF < 0
          ? [state.age, String(+state.age + 1)]
          : [String(+state.age - 1), state.age]
  },
  isInsured: {
    choices: ['yes', 'no'],
    resets: ['whenInsured']
  },
  whenInsured: {
    choices: ['Before July 2000']
      .concat(Array.apply(null, { length: YEARS_SINCE_2000 - 1 }).map((x, i) => `${YEARS_SINCE_2000 - i} years ago`))
      .concat('1 year ago', '< 1 year ago'),
    asButtons: 1,
    noOptionLabel: 'Later'
  },
  location: {
    choices: [
      'Australian Capital Territory',
      'New South Wales',
      'Northern Territory',
      'Queensland',
      'South Australia',
      'Tasmania',
      'Victoria',
      'Western Australia'
    ]
  },
  sex: { choices: ['male', 'female'] },
  isWorthIt: { choices: ['yes', 'no'], shouldLock: true }
});

module.exports.DEV_STATE = {
  relationship: 'single',
  income: '99000',
  children: '0',
  age: '64',
  partnerAge: null,
  ageOnJul1: '64',
  isInsured: 'no',
  ageWhenInsuranceTaken: null,
  location: 'Queensland',
  sex: 'male',
  isWorthIt: null
};

const PATTERNS = {
  amount: /\B(?=(\d{3})+(?!\d))/g
};

const FORMATS = (module.exports.FORMATS = {
  amount: x => x.toString().replace(PATTERNS.amount, ','),
  dollarAmount: x => `$${FORMATS.amount(x)}`,
  percentage: x => {
    const pct = x * 100;
    const fixedPct = pct.toFixed(1);

    return `${fixedPct.indexOf('.0') > -1 ? Math.round(pct) : fixedPct}%`;
  }
});

const ORDINAL = (module.exports.ORDINAL = ['zero', 'one', 'two', 'three', 'four', 'five']);

module.exports.LINKS = {
  surcharge:
    'https://www.ato.gov.au/Individuals/Tax-Return/2017/Tax-return/Medicare-levy-questions-M1-M2/M2-Medicare-levy-surcharge-(MLS)-2017/'
};

const SURCHARGES = [0, 0.01, 0.0125, 0.015]; // x=tier

const LOW_INCOME_THRESHOLD = (module.exports.LOW_INCOME_THRESHOLD = 21655);

const PREMIUMS_2018 = {
  basic: {
    single: 1336,
    singleParent: 2245,
    couple: 2602,
    family: 2715
  },
  medium: {
    single: 1711,
    singleParent: 2843,
    couple: 3423,
    family: 3423
  },
  top: {
    single: 1872,
    singleParent: 3295,
    couple: 3738,
    family: 3747
  }
};

const REBATES = [[0.2542, 0.1694, 0.0847, 0], [0.2965, 0.2118, 0.1271, 0], [0.3389, 0.2542, 0.1694, 0]]; // x=age; y=tier

const KNOWN_PREMIUM_RISES = {
  2018: 0.0395,
  2017: 0.0484,
  2016: 0.0559,
  2015: 0.0618,
  2014: 0.062,
  2013: 0.056,
  2012: 0.0506,
  2011: 0.0556,
  2005: 0.0796,
  2004: 0.0758,
  2003: 0.074,
  2002: 0.069,
  2001: 0,
  2000: 0.018
};
const ASSUMED_PREMIUM_RISE = 0.05;
const [MEDIUM_SINGLE_PREMIUMS_2000_TO_TEN_YEARS_FROM_NOW, MEDIUM_SINGLE_PREMIUMS_NEXT_10_YEARS_TOTAL] = (() => {
  const premiums = {
    2018: PREMIUMS_2018.medium.single
  };
  let nextTenYearsTotal = 0;

  for (let year = 2017; year >= 2000; year--) {
    premiums[year] = premiums[year + 1] * (1 - (KNOWN_PREMIUM_RISES[year + 1] || ASSUMED_PREMIUM_RISE));
  }

  for (let year = 2019; year <= THIS_YEAR + 9; year++) {
    premiums[year] = premiums[year - 1] * (1 + ASSUMED_PREMIUM_RISE);
  }

  for (let year = THIS_YEAR; year <= THIS_YEAR + 9; year++) {
    nextTenYearsTotal += premiums[year];
  }

  return [premiums, nextTenYearsTotal];
})();
const FIRST_YEAR_LOADING = (module.exports.FIRST_YEAR_LOADING = (
  MEDIUM_SINGLE_PREMIUMS_2000_TO_TEN_YEARS_FROM_NOW[THIS_YEAR] * 0.02
).toFixed(2));

const LOCATION_CODES = {
  'Australian Capital Territory': 'act',
  'New South Wales': 'nsw',
  'Northern Territory': 'nt',
  Queensland: 'qld',
  'South Australia': 'sa',
  Tasmania: 'tas',
  Victoria: 'vic',
  'Western Australia': 'wa'
};

const COVERAGE_PROPORTION = {
  female: [
    0.386,
    0.446,
    0.477,
    0.442,
    0.325,
    0.296,
    0.457,
    0.525,
    0.503,
    0.524,
    0.518,
    0.549,
    0.575,
    0.559,
    0.586,
    0.524,
    0.497,
    0.444,
    0.357,
    0.335
  ],
  male: [
    0.391,
    0.448,
    0.477,
    0.445,
    0.305,
    0.25,
    0.404,
    0.484,
    0.474,
    0.505,
    0.496,
    0.529,
    0.556,
    0.529,
    0.559,
    0.529,
    0.511,
    0.49,
    0.38,
    0.259
  ]
};

const PROCEDURES = (module.exports.PROCEDURES = [
  // name, description, admissions, wait, totalCost, pctNoOOPs, oop
  ['ACL repair', 'Knee ligament repair', 0, 0, 8400, 0.2, 420],
  ['Acromioplasty/arthroscopy shoulder/sub acromial decompression', 'Repair shoulder joint', 1726, 85, 0, 0, 0],
  ['Angiogram', 'X-ray of arteries', 0, 0, 5300, 0.06, 60],
  ['Arthroscopy', 'Exploratory/repair procedure of joint', 13529, 68, 3800, 0.37, 400],
  ['Cardiac stents', 'Widen artery with a tube', 0, 0, 15800, 0.06, 70],
  ['Cataract', 'Remove cloudy eye lens', 71377, 85, 4300, 0.5, 500],
  ['Childbirth: C-section', '', 0, 0, 11300, 0.42, 400],
  ['Childbirth: Vaginal', '', 0, 0, 8600, 0.67, 270],
  ['Colonoscopy', 'Exploratory procedure of bowel', 0, 0, 1900, 0.72, 120],
  ['Cytoscopy', 'Exploratory procedure of bladder', 0, 0, 1500, 57, 710],
  ['Gall bladder surgery', '', 18611, 41, 7000, 0.18, 340],
  ['Gastroscopy', 'Exploratory procedure of digestive tract', 0, 0, 1300, 0.7, 110],
  ['Grommets', 'Tube to drain ear', 6742, 56, 2300, 0.39, 310],
  ['Inguinal herniotomy/herniorrhaphy', '', 16809, 52, 0, 0, 0],
  ['Inguinal/femoral hernia', 'Repair weakness in abdominal wall', 16809, 52, 5000, 0.47, 330],
  ['Hip replacement', '', 11151, 110, 25900, 0.16, 550],
  ['Hysteroscopy', 'Exploratory/repair procedure of uterus', 32062, 23, 2200, 0.35, 250],
  ['Hysterectomy (abdominal/vaginal/laparoscopic)', '', 11457, 55, 0, 0, 0],
  ['Knee replacement', '', 16853, 195, 22700, 0.17, 520],
  ['Laparoscopy', 'Exploratory procedure of abdomen', 9706, 47, 5100, 26, 500],
  ['Masectomy', 'Removal of breast', 4357, 16, 0, 0, 0],
  ['Prostate surgery', '', 8216, 41, 7100, 0.32, 380],
  ['Sleep studies', '', 0, 0, 1300, 0.94, 250],
  ['Sleeve gastrectomy', 'Surgery to reduce stomach size', 0, 0, 12200, 0.18, 500],
  ['Tonsils and adenoids', '', 19466, 97, 3500, 0.27, 420],
  ['Tooth extraction', '', 0, 0, 1600, 0.51, 260],
  ['Vasectomy', '', 0, 0, 1900, 0.42, 210],
  ['ACL reconstruction', 'Knee ligament reconstruction', 4050, 78, 0, 0, 0]
]);

const WAITING_TIMES_PROCEDURES = [
  [[24, 12], [24, 12]],
  [[24, 12], [24, 12]],
  [[24, 12], [24, 12]],
  [[27, 24], [27, 24]],
  [[27, 24], [27, 24]],
  [[27, 19], [27, 14, 3]],
  [[27, 19], [27, 14, 3]],
  [[16, 19], [3, 13]],
  [[16, 17], [3, 13]],
  [[10, 16], [3, 1]],
  [[10, 16], [3, 1]],
  [[18, 20], [21, 5]],
  [[18, 20], [21, 5]],
  [[18, 5], [18, 21, 5]],
  [[18, 5], [18, 21]],
  [[15, 5], [15, 21, 5]],
  [[15, 5], [15, 21]],
  [[15, 5], [15, 21, 5]],
  [[15, 5], [15, 21, 5]],
  [[15, 5], [15, 21, 5]],
  [[15, 5], [15, 21, 5]]
]; // x=age; y=sex; z=procedures

const TOP_N_COVERED_PROCEDURES = [
  [[24, 12, 25, 22, 11], [24, 12, 25, 22, 11]],
  [[24, 12, 25, 22, 11], [24, 12, 25, 22, 11]],
  [[24, 12, 25, 22, 11], [24, 12, 25, 22, 11]],
  [[0, 24, 8, 25, 11], [0, 24, 8, 25, 11]],
  [[0, 24, 8, 25, 11], [0, 24, 8, 25, 11]],
  [[6, 7, 0, 19, 8], [0, 14, 3, 23, 8]],
  [[6, 7, 0, 19, 8], [0, 14, 3, 23, 8]],
  [[6, 7, 23, 16, 8], [3, 26, 8, 22, 11]],
  [[6, 7, 23, 16, 8], [3, 26, 8, 22, 11]],
  [[10, 2, 16, 8, 22], [2, 14, 8, 22, 11]],
  [[10, 2, 16, 8, 22], [2, 14, 8, 22, 11]],
  [[18, 2, 8, 22, 11], [21, 5, 8, 9, 11]],
  [[18, 2, 8, 22, 11], [21, 5, 8, 9, 11]],
  [[18, 2, 5, 8, 22], [18, 21, 2, 5, 8]],
  [[18, 2, 5, 8, 22], [18, 21, 2, 5, 8]],
  [[15, 2, 5, 8, 11], [15, 4, 21, 5, 8]],
  [[15, 2, 5, 8, 11], [15, 4, 21, 5, 8]],
  [[15, 2, 5, 8, 11], [15, 4, 21, 5, 8]],
  [[15, 2, 5, 8, 11], [15, 4, 21, 5, 8]],
  [[15, 2, 5, 8, 11], [15, 4, 21, 5, 8]],
  [[15, 2, 5, 8, 11], [15, 4, 21, 5, 8]]
]; // x=age; y=sex; z=procedures

const AGE_GROUP_BENEFITS = [
  373,
  118,
  131,
  360,
  494,
  650,
  749,
  712,
  664,
  757,
  980,
  1283,
  1814,
  2573,
  3518,
  4613,
  5461,
  6108,
  5925,
  5377
];

const getWaitingProcedures = (age, sex) =>
  age == null || sex == null
    ? null
    : WAITING_TIMES_PROCEDURES[Math.min(WAITING_TIMES_PROCEDURES.length - 1, Math.floor(age / 5))][
        sex == 'female' ? 0 : 1
      ].map(procedure => ({
        name: PROCEDURES[procedure][0],
        description: PROCEDURES[procedure][1],
        admissions: PROCEDURES[procedure][2],
        wait: PROCEDURES[procedure][3]
      }));

const getTopNProcedures = (age, sex) =>
  age == null || sex == null
    ? null
    : TOP_N_COVERED_PROCEDURES[Math.min(TOP_N_COVERED_PROCEDURES.length - 1, Math.floor(age / 5))][
        sex == 'female' ? 0 : 1
      ].map(procedure => ({
        name: PROCEDURES[procedure][0],
        description: PROCEDURES[procedure][1],
        totalCost: PROCEDURES[procedure][4],
        pctNoOOPs: PROCEDURES[procedure][5],
        oop: PROCEDURES[procedure][6]
      }));

const KIDS_AGE_GROUPS = [0, 5, 10, 15];

const getKidsProcedures = getFn =>
  KIDS_AGE_GROUPS.reduce(
    (memo, age) => {
      FIELDS.sex.choices.forEach(sex => {
        getFn(age, sex).forEach(procedure => {
          if (memo.names.indexOf(procedure.name) == -1) {
            memo.names.push(procedure.name);
            memo.procedures.push(procedure);
          }
        });
      });

      return memo;
    },
    { procedures: [], names: [] }
  ).procedures;

const WAITING_KIDS = getKidsProcedures(getWaitingProcedures);
const TOP_N_KIDS = getKidsProcedures(getTopNProcedures);

const getBenefits = age => AGE_GROUP_BENEFITS[Math.min(AGE_GROUP_BENEFITS.length - 1, Math.floor(age / 5))];

module.exports.REASONS_FOR_HAVING = {
  'Security, protection, peace of mind': 0.679,
  'Allows treatment as private patient in hospital': 0.473,
  "Provides benefits for ancillary services, 'extras'": 0.432,
  'Shorter wait for treatment, concern over public hospital waiting lists': 0.429,
  'Choice of doctor': 0.342,
  'Always had it, parents pay it, condition of job': 0.295,
  'To gain government benefits, avoid extra Medicare levy': 0.219,
  'Lifetime cover, avoid age surcharge': 0.211,
  'Elderly, getting older, likely to need treatment': 0.151,
  'Has illness, condition that requires treatment': 0.101,
  'Other financial reasons': 0.043,
  'Other reasons': 0.05
};

module.exports.REASONS_FOR_NOT_HAVING = {
  "Can't afford it, too expensive": 0.609,
  'Medicare cover sufficient': 0.291,
  'Lack of value for money, not worth it': 0.177,
  "Don't need medical care, in good health, have no dependants": 0.114,
  "Pensioners, Veterans' Affairs, health concession card": 0.095,
  "Not high priority, previously included in parent's cover": 0.083,
  "Disillusioned about having to pay 'out of pocket' costs/gap fees": 0.08,
  'Prepared to pay cost of private treatment from own resources': 0.047,
  "Won't pay Medicare levy and private health insurance premium": 0.036,
  'High risk category': 0.012,
  Other: 0.06
};

module.exports.getComputedState = ({
  relationship,
  income,
  children,
  age: _age,
  partnerAge,
  ageOnJul1,
  isInsured,
  whenInsured,
  location,
  sex,
  isWorthIt
}) => {
  const household =
    relationship == null || children == null
      ? null
      : children == 0
        ? relationship
        : relationship == 'single'
          ? 'singleParent'
          : 'family';
  const incomeRelationshipFactor = household == null ? null : household == 'single' ? 1 : 2;
  const incomeChildOffset = children == null ? null : children > 1 ? 1500 * (children - 1) : 0;
  const incomeTier =
    income == null || household == null
      ? null
      : income <= 90000 * incomeRelationshipFactor + incomeChildOffset
        ? 0
        : income <= 105000 * incomeRelationshipFactor + incomeChildOffset
          ? 1
          : income <= 140000 * incomeRelationshipFactor + incomeChildOffset
            ? 2
            : 3;
  const surcharge = incomeTier == null ? null : Math.round(income * SURCHARGES[incomeTier]);
  const lowIncomeSaving =
    relationship == 'single' || incomeTier == null || incomeTier == 0
      ? null
      : Math.round(LOW_INCOME_THRESHOLD * SURCHARGES[incomeTier]);
  const coverBasic = household ? PREMIUMS_2018['basic'][household] : null;
  const coverMedium = household ? PREMIUMS_2018['medium'][household] : null;
  const coverTop = household ? PREMIUMS_2018['top'][household] : null;
  const age = _age == null ? null : +_age;
  const oldestAge = age ? Math.max(age, partnerAge || 0) : null;
  const rebate =
    incomeTier == null || age == null || (relationship == 'couple' && partnerAge == null)
      ? null
      : REBATES[oldestAge < 65 ? 0 : oldestAge < 70 ? 1 : 2][incomeTier];
  const reducedCoverBasic = rebate != null ? (coverBasic * (1 - rebate)).toFixed(0) : null;
  const reducedCoverMedium = rebate != null ? (coverMedium * (1 - rebate)).toFixed(0) : null;
  const reducedCoverTop = rebate != null ? (coverTop * (1 - rebate)).toFixed(0) : null;
  const loadingAge = JUL_1_DIFF > 0 ? (ageOnJul1 == null ? null : +ageOnJul1) : age;
  const wasBornBeforeJuly1934 = ageOnJul1 == null ? null : +ageOnJul1 + (JUL_1_DIFF > 0 ? 1 : 0) > YEARS_SINCE_1934;
  const willAccrueLoading = !wasBornBeforeJuly1934 && loadingAge != null && loadingAge >= 31;
  const loadingAccrualYears = Math.max(0, loadingAge - (JUL_1_DIFF < 0 ? 31 : 30));
  const yearsInsured =
    isInsured == null || whenInsured == null
      ? 0
      : FIELDS.whenInsured.choices.length - 1 - FIELDS.whenInsured.choices.indexOf(whenInsured);
  const wasInsuredBeforeJul2000 = yearsInsured > YEARS_SINCE_2000;
  const loadingYears =
    loadingAge == null || isInsured == null || (isInsured == 'yes' && whenInsured == null)
      ? null
      : wasInsuredBeforeJul2000
        ? 0
        : Math.max(0, loadingAccrualYears - yearsInsured);
  const loading = loadingYears == null ? null : Math.min(0.7, loadingYears * 0.02);
  const loadingCode = wasBornBeforeJuly1934
    ? 'before1934'
    : loadingAge != null && loadingAge < 31
      ? 'under31'
      : loadingYears == null
        ? null
        : loadingYears == 0
          ? 'continuous'
          : 'without';
  const totalCoverPaid = (thisYearOffset => {
    if (thisYearOffset == null) {
      return null;
    }

    let total = 0;

    for (; thisYearOffset > 0; thisYearOffset--) {
      total += MEDIUM_SINGLE_PREMIUMS_2000_TO_TEN_YEARS_FROM_NOW[THIS_YEAR - thisYearOffset + 1] || 0;
    }

    return Math.round(total);
  })(loadingYears);
  const totalExtraToPay = loading == null ? null : Math.round(MEDIUM_SINGLE_PREMIUMS_NEXT_10_YEARS_TOTAL * loading);
  const locationCode = location ? LOCATION_CODES[location] : null;
  const coverage =
    age == null || sex == null
      ? null
      : COVERAGE_PROPORTION[sex][Math.min(COVERAGE_PROPORTION[sex].length - 1, Math.floor(age / 5))];
  const waiting = age == null || sex == null ? null : getWaitingProcedures(age, sex);
  const waitingKids = +children ? WAITING_KIDS : null;
  const topN = age == null || sex == null ? null : getTopNProcedures(age, sex);
  const topNKids = +children ? TOP_N_KIDS : null;
  const benefits = age == null ? null : getBenefits(age);

  return {
    household,
    incomeRelationshipFactor,
    incomeChildOffset,
    oldestAge,
    incomeTier,
    surcharge,
    lowIncomeSaving,
    coverBasic,
    coverMedium,
    coverTop,
    rebate,
    reducedCoverBasic,
    reducedCoverMedium,
    reducedCoverTop,
    loadingAge,
    wasBornBeforeJuly1934,
    willAccrueLoading,
    loadingAccrualYears,
    yearsInsured,
    wasInsuredBeforeJul2000,
    loadingYears,
    loading,
    loadingCode,
    totalCoverPaid,
    totalExtraToPay,
    locationCode,
    coverage,
    waiting,
    waitingKids,
    topN,
    topNKids,
    benefits
  };
};
