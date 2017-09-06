'use strict';

const DBus = require('dbus-as-promised');

module.exports = NetworkManager => {
  class Checkpoint extends DBus.InterfaceWrapper {
    static connect(objPath) {
      return NetworkManager._getInterface(
        Checkpoint,
        objPath,
        'org.freedesktop.NetworkManager.Checkpoint');
    }
    
    async GetDevices() {
      let devs = await this.getProperty('Devices');
      return Promise.all(devs.map(NetworkManager.Device.connect));
    }
  }
  
  return Checkpoint;
}