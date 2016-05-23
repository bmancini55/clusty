
import forever from 'forever';

export async function start(config) {
  let script = config.script;
  delete config.script;
  forever.startDaemon(script, config);
}

export async function list() {
  return new Promise((resolve, reject) => {
    forever.list(false, (err, procs) => {
      if(err) reject(err);
      else {
        if(procs)
          procs.forEach(applyClustyConfigs);
        resolve(procs);
      }
    });
  });
}

export async function stop(name) {
  return new Promise((resolve, reject) => {
    let emitter = forever.stop(name);
    emitter.on('stop',  (arg) => resolve(arg));
    emitter.on('error', (err) => reject(err));
    resolve();
  });
}

export async function tailLines(index, opts, log) {
  forever.tail(index, opts, (err, data) => {
    log(err || data.line);
  });
}

export async function findIndex(uid) {
  let procs = await list();
  if(!procs)
    return -1;

  return procs.findIndex(proc => proc.uid === uid);
}

export async function findByIndex(index) {
  return new Promise((resolve, reject) => {
    forever.list(false, (err, processes) => {
      if(err) reject(err);
      else {
        let result = forever.findByIndex(index, processes);
        resolve(result ? applyClustyConfigs(result[0]) : null);
      }
    });
  });
}


function applyClustyConfigs(proc) {
  proc.uid.cyan;
  proc.clusterName = proc.spawnWith.env.CLUSTY_CLUSTER_NAME.cyan;
  proc.serviceType = proc.spawnWith.env.CLUSTY_SERVICE_TYPE.cyan;
  proc.instanceName = proc.spawnWith.env.CLUSTY_INSTANCE_NAME.cyan;
  return proc;
}