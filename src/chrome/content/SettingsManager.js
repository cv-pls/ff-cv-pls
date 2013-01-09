/*jslint plusplus: true, white: true, browser: true */
/*global CvPlsHelper */

(function() {

  'use strict';

  function getInputByPrefName(name) {
    var input = document.getElementById('cv-pls-pref-control-'+name);
    if (input) {
      this[name] = input;
      return true;
    }
    return false;
  }

  function toggleInput(input, state, noRecurse) {
    var labels, i;
    noRecurse = noRecurse || false;

    input.disabled = !state;

    labels = document.querySelectorAll('.label-for-'+input.id.split('-').pop());
    if (labels) {
      for (i in labels) {
        if (labels.hasOwnProperty(i)) {
          labels[i].disabled = !state;
        }
      }
    }

    if (!noRecurse) {
      toggleDependencies(input, state, state);
    }
  }
  function toggleDependencies(input, state, noRecurse) {
    var dependencies, i;
    noRecurse = noRecurse || false;

    dependencies = document.querySelectorAll('.depends-on-'+input.id.split('-').pop());
    if (dependencies) {
      for (i in dependencies) {
        if (dependencies.hasOwnProperty(i) && !noRecurse && dependencies[i].tagName !== 'label') {
          toggleInput(dependencies[i], state, state);
        }
      }
    }
  }

  function loadInputs() {
    getInputByPrefName.call(this, 'oneBoxHeight');
    getInputByPrefName.call(this, 'removeCompletedOneboxes');
    getInputByPrefName.call(this, 'oneBox');

    getInputByPrefName.call(this, 'removeLostNotifications');
    getInputByPrefName.call(this, 'removeCompletedNotifications');
    getInputByPrefName.call(this, 'avatarNotification');

    getInputByPrefName.call(this, 'pollInterval');
    getInputByPrefName.call(this, 'showCloseStatus');
    getInputByPrefName.call(this, 'pollCloseStatus');

    getInputByPrefName.call(this, 'backlogAmount');
    getInputByPrefName.call(this, 'backlogRefreshInterval');
    getInputByPrefName.call(this, 'backlogRefresh');
    getInputByPrefName.call(this, 'backlogEnabled');

    getInputByPrefName.call(this, 'dupesEnabled');
  }

  function initAppearance() {
    var self = this;
    this.oneBox.addEventListener('command', function() {
      self.oneBoxHeight.disabled = !this.checked;
      toggleInput(self.removeCompletedOneboxes, this.checked);
    });

    if (!this.oneBox.checked) {
      this.oneBoxHeight.disabled = true;
      toggleInput(this.removeCompletedOneboxes, false);
    }
  }
  function initNotification() {
    var self = this;
    this.avatarNotification.addEventListener('command', function() {
      toggleInput(self.removeLostNotifications, this.checked);
      toggleInput(self.removeCompletedNotifications, this.checked);
    });

    if (!this.avatarNotification.checked) {
      toggleInput(this.removeLostNotifications, false);
      toggleInput(this.removeCompletedNotifications, false);
    }
  }
  function initVoteStatus() {
    var self = this;
    this.pollCloseStatus.addEventListener('command', function() {
      toggleInput(self.pollInterval, this.checked);
    });
    this.showCloseStatus.addEventListener('command', function() {
      if (this.checked) {
        toggleInput(self.pollCloseStatus, true);
        if (self.pollCloseStatus.checked) {
          toggleInput(self.pollInterval, true);
        }
      } else {
        toggleInput(self.pollCloseStatus, false);
        toggleInput(self.pollInterval, false);
      }
    });

    if (!this.pollCloseStatus.checked) {
      toggleInput(this.pollInterval, false);
    }
    if (!this.showCloseStatus.checked) {
      toggleInput(this.pollCloseStatus, false);
      toggleInput(this.pollInterval, false);
    }
  }
  function initBacklog() {
    var self = this;
    this.backlogRefresh.addEventListener('command', function() {
      self.backlogRefreshInterval.disabled = !this.checked;
    });
    this.backlogEnabled.addEventListener('command', function() {
      if (this.checked) {
        toggleInput(self.backlogAmount, true);
        toggleInput(self.backlogRefresh, true);
        if (self.backlogRefresh.checked) {
          toggleInput(self.backlogRefreshInterval, true);
        }
      } else {
        toggleInput(self.backlogAmount, false);
        toggleInput(self.backlogRefresh, false);
        toggleInput(self.backlogRefreshInterval, false);
      }
    });

    if (!this.backlogRefresh.checked) {
      toggleInput(this.backlogRefreshInterval, false);
    }
    if (!this.backlogEnabled.checked) {
      toggleInput(this.backlogAmount, false);
      toggleInput(this.backlogRefresh, false);
      toggleInput(this.backlogRefreshInterval, false);
    }
  }

  CvPlsHelper.firefox.SettingsManager = function() {
    loadInputs.call(this);

    initAppearance.call(this);
    initNotification.call(this);
    initVoteStatus.call(this);
    initBacklog.call(this);
  };

}());