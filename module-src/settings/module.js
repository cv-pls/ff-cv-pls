/*jslint plusplus: true, white: true, browser: true, sloppy: true */
/*global CvPlsHelper, DataAccessor, DataStore, DefaultSettings, makeDefaultSettingsObject:false */

/**
 * Module definition
 */
CvPlsHelper.modules.settings = {
    load: function(args) {
        var appSettings = args[0];

        return new DataAccessor(new DataStore(), makeDefaultSettingsObject(DefaultSettings, appSettings));
    }
};
