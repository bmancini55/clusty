

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
async function run(uid) {
  let index;

  if(!uid) {
    error('service is required');
    process.exit(1);
  }

  if(!isNaN(parseInt(uid))) {
    index = parseInt(uid);
    uid = await forever.findByIndex(index).uid;

    console.log('ok');
  }
  else {
    index = await forever.findIndex(uid);

    console.log('bad');
  }

  log('Logs for ' + uid);

  let options = {
    length: program.number || 0,
    stream: program.stream || false
  };

  await forever.tailLines(index, options, (line) => log(' ' + line.grey));
}