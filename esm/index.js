'use strict';

// DBus-based interface to NetworkManager.
// See https://developer.gnome.org/NetworkManager/stable/spec.html

const DBus = require('dbus-as-promised');
const PLazy = require('p-lazy');

const SERVICE_NAME = 'org.freedesktop.NetworkManager';

class NetworkManager extends DBus.InterfaceWrapper {
  constructor(iface)
  {
    super(iface);
    
    this.ActiveConnection = require('./active-connection')(this);
    this.AgentManager = require('./agent-manager')(this);
    this.DnsManager = require('./dns-manager')(this);
    this.Settings = require('./settings')(this);
    this.Connection = this.Settings.Connection;
    this.Device = require('./device')(this);
    this.IP4Config = require('./ip4-config')(this);
    this.IP6Config = require('./ip6-config')(this);
    this.DHCP4Config = require('./dhcp4-config')(this);
    this.DHCP6Config = require('./dhcp6-config')(this);
    this.AccessPoint = require('./access-point')(this);
  }
  
  get SERVICE_NAME() { return SERVICE_NAME; }
  
  async _getInterface(wrapper, objPath, iface) {
    return new wrapper(await this._iface.bus.getInterface(SERVICE_NAME, objPath, iface));
  }
  
  static async connect(bus) {
    const OBJECT_PATH = '/org/freedesktop/NetworkManager';
    const RPC_INTERFACE = 'org.freedesktop.NetworkManager';
    
    if (!bus)
    {
      bus = DBus.getBus('system');
    }

    return new NetworkManager(
      await bus.getInterface(SERVICE_NAME, OBJECT_PATH, RPC_INTERFACE));
  }

  async _interpretSignal(signal, args)
  {
    switch(signal)
    {
      case "DeviceAdded":
        return [await this.Device.connect(args[0])];

      default:
        return args;
    }
  }

  async GetDevices()
  {
    let devs = await this._iface.GetDevices();
    return Promise.all(devs.map(d => this.Device.connect(d)));
  }
  
  get PrimaryConnection() {
    return this.getProperty('PrimaryConnection')
      .then(conn => this.ActiveConnection.connect(conn));
  }
}

module.exports = NetworkManager;
