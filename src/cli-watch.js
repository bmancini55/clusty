
import program from 'commander';
import 'colors';

import { log, title, getdirs, createConfigs, createLogDir } from './util';
import * as forever from './forever';


program
  .parse(process.argv);

run(program.args).catch(err => log(err.stack));

// runs the command
async function run() {
  await createLogDir();

  let dirs    = await getdirs('watch');
  let configs = await createConfigs(dirs, 'watch');

  if(!configs || !configs.length) {
    title('No candidates for watching found');
    return;
  }

  title('Watching cluster...');

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

