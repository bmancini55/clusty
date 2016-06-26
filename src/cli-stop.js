
import cliff from 'cliff';
import { log, title } from './util';
import * as forever from './forever';

export default async function run(services) {

  // fetch the running processes
  let procs         = await forever.list();
  let selectedProcs = procs;

  // filter to applied services
  if(services) {
    services      = services.split(',');
    selectedProcs = procs.filter(proc => services.indexOf(proc.uid) >= 0);
  }

  if(!procs) {
    title('No running processes');
    return;
  }

  title('Stopping cluster...');

  // this is needed to keep the process open
  let timeout = setTimeout(() => log('Timeout reached'.red), 30000);

  // header row
  let rows = [ [ 'status', 'service', 'directories', '', '', '' ] ];

  // close all processes
  for(let proc of selectedProcs) {
    try {
      await forever.stop(proc.pid);
    }
    catch(ex) { }
    finally {
      rows.push.apply(rows, createRows(proc));
    }
  }

  // output the rows
  log(cliff.stringifyRows(rows));

  // clear the timeout
  clearTimeout(timeout);
}


function createRows(proc) {
  let rows = [];
  let dirs = proc.spawnWith.env.CLUSTY_SERVICE_DIRS.split(',');
  for(let i = 0; i < dirs.length; i += 4) {
    if(i === 0) {
      rows.push([
        'stopped'.green,
        proc.uid.cyan,
        (dirs[i] || '').grey,
        (dirs[i+1] || '').grey,
        (dirs[i+2] || '').grey,
        (dirs[i+3] || '').grey,
      ]);
    }
    else {
      rows.push([
        '',
        '',
        (dirs[i] || '').grey,
        (dirs[i+1] || '').grey,
        (dirs[i+2] || '').grey,
        (dirs[i+3] || '').grey
      ]);
    }
  }
  return rows;
}