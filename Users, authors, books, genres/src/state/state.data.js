//los estados se utilizan y se reinicializan

let isEmailSent = false; //lo iniciamos en false porque no se ha mandado

//el get trae información y el set la setea a través del estado

const setSendEmail = (data) => {
  //esta data es un boolean
  isEmailSent = data;
};

const getSendEmail = () => {
  return isEmailSent;
};

//ahora lo exportamos para usarlo en los controladores

module.exports = { setSendEmail, getSendEmail };
