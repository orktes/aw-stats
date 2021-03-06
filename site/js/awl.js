(function (window) {
  var awl = {url: parent.location.protocol + "//" + window.location.hostname + ":3001", pilotsWaiting: {}};

  awl.api = function (path, data, callback) {
    $.getJSON(this.url + path + "?callback=?", data, callback);
  };

  awl._loadPlugin = function () {
    this.plugin = $('<object id="awl" type="application/x-assaultwinglauncher" width="1" height="1"></object>');
    $('body').append(this.plugin);
  };

  awl.isPluginLoaded = function () {
    return (document.getElementById('awl') != null);
  };

  awl.init = function () {
    if (!this.isPluginInstalled()) {
      return false;
    }

    if (!this.isPluginLoaded()) {
      this._loadPlugin();
    } else {
      this.plugin = $('#awl');
    }
  };

  awl.isPluginInstalled = function () {
    if (this.isPluginLoaded()) {
      if (document.getElementById('awl').version == "1.0.0.0") {
        return false;
      }
    }

    var mimeTypes = navigator.mimeTypes;

    if (mimeTypes) {
      if (navigator.mimeTypes["application/x-assaultwinglauncher"] != undefined) {
        return true;
      }
    }

    var plugins = navigator.plugins;

    if (plugins) {

      if (navigator.plugins['Assault Wing Launcher']) {
        return true;
      }


      for (var i = 0; i < plugins.length; i++) {
        var mimeTypes = plugins[i];
        for (var x = 0; x < mimeTypes.length; x++) {
          var mimeType = mimeTypes[x];
          if (mimeType.type == "application/x-assaultwinglauncher") {
            return true;
          }
        }
      }
    }

    if (window.ActiveXObject) {
      try {
        // AcroPDF.PDF is used by version 7 and later
        var plugin = new ActiveXObject('StudfarmStudios.AssaultWingLauncher');
        return true;
      } catch (e) {

      }
    }


    return false;
  };

  awl.start = function (params) {
    if (!this.isPluginInstalled() || !this.isPluginLoaded()) {
      return false;
    }

    var kvps = [];
    var key;
    for (key in params) {
      kvps.push(key + "=" + params[key]);
    }
    if (document.getElementById('awl').start) {
      document.getElementById('awl').start(kvps.join('&'));
      return true;
    }

    return false;
  };

  if (window.aw == undefined) {
    window.aw = {};
  }

  window.aw.awl = awl;

})(window);