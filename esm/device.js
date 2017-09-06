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
    
    static _addSubInterface(name, cls = DBus.InterfaceWrapper) {
      if (!Device.subInterfaces) {
        Device.subInterfaces = [];
      }
      
      Device.subInterfaces.push(name);
      Device[name] = class extends cls {
        static connect(objPath) {
          return NetworkManager._getInterface(
            Device[name],
            objPath,
            'org.freedesktop.NetworkManager.Device.' + name);
        }
      };
    }

    async _getSubInterface(name) {
      return Device[name].connect(this._iface.objectPath);
    }
  }

  // TODO: dynamically discover which of these apply to each particular device object,
  // using bus.introspect.
  Device._addSubInterface('Statistics');
  Device._addSubInterface('Adsl');
  Device._addSubInterface('Bluetooth');
  
  Device._addSubInterface('Bond', class extends DBus.InterfaceWrapper {
    async GetSlaves() {
      let slaves = await this.getProperty('Slaves');
      return Promise.all(slaves.map(NetworkManager.Device.connect));
    }
  });

  Device._addSubInterface('Bridge', class extends DBus.InterfaceWrapper {
    async GetSlaves() {
      let slaves = await this.getProperty('Slaves');
      return Promise.all(slaves.map(NetworkManager.Device.connect));
    }
  });

  Device._addSubInterface('Dummy');
  Device._addSubInterface('Generic');
  Device._addSubInterface('Infiniband');
  
  Device._addSubInterface('IPTunnel', class extends DBus.InterfaceWrapper {
    async GetParent() {
      return NetworkManager.Device.connect(await this.getProperty('Parent'));
    }
  });

  Device._addSubInterface('Macsec', class extends DBus.InterfaceWrapper {
    async GetParent() {
      return NetworkManager.Device.connect(await this.getProperty('Parent'));
    }
  });
  
  Device._addSubInterface('Macvlan', class extends DBus.InterfaceWrapper {
    async GetParent() {
      return NetworkManager.Device.connect(await this.getProperty('Parent'));
    }
  });
  
  Device._addSubInterface('Modem');
  
  Device._addSubInterface('OlpcMesh', class extends DBus.InterfaceWrapper {
    async GetCompanion() {
      return NetworkManager.Device.connect(await this.getProperty('Companion'));
    }
  });
  
  Device._addSubInterface('Team', class extends DBus.InterfaceWrapper {
    async GetSlaves() {
      let slaves = await this.getProperty('Slaves');
      return Promise.all(slaves.map(NetworkManager.Device.connect));
    }
  });
  
  Device._addSubInterface('Tun');
  
  Device._addSubInterface('Veth', class extends DBus.InterfaceWrapper {
    async GetPeer() {
      return NetworkManager.Device.connect(await this.getProperty('Peer'));
    }
  });
  
  Device._addSubInterface('Vlan', class extends DBus.InterfaceWrapper {
    async GetParent() {
      return NetworkManager.Device.connect(await this.getProperty('Parent'));
    }
  });
  
  Device._addSubInterface('Vxlan', class extends DBus.InterfaceWrapper {
    async GetParent() {
      return NetworkManager.Device.connect(await this.getProperty('Parent'));
    }
  });
  
  Device._addSubInterface('WiMax');
  Device._addSubInterface('Wired');
  Device._addSubInterface('Wireless', class extends DBus.InterfaceWrapper {
    async GetAccessPoints() {
      let aps = await this._iface.GetAccessPoints();
      return Promise.all(aps.map(NetworkManager.AccessPoint.connect));
    }
    
    async GetAllAccessPoints() {
      let aps = await this._iface.GetAllAccessPoints();
      return Promise.all(aps.map(NetworkManager.AccessPoint.connect));
    }
    
    async GetActiveAccessPoint() {
      return NetworkManager.AccessPoint.connect(await this.getProperty('ActiveAccessPoint'));
    }
    
    async _interpretSignal(signal, args) {
      switch(signal) {
        case 'AccessPointAdded':
        // case 'AccessPointRemoved':
          return [NetworkManager.AccessPoint.connect(args[0])];
      
        default:
          return args;
      }
    }
  });
  
  Device._addSubInterface('PPP', class extends DBus.InterfaceWrapper {
    static connect(objPath) {
      return NetworkManager._getInterface(
        Device.PPP,
        objPath,
        'org.freedesktop.NetworkManager.PPP');
    }
  });

  return Device;
}
