
import program from 'commander';

program
  .command('start <service>', 'start cluster')
  .command('watch', 'start cluster in watch mode')
  .command('stop', 'start cluster')
  .command('ps', 'list running nodes')
  .command('tail <service>', 'tail the logs for the service')
  .parse(process.argv);
