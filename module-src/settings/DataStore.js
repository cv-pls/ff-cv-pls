/*jslint plusplus: true, white: true, browser: true */
/*global DataStore, Components */

(function() {
    /**
     * Constructor
     */
    DataStore = function()
    {
        this.prefs = Components.classes['@mozilla.org/preferences-service;1']
                      .getService(Components.interfaces.nsIPrefService)
                      .getBranch('extensions.cv-pls.');
    };

    /**
     * Retrieve a setting from localStorage
     *
     * @param {string} key The setting name
     *
     * @return {mixed} The setting value
     */
    DataStore.prototype.getSetting = function(key)
    {
        var result;

        try {
            switch (this.prefs.getPrefType(key)) {
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

    /**
     * Save a setting in localStorage
     *
     * @param {string} key   The setting name
     * @param {mixed}  value The setting value
     */
    DataStore.prototype.saveSetting = function(key, value)
    {
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
