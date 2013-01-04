/*jslint plusplus: true, white: true, browser: true */
/*global CvPlsHelper */

(function() {

  'use strict';

  CvPlsHelper.firefox.Bootstrap = {
    onPageLoad: function(e) {
      var application, opts;

      if (/^https?:\/\/chat\.stackoverflow\.com\/(rooms|transcript)\//i.test(e.originalTarget.location.href)) {

        opts = {
          SettingsDataAccessor: CvPlsHelper.firefox.SettingsDataAccessor,
          SettingsDataStore: CvPlsHelper.firefox.SettingsDataStore,
          DefaultSettings: CvPlsHelper.firefox.DefaultSettings,
          DesktopNotificationDispatcher: CvPlsHelper.firefox.DesktopNotificationDispatcher
        };
        application = new CvPlsHelper.ChatApplication(e.originalTarget, opts, function(){});

      } else if (/^https?:\/\/stackoverflow\.com\/questions\//i.test(e.originalTarget.location.href)) {
        /*
        opts = {
          SettingsDataAccessor: CvPlsHelper.firefox.SettingsDataAccessor,
          SettingsDataStore: CvPlsHelper.firefox.SettingsDataStore,
          DefaultSettings: CvPlsHelper.firefox.DefaultSettings,
          DesktopNotificationDispatcher: CvPlsHelper.firefox.DesktopNotificationDispatcher
        };
        application = new CvPlsHelper.QuestionApplication(e.originalTarget, opts, function(){});
        */
      }

      if (application !== undefined) {
        e.originalTarget.defaultView.addEventListener('unload', function() {
          application.shutdown();
          application = null;
        }, true);
        application.start();
      }
    },

    onWindowLoad: function() {
      window.removeEventListener('load', CvPlsHelper.firefox.Bootstrap.onWindowLoad); // Should only run once
      CvPlsHelper.content = document.getElementById('appcontent');
      CvPlsHelper.content.addEventListener('DOMContentLoaded', CvPlsHelper.firefox.Bootstrap.onPageLoad, true);
    }
  };

  window.addEventListener('load', CvPlsHelper.firefox.Bootstrap.onWindowLoad);

}());