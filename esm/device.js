'use strict';

const DBus = require('dbus-as-promised');
const PLazy = require('p-lazy');

module.exports = NetworkManager => {
  class Device extends DBus.InterfaceWrapper {
    constructor(iface) {
      super(iface);
      
      Device.subInterfaces.forEach(name => {
        this[name] = PLazy.from(this._getSubInterface.bind(this, name));
      });
    }
    
    static connect(objPath) {
      return NetworkManager._getInterface(
        Device,
        objPath,
        'org.freedesktop.NetworkManager.Device');
    }

    async _getSubInterface(name) {
      return Device[name].connect(this._iface.objectPath);
    }
  }

  // TODO: dynamically discover which of these apply to each particular device object,
  // using bus.introspect.
  Device.subInterfaces = [
    'Statistics',
    'Adsl',
    'Bond',
    'Bridge',
    'Bluetooth',
    'Dummy',
    'Wired',
    'Generic',
    'Infiniband',
    'IPTunnel',
    'Macsec',
    'Macvlan',
    'Modem',
    'OlpcMesh',
    'Team',
    'Tun',
    'Veth',
    'Vlan',
    'Vxlan',
    'Wireless',
    'WiMax',
  ];
  Device.subInterfaces.forEach(name => {
    Device[name] = class extends DBus.InterfaceWrapper {
      static connect(objPath) {
        return NetworkManager._getInterface(
          Device[name],
          objPath,
          'org.freedesktop.NetworkManager.Device.' + name);
      }
    }
  });

  Device.subInterfaces.push('PPP');
  Device.PPP = class extends DBus.InterfaceWrapper {
    static connect(objPath) {
      return NetworkManager._getInterface(
        Device.PPP,
        objPath,
        'org.freedesktop.NetworkManager.PPP');
    }
  }

  return Device;
}
