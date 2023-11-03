const randomCode = (min, max) => {
  let code = Math.floor(Math.random() * (max - min + 1) + min);
  return code;
};

module.exports = randomCode;

// console.log(randomCode(100000, 999999))
