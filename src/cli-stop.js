

import program from 'commander';
import 'colors';

import { log, title } from './util';
import * as forever from './forever';

program
  .parse(process.argv);

run()
  .then(() => console.log('Stop complete'.white))
  .catch(err => console.log(err));

// runs the command
async function run() {
  let procs = await forever.list();

  let uids = [];
  if(program.args.length) {
    let procsLookup = procs
      .reduce((p, n) => {
        p[n.uid] = n;
        return p;
      }, {});
    for(let service of program.args) {
      if(procsLookup[service])
        uids.push(service);
    }
  }
  else {
    uids = procs.map(p => p.uid);
  }


  if(!procs) {
    title('No running processes');
    return;
  }

  title('Stopping cluster...');

  // close all processes
  return Promise.all(uids.map(uid => {
    return forever
      .stop(uid)
      .then(() => log('stopped:'.green, uid.cyan))
      .catch(ex => log('stopped:'.red, uid.cyan, (' - Error: ' + ex.message).grey));
  }));
}