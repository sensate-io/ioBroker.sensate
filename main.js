"use strict";

/*
 * Created with @iobroker/create-adapter v1.23.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");

const request = require('request');

class Sensate extends utils.Adapter {

	/**
	 * @param {Partial<ioBroker.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: "sensate",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("objectChange", this.onObjectChange.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));

		this.loopVar = null;
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Initialize your adapter here

		// The adapters config (in the instance object everything under the attribute "native") is accessible via
		// this.config:

		const self = this;

		if(this.config.accessToken==null || this.config.listKey==null)
		{
			self.log.error("Please provide an accessToken and listKey!");
			return;
		}
		else
		{
			self.getDataList(self.config.accessToken, self.config.listKey, self.config.tempUnit)
			this.loopVar = setInterval(function() {
				self.getDataList(self.config.accessToken, self.config.listKey, self.config.tempUnit)
			}, 30*1000);
		}

		// /*
		// For every state in the system there has to be also an object of type state
		// Here a simple template for a boolean variable named "testVariable"
		// Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
		// */
		// await this.setObjectAsync("testVariable", {
		// 	type: "state",
		// 	common: {
		// 		name: "testVariable",
		// 		type: "boolean",
		// 		role: "indicator",
		// 		read: true,
		// 		write: true,
		// 	},
		// 	native: {},
		// });
		//
		// // in this template all states changes inside the adapters namespace are subscribed
		// this.subscribeStates("*");
		//
		// /*
		// setState examples
		// you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
		// */
		// // the variable testVariable is set to true as command (ack=false)
		// await this.setStateAsync("testVariable", true);
		//
		// // same thing, but the value is flagged "ack"
		// // ack should be always set to true if the value is received from or acknowledged from the target system
		// await this.setStateAsync("testVariable", { val: true, ack: true });
		//
		// // same thing, but the state is deleted after 30s (getState will return null afterwards)
		// await this.setStateAsync("testVariable", { val: true, ack: true, expire: 30 });
		//
		// // examples for the checkPassword/checkGroup functions
		// let result = await this.checkPasswordAsync("admin", "iobroker");
		// this.log.info("check user admin pw iobroker: " + result);
		//
		// result = await this.checkGroupAsync("admin", "admin");
		// this.log.info("check group user admin group admin: " + result);
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			this.log.info("cleaned everything up...");
			if(this.loopVar!=null)
				clearInterval(this.loopVar);
			callback();
		} catch (e) {
			callback();
		}
	}

	/**
	 * Is called if a subscribed object changes
	 * @param {string} id
	 * @param {ioBroker.Object | null | undefined} obj
	 */
	onObjectChange(id, obj) {
		if (obj) {
			// The object was changed
			this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
		} else {
			// The object was deleted
			this.log.info(`object ${id} deleted`);
		}
	}

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	/**
	 * This function is called periodically (every 30 sec) to get sensor updates from the Sensate Api
	 * Reference: https://api.sensate.io
	 * @param {string} accessToken
	 * @param {string} listKey
	 * @param {string} tempUnit
	 */
	getDataList(accessToken, listKey, tempUnit) {

		const self = this;

		this.log.debug('Refresh Data List...');

		accessToken = escape(accessToken);
		listKey = escape(listKey);

		var url = 'https://api.sensate.io/v1/data/live/list?accessToken='+accessToken+'&listKey='+listKey;
		if(tempUnit!=null)
			url = url + '&tempUnit='+tempUnit;

		request(
			{
				url: url,
				json: true,
				time: true,
				timeout: 5000
			},
			(error, response, content) => {

				if (response) {

					if(response.statusCode==401)
					{
						self.log.error("Invalid Sensor API Key and/or ListKey");
						return;
					}
					else if(response.statusCode==200)
					{
						for (var key in content) {
							if (content.hasOwnProperty(key)) {

								var group = "Unknown";
								if(content[key].category!=null)
									group = content[key].category;

								self.setObjectNotExists(group, {
									type: 'device',
									common: {
										name: group
									},
									native: {}
								});

								const channel = group+"."+key;

								self.setObjectNotExists(channel, {
									type: 'channel',
									common: {
										name: group+':'+content[key].name
									},
									native: {}
								});

								self.setObjectNotExists(channel + '.id', {
									type: 'state',
									common: {
										name: group+':'+content[key].name+':id',
										type: 'string',
										role: 'text'
									},
									native: {}
								});
								this.setState(channel + '.id', {val: key, ack: true});

								self.setObjectNotExists(channel + '.shortName', {
									type: 'state',
									common: {
										name: group+':'+content[key].name+':shortName',
										type: 'string',
										role: 'text'
									},
									native: {}
								});
								this.setState(channel + '.shortName', {val: content[key].shortName, ack: true});

								self.setObjectNotExists(channel + '.name', {
									type: 'state',
									common: {
										name: group+':'+content[key].name+':name',
										type: 'string',
										role: 'text'
									},
									native: {}
								});
								this.setState(channel + '.name', {val: content[key].name, ack: true});

								var unit = '?';
								switch(content[key].dataUnit)
								{
									case 'AMPERE':
										unit = "A";
										break;
									case 'AMPEREHOURS':
										unit = "Ah";
										break;
									case 'BAR':
										unit = "bar";
										break;
									case 'CELSIUS':
										unit = "°C";
										break;
									case 'FAHRENHEIT':
										unit = "°F";
										break;
									case 'HEKTOPASCAL':
										unit = "hPa";
										break;
									case 'KELVIN':
										unit = "K";
										break;
									case 'KOHM':
										unit = "kΩ";
										break;
									case 'LUMEN':
										unit = "lum";
										break;
									case 'LUX':
										unit = "lux";
										break;
									case 'METER':
										unit = "m";
										break;
									case 'MILLIAMPERE':
										unit = "mA";
										break;
									case 'MILLIAMPEREHOURS':
										unit = "mAh";
										break;
									case 'MILLIVOLT':
										unit = "mV";
										break;
									case 'NONE':
										unit = "";
										break;
									case 'OHM':
										unit = "Ω";
										break;
									case 'PASCAL':
										unit = "Pa";
										break;
									case 'PERCENT':
										unit = "%";
										break;
									case 'PPM':
										unit = "ppm";
										break;
									case 'UNKNOWN':
										unit = "?";
										break;
									case 'VOLT':
										unit = "V";
										break;
									case 'WATT':
										unit = "W";
										break;
									case 'WATTHOURS':
										unit = "Wh";
										break;
									default:
										unit = "?";
										break;
								}

								self.setObjectNotExists(channel + '.value', {
									type: 'state',
									common: {
										name: group+':'+content[key].name+':value',
										type: 'number',
										role: 'value',
										unit: unit,
										read: true,
										write: false
									},
									native: {}
								});
								self.setState(channel + '.value', {val: content[key].lastData.value, ack: true});

								self.setObjectNotExists(channel + '.upToDate', {
									type: 'state',
									common: {
										name: group+':'+content[key].name+':upToDate',
										type: 'boolean',
										role: 'value',
										read: true,
										write: false
									},
									native: {}
								});
								self.setState(channel + '.upToDate', {val: content[key].upToDate, ack: true});

								self.setObjectNotExists(channel + '.dateTime', {
									type: 'state',
									common: {
										name: group+':'+content[key].name+':dateTime',
										type: 'string',
										role: 'date',
										read: true,
										write: false
									},
									native: {}
								});
								self.setState(channel + '.dateTime', {val: Date.parse(content[key].lastData.dateTime), ack: true});
							}
						}
						self.setObjectNotExists('responseTime', {
							type: 'state',
							common: {
								name: 'Service response time',
								type: 'number',
								role: 'value',
								unit: 'ms',
								read: true,
								write: false
							},
							native: {}
						});
						self.setState('responseTime', {val: parseInt(response.timingPhases.total), ack: true});
					}
					else if(response.statusCode==304) {
						self.log.info("No Sensor Update required");
					}
					else
					{
						self.log.warn("Unexpected Return Status: "+response.statusCode);
						return;
					}

				} else if (error) {
					self.log.info(error);
				}
			}
		);

	}

}

// @ts-ignore parent is a valid property on module
if (module.parent) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<ioBroker.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new Sensate(options);
} else {
	// otherwise start the instance directly
	new Sensate();
}