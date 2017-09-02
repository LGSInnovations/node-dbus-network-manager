'use strict';

const DBus = require('dbus-as-promised');

module.exports = NetworkManager => {
  class Settings extends DBus.InterfaceWrapper {
    static connect() {
      return NetworkManager._getInterface(
        Settings,
        '/org/freedesktop/NetworkManager/Settings',
        'org.freedesktop.NetworkManager.Settings');
    }
  }

  Settings.Connection = class extends DBus.InterfaceWrapper {
    static connect(objPath) {
      return NetworkManager._getInterface(
        Settings.Connection,
        objPath,
        'org.freedesktop.NetworkManager.Settings.Connection');
    }
  }

  return Settings;
}
