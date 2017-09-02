'use strict';

const DBus = require('dbus-as-promised');

module.exports = NetworkManager => {
  class DnsManager extends DBus.InterfaceWrapper {
    static connect() {
      return NetworkManager._getInterface(
        DnsManager,
        '/org/freedesktop/NetworkManager/DnsManager',
        'org.freedesktop.NetworkManager.DnsManager');
    }
  }
  
  return DnsManager;
}