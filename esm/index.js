'use strict';

// DBus-based interface to NetworkManager.
// See https://developer.gnome.org/NetworkManager/stable/spec.html

const DBus = require('dbus-as-promised');

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

class Device extends DBus.InterfaceWrapper {
  static async connect(bus, objPath) {
    const RPC_INTERFACE = 'org.freedesktop.NetworkManager.Device';

    return new Device(await
      await bus.getInterface(SERVICE_NAME, objPath, RPC_INTERFACE));
  }

  get Statistics() {
    return (async () => {
      if (!this._statistics) {
        this._statistics = await DeviceStatistics.connect(
          this._iface.bus, 
          this._iface.objectPath);
      }

      return this._statistics;
    })()
  }
}

class DeviceStatistics extends DBus.InterfaceWrapper {
  static async connect(bus, objPath) {
    const RPC_INTERFACE = 'org.freedesktop.NetworkManager.Device.Statistics';

    return new DeviceStatistics(
      await bus.getInterface(SERVICE_NAME, objPath, RPC_INTERFACE));
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

exports.NetworkManager = NetworkManager;
exports.Device = Device;
exports.Settings = Settings;
exports.Connection = Connection;