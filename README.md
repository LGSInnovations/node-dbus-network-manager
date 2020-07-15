# DEPRECATED

This package is no longer maintained.

---

# dbus-network-manager

A node.js API to interact with NetworkManager via DBus.  This is currently extremely new and incomplete.

Here are a few example snippets.  We could use some more documentation.

    const nm = await require('dbus-network-manager').connect();
    
    nm.on('DeviceAdded', dev => console.log("Device Added:", dev));
    nm.on('DeviceRemoved', dev => console.log("Device Removed:", dev));
    
    let dev = await nm.GetDeviceByIpIface('wlp4s0');
    let stats = await dev.Statistics;
    stats.on('PropertiesChanged', console.log);
    console.log(await stats.getProperties());
    stats.setProperty('RefreshRateMs', 100);

    let settings = await nm.Settings.connect();
    console.log(await settings.ListConnections());
    settings.on('PropertiesChanged', console.log);

    let connections = await settings.ListConnections();
    console.log(await connections[0].GetSettings());
