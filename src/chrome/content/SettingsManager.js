/*jslint plusplus: true, white: true, browser: true */
/*global CvPlsHelper */

CvPlsHelper.firefox.SettingsManager = function() {

  "use strict";

  var self = this;

  this.getInputByName = function(name) {
    console.log(name);
    var input = document.getElementById('cv-pls-pref-control-'+name);
    if (input) {
      self[name] = input;
      return true;
    }
    return false;
  };

  this.toggleInput = function(input, state, noRecurse) {
    var labels, i;
    noRecurse = noRecurse || false;

    input.disabled = !state;

    labels = document.querySelector('.label-for-'+input.id.split('-').pop());
    if (labels) {
      for (i in labels) {
        if (labels.hasOwnProperty(i)) {
          labels[i].disabled = !state;
        }
      }
    }

    if (!noRecurse) {
      self.toggleDependencies(input, state, state);
    }
  };
  this.toggleDependencies = function(input, state, noRecurse) {
    var dependencies, i;
    noRecurse = noRecurse || false;

    dependencies = document.querySelector('.depends-on-'+input.id.split('-').pop());
    if (dependencies) {
      for (i in dependencies) {
        if (dependencies.hasOwnProperty(i) && !noRecurse && dependencies[i].tagName !== 'label') {
          self.toggleInput(dependencies[i], state, state);
        }
      }
    }
  }

  this.initOneBox = function() {
    self.getInputByName('oneBoxHeight');
    self.getInputByName('removeCompletedOneboxes');
    if (self.getInputByName('oneBox')) {
      if (!self.oneBox.checked) {
        self.oneBoxHeight.disabled = true;
        self.toggleInput(self.removeCompletedOneboxes, false);
      }
      self.oneBox.addEventListener('command', function() {
        self.oneBoxHeight.disabled = !this.checked;
        self.toggleInput(self.removeCompletedOneboxes, this.checked);
      });
    }
  };

  this.initAvatarNotification = function() {
    self.getInputByName('removeLostNotifications');
    self.getInputByName('removeCompletedNotifications');
    if (self.getInputByName('avatarNotification')) {
      if (!self.avatarNotification.checked) {
        self.toggleInput(self.removeLostNotifications, false);
        self.toggleInput(self.removeCompletedNotifications, false);
      }
      self.avatarNotification.addEventListener('command', function() {
        self.toggleInput(self.removeLostNotifications, this.checked);
        self.toggleInput(self.removeCompletedNotifications, this.checked);
      });
    }
  };

  this.initShowCloseStatus = function() {
    self.initPollCloseStatus();
    if (self.getInputByName('showCloseStatus')) {
      if (!self.showCloseStatus.checked) {
        self.toggleInput(self.pollCloseStatus, false);
        self.toggleInput(self.pollInterval, false);
      }
      self.showCloseStatus.addEventListener('command', function() {
        if (this.checked) {
          self.toggleInput(self.pollCloseStatus, true);
          if (self.pollCloseStatus.checked) {
            self.toggleInput(self.pollInterval, true);
          }
        } else {
          self.toggleInput(self.pollCloseStatus, false);
          self.toggleInput(self.pollInterval, false);
        }
      });
    }
  };
  this.initPollCloseStatus = function() {
    self.getInputByName('pollInterval');
    if (self.getInputByName('pollCloseStatus')) {
      if (!self.pollCloseStatus.checked) {
        self.toggleInput(self.pollInterval, false);
      }
      self.pollCloseStatus.addEventListener('command', function() {
        self.toggleInput(self.pollInterval, this.checked);
      });
    }
  };

  this.initBacklogEnabled = function() {
    self.getInputByName('backlogAmount');
    self.initBacklogRefresh();
    if (self.getInputByName('backlogEnabled')) {
      if (!self.backlogEnabled.checked) {
        self.toggleInput(self.backlogAmount, false);
        self.toggleInput(self.backlogRefresh, false);
        self.toggleInput(self.backlogRefreshInterval, false);
      }
      self.backlogEnabled.addEventListener('command', function() {
        if (this.checked) {
          self.toggleInput(self.backlogAmount, true);
          self.toggleInput(self.backlogRefresh, true);
          if (self.backlogRefresh.checked) {
            self.toggleInput(self.backlogRefreshInterval, true);
          }
        } else {
          self.toggleInput(self.backlogAmount, false);
          self.toggleInput(self.backlogRefresh, false);
          self.toggleInput(self.backlogRefreshInterval, false);
        }
      });
    }
  };
  this.initBacklogRefresh = function() {
    self.getInputByName('backlogRefreshInterval');
    if (self.getInputByName('backlogRefresh')) {
      if (!self.backlogRefresh.checked) {
        self.toggleInput(self.backlogRefreshInterval, false);
      }
      self.backlogRefresh.addEventListener('command', function() {
        self.backlogRefreshInterval.disabled = !this.checked;
      });
    }
  };

  this.initDupesEnabled = function() {
    if (self.getInputByName('dupesEnabled')) {
      if (!self.dupesEnabled.checked) {
        self.toggleInput(self.showDupes, false);
      }
      self.dupesEnabled.addEventListener('command', function() {
        self.toggleInput(self.showDupes, this.checked);
      });
    }
  };

  this.init = function() {
    self.initOneBox();
    self.initAvatarNotification();
    self.initShowCloseStatus();
    self.initBacklogEnabled();
    self.initDupesEnabled();
  };

};