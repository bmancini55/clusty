

import program from 'commander';
import 'colors';

import { log, title } from './util';
import * as forever from './forever';

program
  .parse(process.argv);

run(program.args).catch(err => log(err.stack));

// runs the command
async function run() {
  let procs = await forever.list();

  if(!procs) {
    title('No running processes'.grey);
    return;
  }

  title('Stopping cluster...');

  for(let proc of procs) {
    await forever.stop(proc.uid);
    log('stopped: '.green, proc.uid.grey);
  }
}