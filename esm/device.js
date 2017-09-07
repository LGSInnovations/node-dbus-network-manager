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
    
    Reapply(connection, version_id = 0, ...flags) {
      return this._iface.Reapply(
        connection,
        version_id,
        NetworkManager.fromFlags(NetworkManager.enums.DeviceReapplyFlags, flags));
    }
    
    GetAppliedConnection(...flags) {
      return this._iface.GetAppliedConnection(
        NetworkManager.fromFlags(NetworkManager.enums.GetAppliedConnectionFlags, flags));
    }
    
    async GetCapabilities() {
      let caps = await this.getProperty('Capabilities');
      return NetworkManager.toFlags(NetworkManager.enums.DeviceCapabilities, caps);
    }
    
    async GetState() {
      let state = await this.getProperty('State');
      return NetworkManager.toEnum(NetworkManager.enums.DeviceState, state);
    }
    
    async GetStateReason() {
      let stateReason = await this.getProperty('StateReason');
      let result = {};
      for (let state in stateReason) {
        let reason = stateReason[state];
        
        result[NetworkManager.toEnum(NetworkManager.enums.DeviceState, state)]
          = NetworkManager.toEnum(NetworkManager.enums.DeviceStateReason, reason);
      }
      return result;
    }
    
    async GetDeviceType() {
      let devType = await this.getProperty('DeviceType');
      return NetworkManager.toEnum(NetworkManager.enums.DeviceType, devType);
    }
    
    async GetAvailableConnections() {
      let conns = await this.getProperty('AvailableConnections');
      return Promise.all(conns.map(NetworkManager.Connection.connect));
    }
    
    async GetMetered() {
      let metered = await this.getProperty('Metered');
      return NetworkManager.toEnum(NetworkManager.enums.Metered, metered);
    }
    
    async _interpretSignal(signal, args)
    {
      switch(signal)
      {
        case 'StateChanged':
          return [
            NetworkManager.toEnum(NetworkManager.enums.DeviceState, args[0]),
            NetworkManager.toEnum(NetworkManager.enums.DeviceState, args[1]),
            NetworkManager.toEnum(NetworkManager.enums.DeviceStateReason, args[2])
          ];
        
        default:
          return args;
      }
    }
  }

  // TODO: dynamically discover which of these apply to each particular device object,
  // using bus.introspect.
  Device._addSubInterface('Statistics');
  Device._addSubInterface('Adsl');
  Device._addSubInterface('Bluetooth', class extends DBus.InterfaceWrapper {
    async GetBtCapabilities() {
      let caps = await this.getProperty('BtCapabilities');
      return NetworkManager.toFlags(NetworkManager.enums.BluetoothCapabilities, caps);
    }
  });
  
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
  
  Device._addSubInterface('Modem', class extends DBus.InterfaceWrapper {
    async GetModemCapabilities() {
      let caps = await this.getProperty('ModemCapabilities');
      return NetworkManager.toFlags(NetworkManager.enums.DeviceModemCapabilities, caps);
    }
    
    async GetCurrentCapabilities() {
      let caps = await this.getProperty('CurrentCapabilities');
      return NetworkManager.toFlags(NetworkManager.enums.DeviceModemCapabilities, caps);
    }
  });
  
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
    async GetMode() {
      let mode = await this.getProperty('Mode');
      return NetworkManager.toEnum(NetworkManager.enums.NM80211Mode, mode);
    }
    
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
    
    async GetWirelessCapabilities() {
      let caps = await this.getProperty('WirelessCapabilities');
      return NetworkManager.toFlags(NetworkManager.enums.DeviceWifiCapabilities, caps);
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
