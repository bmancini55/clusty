
import program from 'commander';

program
  .command('start', 'start cluster')
  .command('stop', 'start cluster')
  .command('list', 'list running nodes')
  .parse(process.argv);
