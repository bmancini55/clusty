import 'babel-polyfill';
import 'colors';
import program from 'commander';

import ps from './cli-ps';
import start from './cli-start';
import stop from './cli-stop';
import tail from './cli-tail';


program
  .version('0.2.4');

// ps
//
program
  .command('ps')
  .description('Lists the running services')
  .action(() => ps().catch(console.log));

// start
//
program
  .command('start [services]')
  .description('Starts the service(s) for the cluster with the supplied options')
  .option('-s', '--script <script>', 'the npm script to execute, defaults to \'start\'')
  .action((services, options) => start(services, options).catch(console.log));

// stop
//
program
  .command('stop [services]')
  .description('Stops the service(s) that are running')
  .action((services) => stop(services).catch(console.log));

// tail
//
program
  .command('tail [service]')
  .description('Tails the log output for the service')
  .option('-n, --number [lines]', 'number of lines', parseInt)
  .option('-f, --stream', 'stream lines')
  .action((index, options) => tail(index, options).catch(console.log));

program
  .parse(process.argv);
