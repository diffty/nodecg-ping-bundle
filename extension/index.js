'use strict';

var lastButtonsState = {}

module.exports = function (nodecg) {
	nodecg.log.info('P I N G Overlay System – Extension');
	nodecg.log.info('Serial port communication extension, for PING6/BassThon');

	var arduino_enabled = true;

	const SerialPort = null;
	const Readline = null;

	try {
		SerialPort = require("serialport");
		Readline = require('@serialport/parser-readline')
	}
	catch (err) {
		arduino_enabled = false;

		if (err.code == 'MODULE_NOT_FOUND') {
			nodecg.log.info("<!> Modules serialport and/or @serialport/parser-readline has not beed found. Thus, Arduino interface will be disabled.")
		}
	}

	if (arduino_enabled == true) {
		var port = new SerialPort("COM12", {
			baudRate: 9600,
		});

		var receiveSerialData = (data) => {
			var splittedData = data.split(":")

			if (!(splittedData[0].indexOf("Button") != -1 && splittedData[1] in ["0", "1"])) {
				return;
			}

			var buttonName = splittedData[0];
			var buttonState = splittedData[1] == "1";

			if (!(buttonName in lastButtonsState)) {
				lastButtonsState[buttonName] = false;
			}

			if (buttonState != lastButtonsState[buttonName]) {
				nodecg.sendMessage("physicalButtonStateChanged", {
					buttonName: buttonName,
					buttonState: buttonState,
				});
			}

			lastButtonsState[buttonName] = buttonState;
		}

		const parser = port.pipe(new Readline({ delimiter: '\r\n' }));
		parser.on('data', receiveSerialData.bind(nodecg));
	}
};

