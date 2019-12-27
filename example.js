const Censor = require('./src');
const fs = require('fs');

const censor = new Censor();
censor.loadArchive(fs.readFileSync('./filter2.jag'));

console.log(censor.censorMessage('hey you suck! visit dogs.com'))
// hey you ****! visit ********

censor.badWords = censor.badWords.filter(({ word }) => !/suc/i.test(word));
censor.populateBuffers();

console.log(censor.censorMessage('hey you suck! visit dogs.com'))
// hey you suck! visit ********

fs.writeFileSync('./filter3.jag', censor.toArchive());
