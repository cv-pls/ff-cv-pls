var ss = require("simple-storage");

function LocalStorage(storage)
{
  function getItem(key) {
    return storage[key];
  }

  function setItem(key, value) {
    return storage[key] = value;
  }
}

var localStorage = new LocalStorage(ss.storage);

function Settings() {
  this.normalizeDefaultTrue = function(value) {
    if (value == 'true' || value === true || value === null) {
      return true;
    }

    return false;
  };

  this.normalizeDefaultFalse = function(value) {
    if (value == 'false' || value === false || value === null) {
      return false;
    }

    return true;
  };

  this.normalizeDefaultNumeric = function(value, defaultValue) {
    if (value === null || isNaN(value)) {
      return defaultValue;
    }

    return value;
  }

  this.normalizeDefaultArray = function(value) {
    if (value === null  || !value.length) {
      return [];
    }

    return JSON.parse(value);
  }

  this.normalizeDefaultObject = function(value) {
    if (value === null || !value.length) {
      return {};
    }

    return JSON.parse(value);
  }

  this.getSetting = function(key) {
    return localStorage.getItem(key);
  };

  this.saveSetting = function(key, value) {
    localStorage.setItem(key, value);
  };

  this.deleteSetting = function(key) {
    localStorage.remove(key);
  }

  this.truncate = function() {
    localStorage.clear();
  }
}

function PluginSettings(settings) {
  var self = this;

  this.settings = settings;

  this.getVersion = function() {
    var details = {
      version: 0.2
    }
    return details.version;
  }

  this.showIcon = function() {
    return settings.normalizeDefaultTrue(settings.getSetting('showIcon'));
  };

  this.oneBox = function() {
    return settings.normalizeDefaultTrue(settings.getSetting('oneBox'));
  };

  this.oneBoxHeight = function() {
    return settings.normalizeDefaultNumeric(settings.getSetting('oneBoxHeight'), 30);
  };

  this.soundNotification = function() {
    return settings.normalizeDefaultFalse(settings.getSetting('soundNotification'));
  };

  this.avatarNotification = function() {
    return settings.normalizeDefaultFalse(settings.getSetting('avatarNotification'));
  };

  this.desktopNotification = function() {
    return settings.normalizeDefaultFalse(settings.getSetting('desktopNotification'));
  };

  this.showCloseStatus = function() {
    return settings.normalizeDefaultTrue(settings.getSetting('showCloseStatus'));
  };

  this.pollCloseStatus = function() {
    return settings.normalizeDefaultFalse(settings.getSetting('pollCloseStatus'));
  };

  this.pollInterval = function() {
    return settings.normalizeDefaultNumeric(settings.getSetting('pollInterval'), 5);
  };

  this.cvPlsButton = function() {
    return settings.normalizeDefaultTrue(settings.getSetting('cvPlsButton'));
  };

  this.delvPlsButton = function() {
    return settings.normalizeDefaultFalse(settings.getSetting('delvPlsButton'));
  };

  this.backlogEnabled = function() {
    return settings.normalizeDefaultFalse(settings.getSetting('backlogEnabled'));
  };

  this.backlogAmount = function() {
    return settings.normalizeDefaultNumeric(settings.getSetting('backlogAmount'), 5);
  };

  this.backlogRefresh = function() {
    return settings.normalizeDefaultTrue(settings.getSetting('backlogRefresh'));
  };

  this.backlogRefreshInterval = function() {
    return settings.normalizeDefaultNumeric(settings.getSetting('backlogRefreshInterval'), 60);
  };

  this.dupesEnabled = function() {
    return settings.normalizeDefaultFalse(settings.getSetting('dupesEnabled'));
  };

  this.dupesList = function() {
    return settings.normalizeDefaultArray(settings.getSetting('dupesList'));
  };

  this.getAllSettings = function() {
    return {
      version: self.getVersion(),
      showIcon: self.showIcon(),
      oneBox: self.oneBox(),
      oneBoxHeight: self.oneBoxHeight(),
      soundNotification: self.soundNotification(),
      avatarNotification: self.avatarNotification(),
      desktopNotification: self.desktopNotification(),
      showCloseStatus: self.showCloseStatus(),
      pollCloseStatus: self.pollCloseStatus(),
      pollInterval: self.pollInterval(),
      cvPlsButton: self.cvPlsButton(),
      delvPlsButton: self.delvPlsButton(),
      backlogEnabled: self.backlogEnabled(),
      backlogAmount: self.backlogAmount(),
      backlogRefresh: self.backlogRefresh(),
      backlogRefreshInterval: self.backlogRefreshInterval(),
      dupesEnabled: self.dupesEnabled(),
      dupesList: self.dupesList()
    };
  };

  this.saveAllSettings = function(settingsJsonString) {
    settings.saveSetting('showIcon', settingsJsonString.showIcon);
    settings.saveSetting('oneBox', settingsJsonString.oneBox);
    settings.saveSetting('oneBoxHeight', settingsJsonString.oneBoxHeight);
    settings.saveSetting('soundNotification', settingsJsonString.soundNotification);
    settings.saveSetting('avatarNotification', settingsJsonString.avatarNotification);
    settings.saveSetting('desktopNotification', settingsJsonString.desktopNotification);
    settings.saveSetting('showCloseStatus', settingsJsonString.showCloseStatus);
    settings.saveSetting('pollCloseStatus', settingsJsonString.pollCloseStatus);
    settings.saveSetting('pollInterval', settingsJsonString.pollInterval);
    settings.saveSetting('cvPlsButton', settingsJsonString.cvPlsButton);
    settings.saveSetting('delvPlsButton', settingsJsonString.delvPlsButton);
    settings.saveSetting('backlogEnabled', settingsJsonString.backlogEnabled);
    settings.saveSetting('backlogAmount', settingsJsonString.backlogAmount);
    settings.saveSetting('backlogRefresh', settingsJsonString.backlogRefresh);
    settings.saveSetting('backlogRefreshInterval', settingsJsonString.backlogRefreshInterval);
    settings.saveSetting('dupesEnabled', settingsJsonString.dupesEnabled);
    settings.saveSetting('dupesList', JSON.stringify(settingsJsonString.dupesList));
  };
}

var settings = new Settings();
var pluginSettings = new PluginSettings(settings);

const widgets = require("widget");
const tabs = require("tabs");

var data = require("self").data;

var widget = widgets.Widget({
  id: "mozilla-link",
  label: "Mozilla website",
  contentURL: "https://github.com/cv-pls/cv-pls/blob/master/cv-pls/img/icon16.png",
  onClick: function() {
    console.log('clicked');
    tabs.open("http://chat.stackoverflow.com/rooms/1/sandbox");
  }
});

var pageMod = require("page-mod");
pageMod.PageMod({
  include: [
    "http://chat.stackoverflow.com/rooms/*",
    "http://chat.stackoverflow.com/transcript/*"
  ],
  contentScriptWhen: 'end',
  contentScriptFile: [
    data.url("jquery-1.7.1.min.js"),
    data.url("Settings.js"),
    data.url("PluginSettings.js"),
    data.url("RequestQueue.js"),
    data.url("RequestStack.js"),
    data.url("StackApi.js"),
    data.url("griphandler-0.10.1.min.js"),
    data.url("putCursorAtEnd.js"),
    data.url("AudioPlayer.js"),
    data.url("script.js")
  ],
  onAttach: function onAttach(worker) {
    worker.port.emit("custom-jplayer-script", data.url("custom-jplayer.js"));
    worker.port.emit("getSettings", pluginSettings.getAllSettings());
  }
});