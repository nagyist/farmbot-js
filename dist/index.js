"use strict";
var fbpromise_1 = require("./fbpromise");
var mqtt_1 = require("mqtt");
var util_1 = require("./util");
var Farmbot = (function () {
    function Farmbot(input) {
        this._events = {};
        this._state = util_1.assign({}, Farmbot.defaults, input);
        this._decodeThatToken();
    }
    Farmbot.prototype._decodeThatToken = function () {
        var token;
        try {
            var str = this.getState()["token"];
            var base64 = str.split(".")[1];
            var plaintext = atob(base64);
            token = JSON.parse(plaintext);
        }
        catch (e) {
            console.warn(e);
            throw new Error("Unable to parse token. Is it properly formatted?");
        }
        var mqttUrl = token.mqtt || "MQTT SERVER MISSING FROM TOKEN";
        var isSecure = location.protocol === "https:";
        var protocol = isSecure ? "wss://" : "ws://";
        var port = isSecure ? 443 : 3002;
        this.setState("mqttServer", "" + protocol + mqttUrl + ":" + port);
        this.setState("uuid", token.bot || "UUID MISSING FROM TOKEN");
    };
    Farmbot.prototype.getState = function () {
        return JSON.parse(JSON.stringify(this._state));
    };
    ;
    Farmbot.prototype.setState = function (key, val) {
        if (val !== this._state[key]) {
            var old = this._state[key];
            this._state[key] = val;
            this.emit("change", { name: key, value: val, oldValue: old });
        }
        ;
        return val;
    };
    ;
    Farmbot.prototype.powerOff = function () {
        var p = {
            method: "power_off",
            params: [],
            id: util_1.uuid()
        };
        return this.send(p);
    };
    Farmbot.prototype.reboot = function () {
        var p = {
            method: "reboot",
            params: [],
            id: util_1.uuid()
        };
        return this.send(p);
    };
    Farmbot.prototype.checkUpdates = function () {
        var p = {
            method: "check_updates",
            params: [],
            id: util_1.uuid()
        };
        return this.send(p);
    };
    Farmbot.prototype.checkArduinoUpdates = function () {
        var p = {
            method: "check_arduino_updates",
            params: [],
            id: util_1.uuid()
        };
        return this.send(p);
    };
    /** Lock the bot from moving. This also will pause running regimens and cause
     *  any running sequences to exit
     */
    Farmbot.prototype.emergencyLock = function () {
        var p = {
            method: "emergency_lock",
            params: [],
            id: util_1.uuid()
        };
        return this.send(p);
    };
    /** Unlock the bot when the user says it is safe. */
    Farmbot.prototype.emergencyUnlock = function () {
        var p = {
            method: "emergency_unlock",
            params: [],
            id: util_1.uuid()
        };
        return this.send(p);
    };
    Farmbot.prototype.execSequence = function (sequence) {
        var p = {
            method: "exec_sequence",
            params: [sequence],
            id: util_1.uuid()
        };
        return this.send(p);
    };
    Farmbot.prototype.homeAll = function (i) {
        var p = {
            method: "home_all",
            params: [i],
            id: util_1.uuid()
        };
        return this.send(p);
    };
    Farmbot.prototype.homeX = function (i) {
        var p = {
            method: "home_x",
            params: [i],
            id: util_1.uuid()
        };
        return this.send(p);
    };
    Farmbot.prototype.homeY = function (i) {
        var p = {
            method: "home_y",
            params: [i],
            id: util_1.uuid()
        };
        return this.send(p);
    };
    Farmbot.prototype.homeZ = function (i) {
        var p = {
            method: "home_z",
            params: [i],
            id: util_1.uuid()
        };
        return this.send(p);
    };
    Farmbot.prototype.moveAbsolute = function (i) {
        var p = {
            method: "move_absolute",
            params: [i],
            id: util_1.uuid()
        };
        return this.send(p);
    };
    Farmbot.prototype.moveRelative = function (i) {
        var p = {
            method: "move_relative",
            params: [i],
            id: util_1.uuid()
        };
        return this.send(p);
    };
    Farmbot.prototype.writePin = function (i) {
        var p = {
            method: "write_pin",
            params: [i],
            id: util_1.uuid()
        };
        return this.send(p);
    };
    Farmbot.prototype.togglePin = function (i) {
        var p = {
            method: "toggle_pin",
            params: [i],
            id: util_1.uuid()
        };
        return this.send(p);
    };
    Farmbot.prototype.readStatus = function () {
        var p = {
            method: "read_status",
            params: [],
            id: util_1.uuid()
        };
        return this.send(p);
    };
    Farmbot.prototype.sync = function () {
        var p = {
            method: "sync",
            params: [],
            id: util_1.uuid()
        };
        return this.send(p);
    };
    /** Update the arduino settings */
    Farmbot.prototype.updateMcu = function (i) {
        var p = {
            method: "mcu_config_update",
            params: [i],
            id: util_1.uuid()
        };
        return this.send(p);
    };
    /** Update a config */
    Farmbot.prototype.updateConfig = function (i) {
        var p = {
            method: "bot_config_update",
            params: [i],
            id: util_1.uuid()
        };
        return this.send(p);
    };
    Farmbot.prototype.startRegimen = function (id) {
        var p = {
            method: "start_regimen",
            params: [{ regimen_id: id }],
            id: util_1.uuid()
        };
        return this.send(p);
    };
    Farmbot.prototype.stopRegimen = function (id) {
        var p = {
            method: "stop_regimen",
            params: [{ regimen_id: id }],
            id: util_1.uuid()
        };
        return this.send(p);
    };
    Farmbot.prototype.clibrate = function (target) {
        var p = {
            method: "calibrate",
            params: [{ target: target }],
            id: util_1.uuid()
        };
        return this.send(p);
    };
    Farmbot.prototype.event = function (name) {
        this._events[name] = this._events[name] || [];
        return this._events[name];
    };
    ;
    Farmbot.prototype.on = function (event, callback) {
        this.event(event).push(callback);
    };
    ;
    Farmbot.prototype.emit = function (event, data) {
        [this.event(event), this.event("*")]
            .forEach(function (handlers) {
            handlers.forEach(function (handler) {
                try {
                    handler(data, event);
                }
                catch (e) {
                    console.warn("Exception thrown while handling `" + event + "` event.");
                }
            });
        });
    };
    Object.defineProperty(Farmbot.prototype, "channel", {
        get: function () {
            var uuid = this.getState()["uuid"] || "lost_and_found";
            return {
                toDevice: "bot/" + uuid + "/from_clients",
                toClient: "bot/" + uuid + "/from_device"
            };
        },
        enumerable: true,
        configurable: true
    });
    Farmbot.prototype.publish = function (msg) {
        if (this.client) {
            this.client.publish(this.channel.toDevice, JSON.stringify(msg));
        }
        else {
            throw new Error("Not connected to server");
        }
    };
    ;
    Farmbot.prototype.send = function (input) {
        var that = this;
        var msg = input;
        var label = msg.method + " " + JSON.stringify(msg.params);
        var time = that.getState()["timeout"];
        var p = fbpromise_1.timerDefer(time, label);
        console.log("Sent: " + msg.id);
        that.publish(msg);
        that.on(msg.id, function (response) {
            console.log("Got " + (response.id || "??"));
            if (response && response.result) {
                // Good method invocation.
                p.resolve(response);
                return;
            }
            if (response && response.error) {
                // Bad method invocation.
                p.reject(response.error);
                return;
            }
            // It's not JSONRPC.
            var e = new Error("Malformed response");
            console.error(e);
            console.dir(response);
            p.reject(e);
        });
        return p.promise;
    };
    ;
    Farmbot.prototype._onmessage = function (_, buffer /*, message*/) {
        try {
            var msg = JSON.parse(buffer.toString());
        }
        catch (error) {
            throw new Error("Could not parse inbound message from MQTT.");
        }
        if (msg && (msg.method && msg.params && (msg.id === null))) {
            console.log("Notification");
            this.emit("notification", msg);
            return;
        }
        if (msg && (msg.id)) {
            this.emit(msg.id, msg);
            return;
        }
        throw new Error("Not a JSONRPC Compliant message");
    };
    ;
    Farmbot.prototype.connect = function () {
        var that = this;
        var _a = that.getState(), uuid = _a.uuid, token = _a.token, mqttServer = _a.mqttServer, timeout = _a.timeout;
        var p = fbpromise_1.timerDefer(timeout, "MQTT Connect Atempt");
        that.client = mqtt_1.connect(mqttServer, {
            username: uuid,
            password: token
        });
        that.client.subscribe(that.channel.toClient);
        that.client.once("connect", function () { return p.resolve(that); });
        that.client.on("message", that._onmessage.bind(that));
        return p.promise;
    };
    return Farmbot;
}());
exports.Farmbot = Farmbot;
Farmbot.VERSION = "2.0.0-rc.9";
Farmbot.defaults = { speed: 100, timeout: 6000 };
