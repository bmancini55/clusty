
import timespan from 'timespan';
import usage from 'pidusage';
import psTree from 'ps-tree';
import pad from 'pad-left';
import cliff from 'cliff';

import { log, title, display } from './util';
import * as forever from './forever';

// runs the command
export default async function run() {
  let procs = await forever.list();

  if(!procs) {
    title('No running processes');
    return;
  }

  title('Listing cluster...');

  let rows = [ [ '', 'service', 'uptime', 'mem-mb', 'cpu-%', 'pid', 'dirs' ] ];
  let memTotal = 0;
  let cpuTotal = 0;
  for(let idx = 0; idx < procs.length; idx++) {
    let proc = procs[idx];
    let descendants = await getTree(proc.pid);
    let pids = descendants.slice();
    pids.splice(0, null, proc.pid);

    let { cpu, mem } = await getTreeUsage(pids);
    rows.push([
      `[${idx}]`,
      display(proc, 'serviceType'),
      uptime(proc),
      pad(mem.toFixed(1), 6, ' ').grey,
      pad(cpu.toFixed(0), 5, ' ').grey,
      `${proc.pid}`.grey,
      proc.spawnWith.env.CLUSTY_SERVICE_DIRS.grey
    ]);

    memTotal += mem;
    cpuTotal += cpu;
  }

  rows.push([
    '',
    'TOTAL',
    '',
    '',
    pad(memTotal.toFixed(1), 6, ' '),
    pad(cpuTotal.toFixed(0), 5, ' '),
    '',
    ''
  ]);

  log(cliff.stringifyRows(rows));
}


function uptime(proc) {
  return proc.running ? timespan.fromDates(new Date(proc.ctime), new Date()).toString().yellow : 'STOPPED'.red;
}

async function getTreeUsage(pids) {
  let mem = 0;
  let cpu = 0;
  let stat;

  for(let pid of pids) {
    stat = await getUsage(pid);
    if(stat) {
      mem += stat.memory/1000/1000;
      cpu += stat.cpu;
    }
  }

  return { mem, cpu };
}

async function getTree(pid) {
  return new Promise((resolve) => {
    psTree(pid, async (err, children) => {
      if(err) {
        resolve([]);
      }
      else {
        let cpids = children.map(p => parseInt(p.PID));
        resolve(cpids);
      }
    });
  });
}

async function getUsage(pid) {
  return new Promise((resolve) => {
    usage.stat(pid, (err, stat) => {
      if(err) {
        resolve({ memory: 0, cpu: 0 });
      }
      else {
        usage.unmonitor(pid);
        resolve(stat);
      }
    });
  });
}