'use strict';

const DBus = require('dbus-as-promised');

module.exports = NetworkManager => {
  class IP4Config extends DBus.InterfaceWrapper {
    static connect(objPath) {
      return NetworkManager._getInterface(
        IP4Config,
        objPath,
        'org.freedesktop.NetworkManager.IP4Config');
    }
  }

  return IP4Config;
}