const required = { allowEmpty: false, message: 'This field is required.' };
const inputSelect = { presence: required, selector: true };

// eslint-disable-next-line import/prefer-default-export
module.exports = {
  name: {
    presence: required,
    length: {
      minimum: 3,
      maximum: 16,
      tooShort: 'The title must be between 3 and 16 characters.',
      tooLong: 'The title must be between 3 and 16 characters.',
    },
  },
  event: inputSelect,
  post: inputSelect,
  role: inputSelect,
};
