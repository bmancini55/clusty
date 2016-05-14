
import forever from 'forever';

export async function start(config) {
  forever.startDaemon(null, config);
}

export async function list() {
  return new Promise((resolve, reject) => {
    forever.list(false, (err, processes) => {
      if(err) reject(err);
      else resolve(processes);
    });
  });
}

export async function stop(name) {
  forever.stop(name);
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