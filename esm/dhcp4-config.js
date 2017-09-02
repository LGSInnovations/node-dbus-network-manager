'use strict';

const DBus = require('dbus-as-promised');

module.exports = NetworkManager => {
  class DHCP4Config extends DBus.InterfaceWrapper {
    static connect(objPath) {
      return NetworkManager._getInterface(
        DHCP4Config,
        objPath,
        'org.freedesktop.NetworkManager.DHCP4Config');
    }
  }

  return DHCP4Config;
}