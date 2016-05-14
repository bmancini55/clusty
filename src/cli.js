
import program from 'commander';

program
  .command('start', 'start cluster')
  .command('stop', 'start cluster')
  .command('list', 'list running nodes')
  .command('log <service>', 'outputs the specified log')
  .parse(process.argv);
