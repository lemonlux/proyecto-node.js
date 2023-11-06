const validEnumGender = (gender) => {
  console.log('hola');
  const enumGender = ['hombre', 'mujer', 'no binario'];
  if (enumGender.includes(gender)) {
    return true;
  } else {
    return false;
  }
};


const validEnumLanguage = (language) => {
  const enumLanguage = ['español', 'inglés', 'francés', 'alemán', 'italiano', 'portugués']
  if (enumLanguage.includes(language)){
    return true
  }else{
    return false
  }
}

const validEnumGenre = (genre) =>{
  const enumGenre = [
    'Narrativo', 'Didáctico', 'Dramático/Teatral', 'Lírico', 'Poético'
  ]
  if (enumGenre.includes(genre)){
    return true
  }else{
    return false
  }
}




module.exports = { validEnumGender, validEnumLanguage, validEnumGenre };



