const required = { allowEmpty: false, message: 'This field is required.' };
const area = { length: { maximum: 1024, tooLong: 'Max length of this field is 1024 characters.' } };

// eslint-disable-next-line import/prefer-default-export
module.exports = {
  title: {
    presence: required,
    length: {
      minimum: 3,
      maximum: 32,
      tooShort: 'The title must be between 3 and 32 characters.',
      tooLong: 'The title must be between 3 and 32 characters.',
    },
  },
  playerCount: {
    numericality: {
      onlyInteger: true,
      strict: true,
      greaterThanOrEqualTo: 0,
      lessThanOrEqualTo: 16,
      message: 'Player count must be between 0 and 16.',
    },
  },
  description: area,
  notes: area,
  location: {
    length: {
      maximum: 32,
      tooLong: 'The location must be between 3 and 32 characters.',
    },
  },
};
