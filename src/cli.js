
import program from 'commander';

program
  .command('start', 'start cluster')
  .command('stop', 'start cluster')
  .command('list', 'list running nodes')
  .command('logs <service>', 'outputs the logs for the service')
  .command('watch', 'watches a cluster')
  .parse(process.argv);
