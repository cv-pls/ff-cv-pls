/*jslint plusplus: true, white: true, browser: true, sloppy: true */
/*global CvPlsHelper, ListenerFactory */

/**
 * Module definition
 */
CvPlsHelper.modules.mutations = {
    load: function() {
        return new ListenerFactory();
    }
};
