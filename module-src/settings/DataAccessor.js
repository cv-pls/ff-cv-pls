/*jslint plusplus: true, white: true, browser: true, sloppy: true */
/*global DataAccessor:true, normalizeSetting:false */

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
    DataAccessor.prototype.dataStore = null;

    /**
     * @param {DefaultSettings} Map of the default settings
     */
    DataAccessor.prototype.defaultSettings = null;

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
                result[key] = this.getSetting(key);
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
