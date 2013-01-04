/*jslint plusplus: true, white: true, browser: true */
/*global CvPlsHelper, Components */

CvPlsHelper.firefox.SettingsDataStore = function() {

  "use strict";
  var prefs = Components.classes['@mozilla.org/preferences-service;1']
                .getService(Components.interfaces.nsIPrefService)
                .getBranch('extensions.cv-pls.');

  this.getSetting = function(key) {
    var result;
    try {
      switch (prefs.getPrefType(key)) {
        case prefs.PREF_INT:
          result = prefs.getIntPref(key);
          break;
        case prefs.PREF_BOOL:
          result = prefs.getBoolPref(key);
          break;
        case prefs.PREF_STRING:
          result = prefs.getCharPref(key);
          break;
        case prefs.PREF_INVALID:
          result = null;
          break;
      }
    } catch (e) {
      result = null;
    }
    return result;
  };

  this.saveSetting = function(key, value) {
    try {
      switch (prefs.getPrefType(key)) {
        case prefs.PREF_INT:
          result = prefs.setIntPref(key, value);
          break;
        case prefs.PREF_BOOL:
          result = prefs.setBoolPref(key, value);
          break;
        case prefs.PREF_STRING:
          result = prefs.setCharPref(key, value);
          break;
        case prefs.PREF_INVALID:
          result = null;
          break;
      }
    } catch (e) {}
  };

};