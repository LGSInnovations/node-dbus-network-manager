'use strict';

const DBus = require('dbus-as-promised');

module.exports = NetworkManager => {
  class DHCP6Config extends DBus.InterfaceWrapper {
    static connect(objPath) {
      return NetworkManager._getInterface(
        DHCP6Config,
        objPath,
        'org.freedesktop.NetworkManager.DHCP6Config');
    }
  }

  return DHCP6Config;
}