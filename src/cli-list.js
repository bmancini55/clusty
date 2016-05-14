

import program from 'commander';
import forever from 'forever';
import timespan from 'timespan';
import cliff from 'cliff';
import 'colors';

import { log } from './util';

program
  .parse(process.argv);

run(program.args).catch(err => log(err.stack));

// runs the command
async function run() {
  let procs = await foreverList();

  let rows = [ [ 'uid', 'uptime'.yellow ] ];
  for(let proc of procs) {
    rows.push([ proc.uid.grey, uptime(proc) ]);
  }

  log(cliff.stringifyRows(rows));
}


// spawn
async function foreverList() {
  return new Promise((resolve, reject) => {
    forever.list(false, (err, processes) => {
      if(err) reject(err);
      else resolve(processes);
    });
  });
}

function uptime(proc) {
  return proc.running ? timespan.fromDates(new Date(proc.ctime), new Date()).toString().yellow : 'STOPPED'.red;
}