/*jslint plusplus: true, white: true, browser: true */
/*global Components, CvPlsHelper */
/* Built with build-module.php at 2013-03-16 03:08:46 GMT */

(function() {

    'use strict';

    var DataAccessor, DataStore, DefaultSettings;

    /**
     * Normalize a setting to the correct type and value
     *
     * @param {mixed} value        The current value
     * @param {mixed} defaultValue The default value
     *
     * @return {mixed} The normalized setting
     */
    function normalizeSetting(value, defaultValue)
    {
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

    /**
     * Create a default settings object based on the default values and configured overrides
     *
     * @param {object} defaults The default settings object
     * @param {object} defaults The overridden settings object
     *
     * @return {object} The created object
     */
    function makeDefaultSettingsObject(defaults, overrides)
    {
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

        // internal use, force value
        result.currentSavedVersion = '0.0.0.0';

        return result;
    }

    /**
     * Allows access to settings
     */
    (function() {
        /**
         * Constructor
         *
         * @param {DataStore}       dataStore       Object which stores the settings
         * @param {DefaultSettings} defaultSettings Map of the default settings
         */
        DataAccessor = function(dataStore, defaultSettings)
        {
            this.dataStore       = dataStore;
            this.defaultSettings = defaultSettings;
        };

        /**
         * @param {DataStore} Object which stores the settings
         */
        ContentSettingsDataAccessor.prototype.dataStore = null;

        /**
         * @param {DefaultSettings} Map of the default settings
         */
        ContentSettingsDataAccessor.prototype.defaultSettings = null;

        /**
         * Save a setting in the data store
         *
         * @param {string} key   The setting name
         * @param {mixed}  value The setting value
         */
        DataAccessor.prototype.saveSetting = function(key, value)
        {
            this.dataStore.saveSetting(key, value);
        };

        /**
         * Retrieve a setting from the data store
         *
         * @param {string} key   The setting name
         *
         * @return {mixed} The setting value
         */
        DataAccessor.prototype.getSetting = function(key)
        {
            if (this.defaultSettings[key] !== undefined) {
                return normalizeSetting(this.dataStore.getSetting(key), this.defaultSettings[key]);
            }

            return null;
        };

        /**
         * Retrieve all settings from the data store
         *
         * @return {object} The settings as a map
         */
        DataAccessor.prototype.getAllSettings = function()
        {
            var key, result = {};

            for (key in this.defaultSettings) {
                if (typeof this.defaultSettings[key] !== 'function') {
                    result[key] = self.getSetting(key);
                }
            }

            return result;
        };

        /**
         * Initialize the settings values
         *
         * @param {function} callBack Callback function to execute when the settings are initialized
         */
        DataAccessor.prototype.init = function(callBack)
        {
            callBack.call();
        };
    }());

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

    /**
     * The default settings for the plugin
     */
    DefaultSettings = {};

    /**
     * Module definition
     */
    CvPlsHelper.modules.settings = {
        load: function(args) {
            var appSettings = args[0];

            return new DataAccessor(new DataStore(), makeDefaultSettingsObject(DefaultSettings, appSettings));
        }
    };

}());
