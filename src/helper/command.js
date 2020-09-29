class Command {
  constructor(userArgs = [], targetArgs = [], { name, description }) {
    this.userArgs = userArgs;
    this.targetArgs = targetArgs;
    this.name = `${name} Command`;
    this.description = description;
    this.printName();
    this.isHelpCommand();
  }
  extract() {
    try {
      const values = {}
      this.targetArgs.forEach(tagetArg => {
        tagetArg.names.forEach(name => {
          const index = this.userArgs.indexOf(name);
          if (index > -1) tagetArg.value = this.userArgs[index + 1];
        });
        if (tagetArg.value === undefined) {
          if (tagetArg.required) throw new Error(`Missing required property '${tagetArg.key}'`);
          tagetArg.value = tagetArg.default;
        }
        values[tagetArg.key] = tagetArg.value;
      })
      return values;
    } catch (error) {
      throw new Error(` \nError: ${error.message} \n ${this.getSyntax()}`);
    }
  }
  isHelpCommand() {
    if (this.userArgs[0] && this.userArgs[0].endsWith('help')) {
      console.log(this.getDescripcion());
      console.log(this.getSyntax());
      process.exit();
    }
  }
  printName() {
    console.log('===================================');
    console.log(`<< ${this.name} >>`);
    console.log('===================================');
  }
  getDescripcion() {
    return `\n\t << Description >>
    ${this.description || 'No description for this command.'} \n`;
  }
  getSyntax() {
    return `\t << Syntax >>
    ${this.targetArgs.map(arg => `\n - ${arg.key}: [${arg.names}] (${(arg.required) ? 'REQUIRED' : 'DEFAULT: '+arg.default})`)}`
  }
}

module.exports = { Command };