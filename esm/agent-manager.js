'use strict';

const DBus = require('dbus-as-promised');

module.exports = NetworkManager => {
  class AgentManager extends DBus.InterfaceWrapper {
    static connect() {
      return NetworkManager._getInterface(
        AgentManager,
        '/org/freedesktop/NetworkManager/AgentManager',
        'org.freedesktop.NetworkManager.AgentManager');
    }
  }
  
  return AgentManager;
}