
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