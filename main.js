"use strict";

var utils = require('@iobroker/adapter-core');
var adapterName = require(__dirname + '/package.json').name.split('.').pop();
var adapterName = 'hid-barcode';
var os = require('os');
var adapter = new utils.Adapter(adapterName);
const Hostname = JSON.stringify(os.hostname());
//adapter.log.info (Hostname)
var BS = require('usb-barcode-scanner').UsbScanner;
var scanner = null;

var id_Anlage = "2600_Schrauberstand";
var angemeldet = "Angemeldet";
var abgemeldet = "Abgemeldet";
var RFID;


const sql = require('mssql')
const config = {
    user: 'sa',
    password: '',
    server: '10.170.20.32',
    database: 'Anlagen_Produktdaten',
    parseJSON: "true"
    }


// States anlegen
adapter.setObjectNotExists("RFID", {
	type: "state",
	common: {
	name: "RFID",
	type: "String",
	role: "Benutzeranmeldung",
	read: true,
	write: false
	},
	native: {}
	});



adapter.setObjectNotExists("RFID_Level", {
	type: "state",
	common: {
	read: true, 
  	write: false, 
  	name: "RFID_Level",
	role: "Benutzeranmeldung"
	},
	native: {}
	});

adapter.setObjectNotExists("RFID_Name", {
 	type: "state",
        common: {
 	read: true, 
  	write: false, 
  	name: "RFID_Name", 
  	type: "string", 
	role: "Benutzeranmeldung",
 	},
        native: {}
	});

adapter.setObjectNotExists("RFID_Status", {
 	type: "state",
        common: {
  	read: true, 
  	write: false, 
  	name: "RFID_Status", 
  	type: "string", 
	role: "Benutzeranmeldung",
 	},
        native: {}
	});






////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

adapter.on('ready', function(){
adapter.log.info(Hostname)
main();
});

adapter.on('unload', function(){
scanner.stopScanning();
scanner = null
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
	adapter.setState("RFID", decimalToHex(data), true); 
	RFID = decimalToHex(data)
	NNRFID();

	//SQLAbfrage();
});

scanner.on('error', function(err){
adapter.log.error(err)
});

 
scanner.startScanning();
adapter.subscribeStates('*');


};


function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);

    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    var s = "";
    var i = hex.length;
    while (i>0) {
        s += hex.substring(i-2,i);
        i=i-2;
    }
    return s;
}


function NNRFID (){
//Daten vom SQL server lesen
adapter.log.info(RFID)
var ssql = 'exec [Anlagen_Produktdaten].[dbo].[Allgemein_Benutzerverwaltung_ioBroker] @SN_Nr = "' + RFID + '", @Anlage = "2600_Schrauberstand"'
sql.connect(config).then(() => {
    return sql.query (ssql)
}).then(result => {
		try{
		adapter.setState("RFID",JSON.stringify(result.recordsets[0][0].SN_Nr), true);
                adapter.setState("RFID_Name",JSON.stringify(result.recordsets[0][0].Benutzername),true);
                adapter.setState("RFID_Level",JSON.stringify(result.recordsets[0][0].Anlage), true);
		adapter.log.info("Level:  " + JSON.stringify(result.recordsets[0][0].Anlage))
//Level größer 0 dann anmelden setzen
                if (Number(JSON.stringify(result.recordsets[0][0].Anlage)) > 0)  {
                    adapter.log.info('Angemeldet');
                    adapter.setState("RFID_Status",angemeldet);
                    Anmeldedaten("Angemeldet");
		    sql.close();
//Level =0 dann Benutzer abmelden
                }else {
                    adapter.log.info('Abgemeldet');
                    Anmeldedaten("Angemeldet");
		    sql.close(); 
}
                }
                catch(err){
			adapter.log.error(err)
                    adapter.log.info('Abgemeldet');
                    Anmeldedaten("Abgemeldet");
		    sql.close();
                }}
   );

}



function Anmeldedaten(s) {
var a = s.toString();
var delayMillis = 1000; //1 second
adapter.log.info("Funktion:  " + a)
setTimeout(function() {
	setTimeout(function() {
    		adapter.setState("RFID","0");
    		adapter.setState("RFID_Name",'');
    		adapter.setState("RFID_Level",0);
    		adapter.setState("RFID_Status","Abgemeldet");
 	},1000*60*10);
 
//	ssql =  "INSERT INTO [Anlagen_Produktdaten].[dbo].[_Benutzeranmeldung] ([SN_Nr],[Benutzername],[Anlage],[Status],[Level]) VALUES ('" + adapter.getState("RFID").val + "','" + adapter.getState("RFID_Name").val + "', '" + Hostname + "', '" + a + "', '" + adapter.getState("RFID_Level").val + "')";
//	adapter.log.info (ssql)


}, delayMillis);

	if (a=='Abgemeldet') {
    		setTimeout(function() {
    			adapter.setState("RFID","0");
			adapter.setState("RFID_Name",'');
    			adapter.setState("RFID_Level",0);
    			adapter.setState("RFID_Status","Abgemeldet");
    		}, delayMillis);
	};


}








