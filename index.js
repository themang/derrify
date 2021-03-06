var through = require('through')
  , syntaxError = require('syntax-error')
  , _ = require('lodash')
  , fs = require('fs')
  , errors = [];

module.exports = function(errFile) {
  return {
    transform: function(file) {
      if(_.last(file.split('.')) === 'js') {
        var err = syntaxError(fs.readFileSync(file), file);
        if(err) {
          if(! _.contains(errors, file))
            errors.push(file);

          fs.writeFileSync(errFile, err);
          return through(function() {

          }, function() {
            this.queue('');
            this.queue(null);
          });
        }
      }

      errors = _.without(errors, file);
      return through();
    },
    postBundleCb: function(err, src, cb) {
      if(errors.length === 0 && fs.existsSync(errFile))
        fs.unlinkSync(errFile);
      cb && cb(err, src);
    }
  };
};