'use strict';

// DBus-based interface to NetworkManager.
// See https://developer.gnome.org/NetworkManager/stable/spec.html

const DBus = require('dbus-as-promised');

const SERVICE_NAME = 'org.freedesktop.NetworkManager';

class NetworkManager extends DBus.InterfaceWrapper {
  constructor(iface)
  {
    super(iface);

    this.AccessPoint = require('./access-point')(this);
    this.ActiveConnection = require('./active-connection')(this);
    this.AgentManager = require('./agent-manager')(this);
    this.Checkpoint = require('./checkpoint')(this);
    this.Device = require('./device')(this);
    this.DHCP4Config = require('./dhcp4-config')(this);
    this.DHCP6Config = require('./dhcp6-config')(this);
    this.DnsManager = require('./dns-manager')(this);
    this.IP4Config = require('./ip4-config')(this);
    this.IP6Config = require('./ip6-config')(this);
    this.Settings = require('./settings')(this);

    this.Connection = this.Settings.Connection;

    require('./network-manager-enums')(this);
  }

  get SERVICE_NAME() { return SERVICE_NAME; }

  async _getInterface(wrapper, objPath, iface) {
    if (!objPath || objPath === '/') return undefined;

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

  Reload(...flags) {
    return this._iface.Reload(this.fromFlags(this.enums.ReloadFlags, ...flags));
  }

  async CheckConnectivity() {
    let conn = await this._iface.CheckConnectivity();
    return this.toEnum(this.enums.ConnectivityState, conn);
  }

  async GetConnectivity() {
    let conn = await this.getProperty('Connectivity');
    return this.toEnum(this.enums.ConnectivityState, conn);
  }

  async GetState() {
    let state = await this.state();
    return this.toEnum(this.enums.State, state);
  }

  async GetDevices()
  {
    let devs = await this._iface.GetDevices();
    return Promise.all(devs.map(this.Device.connect));
  }

  async GetAllDevices()
  {
    let devs = await this._iface.GetAllDevices();
    return Promise.all(devs.map(this.Device.connect));
  }

  async GetDeviceByIpIface(iface)
  {
    return this.Device.connect(await this._iface.GetDeviceByIpIface(iface));
  }

  async ActivateConnection(connection, device, specificObject='/') {
    let objPath = await this._iface.ActivateConnection(
      DBus.unwrapInterface(connection),
      DBus.unwrapInterface(device),
      specificObject);
    return this.ActiveConnection.connect(objPath);
  }

  async AddAndActivateConnection(connection, device, specificObject='/') {
    args = args.map(DBus.unwrapInterface);

    let [conn_path, active_conn_path] =
      await this._iface.ActivateConnection(
        DBus.unwrapInterface(connection),
        DBus.unwrapInterface(device),
        specificObject);

    return Promise.all([
      this.Connection.connect(conn_path),
      this.ActiveConnection.connect(active_conn_path)]);
  }

  async DeactivateConnection(active_connection) {
    let ret = await this._iface.DeactivateConnection(active_connection);
    return ret;
  }

  async CheckpointCreate(devices, rollback_timeout = 0, ...flags) {
    return this.Checkpoint.connect(
      await this._iface.CheckpointCreate(
        devices.map(DBus.unwrapInterface),
        rollback_timeout,
        this.fromFlags(this.enums.CheckpointCreateFlags, ...flags)));
  }

  async GetActiveConnections() {
    let conns = await this.getProperty('ActiveConnections');
    return Promise.all(conns.map(this.ActiveConnection.connect));
  }

  async GetPrimaryConnection() {
    return this.ActiveConnection.connect(await this.getProperty('PrimaryConnection'));
  }

  async GetActivatingConnection() {
    return this.ActiveConnection.connect(await this.getProperty('ActivatingConnection'));
  }

  async GetMetered() {
    let metered = await this.getProperty('Metered');
    return this.toEnum(this.enums.Metered, metered);
  }

  async GetCapabilities() {
    let caps = await this.getProperty('Capabilities');
    return caps.map(c => this.toEnum(this.enums.Capabilities, c));
  }

  async _interpretSignal(signal, args)
  {
    switch(signal)
    {
      case 'DeviceAdded':
        return [await this.Device.connect(args[0])];

      case 'StateChanged':
        return [this.toEnum(this.enums.State, args[0])];

      default:
        return args;
    }
  }
}

module.exports = NetworkManager;
