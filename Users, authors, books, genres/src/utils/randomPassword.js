const randomPasswordGenerator = () => {
  const num =
    'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ&$._-@#+?!';
  let randomPassword = '';
  let passwordLength = 12;

  for (let i = 0; i <= passwordLength; i++) {
    const randomNum = Math.floor(Math.random() * num.length);
    randomPassword += num.substring(randomNum, randomNum + 1);
  }
  
  console.log(randomPassword);
  return randomPassword;
};

randomPasswordGenerator();

module.exports = randomPasswordGenerator;
