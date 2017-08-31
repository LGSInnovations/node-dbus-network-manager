# dbus-NetworkManager

A node.js API to interact with NetworkManager via DBus.  This is currently extremely new and incomplete.

Here are a few example snippets.  They need work, they're just some random bits and bobs I've been using to test with as I build this (on a Node 6.x system).

    const libnm = require('./cjs/index.js');
    const bus = require('dbus-as-promised').getBus('system');
    
    var nm; libnm.NetworkManager.connect(bus).then(x => nm = x);

    var devs;
    nm.on('DeviceAdded', console.log);
    nm.on('DeviceRemoved', dev => console.log ("Device Removed: " + dev));

    var dev; libnm.Device.connect(bus, '/org/freedesktop/NetworkManager/Devices/0').then(x => dev=x);
    var stats; dev.Statistics.then(x => stats=x);
    stats.on('PropertiesChanged', console.log);
    stats.setProperty('RefreshRateMs', 100);

    var settings; libnm.Settings.connect(bus).then(x => settings=x);
    settings.ListConnections().then(console.log)
    settings.on('PropertiesChanged', console.log);

    var conn; libnm.Connection.connect(bus, '/org/freedesktop/NetworkManager/Settings/0').then(x => conn=x);
    conn.GetSettings().then(console.log)

