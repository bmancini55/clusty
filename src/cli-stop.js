
import cliff from 'cliff';
import { log, title } from './util';
import * as forever from './forever';

export default async function run(services) {
  let procs = await forever.list();

  let selectedProcs = [];
  if(services) {
    let procsLookup = procs
      .reduce((p, n) => {
        p[n.uid] = n;
        return p;
      }, {});
    for(let service of services) {
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

  // this is needed to keep the process open
  let timeout = setTimeout(() => log('Timeout reached'.red), 30000);

  // header row
  let rows = [ [ '', 'cluster', 'service', 'uid', 'status' ] ];

  // close all processes
  for(let [index, proc] of selectedProcs.entries()) {
    try {
      await forever.stop(proc.pid);
      rows.push([ `[${index}]`, proc.clusterName, proc.serviceType, proc.uid, 'stopped'.green ]);
    }
    catch(ex) {
      rows.push([ `[${index}]`, proc.clusterName, proc.serviceType, proc.uid, 'failed'.red + (' - ' + ex.message).grey]);
    }
  }

  // output the rows
  log(cliff.stringifyRows(rows));

  // clear the timeout
  clearTimeout(timeout);
}