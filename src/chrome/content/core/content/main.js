/*jslint plusplus: true, white: true, browser: true */
/*global CvPlsHelper */

(function() {

  'use strict';

  var Bootstrap, moduleLoader;

  moduleLoader = new CvPlsHelper.firefox.ModuleLoader();

  Bootstrap = {
    onPageLoad: function(e) {
      var application, opts;

      if (/^https?:\/\/chat\.stackoverflow\.com\/(rooms|transcript)\//i.test(e.originalTarget.location.href)) {

        application = new CvPlsHelper.ChatApplication(e.originalTarget, moduleLoader, function(){});

      } else if (/^https?:\/\/stackoverflow\.com\/questions\//i.test(e.originalTarget.location.href)) {

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
      window.removeEventListener('load', Bootstrap.onWindowLoad); // Should only run once
      CvPlsHelper.content = document.getElementById('appcontent');
      CvPlsHelper.content.addEventListener('DOMContentLoaded', Bootstrap.onPageLoad, true);
    }
  };

  window.addEventListener('load', Bootstrap.onWindowLoad);

}());