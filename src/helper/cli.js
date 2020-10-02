const divisor = () => console.log('='.repeat(process.stdout.columns));
const lightDivisor = () => console.log('-'.repeat(process.stdout.columns));
const centerDivisor = (value = '') => {
  value = `|| ${value} ||`;
  const s = '-'.repeat((process.stdout.columns - value.length) / 2);
  console.log(`${s}${value}${s}`);
}
const printCommandName = (value) => {
  divisor();
  console.log(`<< EBASED >> ${value} Command `);
}
const printParams = (value) => {
  centerDivisor('PARAMS')
  console.log(value, '\n');
  centerDivisor('EXECUTION LOGS');
}
const printResult = (value) => {
  centerDivisor('RESULT');
  console.log(value);
  divisor();
}
module.exports = {
  divisor,
  lightDivisor,
  printCommandName,
  printParams,
  printResult,
}