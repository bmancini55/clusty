

//import program from 'commander';
import 'colors';

import { log, title } from './util';
import * as forever from './forever';

// program
//   .parse(process.argv);

run()
  .then(() => console.log('Stop complete'.white))
  .catch(err => console.log(err));

// runs the command
async function run() {
  let procs = await forever.list();

  if(!procs) {
    title('No running processes');
    return;
  }

  title('Stopping cluster...');

  // close all processes
  return Promise.all(procs.map(proc => {
    return forever
      .stop(proc.uid)
      .then(() => log('stopped:'.green, proc.uid.cyan))
      .catch(ex => log('stopped:'.red, proc.uid.cyan, (' - Error: ' + ex.message).grey));
  }));
}