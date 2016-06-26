
import cliff from 'cliff';
import { log, title, getDirs, createSingleConfig, createLogDir } from './util';
import * as forever from './forever';

export default async function run(services, args) {
  await createLogDir();

  let dirs = await getDirs({ hasMain: true });
  dirs = filterDirs(services, dirs);

  await startSingle(dirs, args);

}

function filterDirs(desired, dirs) {
  let result = dirs;
  if(desired) {
    desired = desired.split(',');
    result = dirs.filter(d => desired.indexOf(d) >= 0);
  }
  return result;
}

async function startSingle(dirs, args) {
  title('Starting cluster...');
  let rows = [ [ 'status', 'service', 'directories', '', '', '' ] ];

  // generate the config
  let config = await createSingleConfig(dirs, args);

  // start the single process
  await forever.start(config);

  // indicate that each was started
  for(let i = 0; i < dirs.length; i += 4) {
    if(i === 0)
      rows.push([
        'started'.green,
        config.uid.cyan,
        (dirs[i].grey || ''),
        (dirs[i+1] || '').grey,
        (dirs[i+2] || '').grey,
        (dirs[i+3] || '').grey
      ]);
    else {
      rows.push([
        '',
        '',
        (dirs[i] || '').grey,
        (dirs[i+1] || '').grey,
        (dirs[i+2] || '').grey,
        (dirs[i+3] || '').grey
      ]);
    }
  }

  // output rows
  log(cliff.stringifyRows(rows));
}