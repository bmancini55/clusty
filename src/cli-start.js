
import cliff from 'cliff';
import { log, title, getDirs, createConfigs, createLogDir } from './util';
import * as forever from './forever';

export default async function run(services, { script }) {
  await createLogDir();

  // fetch the directory that are validate
  let dirs = await getDirs(script);

  // filter directories to the ones we care about
  if(services) {
    services = services.split(',');
    dirs = dirs.filter(d => services.indexOf(d) >= 0);
  }

  // create configs and validate there is work to do
  let configs  = await createConfigs(dirs, script);
  if(!configs || !configs.length) {
    title('No directories for starting found');
    return;
  }

  title('Starting cluster...');
  let rows = [ [ '', 'cluster', 'service', 'uid', 'status' ] ];
  for(let [index, config] of configs.entries()) {
    try {
      await forever.start(config);
      rows.push([ `[${index}]`, config.clusterName, config.serviceType, config.uid, 'started'.green ]);
    }
    catch(ex) {
      rows.push([ `[${index}]`, config.clusterName, config.serviceType, config.uid, 'failed'.red + (' - ' + ex.message).grey]);
    }
  }

  // output rows
  log(cliff.stringifyRows(rows));
}


