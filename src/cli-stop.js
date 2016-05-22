

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

  let selectedProcs = [];
  if(program.args.length) {
    let procsLookup = procs
      .reduce((p, n) => {
        p[n.uid] = n;
        return p;
      }, {});
    for(let service of program.args) {
      if(procsLookup[service])
        selectedProcs.push(procsLookup[service]);
    }
  }
  else {
    selectedProcs = procs;
  }


  if(!procs) {
    title('No running processes');
    return;
  }

  title('Stopping cluster...');

  // close all processes
  return Promise.all(selectedProcs.map(proc => {
    return forever
      .stop(proc.uid)
      .then(() => log('stopped:'.green, proc.clusterName.cyan, proc.serviceType.cyan, proc.uid.cyan))
      .catch(ex => log('stopped:'.red, proc.clusterName.cyan, proc.serviceType.cyan, proc.uid.cyan, (' - Error: ' + ex.message).grey));
  }));
}