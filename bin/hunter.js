#!/usr/bin/env node

let {
    exec
} = require('child_process')

let fs = require('fs-extra')
let _fs = require('fs')
let rimraf = require('rimraf');
let chalk = require('chalk')
let argv = require('optimist').argv;

let gitRepo = 'https://github.com/corianderHunter/vue-common-project-template.git';

if (argv._.length < 2) {
    return console.log(chalk.red('missing required command,please check your command.'));
}

let projectName = argv._[1];

main();

async function main() {
    let options = {
        name: {
            value: '',
            initialValue: 'projectName'
        },
        version: {
            value: '',
            initialValue: '1.0.0',
        },
        description: {
            value: '',
            initialValue: 'A commpn vue project with element-ui、vuex、vue-router',
        },
        author: {
            value: '',
            initialValue: process.env.USER || ''
        },
    };
    for (let pro in options) {
        process.stdout.write(` ?Project ${pro}${options[pro]?`(${options[pro]})`:''}:   `);
        await new Promise((resolve, reject) => {
            process.stdin.on('data', (chunk) => {
                options[pro].value ? null : options[pro].value = stdinFormat(chunk.toString()) || options[pro].initialValue; //avoid set value repeatedly
                resolve();
            });
        })
    }
    process.stdin.end();
    await start(projectName);
    let packjsonFile = `./${projectName}/package.json`,
        json;
    await new Promise((resolve, reject) => {
        fs.readFile(packjsonFile, 'utf8', (err, chunk) => {
            if (err)
                return console.log(chalk.red(chalk.bold('[error]:' + err)));
            try {
                json = JSON.parse(chunk.toString());
                resolve();
            } catch (e) {
                console.log(chalk.red(chalk.bold('[error]:' + e)))
            }
        })
    });
    for (let pro in options) {
        json[pro] = options[pro].value || json[pro];
    }
    await new Promise((resolve, reject) => {
        fs.writeFile(packjsonFile, JSON.stringify(json, null, 4), err => {
            if (err)
                return console.log(chalk.red(chalk.bold('[error]:' + err))), reject();
            resolve();
        })
    })
    console.log(chalk.green('Completed!'));
}

function start(name) {
    console.log(chalk.green('start pulling project template'));
    return new Promise((resolve, reject) => {
        //the output of command 'git clone' is always putted in stderr, can't determine if the execution wan successful
        exec(`git clone ${gitRepo} ${name}`, (error, stdout, stderr) => {
            if (error) {
                console.log(chalk.red(chalk.bold('[error]:') + error || 'occur errors'));
                reject();
            } else {
                stdout ? console.log(chalk.bold('[info]:') + '    ' + stdout.slice(0, -1)) : '';
                stderr ? console.log(chalk.bold('[info]:') + '    ' + stderr.slice(0, -1)) : '';
                async function rmFile() {
                    await new Promise((resolve, reject) => {
                        rimraf(`./${name}/.git`, err => {
                            if (err) {
                                console.log(chalk.red(err))
                                reject()
                            } else {
                                resolve()
                            };

                        })
                    })
                    console.log(chalk.green('pull over successfully!'));
                    resolve();
                };
                rmFile().catch(err => {

                });
            }
        })
    })
}

function stdinFormat(str) {
    return str.replace(/[\r\n]/g, "").trim();
}