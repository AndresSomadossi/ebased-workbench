#! /usr/bin/env node

const version = require('../package.json').version;
const interfaceCommand = require('./interface/commands');
const interfaceInteractive = require('./interface/interactive');
console.clear();

(async () => {
  try {
    const args = process.argv.slice(2);
    // Help command
    if (args[0] && args[0].endsWith('help')) help();
    // Command mode
    if (args.length > 0) {
      const cmd = interfaceCommand[args.shift()];
      if (!cmd) throw new Error('Invalid command');
      await cmd(args);
    }
    // Interactive mode
    else interfaceInteractive();

  } catch (error) {
    console.log('===================================');
    console.log('<< ERROR >> ');
    console.log(error.message);
  }
})();

function help() {
  console.log(`EBASED v${version}`);
  console.log(`Interactive mode: Type 'ebased'`);
  console.log('Available commands: ');
  console.log(Object.keys(interfaceCommand));
  console.log(`Type 'ebased [command] help' for more information.`);
  process.exit();
}