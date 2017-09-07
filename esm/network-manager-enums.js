'use strict';

module.exports = NetworkManager => {
  NetworkManager.toEnum = function(enumMap, entry) {
    if (!enumMap._inverse) {
      let invMap = {};
      for (let key in enumMap) {
        invMap[enumMap[key]] = key;
      }
      enumMap._inverse = invMap;
    }
    
    return enumMap._inverse[entry] || entry;
  }
  
  NetworkManager.fromEnum = function(enumMap, entry) {
    return (typeof entry === 'string') ? enumMap[entry] : entry;
  }
  
  NetworkManager.toFlags = function(enumMap, flags) {
    if (!flags) return [];
    
    let firstFlag = flags & -flags;
    let rest = flags & ~firstFlag;
    return [NetworkManager.toEnum(enumMap, firstFlag), ...NetworkManager.toFlags(enumMap, rest)];
  }
  
  NetworkManager.fromFlags = function(enumMap, ...flags) {
    if (flags.length == 1) {
      let [flag] = flags;
      return Array.isArray(flag)
        ? NetworkManager.fromFlags(enumMap, ...flag)
        : NetworkManager.fromEnum(enumMap, flag);
    }
    
    return flags.reduce((x, y) => x | NetworkManager.fromFlags(enumMap, y), 0);
  };
  
  NetworkManager.enums = {
    ReloadFlags: {
      All:                    0x00,
      NMConfig:               0x01,
      DNSConfig:              0x02,
      DNSPlugin:              0x04
    },
    
    ConnectivityState: {
      Unknown:                0,
      None:                   1,
      Portal:                 2,
      Limited:                3,
      Full:                   4
    },
    
    State: {
      Unknown:                0,
      Asleep:                 10,
      Disconnected:           20,
      Disconnecting:          30,
      Connecting:             40,
      ConnectedLocal:         50,
      ConnectedSite:          60,
      ConnectedGlobal:        70
    },
    
    CheckpointCreateFlags: {
      None:                   0x00,
      DestroyAll:             0x01,
      DeleteNewConnections:   0x02,
      DisconnectNewDevices:   0x04
    },
    
    Metered: {
      Unknown:                0,
      Yes:                    1,
      No:                     2,
      GuessYes:               3,
      GuessNo:                4
    },
    
    Capability: {
      Team:                   1
    },
    
    DeviceReapplyFlags: {
      // none currently defined
    },
    
    GetAppliedConnectionFlags: {
      // none currently defined
    },
    
    DeviceState: {
      Unknown:                0, 
      Unmanaged:              10, 
      Unavailable:            20, 
      Disconnected:           30, 
      Prepare:                40, 
      Config:                 50, 
      NeedAuth:               60, 
      IPConfig:               70, 
      IPCheck:                80, 
      Secondaries:            90, 
      Activated:              100, 
      Deactivating:           110, 
      Failed:                 120
    },
    
    DeviceStateReason: {
      NONE:                                 0,
      UNKNOWN:                              1,
      NOW_MANAGED:                          2,
      NOW_UNMANAGED:                        3,
      CONFIG_FAILED:                        4,
      IP_CONFIG_UNAVAILABLE:                5,
      IP_CONFIG_EXPIRED:                    6,
      NO_SECRETS:                           7,
      SUPPLICANT_DISCONNECT:                8,
      SUPPLICANT_CONFIG_FAILED:             9,
      SUPPLICANT_FAILED:                    10,
      SUPPLICANT_TIMEOUT:                   11,
      PPP_START_FAILED:                     12,
      PPP_DISCONNECT:                       13,
      PPP_FAILED:                           14,
      DHCP_START_FAILED:                    15,
      DHCP_ERROR:                           16,
      DHCP_FAILED:                          17,
      SHARED_START_FAILED:                  18,
      SHARED_FAILED:                        19,
      AUTOIP_START_FAILED:                  20,
      AUTOIP_ERROR:                         21,
      AUTOIP_FAILED:                        22,
      MODEM_BUSY:                           23,
      MODEM_NO_DIAL_TONE:                   24,
      MODEM_NO_CARRIER:                     25,
      MODEM_DIAL_TIMEOUT:                   26,
      MODEM_DIAL_FAILED:                    27,
      MODEM_INIT_FAILED:                    28,
      GSM_APN_FAILED:                       29,
      GSM_REGISTRATION_NOT_SEARCHING:       30,
      GSM_REGISTRATION_DENIED:              31,
      GSM_REGISTRATION_TIMEOUT:             32,
      GSM_REGISTRATION_FAILED:              33,
      GSM_PIN_CHECK_FAILED:                 34,
      FIRMWARE_MISSING:                     35,
      REMOVED:                              36,
      SLEEPING:                             37,
      CONNECTION_REMOVED:                   38,
      USER_REQUESTED:                       39,
      CARRIER:                              40,
      CONNECTION_ASSUMED:                   41,
      SUPPLICANT_AVAILABLE:                 42,
      MODEM_NOT_FOUND:                      43,
      BT_FAILED:                            44,
      GSM_SIM_NOT_INSERTED:                 45,
      GSM_SIM_PIN_REQUIRED:                 46,
      GSM_SIM_PUK_REQUIRED:                 47,
      GSM_SIM_WRONG:                        48,
      INFINIBAND_MODE:                      49,
      DEPENDENCY_FAILED:                    50,
      BR2684_FAILED:                        51,
      MODEM_MANAGER_UNAVAILABLE:            52,
      SSID_NOT_FOUND:                       53,
      SECONDARY_CONNECTION_FAILED:          54,
      DCB_FCOE_FAILED:                      55,
      TEAMD_CONTROL_FAILED:                 56,
      MODEM_FAILED:                         57,
      MODEM_AVAILABLE:                      58,
      SIM_PIN_INCORRECT:                    59,
      NEW_ACTIVATION:                       60,
      PARENT_CHANGED:                       61,
      PARENT_MANAGED_CHANGED:               62,
    },
    
    DeviceCapabilities: {
      None:                 0x00,
      NMSupported:          0x01,
      CarrierDetect:        0x02,
      IsSoftware:           0x04,
      SRIOV:                0x08
    },
    
    DeviceType: {
      Unknown:              0,
      Generic:              14,
      Ethernet:             1,
      Wifi:                 2,
      Unused1:              3,
      Unused2:              4,
      BT:                   5,
      OLPCMesh:             6,
      Wimax:                7,
      Modem:                8,
      Infiniband:           9,
      Bond:                 10,
      VLAN:                 11,
      ADSL:                 12,
      Bridge:               13,
      Team:                 15,
      TUN:                  16,
      IPTunnel:             17,
      MACVLAN:              18,
      VXLAN:                19,
      VETH:                 20,
      MACSec:               21,
      Dummy:                22
    },
    
    BluetoothCapabilities: {
      None:                 0x00,
      DUN:                  0x01,
      NAP:                  0x02
    },
    
    NM80211Mode: {
      Unknown:              0,
      AdHoc:                1,
      Infra:                2,
      AP:                   3
    },
    
    DeviceWifiCapabilities: {
      NONE:                 0x00000000,
      CIPHER_WEP40:         0x00000001,
      CIPHER_WEP104:        0x00000002,
      CIPHER_TKIP:          0x00000004,
      CIPHER_CCMP:          0x00000008,
      WPA:                  0x00000010,
      RSN:                  0x00000020,
      AP:                   0x00000040,
      ADHOC:                0x00000080,
      FREQ_VALID:           0x00000100,
      FREQ_2GHZ:            0x00000200,
      FREQ_5GHZ:            0x00000400
    },
    
    DeviceModemCapabilities: {
      None:                 0x00000000,
      POTS:                 0x00000001,
      CDMA_EVDO:            0x00000002,
      GSM_UMTS:             0x00000004,
      LTE:                  0x00000008
    },
    
    ActiveConnectionState: {
      Unknown:              0, 
      Activating:           1, 
      Activated:            2, 
      Deactivating:         3, 
      Deactivated:          4
    },
    
    ActiveConnectionStateReason: {
      Unknown:              0,
      None:                 1,
      UserDisconnected:     2,
      DeviceDisconnected:   3,
      ServiceStopped:       4,
      IPConfigInvalid:      5,
      ConnectTimeout:       6,
      ServiceStartTimeout:  7,
      ServiceStartFailed:   8,
      NoSecrets:            9,
      LoginFailed:          10,
      ConnectionRemoved:    11,
      DependencyFailed:     12,
      DeviceRealizeFailed:  13,
      DeviceRemoved:        14
    },
    
    VpnConnectionState: {
      Unknown:              0,
      Prepare:              1,
      NeedAuth:             2,
      Connect:              3,
      IPConfigGet:          4,
      Activated:            5,
      Failed:               6,
      Disconnected:         7
    },
    
    NM80211ApFlags: {
      None:                 0x00000000,
      Privacy:              0x00000001
   },
    
    NM80211ApSecurityFlags: {
      None:                 0x00000000,
      PairWEP40:            0x00000001,
      PairWEP104:           0x00000002,
      PairTKIP:             0x00000004,
      PairCCMP:             0x00000008,
      GroupWEP40:           0x00000010,
      GroupWEP104:          0x00000020,
      GroupTKIP:            0x00000040,
      GroupCCMP:            0x00000080,
      KeyMgmtPSK:           0x00000100,
      KeyMgmt8021X:         0x00000200
    }
  };
}