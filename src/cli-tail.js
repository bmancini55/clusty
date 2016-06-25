
import psTree from 'ps-tree';
import { log, display } from './util';
import * as forever from './forever';

let currentIndex = 0;
let tailWithOptions;

// runs the command
export default async function run(arg, options) {
  if(!arg)
    arg = 0;

  if(options.stream)
    listenForInput();

  // apply options for subsequent calls
  tailWithOptions = tail.bind(this, options);
  await tailWithOptions(arg);
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
  try {
    await kill();
    await tailWithOptions(newIndex);
  }
  catch(ex) {
    console.log(ex.stack);
  }
}

async function tail({ number = 50, stream = false }, arg) {
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
  log(` Tail ${index}: `, display(proc, 'clusterName'), display(proc, 'serviceType'));
  log('\n----------------------------------------------------------------------------------\n');

  let options = {
    length: number,
    stream: stream
  };

  // run tail
  await forever.tailLines(index, options, (line) => log(' ' + line.grey));
}