const core = require('@actions/core');
const walk = require('walk');
const path = require('path');
const lint = require('./lint');

const disableChecks = core.getInput('disable-checks', {required: false});

let disabled = [];
if (disableChecks) {
    disabled = disableChecks.split(',');
}

const walker = walk.walk(".", {followLinks: false, filters: ["node_modules"]});
const results = [];
walker.on("file", function (root, fileStats, next) {
    if (path.extname(fileStats.name) === '.ipynb') {
        console.log(fileStats.name);
        results.push(lint(path.join(root, fileStats.name), disabled));
    }
    next();
});

walker.on("end", function () {
    if (!results.every(i => i)) {
        console.log(`${results.filter(v => !v).length}/${results.length} notebooks need cleaning!`);
        core.setFailed('Lint failed');
    } else {
        console.log(`${results.length}/${results.length} notebooks are clean!`);
    }
});
