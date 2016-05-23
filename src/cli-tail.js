
import psTree from 'ps-tree';
import { log } from './util';
import * as forever from './forever';

let currentIndex = 0;

// runs the command
export default async function run(arg, options) {
  if(!arg)
    arg = 0;

  if(options.stream)
    listenForInput();

  await tail(arg, options);
}

function listenForInput() {
  process.stdin.setRawMode(true);
  process.stdin.on('data', async (data) => {
    let key = data.toString();
    let procs;
    let length;
    switch(key) {
      case '\u001B\u005B\u0044':
        procs = await forever.list();
        length = procs.length;
        currentIndex = (currentIndex + length - 1) % length;
        nav(currentIndex);
        break;
      case '\u001B\u005B\u0043':
        procs = await forever.list();
        length = procs.length;
        currentIndex = (currentIndex + length + 1) % length;
        nav(currentIndex);
        break;
      case '\u0003':
        await kill();
        process.exit();
        break;
    }
  });
}

async function kill() {
  return new Promise((resolve) => {
    psTree(process.pid, (err, children) => {
      children.forEach(c => process.kill(c.PID));
      resolve();
    });
  });
}

async function nav(newIndex) {
  await kill();
  await tail(newIndex);
}

async function tail(arg, opts) {
  let index;
  let proc;

  // when index
  if(!isNaN(parseInt(arg))) {
    index = parseInt(arg);
    proc = await forever.findByIndex(index);
  }
  // when uid
  else {
    index = await forever.findIndex(arg);
    proc = await forever.findByIndex(index);
  }

  log('\n==================================================================================\n');
  log(` Tail ${index}: `, proc.clusterName, proc.serviceType, proc.uid);
  log('\n----------------------------------------------------------------------------------\n');

  let options = {
    length: opts.number || 50,
    stream: opts.stream || false
  };

  // run tail
  await forever.tailLines(index, options, (line) => log(' ' + line.grey));
}