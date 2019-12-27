#!/usr/bin/env node

const Censor = require('./');
const fs = require('fs').promises;
const mkdirp = require('mkdirp-promise');
const path = require('path');
const pkg = require('../package');
const yargs = require('yargs');

const SECTIONS = ['badWords', 'hosts', 'tlds', 'fragments'];

yargs
    .scriptName('rsc-censor')
    .version(pkg.version)
    .command(
        'censor <archive> <message>',
        'censor message using filters in archive',
        yargs => {
            yargs.positional('archive', {
                description: 'filter jag archive',
                type: 'string'
            });

            yargs.positional('message', {
                description: 'message to censor',
                type: 'string'
            });

            yargs.option('ignore', {
                alias: 'i',
                description: 'don\'t censor these words',
                type: 'array',
                default: []
            });
        },
        async argv => {
            try {
                const censor = new Censor();

                if (argv.ignore) {
                    censor.ignore.push(...argv.ignore);
                }

                censor.loadArchive(await fs.readFile(argv.archive));
                console.log(censor.censorMessage(argv.message));
            } catch (e) {
                process.exitCode = 1;
                console.error(e);
            }
        })
    .command(
        'dump-json <archive>',
        'dump JSON files of each censor section',
        yargs => {
            yargs.positional('archive', {
                description: 'filter jag archive',
                type: 'string'
            });

            yargs.option('pretty', {
                alias: 'p',
                description: 'pretty-print JSON files',
                type: 'boolean',
                default: false
            });

            yargs.option('output', {
                alias: 'o',
                description: 'directory to dump JSON files',
                type: 'string',
                default: './filter-json'
            });
        },
        async argv => {
            const censor = new Censor();

            try {
                await mkdirp(argv.output);
                censor.loadArchive(await fs.readFile(argv.archive));

                for (const section of SECTIONS) {
                    await fs.writeFile(
                        path.join(argv.output, `${section}.json`),
                        JSON.stringify(censor[section], null,
                            argv.pretty ? '    ' : ''));
                }
            } catch (e) {
                process.exitCode = 1;
                console.error(e);
            }
        })
    .command(
        'pack-json <archive> <files..>',
        'encode and compress JSON files into filter archive',
        yargs => {
            yargs.positional('archive', {
                description: 'filter jag archive',
                type: 'string'
            });

            yargs.positional('files', {
                description: 'JSON files of each censor section',
                type: 'array'
            });
        },
        async argv => {
            const censor = new Censor();

            try {
                censor.loadArchive(await fs.readFile(argv.archive));
            } catch (e) {
                // ignore - script will create a new archive
            }

            try {
                for (const filename of argv.files) {
                    const section = JSON.parse(await fs.readFile(filename));
                    const ext = path.extname(filename);
                    const sectionName = path.basename(filename, ext);

                    censor[sectionName] = section;
                }

                censor.populateBuffers();
                await fs.writeFile(argv.archive, censor.toArchive());
            } catch (e) {
                process.exitCode = 1;
                console.error(e);
            }
        })
    .demandCommand()
    .argv;
