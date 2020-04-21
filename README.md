![Logo](admin/sensate.png)
# ioBroker.sensate

[![NPM version](http://img.shields.io/npm/v/iobroker.sensate.svg)](https://www.npmjs.com/package/iobroker.sensate)
[![Downloads](https://img.shields.io/npm/dm/iobroker.sensate.svg)](https://www.npmjs.com/package/iobroker.sensate)
![Number of Installations (latest)](http://iobroker.live/badges/sensate-installed.svg)
![Number of Installations (stable)](http://iobroker.live/badges/sensate-stable.svg)
[![Dependency Status](https://img.shields.io/david/sensate-io/iobroker.sensate.svg)](https://david-dm.org/sensate-io/iobroker.sensate)
[![Known Vulnerabilities](https://snyk.io/test/github/sensate-io/ioBroker.sensate/badge.svg)](https://snyk.io/test/github/sensate-io/ioBroker.sensate)

[![NPM](https://nodei.co/npm/iobroker.sensate.png?downloads=true)](https://nodei.co/npm/iobroker.sensate/)

## Sensate platform adapter for ioBroker

This adapter is used to interface the [Sensate Platform](https://www.sensate.io). The purpose of the Sensate Platform is
to enable people to build their own custom DiY sensor hardware solutions, and easily access their data from anywhere. The
Sensate Platform does allow for fully customized projects, and also offers straight forward easy to use [DiY tutorials](https://www.sensate.io/tutorials).
Start building your DiY solution today, using either the widely available ESP8266 or ESP32 Hardware plus one (or more) of the
supported sensors for all kind of sensor data.

## Changelog

### 0.1.2
* Fixed wrong Temperature-Unit if changed after Init
### 0.1.1
* Minor improvements
### 0.1.0
* First working pre-release with polling and regular sensor updates.
### 0.0.1
* Initial release

## Known Issues
### Polling Interval
The service will poll strictly every 30 seconds from the time of starting it, not reacting to the current state and expected sensor interval update.
### Up to Date Status
The up to date status of a sensor is only updated after a successful server fetch, i.e. if there is no server connection the up to date flag will not change to false.
## License
MIT License

Copyright (c) 2020 Sensate Digital Solutions GmbH -> [hello@sensate.io](mailto:hello@sensate.io)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.