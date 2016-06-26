
import cliff from 'cliff';
import { log, title, display } from './util';
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
  let rows = [ [ '', 'service', 'status' ] ];

  // close all processes
  for(let [index, proc] of selectedProcs.entries()) {
    try {
      await forever.stop(proc.pid);
      rows.push([ `[${index}]`, display(proc, 'serviceType'), 'stopped'.green ]);
    }
    catch(ex) {
      rows.push([ `[${index}]`, display(proc, 'serviceType'), 'failed'.red + (' - ' + ex.message).grey]);
    }
  }

  // output the rows
  log(cliff.stringifyRows(rows));

  // clear the timeout
  clearTimeout(timeout);
}