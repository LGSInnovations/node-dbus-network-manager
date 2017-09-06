# dbus-network-manager

A node.js API to interact with NetworkManager via DBus.  This is currently extremely new and incomplete.

### Title

Here are a few example snippets.  They need work, they're just some random bits and bobs I've been using to test with as I build this (on a Node 6.x system).

    require('./cjs/index.js').connect().then(x => nm=x);
    
    nm.on('DeviceAdded', console.log);
    nm.on('DeviceRemoved', dev => console.log ("Device Removed: " + dev));
    
    nm.Device.connect('/org/freedesktop/NetworkManager/Devices/0').then(x => dev=x);
    dev.Statistics.then(x => stats=x);
    stats.getProperties().then(console.log)
    stats.on('PropertiesChanged', console.log);
    stats.setProperty('RefreshRateMs', 100);

    nm.Settings.connect().then(x => settings=x);
    settings.ListConnections().then(console.log)
    settings.on('PropertiesChanged', console.log);

    nm.Connection.connect('/org/freedesktop/NetworkManager/Settings/0').then(x => conn=x);
    conn.GetSettings().then(console.log)
