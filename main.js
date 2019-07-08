"use strict";

var utils = require(__dirname + '/lib/utils');
var HID = require('usb-barcode-scanner');

var hidDevice = null;

main()
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var dev;

var sub = {
    wo:     '',
    double: '-double',
    single: '-single-short',
    long:   '-long',
    action: '-action',
    dsl:    '-dsl',
    repcnt: '-repcnt',

    raw: 'raw',
    key: 'key'

};

var stateNames = {
    Barcode:     { n: sub.raw,              val: '',     common: { write: false, name: 'Raw Key Code', desc: 'key-code, changes on first press'}}
   
};

function createAll(callback) {

    var hidDeviceName = '';
    var d = HID.devices().find(function(d) {
        return (d.vendorId == adapter.config.vendorID && d.productId == adapter.config.productID);
    });
    if (d) {
        hidDeviceName = d.manufacturer + ' - ' + d.product;
    }
    dev = new devices.CDevice(adapter.config.vendorID + '-' + adapter.config.productID, hidDeviceName);

    //for (var prefix in { raw: '', key: '' }) {
        for (var i in stateNames) {
            var st = Object.assign({}, stateNames[i]);
            var n = st.n;
            delete st.n;
            dev.createNew(n, st);
        }
    //}
    dev.update(callback);
}



function main() {
/*
    normalizeConfig(adapter.config);
    mappings = adapter.ioPack.mappings;
    if (!adapter.config.vendorID || !adapter.config.productID) {
        adapter.log.error("VendorID and ProductID has to be configured");
        return;
    }

    try {
        hidDevice = new HID.HID(adapter.config.vendorID, adapter.config.productID);
    } catch(e) {
        adapter.log.error(e.message);
        adapter.log.error('If running on Windows, see requirements in readme.md. https://github.com/soef/iobroker.hid/blob/master/README.md');
        return;
    }
    if (!hidDevice) {
        adapter.log.error("can not open device with VendorID " + adapter.config.vendorID + " and Product ID " + adapter.config.productID);
        adapter.log.error('If running on Windows, see requirements in readme.md. https://github.com/soef/iobroker.hid/blob/master/README.md');
        return;
    }
    createAll();

    hidDevice.on("data", function (data) {
        var sData = data.toString('hex').toUpperCase();
        onData(sData);
    });
    hidDevice.on("error", function (err) {
        console.log("err: " + err);
    });
*/  
  //adapter.subscribeStates('*');
}

//--msvs_version=2015
