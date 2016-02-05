const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');const spawn = require('child_process').spawn;

var jdiffPath = path.join(__dirname, 'jdiff/bin/', process.platform, 'jdiff',
                         process.platform == 'win32' ? '.exe' : '');

/**
 * diff(origFile, targetFile, callback[, errCallback]) ||
 * diff(origFile, targetFile, patchFile, callback[, errCallback])
 * @param {Function} callback - callback(filename || buffer);
 */
function diff(origFile, targetFile, patchFile, callback, errCallback) {
    if (typeof patchFile === 'function') {
        errCallback = callback;
        callback = patchFile;
        patchFile = undefined;
    }

    var args = [origFile, targetFile];

    var destDir = path.dirname(patchFile);
    if (!fs.accessSync(destDir, fs.W_OK))
        mkdirp(destDir);

    if (patchFile) {
        diffToFile(args, patchFile, callback, errCallback);
    } else {
        diffToBuffer(args, callback);
    }
}

function diffToFile(args, patchFile, callback, errCallback) {
    args.push(patchFile);
    var jdiff = spawn(jdiffPath, args);

    jdiff.on('exit', function(code) {
        if (code === 0)
            callback(patchFile);
        else
            (errCallback || callback)(code);
    });
}

function diffToBuffer(args, callback, errCallback) {
    var chunks = [];
    var chunksLength = 0;
    var jdiff = spawn(jdiffPath, args);

    jdiff.stdout.on('data', chunk => {
        chunks.push(chunk);
        chunksLength += chunk.length;
    });

    jdiff.on('exit', function(code) {
        if (code === 0)
            callback(Buffer.concat(chunks, chunksLength));
        else
            (errCallback || callback)(code);
    });
}

module.exports = diff;
