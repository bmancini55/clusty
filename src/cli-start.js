
import program from 'commander';

program
  .parse(process.argv);

console.log(program.args);