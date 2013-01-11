/*jslint plusplus: true, white: true, browser: true */
/*global CvPlsHelper */

(function() {

  CvPlsHelper.firefox.ModuleLoader = function() {};

  CvPlsHelper.firefox.ModuleLoader.prototype.loadModule = function() {
    var moduleName, i, args = [];

    moduleName = arguments[0].toLowerCase();
    if (CvPlsHelper.modules[moduleName] === undefined) {
      throw new Error('The specified module ('+moduleName+') could not be found, it may not be supported on this platform');
    }

    for (i = 1; arguments[i] !== undefined; i++) {
      args.push(arguments[i]);
    }

    return CvPlsHelper.modules[moduleName].load(args);
  };

}());