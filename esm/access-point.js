'use strict';

const DBus = require('dbus-as-promised');

module.exports = NetworkManager => {
  class AccessPoint extends DBus.InterfaceWrapper {
    static connect(objPath) {
      return NetworkManager._getInterface(
        AccessPoint,
        objPath,
        'org.freedesktop.NetworkManager.AccessPoint');
    }
    
    async GetFlags() {
      let flags = await this.getProperty('Flags');
      return NetworkManager.toFlags(NetworkManager.enums.NM80211ApFlags, flags);
    }
    
    async GetWpaFlags() {
      let flags = await this.getProperty('WpaFlags');
      return NetworkManager.toFlags(NetworkManager.enums.NM80211ApSecurityFlags, flags);
    }
    
    async GetRsnFlags() {
      let flags = await this.getProperty('RsnFlags');
      return NetworkManager.toFlags(NetworkManager.enums.NM80211ApSecurityFlags, flags);
    }
    
    async GetMode() {
      let mode = await this.getProperty('Mode');
      return NetworkManager.toEnum(NetworkManager.enums.NM80211Mode, flags);
    }
  }
  
  return AccessPoint;
}