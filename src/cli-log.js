

import program from 'commander';
import 'colors';

import { log, error } from './util';
import * as forever from './forever';

program
  .option('-n, --number [lines]', 'number of lines', parseInt)
  .option('-f, --stream', 'stream lines')
  .parse(process.argv);

run(program.args[0]).catch(console.log);

// runs the command
async function run(service) {

  if(!service) {
    error('service is required');
    process.exit(1);
  }

  log('Logs for ' + service);

  let options = {
    length: program.number || 0,
    stream: program.stream || false
  };

  let index  = await forever.findIndex(service);
  let result = await forever.tailLines(index, options, (line) => log(' ' + line.grey));
  console.log(result);

}