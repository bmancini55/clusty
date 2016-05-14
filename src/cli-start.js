
import path from 'path';
import fs from 'mz/fs';
import program from 'commander';
import forever from 'forever';
import 'colors';

import { log } from './util';


program
  .parse(process.argv);

run(program.args).catch(err => log(err.stack));

// runs the command
async function run() {
  let crawlPath = path.resolve('./');
  let dirs      = await getdirs(crawlPath);
  let configs    = await createConfigs(dirs);
  await createLogDir();
  await spawnForever(configs);
}

// create log directory
async function createLogDir() {
  let exists = await fs.exists('.goodly');
  if(!exists)
    await fs.mkdir('.goodly');
}

// get dirs
async function getdirs(rootPath) {
  let results  = [];
  let subpaths = await fs.readdir(rootPath);
  for(let subpath of subpaths) {
    let stats = await fs.stat(subpath);
    if(stats.isDirectory()) {
      let packagePath = path.join(subpath, 'package.json');
      if(await fs.exists(packagePath)) {
        let packageBytes = await fs.readFile(packagePath);
        let pack = JSON.parse(packageBytes);
        if(pack.scripts && pack.scripts.start) {
          results.push(subpath);
        }
      }
    }
  }
  return results;
}

// create config
async function createConfigs(dirs) {
  let cwd = process.cwd();
  let base = path.basename(cwd);
  return dirs.map(dir => {
    let uid  = base + '-' + dir;
    let logFile = path.join(cwd, '.goodly', uid + '.log' );
    log(logFile);
    return {
      uid: uid,
      append: true,
      watch: false,
      command: 'npm start',
      cwd: path.join(cwd, dir),
      logFile: logFile
    };
  });
}

// spawn
async function spawnForever(configs) {
  for(let config of configs) {
    forever.startDaemon(null, config);
    log('started:'.green, config.uid);
  }
}