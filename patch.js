const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const spawn = require('child_process').spawn;

var jpatchPath = path.join(__dirname, 'jpatch/bin/', process.platform, 'jptch',
                         process.platform == 'win32' ? '.exe' : '');

/**
 * patch(origFile, patchFile, callback[, errCallback]) ||
 * patch(origFile, patchFile, outputFile, callback[, errCallback])
 * @param {Function} callback - callback(filename || buffer);
 */
function patch(origFile, patchFile, outputFile, callback, errCallback) {
    if (typeof outputFile === 'function') {
        errCallback = callback;
        callback = outputFile;
        outputFile = undefined;
    }

    var args = [origFile, patchFile];

    var destDir = path.dirname(outputFile);
    if (!fs.accessSync(destDir, fs.W_OK))
        mkdirp.sync(destDir);

    if (outputFile) {
        patchToFile(args, outputFile, callback, errCallback);
    } else {
        patchToBuffer(args, callback);
    }
}

function patchToFile(args, outputFile, callback, errCallback) {
    args.push(outputFile);
    var jpatch = spawn(jpatchPath, args);

    jpatch.on('exit', function(code) {
        if (code === 0)
            callback(outputFile);
        else
            (errCallback || callback)(code);
    });
}

function patchToBuffer(args, callback, errCallback) {
    var chuncks = [];
    var chuncksLength = 0;
    var jpatch = spawn(jpatchPath, args);

    jpatch.stdout.on('data', chunck => {
        chuncks.push(chunck);
        chuncksLength += chunck.length;
    });

    jpatch.on('exit', function(code) {
        if (code === 0)
            callback(outputFile);
        else
            (errCallback || callback)(code);
    });
}

module.exports = patch;
