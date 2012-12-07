/*jslint plusplus: true, white: true, browser: true */
/*global CvPlsHelper */

CvPlsHelper.firefox.SettingsDataAccessor = function(settingsDataStore, defaultSettings) {

  "use strict";

  var self = this;

  this.saveSetting = function(key, value) {
    settingsDataStore.saveSetting(key, value);
  };

  this.getSetting = function(key) {
    return settingsDataStore.getSetting(key);
  };

  this.getAllSettings = function() {
    var key, result = {};
    for (key in defaultSettings) {
      if (typeof defaultSettings[key] !== 'function') {
        result[key] = self.getSetting(key);
      }
    }
    return result;
  };

  this.init = function(callBack) {
    callBack();
  };

};