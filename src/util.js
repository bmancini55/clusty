
import path from 'path';
import fs from 'mz/fs';

export function log() {
  console.log.apply(console, arguments);
}

export function title(title) {
  console.log(title.white);
}

export function error(msg) {
  console.log('error: '.red + msg);
}


export function createConfigs(dirs, script = 'start') {
  let cwd = process.cwd();
  let base = path.basename(cwd);
  return dirs.map(dir => {
    let uid  = base + '-' + dir;
    let logFile = path.join(cwd, '.clusty', uid + '.log' );
    return {
      uid: uid,
      append: true,
      watch: false,
      command: 'npm run',
      script: script,
      cwd: path.join(cwd, dir),
      logFile: logFile,
      max: 1
    };
  });
}

export async function getdirs(script = 'start') {
  let cwd = process.cwd();
  let results  = [];
  let subpaths = await fs.readdir(cwd);
  for(let subpath of subpaths) {
    if(await validateDir(subpath, script)) {
      results.push(subpath);
    }
  }
  return results;
}


export async function validateDir(dir, script = 'start') {
  let stats = await fs.stat(dir);
  if(stats.isDirectory()) {
    let packagePath = path.join(dir, 'package.json');
    if(await fs.exists(packagePath)) {
      let packageBytes = await fs.readFile(packagePath);
      let pack = JSON.parse(packageBytes);
      if(pack.scripts && pack.scripts[script]) {
        return true;
      }
    }
  }
  return false;
}


export async function createLogDir() {
  let exists = await fs.exists('.clusty');
  if(!exists)
    await fs.mkdir('.clusty');
}