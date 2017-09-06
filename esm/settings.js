'use strict';

const DBus = require('dbus-as-promised');

module.exports = NetworkManager => {
  class Settings extends DBus.InterfaceWrapper {
    static connect() {
      return NetworkManager._getInterface(
        Settings,
        '/org/freedesktop/NetworkManager/Settings',
        'org.freedesktop.NetworkManager.Settings');
    }
    
    async ListConnections() {
      let paths = await this._iface.ListConnections();
      return Promise.all(paths.map(Settings.Connection.connect));
    }
    
    async GetConnectionById(uuid) {
      return Settings.Connection.connect(await this._iface.GetConnectionById(uuid));
    }
    
    async AddConnection(connection) {
      return Settings.Connection.connect(await this._iface.AddConnection(connection));
    }
    
    async AddConnectionUnsaved(connection) {
      return Settings.Connection.connect(await this._iface.AddConnectionUnsaved(connection));
    }
    
    async _interpretSignal(signal, args) {
      switch(signal) {
        case 'NewConnection':
        // case 'ConnectionRemoved':
          return [NetworkManager.Connection.connect(args[0])];
      
        default:
          return args;
      }
    }
  }

  Settings.Connection = class extends DBus.InterfaceWrapper {
    static connect(objPath) {
      return NetworkManager._getInterface(
        Settings.Connection,
        objPath,
        'org.freedesktop.NetworkManager.Settings.Connection');
    }
    
    async _interpretSignal(signal, args) {
      switch(signal) {
        case 'Update':
          // TODO: decide whether we want to automatically fetch these.
          // we probably do - anytime someone subscribes to this event
          // they most likely will want this.
          return [await this.GetSettings()];
        default:
          return args;
      }
    }
  }

  return Settings;
}
