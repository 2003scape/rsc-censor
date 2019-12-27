# rsc-censor
runescape classic chat censor and cache modification. this censor is
semi-intelligent and can detect similar looking symbols and spacing.

## install

    $ npm install @2003scape/rsc-censor # -g for CLI program

## cli usage
```
rsc-censor <command>

Commands:
  rsc-censor censor <archive> <message>     censor message using filters in
                                            archive
  rsc-censor dump-json <archive>            dump JSON files of each censor
                                            section
  rsc-censor pack-json <archive> <files..>  encode and compress JSON files into
                                            filter archive

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```

	$ rsc-censor censor filter2.jag "you suck"

## example
```javascript
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
```

## api
### censor = new Censor()
create a new censor instance.

### censor.badWords
array of profanities.

```javascript
[
    {
        word: 'breast',
        // this allows "abreast" and "breastplate", but not "breast"
        ignore: [
            {
                prefix: 'a',
                postfix: null
            },
            {
                prefix: null,
                postfix: 'p'
            }
        ]
    }
]
```

### censor.hosts
array of webiste [hostnames](https://en.wikipedia.org/wiki/Hostname).

```javascript
[
    {
        word: 'aol',
        // allows for "gaols" but not "go aol"
        ignore: [
            {
                prefix: 'g',
                postfix: 's'
            }
            // ...
        ]
    }
]
```

### censor.tlds
array of [TLDs](https://en.wikipedia.org/wiki/Top-level_domain).

```javascript
[
    {
        word: 'com',
        type: 3
    }
]
```

### censor.fragments
array of word fragments. these seem to be used to fix the censor when it's
[greedy](https://en.wikipedia.org/wiki/Regular_expression#Lazy_matching) and
asterisks too many characters.

### censor.loadArchive(buffer)
load a filter jag archive buffer.

### censor.populateBuffers()
apply changes to internal properties to the filter instance.

### censor.censorMessage(message)
return a censored string.

### censor.toArchive()
return a filter jag archive.

## license
Copyright 2019  2003Scape Team

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU Affero General Public License as published by the
Free Software Foundation, either version 3 of the License, or (at your option)
any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along
with this program. If not, see http://www.gnu.org/licenses/.
