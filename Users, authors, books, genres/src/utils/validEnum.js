const validEnum = (gender) =>{
    console.log("hola")
    const enumGender = ['hombre', 'mujer', 'no binario']
    if(enumGender.includes(gender)){
        
        return true
      
    }else{
        
        return false
        
    }
   
}



module.exports = validEnum