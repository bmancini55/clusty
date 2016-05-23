
import cliff from 'cliff';
import { log, title, getDirs, createConfigs, createLogDir } from './util';
import * as forever from './forever';

export default async function run(services) {
  await createLogDir();

  // fetch the directory that are validate
  let dirs = await getDirs();

  // filter directories to the ones we care about
  if(services) {
    services = services.split(',');
    dirs = dirs.filter(d => services.indexOf(d) >= 0);
  }

  // create configs and validate there is work to do
  let configs  = await createConfigs(dirs);
  if(!configs || !configs.length) {
    title('No directories for starting found');
    return;
  }

  title('Starting cluster...');
  let rows = [ [ '', 'cluster', 'service', 'uid', 'status' ] ];
  for(let [index, config] of configs.entries()) {
    try {
      await forever.start(config);
      rows.push([ `[${index}]`, config.clusterName.cyan, config.serviceType.cyan, config.uid.cyan, 'started'.green ]);
    }
    catch(ex) {
      rows.push([ `[${index}]`, config.clusterName.cyan, config.serviceType.cyan, config.uid.cyan, 'failed'.red + (' - ' + ex.message).grey]);
    }
  }

  // output rows
  log(cliff.stringifyRows(rows));
}


