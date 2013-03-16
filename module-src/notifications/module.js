/*jslint plusplus: true, white: true, browser: true */
/*global CvPlsHelper, DesktopNotificationDispatcher */

/**
 * Module definition
 */
CvPlsHelper.modules.notifications = {
    load: function(args) {
        return new DesktopNotificationDispatcher();
    }
};
