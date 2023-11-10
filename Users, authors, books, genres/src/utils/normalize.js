const normalizeFunction = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const stringExample = [
  'español',
  'inglés',
  'francés',
  'alemán',
  'italiano',
  'portugués',
];

// console.log(eliminarDiacriticos("lá chòcölatìna MÓRDÌDÁ")); // la chocolatina MORDIDA
// eliminarDiacriticos("España");

console.log(normalizeFunction(stringExample.toString()));

const stringNormalized = normalizeFunction(stringExample.toString());

let arrayNormalized = stringNormalized.split(',');

console.log(arrayNormalized);

module.exports = normalizeFunction;
