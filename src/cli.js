
import program from 'commander';

program
  .command('start', 'start submodules')
  .command('ls', 'list running instance')
  .parse(process.argv);
