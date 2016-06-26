
import path from 'path';
import fs from 'mz/fs';
import dockerNames from 'docker-names';

const CLUSTY_HOME = process.env.HOME;

export function log() {
  console.log.apply(console, arguments);
}

export function title(title) {
  console.log(title.white);
}

export function error(msg) {
  console.log('error: '.red + msg);
}


export function createConfigs(dirs, script) {
  let cwd = process.cwd();
  return dirs.map(dir => {
    let serviceType  = dir;
    let instanceName = dockerNames.getRandomName();
    let logRoot      = path.join(CLUSTY_HOME, '.clusty');
    let logFile      = path.join(logRoot, serviceType + '.log' );
    return {
      uid: instanceName,
      append: true,
      watch: false,
      command: 'npm run',
      script: script,
      cwd: path.join(cwd, dir),
      logFile: logFile,
      max: 1,
      env: Object.assign({}, process.env, {
        CLUSTY_INSTANCE_NAME: instanceName,
        CLUSTY_SERVICE_TYPE: serviceType,
        CLUSTY_SERVICE_DIRS: dir
      }),
      serviceType: serviceType,
      instanceName: instanceName
    };
  });
}

export async function createSingleConfig(dirs) {
  let cwd = process.cwd();
  let clusterName  = path.basename(cwd);
  let serviceType  = 'multi-service';
  let instanceName = dockerNames.getRandomName();
  let logRoot      = path.join(CLUSTY_HOME, '.clusty');
  let logFile      = path.join(logRoot, serviceType + '.log' );
  let script       = '';

  for(let dir of dirs) {
    let pack = await loadPackage(dir);
    let main = pack.main;
    script += `require('./${dir}/${main}');`;
  }

  return {
    uid: instanceName,
    append: true,
    watch: false,
    command: 'node -e',
    script: script,
    cwd: cwd,
    logFile: logFile,
    max: 1,
    env: Object.assign({}, process.env, {
      CLUSTY_CLUSTER_NAME: clusterName,
      CLUSTY_INSTANCE_NAME: instanceName,
      CLUSTY_SERVICE_TYPE: serviceType,
      CLUSTY_SERVICE_DIRS: dirs.join()
    }),
    clusterName: clusterName,
    serviceType: serviceType,
    instanceName: instanceName
  };
}

export async function getDirs({ hasScript, hasMain }) {
  let cwd = process.cwd();
  let results  = [];
  let subpaths = await fs.readdir(cwd);

  // for all subpaths
  for(let subpath of subpaths) {

    // get the package file
    let pack = await loadPackage(subpath);

    // ignore if no package file
    if(!pack)
      continue;

    else if (
      (!hasMain && !hasScript) ||
      (hasScript && pack.scripts && pack.scripts[hasScript]) ||
      (hasMain && pack.main)
    ) {
      results.push(subpath);
    }
  }
  return results;
}


export async function loadPackage(dir) {
  let stats = await fs.stat(dir);
  if(stats.isDirectory()) {
    let packagePath = path.join(dir, 'package.json');
    if(await fs.exists(packagePath)) {
      let packageBytes = await fs.readFile(packagePath);
      let result = JSON.parse(packageBytes);
      return result;
    }
  }
}


export async function createLogDir() {
  let logRoot = path.join(CLUSTY_HOME, '.clusty');
  let exists = await fs.exists(logRoot);
  if(!exists)
    await fs.mkdir(logRoot);
}

export function display(proc, property) {
  switch(property) {
    case 'uid':
    case 'serviceType':
    case 'instanceName':
      return proc[property] && proc[property].cyan;
    default:
      return proc[property];
  }
}