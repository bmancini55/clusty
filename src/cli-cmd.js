
let path = require('path');
import { spawn } from 'child_process';
import cliff from 'cliff';
import { log, title, getDirs } from './util';

export default async function run(script, services) {

  if(!script) {
    title('No script was specified. Run clusty --help for all clusty options');
    return;
  }

  // fetch the directory that are validate
  let dirs = await getDirs();

  // filter directories to the ones we care about
  if(services) {
    services = services.split(',');
    dirs = dirs.filter(d => services.indexOf(d) >= 0);
  }

  // create configs and validate there is work to do
  if(!dirs) {
    title('No directories for command execution found');
    return;
  }


  let rows = [ [ 'directory', 'status' ] ];
  for(let dir of dirs) {
    log('Running: ', dir);
    try {
      await execute(dir, script);
      rows.push([ dir, 'succeeded'.green ]);
    }
    catch(ex) {
      rows.push([ dir, 'failed'.red ]);
    }
  }

  //output rows
  title('Results from \'' + script + '\'...');
  log(cliff.stringifyRows(rows));
}


function execute(dir, script) {
  return new Promise((resolve, reject) => {

    // generate shell script
    const cmd = spawn('sh', ['-c', script ], { cwd: path.join(process.cwd(), dir) });

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