
import program from 'commander';
import 'colors';

import { log, title, getdirs, validateDir, createConfigs, createLogDir } from './util';
import * as forever from './forever';


program
  .parse(process.argv);

run(program.args).catch(err => log(err.stack));

// runs the command
async function run() {
  await createLogDir();

  // fetch the directors or use the supplied dir
  let dirs = [];
  if(program.args.length) {
    for(let service of program.args) {
      if(await validateDir(service)) {
        dirs.push(service);
      }
    }
  }
  else {
    dirs = await getdirs();
  }

  // create configs and validate there is work to do
  let configs  = await createConfigs(dirs);
  if(!configs || !configs.length) {
    title('No directories for starting found');
    return;
  }

  title('Starting cluster...');

  for(let config of configs) {
    try {
      await forever.start(config);
      log('started:'.green, config.uid.cyan);
    }
    catch(ex) {
      log('failed'.red, config.uid.cyan);
    }
  }
}
