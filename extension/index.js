'use strict';

var lastButtonsState = {}
var port = null;
var nodecg = null;
var serialPortName;

var stingerCooldownTime = 0;

var currentBassCooldownTime;
var currentThonCooldownTime;

var deltaTime = 0.0;
var previousTickTime = 0.0;


const hrtimeMs = function() {
    let time = process.hrtime()
    return time[0] * 1000 + time[1] / 1000000
}


var initSerial = function(serialPortName) {
    var arduino_enabled = true;

    var SerialPort = null;
    var Readline = null;

    try {
        SerialPort = require("serialport");
        Readline = require('@serialport/parser-readline')
    }
    catch (err) {
        arduino_enabled = false;

        nodecg.log.info(err);

        if (err.code == 'MODULE_NOT_FOUND') {
            nodecg.log.info("<!> Modules serialport and/or @serialport/parser-readline has not beed found. Thus, Arduino interface will be disabled.")
        }
    }

    if (arduino_enabled == true) {
        if (port != null && port.isOpen) {
            nodecg.log.info('Closing opened Serial interface on port ' + port.path);
            port.close()
        }

        nodecg.log.info('Initializing Serial interface on port ' + serialPortName);
        port = new SerialPort(serialPortName, {
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
}

module.exports = function (nodecg_obj) {
    nodecg = nodecg_obj;

    nodecg.log.info('P I N G Overlay System – Extension');
    nodecg.log.info('Serial port communication extension, for PING6/BassThon');

    const arduinoSerialPortReplicant = nodecg.Replicant(
        "arduinoSerialPort", {defaultValue: "COM12"}
    );

    serialPortName = arduinoSerialPortReplicant.value;

    nodecg.listenFor("resetSerialConnection", (value, ack) => {
        initSerial(serialPortName);
    });

    arduinoSerialPortReplicant.on("change", (newValue, oldValue) => {
        serialPortName = newValue;
        initSerial(serialPortName);
    });

    setupVideo();
};

function setupVideo() {
    nodecg.log.info("P I N G — Overlay System — BassThon™ Addon");

    currentBassCooldownTime = stingerCooldownTime;
    currentThonCooldownTime = stingerCooldownTime;

    const stingerCooldownTimeReplicant = nodecg.Replicant(
        "bassthonStingerCooldownTime",
        {defaultValue: 60}
    );

    stingerCooldownTimeReplicant.on("change", (newValue, oldValue) => {
        if (newValue) {
            stingerCooldownTime = currentBassCooldownTime = currentThonCooldownTime = newValue;
        }
    });

    nodecg.listenFor("cooldownAction", (value, ack) => {
        if (value.action == "reset") {
            currentBassCooldownTime = currentThonCooldownTime = stingerCooldownTime;
        }
        else if (value.action == "burn") {
            currentBassCooldownTime = currentThonCooldownTime = 0;
        }
    });

    nodecg.listenFor("sendTeamStinger", (value, ack) => {
        sendTeamStinger(value.teamName)
    });

    nodecg.listenFor("physicalButtonStateChanged", (value, ack) => {
        if (value.buttonState == true) {
            switch (value.buttonName) {
                case "Button1":
                    sendTeamStinger("bass");
                    break;

                case "Button2":
                    sendTeamStinger("thon");
                    break;
            }
        }
    });

    //app.ticker.add(updateVideo);
    previousTickTime = hrtimeMs();

    setImmediate(updateVideo);
}

function updateVideo() {
    var nowTickTime = hrtimeMs();

    deltaTime = nowTickTime - previousTickTime;
    previousTickTime = nowTickTime;

    if (currentBassCooldownTime > 0) {
        currentBassCooldownTime -= deltaTime / 1000.;
    }

    if (currentThonCooldownTime > 0) {
        currentThonCooldownTime -= deltaTime / 1000.;
    }

    setImmediate(updateVideo)
}

function sendTeamStinger(teamName) {
    if (teamName == "bass") {
        showVideo(0);
    }
    else if (teamName == "thon") {
        showVideo(1);
    }
    else if (teamName == "both") {
        showVideo(0);
        showVideo(1);
    }
}

function showVideo(videoId) {
    if (videoId == 0) {
        if (currentBassCooldownTime <= 0) {
            nodecg.sendMessage("showScreen", {videoId: videoId})
            currentBassCooldownTime = stingerCooldownTime;
        }
    }
    else if (videoId == 1) {
        if (currentThonCooldownTime <= 0) {
            nodecg.sendMessage("showScreen", {videoId: videoId})
            currentThonCooldownTime = stingerCooldownTime;
        }
    }
}
