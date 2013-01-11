/*jslint plusplus: true, white: true, browser: true */
/*global CvPlsHelper, Components */

(function() {

  'use strict';

  // Constructors
  var SettingsDataAccessor, SettingsDataStore, DefaultSettings;

  // Helper functions
  function makeDefaultSettingsObject(defaults, overrides) {
    var key, result = {};
    overrides = overrides || {};

    for (key in defaults) {
      if (defaults.hasOwnProperty(key)) {
        result[key] = defaults[key];
      }
    }

    for (key in overrides) {
      if (overrides.hasOwnProperty(key)) {
        result[key] = overrides[key];
      }
    }

    return result;
  }
  function normalizeSetting(value, defaultValue) {
    var result;

    if (value === undefined || value === null) {
      return defaultValue;
    }

    switch (typeof defaultValue) {
      case 'string':
        result = String(value);
        break;

      case 'boolean':
        result = Boolean(value && value !== 'false');
        break;

      case 'number':
        result = Number(value);
        if (isNaN(result)) {
          result = defaultValue;
        }
        break;

      case 'object':
        if (typeof value === 'object') {
          result = value;
        } else if (typeof value === 'string') {
          try {
            result = JSON.parse(value);
          } catch (e) {
            result = defaultValue;
          }
        } else {
          result = defaultValue;
        }
        break;

    }

    return result;
  }

  // Module definition
  CvPlsHelper.modules.settings = {
    load: function(args) {
      var appSettings = args[0];
      return new SettingsDataAccessor(new SettingsDataStore(), makeDefaultSettingsObject(DefaultSettings, appSettings));
    }
  };

  DefaultSettings = {};

  (function() { // SettingsDataAccessor

    SettingsDataAccessor = function(settingsDataStore, defaultSettings) {
      this.settingsDataStore = settingsDataStore;
      this.defaultSettings = defaultSettings;
    };

    SettingsDataAccessor.prototype.saveSetting = function(key, value) {
      this.settingsDataStore.saveSetting(key, value);
    };

    SettingsDataAccessor.prototype.getSetting = function(key) {
      if (this.defaultSettings[key] !== undefined) {
        return normalizeSetting(this.settingsDataStore.getSetting(key), this.defaultSettings[key]);
      }
      return null;
    };

    SettingsDataAccessor.prototype.getAllSettings = function() {
      var key, result = {};
      for (key in this.defaultSettings) {
        if (typeof this.defaultSettings[key] !== 'function') {
          result[key] = self.getSetting(key);
        }
      }
      return result;
    };

    SettingsDataAccessor.prototype.init = function(callBack) {
      callBack();
    };

  }());

  (function() { // SettingsDataStore

    SettingsDataStore = function() {
      this.prefs = Components.classes['@mozilla.org/preferences-service;1']
                    .getService(Components.interfaces.nsIPrefService)
                    .getBranch('extensions.cv-pls.');
    };

    SettingsDataStore.prototype.getSetting = function(key) {
      var result;
      try {
        switch (prefs.getPrefType(key)) {
          case this.prefs.PREF_INT:
            result = this.prefs.getIntPref(key);
            break;
          case this.prefs.PREF_BOOL:
            result = this.prefs.getBoolPref(key);
            break;
          case this.prefs.PREF_STRING:
            result = this.prefs.getCharPref(key);
            break;
          case this.prefs.PREF_INVALID:
            result = null;
            break;
        }
      } catch (e) {
        result = null;
      }
      return result;
    };

    SettingsDataStore.prototype.saveSetting = function(key, value) {
      try {
        switch (prefs.getPrefType(key)) {
          case this.prefs.PREF_INT:
            result = this.prefs.setIntPref(key, value);
            break;
          case this.prefs.PREF_BOOL:
            result = this.prefs.setBoolPref(key, value);
            break;
          case this.prefs.PREF_STRING:
            result = this.prefs.setCharPref(key, value);
            break;
          case this.prefs.PREF_INVALID:
            result = null;
            break;
        }
      } catch (e) {}
    };

  }());

}());