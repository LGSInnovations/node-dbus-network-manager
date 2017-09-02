'use strict';

const DBus = require('dbus-as-promised');

module.exports = NetworkManager => {
  class IP6Config extends DBus.InterfaceWrapper {
    static connect(objPath) {
      return NetworkManager._getInterface(
        IP6Config,
        objPath,
        'org.freedesktop.NetworkManager.IP6Config');
    }
  }

  return IP6Config;
}