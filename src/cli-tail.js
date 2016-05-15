

import program from 'commander';
import 'colors';
import psTree from 'ps-tree';

import { log, title, error } from './util';
import * as forever from './forever';

program
  .option('-n, --number [lines]', 'number of lines', parseInt)
  .option('-f, --stream', 'stream lines')
  .parse(process.argv);

run(program.args[0]).catch(console.log);

let currentIndex = 0;

// runs the command
async function run(arg) {
  if(!arg)
    arg = 0;

  if(program.stream)
    listenForInput();

  await tail(arg);
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
        nav((currentIndex + length - 1) % length);
        break;
      case '\u001B\u005B\u0043':
        procs = await forever.list();
        length = procs.length;
        nav((currentIndex + length + 1) % length);
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

async function tail(arg) {
  let index;
  let uid;

  // when index
  if(!isNaN(parseInt(arg))) {
    index = parseInt(arg);
    uid = (await forever.findByIndex(index)).uid;
  }
  // when uid
  else {
    index = await forever.findIndex(arg);
    uid = arg;
  }

  log('\n==================================================================================\n');
  log(` Tail ${index}: ` + uid.cyan);
  log('\n----------------------------------------------------------------------------------\n');

  let options = {
    length: program.number || 50,
    stream: program.stream || false
  };

  await forever.tailLines(index, options, (line) => log(' ' + line.grey));

  // change state
  currentIndex = index;
}