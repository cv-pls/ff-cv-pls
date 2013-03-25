/*jslint plusplus: true, white: true, browser: true */
/*global CvPlsHelper */
/* Built with build-module.php at Mon, 25 Mar 2013 18:47:40 +0000 */

(function() {

    'use strict';

    var DesktopNotificationDispatcher;

    /**
     * Relays desktop notifications to the background page
     */
    (function() {
        /**
         * Constructor
         */
        DesktopNotificationDispatcher = function() {};

        /**
         * Dispatch a notification to the background page
         */
        DesktopNotificationDispatcher.prototype.dispatch = function(/* title, message */) {};
    }());

    /**
     * Module definition
     */
    CvPlsHelper.modules.notifications = {
        load: function( /* args */ ) {
            return new DesktopNotificationDispatcher();
        }
    };

}());
