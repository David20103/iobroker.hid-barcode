"use strict";

var utils = require('@iobroker/adapter-core');
var adapterName = require(__dirname + '/package.json').name.split('.').pop();
var adapterName = 'hid-barcode';
var adapter = new utils.Adapter(adapterName);

var BS = require('usb-barcode-scanner').UsbScanner;
var scanner = null;

// States anlegen
adapter.setObjectNotExists("RFID", {
	type: "state",
	common: {
	name: "RFID",
	type: "number",
	role: "Zugang",
	read: true,
	write: true
	},
	native: {}
	});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

adapter.on('ready', function(){
main();
});

adapter.on('unload', function(){
scanner.stopScanning();
});



//###########################################   Main Funktion   ############################################################################
function main() {

  if (!adapter.config.vendorID || !adapter.config.productID) {
        adapter.log.error("VendorID and ProductID has to be configured");
        return;
    }

    try {
	adapter.log.info (adapter.config.vendorID + "    " +  adapter.config.productID)

      scanner = new BS({vendorId: Number(adapter.config.vendorID), productId: Number(adapter.config.productID) });

    } catch(e) {
        adapter.log.error(e.message);
        return;

    }
    if (!scanner) {
        adapter.log.error("kann Gerät nicht öffnen VendorID " + adapter.config.vendorID + " und Produkt ID " + adapter.config.productID);
        return;
    }


scanner.on("data", function(data) {
	adapter.setState("RFID", data, true); 
	adapter.log.info("testdata " + data);
});


scanner.on('error', function(err){
adapter.log.error(err)
});

 
scanner.startScanning();


//adapter.subscribeStates('*');


};

