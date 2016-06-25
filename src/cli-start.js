
import cliff from 'cliff';
import { log, title, display, getDirs, createConfigs, createSingleConfig, createLogDir } from './util';
import * as forever from './forever';

export default async function run(services, { script }) {
  await createLogDir();


  if(script) {
    let dirs = await getDirs({ hasScript: script });
    dirs = filterDirs(services, dirs);
    await startScripts(dirs, script);
  }
  else {
    let dirs = await getDirs({ hasMain: true });
    dirs = filterDirs(services, dirs);
    await startSingle(dirs);
  }
}

function filterDirs(desired, dirs) {
  let result = dirs;
  if(desired) {
    desired = desired.split(',');
    result = dirs.filter(d => desired.indexOf(d) >= 0);
  }
  return result;
}

// starts the script for each of the directories
async function startScripts(dirs, script) {

  // create configs and validate there is work to do
  let configs  = await createConfigs(dirs, script);
  if(!configs || !configs.length) {
    title('No directories for starting found');
    return;
  }

  title('Starting cluster...');
  let rows = [ [ '', 'cluster', 'service', 'status' ] ];
  for(let [index, config] of configs.entries()) {
    try {
      await forever.start(config);
      rows.push([ `[${index}]`, display(config, 'clusterName'), display(config, 'serviceType'), 'started'.green ]);
    }
    catch(ex) {
      rows.push([ `[${index}]`, display(config, 'clusterName'), display(config, 'serviceType'), 'failed'.red + (' - ' + ex.message).grey]);
    }
  }

  // output rows
  log(cliff.stringifyRows(rows));
}


async function startSingle(dirs) {
  title('Starting cluster...');
  let rows = [ [ '', 'cluster', 'service', 'status' ] ];

  let config = await createSingleConfig(dirs);
  await forever.start(config);

  for(let [index, dir] of dirs.entries()) {
    rows.push([ `[${index}]`, display(config, 'clusterName'), dir.cyan, 'started'.green ]);
  }

  // output rows
  log(cliff.stringifyRows(rows));
}