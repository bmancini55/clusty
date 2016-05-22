
import program from 'commander';

program
  .version('0.2.3')
  .command('start [service]', 'start cluster')
  .command('watch', 'start cluster in watch mode')
  .command('stop [service]', 'start cluster')
  .command('ps', 'list running nodes')
  .command('tail [service]', 'tail the logs for the service')
  .parse(process.argv);
