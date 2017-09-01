'use strict';

// DBus-based interface to NetworkManager.
// See https://developer.gnome.org/NetworkManager/stable/spec.html

const DBus = require('dbus-as-promised');
const PLazy = require('p-lazy');

const SERVICE_NAME = 'org.freedesktop.NetworkManager';

class NetworkManager extends DBus.InterfaceWrapper {
  static async connect(bus) {
    const OBJECT_PATH = '/org/freedesktop/NetworkManager';
    const RPC_INTERFACE = 'org.freedesktop.NetworkManager';

    return new NetworkManager(
      await bus.getInterface(SERVICE_NAME, OBJECT_PATH, RPC_INTERFACE));
  }

  async _interpretSignal(signal, args)
  {
    switch(signal)
    {
      case "DeviceAdded":
        return [await Device.connect(this._iface.bus, args[0])];

      default:
        return args;
    }
  }

  async GetDevices()
  {
    let devs = await this._iface.GetDevices();
    return Promise.all(devs.map(d => Device.connect(this._iface.bus, d)));
  }
}

class AgentManager extends DBus.InterfaceWrapper {
  static async connect(bus) {
    const OBJECT_PATH = '/org/freedesktop/NetworkManager/AgentManager';
    const RPC_INTERFACE = 'org.freedesktop.NetworkManager.AgentManager';
    
    return new AgentManager(
      await bus.getInterface(SERVICE_NAME, OBJECT_PATH, RPC_INTERFACE));
  }
}

class DnsManager extends DBus.InterfaceWrapper {
  static async connect(bus) {
    const OBJECT_PATH = '/org/freedesktop/NetworkManager/DnsManager';
    const RPC_INTERFACE = 'org.freedesktop.NetworkManager.DnsManager';
    
    return new DnsManager(
      await bus.getInterface(SERVICE_NAME, OBJECT_PATH, RPC_INTERFACE));
  }
}

class Settings extends DBus.InterfaceWrapper {
  static async connect(bus) {
    const OBJECT_PATH = '/org/freedesktop/NetworkManager/Settings';
    const RPC_INTERFACE = 'org.freedesktop.NetworkManager.Settings';
    
    return new Settings(
      await bus.getInterface(SERVICE_NAME, OBJECT_PATH, RPC_INTERFACE));
  }
}

class Connection extends DBus.InterfaceWrapper {
  static async connect(bus, objPath) {
    const RPC_INTERFACE = 'org.freedesktop.NetworkManager.Settings.Connection';
    
    return new Connection(
      await bus.getInterface(SERVICE_NAME, objPath, RPC_INTERFACE));
  }
}

class Device extends DBus.InterfaceWrapper {
  constructor(iface) {
    super(iface);
    
    Device.subInterfaces.forEach(name => {
      this[name] = PLazy.from(this._getSubInterface.bind(this, name));
    });
  }
  
  static async connect(bus, objPath) {
    const RPC_INTERFACE = 'org.freedesktop.NetworkManager.Device';

    return new Device(await
      await bus.getInterface(SERVICE_NAME, objPath, RPC_INTERFACE));
  }

  async _getSubInterface(name) {
    return Device[name].connect(this._iface.bus, this._iface.objectPath);
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
    static async connect(bus, objPath) {
      const RPC_INTERFACE = 'org.freedesktop.NetworkManager.Device.' + name;
      
      return new Device[name](
        await bus.getInterface(SERVICE_NAME, objPath, RPC_INTERFACE));
    }
  }
});

Device.subInterfaces.push('PPP');
Device.PPP = class extends DBus.InterfaceWrapper {
  static async connect(bus, objPath) {
    const RPC_INTERFACE = 'org.freedesktop.NetworkManager.PPP';
    
    return new Device.PPP (
        await bus.getInterface(SERVICE_NAME, objPath, RPC_INTERFACE));
  }
}


class ActiveConnection extends DBus.InterfaceWrapper {
  constructor(iface, vpnIface) {
    super(iface);
    
    this.VPN = PLazy.from(this._getVpnInterace.bind(this));
    this.Connection = PLazy.from(this._getConnection.bind(this));
  }
  
  static async connect(bus, objPath) {
    const RPC_INTERFACE = 'org.freedesktop.NetworkManager.Connection.Active';
    const VPN_INTERFACE = 'org.freedesktop.NetworkManager.VPN.Connection';
    
    return new ActiveConnection(
      await bus.getInterface(SERVICE_NAME, objPath, RPC_INTERFACE));
  }
  
  async _getVpnInterace() {
    return ActiveConnectionVPN.connect(this._iface.bus, this._iface.objectPath);
  }
  
  async _getConnection() {
    let objPath = await this.getProperty('Connection');
    
    return Connection.connect(this._iface.bus, objPath);
  }
}

class ActiveConnectionVPN extends DBus.InterfaceWrapper {
  static async connect(bus, objPath) {
    const RPC_INTERFACE = 'org.freedesktop.NetworkManager.VPN.Connection';
    
    return new ActiveConnectionVPN(
      await bus.getInterface(SERVICE_NAME, objPath, RPC_INTERFACE));
  }
}

class IP4Config extends DBus.InterfaceWrapper {
  static async connect(bus, objPath) {
    const RPC_INTERFACE = 'org.freedesktop.NetworkManager.IP4Config';
    
    return new IP4Config(
      await bus.getInterface(SERVICE_NAME, objPath, RPC_INTERFACE));
  }
}

class IP6Config extends DBus.InterfaceWrapper {
  static async connect(bus, objPath) {
    const RPC_INTERFACE = 'org.freedesktop.NetworkManager.IP6Config';
    
    return new IP6Config(
      await bus.getInterface(SERVICE_NAME, objPath, RPC_INTERFACE));
  }
}

class DHCP4Config extends DBus.InterfaceWrapper {
  static async connect(bus, objPath) {
    const RPC_INTERFACE = 'org.freedesktop.NetworkManager.DHCP4Config';
    
    return new DHCP4Config(
      await bus.getInterface(SERVICE_NAME, objPath, RPC_INTERFACE));
  }
}

class DHCP6Config extends DBus.InterfaceWrapper {
  static async connect(bus, objPath) {
    const RPC_INTERFACE = 'org.freedesktop.NetworkManager.DHCP6Config';
    
    return new DHCP6Config(
      await bus.getInterface(SERVICE_NAME, objPath, RPC_INTERFACE));
  }
}

class AccessPoint extends DBus.InterfaceWrapper {
  static async connect(bus, objPath) {
    const RPC_INTERFACE = 'org.freedesktop.NetworkManager.AccessPoint';
    
    return new DHCP6Config(
      await bus.getInterface(SERVICE_NAME, objPath, RPC_INTERFACE));
  }
}

exports.SERVICE_NAME = SERVICE_NAME;

exports.NetworkManager = NetworkManager;
exports.AgentManager = AgentManager;
exports.DnsManager = DnsManager;
exports.Settings = Settings;
exports.Connection = Connection;
exports.Device = Device;
exports.IP4Config = IP4Config;
exports.IP6Config = IP6Config;
exports.DHCP4Config = DHCP4Config;
exports.DHCP6Config = DHCP6Config;
exports.AccessPoint = AccessPoint;