const required = { allowEmpty: false, message: 'This field is required.' };
const nameConstraint = {
  presence: required,
  length: {
    minimum: 3,
    maximum: 32,
    tooShort: 'The name must be between 3 and 32 characters.',
    tooLong: 'The name must be between 3 and 32 characters.',
  },
  format: {
    pattern: '\\p{L}+',
    flags: 'u',
    message: 'The name must only contain alphabetical characters.',
  },
};

// eslint-disable-next-line import/prefer-default-export
module.exports = {
  regCode: {
    presence: required,
    length: {
      is: 10,
      wrongLength: 'Enter a valid registration code.',
    },
    format: {
      pattern: '[A-Z|0-9]+',
      message: 'Enter a valid registration code.',
    },
  },
  firstName: nameConstraint,
  lastName: nameConstraint,
  email: {
    presence: required,
    email: {
      message: 'Enter a valid email address.',
    },
  },
  phone: {
    presence: required,
    length: {
      is: 10,
      wrongLength: 'Enter a valid phone number.',
    },
    format: {
      pattern: '[0-9]+',
      message: 'Enter a valid phone number.',
    },
  },
  cnp: {
    presence: required,
    length: {
      is: 13,
      wrongLength: 'Enter a valid CNP.',
    },
    cnp: true,
  },
  shirtType: {
    presence: required,
    selector: true,
  },
  shirtSize: {
    presence: required,
    selector: true,
  },
  username: {
    presence: required,
    length: {
      minimum: 4,
      maximum: 25,
      tooShort: 'The username must be between 4 and 32 characters.',
      tooLong: 'The username must be between 4 and 32 characters.',
    },
    format: {
      pattern: '[a-z|0-9|\\.|_]+',
      message: 'The usernames must only contain lowercase alphanumeric characters.',
    },
  },
  password: {
    presence: required,
    length: {
      minimum: 8,
      maximum: 128,
      tooShort: 'The password must be between 8 and 128 characters.',
      tooLong: 'The password must be between 8 and 128 characters.',
    },
    password: true,
  },
};
