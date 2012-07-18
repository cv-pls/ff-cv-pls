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
    data.url("custom-jplayer.js"),
    data.url("griphandler-0.10.1.min.js"),
    data.url("putCursorAtEnd.js"),
    data.url("AudioPlayer.js"),
    data.url("script.js")
  ]
});