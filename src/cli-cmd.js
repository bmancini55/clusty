
import { spawn } from 'child_process';
import cliff from 'cliff';
import { log, title, getDirs, createConfigs } from './util';

export default async function run(script, services) {

  if(!script) {
    title('No script was specified. Run clusty --help for all clusty options');
    return;
  }

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
    title('No directories for running found');
    return;
  }


  let rows = [ [ '', 'service', 'status' ] ];
  for(let [index, config] of configs.entries()) {
    log('Running: ', config.serviceType);
    try {
      await execute(config);
      rows.push([ `[${index}]`, config.serviceType, 'succeeded'.green ]);
    }
    catch(ex) {
      rows.push([ `[${index}]`, config.serviceType, 'failed'.red ]);
    }
  }

  //output rows
  title('Results from \'' + script + '\'...');
  log(cliff.stringifyRows(rows));
}


function execute(config) {
  return new Promise((resolve, reject) => {

    // generate shell script
    const cmd = spawn('sh', ['-c', config.script], { cwd: config.cwd });

    // log the output
    cmd.stdout.on('data', (data) => {
      console.log(data.toString().grey);
    });
    cmd.stderr.on('data', (data) => {
      console.log(data.toString().red);
    });

    // handle close of sub-process by resolving promise accordingly
    cmd.on('close', (code) => {
      if(code !== 0)  reject();
      else            resolve();
    });
  });
}