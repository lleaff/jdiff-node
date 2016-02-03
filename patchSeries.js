const patch = require('./patch');

module.exports = function patchSeries(origFile, patches, outputFile,
                                      callback, errCallback) {
    var prev = origFile;
    (function series(i, prev) {
        if (i < patches.length - 1) {
            let tmp = `.${origFile}-tmp${i}~`;
            patch(prev, patches[i], tmp,
                  series.bind(this, i + 1, tmp), errCallback);
        } else {
            patch(prev, patches[i], outputFile, callback, errCallback);
        }
    })(0, origFile);
};
