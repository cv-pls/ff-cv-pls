/*jslint plusplus: true, white: true, browser: true */
/*global CvPlsHelper */

(function() {

  'use strict';

  // Constructors
  var DesktopNotificationDispatcher;

  // Module definition
  CvPlsHelper.modules.notifications = {
    load: function(args) {
      return new DesktopNotificationDispatcher();
    }
  };

  DesktopNotificationDispatcher = function() {};

  DesktopNotificationDispatcher.prototype.dispatch = function(title, message) {
  };

}());