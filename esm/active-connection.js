'use strict';

const DBus = require('dbus-as-promised');
const PLazy = require('p-lazy');

module.exports = NetworkManager => {
  class ActiveConnection extends DBus.InterfaceWrapper {
    constructor(iface, vpnIface) {
      super(iface);
      
      this.VPN = PLazy.from(this._getVpnInterace.bind(this));
    }
    
    static connect(objPath) {
      return NetworkManager._getInterface(
        ActiveConnection,
        objPath,
        'org.freedesktop.NetworkManager.Connection.Active');
    }
    
    _getVpnInterace() {
      return ActiveConnection.VPN.connect(this._iface.objectPath);
    }
    
    get Connection() {
      return this.getProperty('Connection').then(NetworkManager.Settings.Connection.connect);
    }
  }

  ActiveConnection.VPN = class extends DBus.InterfaceWrapper {
    static connect(objPath) {
      return NetworkManager._getInterface(
        ActiveConnection,
        objPath,
        'org.freedesktop.NetworkManager.VPN.Connection');
    }
  }

  return ActiveConnection;
}