'use strict';

const DBus = require('dbus-as-promised');
const PLazy = require('p-lazy');

module.exports = NetworkManager => {
  class ActiveConnection extends DBus.InterfaceWrapper {
    constructor(iface) {
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
    
    async GetConnection() {
      return NetworkManager.Connection.connect(await this.getProperty('Connection'));
    }
    
    async GetDevices() {
      let devs = await this.getProperty('Devices');
      return Promise.all(devs.map(NetworkManager.Device.connect));
    }
    
    async GetIp4Config() {
      return NetworkManager.IP4Config.connect(await this.getProperty('Ip4Config'));
    }
    
    async GetDhcp4Config() {
      return NetworkManager.DHCP4Config.connect(await this.getProperty('Dhcp4Config'));
    }
    
    async GetIp6Config() {
      return NetworkManager.IP6Config.connect(await this.getProperty('Ip6Config'));
    }
    
    async GetDhcp6Config() {
      return NetworkManager.DHCP6Config.connect(await this.getProperty('Dhcp6Config'));
    }
    
    async GetMaster() {
      return NetworkManager.Device.connect(await this.getProperty('Master'));
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