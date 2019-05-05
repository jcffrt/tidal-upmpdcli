'use strict';

var libQ = require('kew');
var libNet = require('net');
var libFast = require('fast.js');
var fs=require('fs-extra');
var config = new (require('v-conf'))();
var exec = require('child_process').exec;
var nodetools = require('nodetools');

// Define the ControllerTidal class
module.exports = ControllerTidal;
function ControllerTidal(context) {
	// This fixed variable will let us refer to 'this' object at deeper scopes
	var self = this;

	this.context = context;
	this.commandRouter = this.context.coreCommand;
	this.logger = this.context.logger;
	this.configManager = this.context.configManager;

}



ControllerTidal.prototype.onVolumioStart = function()
{
	var self = this;
	var configFile=this.commandRouter.pluginManager.getConfigurationFile(this.context,'config.json');
	this.config = new (require('v-conf'))();
	this.config.loadFile(configFile);
	
	return libQ.resolve();
}

ControllerTidal.prototype.getConfigurationFiles = function()
{
	return ['config.json'];
}



// Plugin methods -----------------------------------------------------------------------------



ControllerTidal.prototype.onStop = function() {
	var self = this;

    var defer=libQ.defer();

    return defer.promise;
};

ControllerTidal.prototype.onStart = function() {
	var self = this;

	var defer=libQ.defer();

	return defer.promise;
};



ControllerTidal.prototype.onRestart = function() {
	var self = this;
	//
};

ControllerTidal.prototype.onInstall = function() {
	var self = this;
	//Perform your installation tasks here
};

ControllerTidal.prototype.onUninstall = function() {
	var self = this;
	//Perform your installation tasks here
};

ControllerTidal.prototype.getUIConfig = function() {
	var defer = libQ.defer();
	var self = this;

	var lang_code = this.commandRouter.sharedVars.get('language_code');

	self.commandRouter.i18nJson(__dirname+'/i18n/strings_'+lang_code+'.json',
		__dirname+'/i18n/strings_en.json',
		__dirname + '/UIConfig.json')
		.then(function(uiconf)
		{

			uiconf.sections[0].content[0].value = self.config.get('username');
			uiconf.sections[0].content[1].value = self.config.get('password');
			uiconf.sections[0].content[2].value = self.config.get('bitrate');

			defer.resolve(uiconf);
		})
		.fail(function()
		{
			defer.reject(new Error());
		});

	return defer.promise;
};

ControllerTidal.prototype.setUIConfig = function(data) {
	var self = this;
	//Perform your installation tasks here
};

ControllerTidal.prototype.getConf = function(varName) {
	var self = this;
	//Perform your installation tasks here
};

ControllerTidal.prototype.setConf = function(varName, varValue) {
	var self = this;
	//Perform your installation tasks here
};

// Public Methods ---------------------------------------------------------------------------------------
// These are 'this' aware, and return a promise


ControllerTidal.prototype.logDone = function(timeStart) {
	var self = this;
	self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + '------------------------------ ' + (Date.now() - timeStart) + 'ms');
	return libQ.resolve();
};

ControllerTidal.prototype.logStart = function(sCommand) {
	var self = this;
	self.commandRouter.pushConsoleMessage('\n' + '[' + Date.now() + '] ' + '---------------------------- ' + sCommand);
	return libQ.resolve();
};



ControllerTidal.prototype.pushTidalConfUpmpdcli = function (config) {
	var self = this;

    var defer = libQ.defer();
    var upnpPlugin = self.commandRouter.pluginManager.getPlugin('audio_interface', 'upnp');
    var upmpdcliconftmpl0 = "/volumio/app/plugins/audio_interface/upnp/upmpdcli.conf.tmpl0";
    var upmpdcliconftmpl = "/volumio/app/plugins/audio_interface/upnp/upmpdcli.conf.tmpl";

	try {
        fs.readFile(upmpdcliconftmpl0, 'utf8', function (err, filedata) {
			if (err) {
				defer.reject(new Error(err));
				return console.log(err);
            }

            var tidalUser = config['username'];
            var tidalPass = config['password'];
            var tidalQual = config['bitrate'].value;
//            self.commandRouter.pushToastMessage('success', "Configuration update: ", tidalUser + ' ' + tidalPass + ' ' + tidalQual);
            //Adds the real credentials and quality chosen by user and writes it to template
            var conf1 = filedata.replace('{TIDAL-USER}', tidalUser);
            var conf2 = conf1.replace('{TIDAL-PASS}', tidalPass);
            var conf3 = conf2.replace('{TIDAL-QUAL}', tidalQual);
            fs.writeFile(upmpdcliconftmpl, conf3, 'utf8', function (err) {
//			fs.writeFile("/etc/spopd.conf", conf4, 'utf8', function (err) {
				if (err)
					defer.reject(new Error(err));
                else
                    //Restarts upmpdcli to take new data
                    upnpPlugin.onRestart();
                    defer.resolve();
			});


		});


	}
	catch (err) {


	}

	return defer.promise;

};



ControllerTidal.prototype.saveTidalAccount = function (data) {
	var self = this;

	var defer = libQ.defer();

	self.config.set('username', data['username']);
	self.config.set('password', data['password']);
	self.config.set('bitrate', data['bitrate']);

    self.pushTidalConfUpmpdcli(data)
		.then(function(e){
			self.commandRouter.pushToastMessage('success', "Configuration update", 'The configuration has been successfully updated');
			defer.resolve({});
		})
		.fail(function(e)
		{
			defer.reject(new Error());
		});

	return defer.promise;
};


//ControllerTidal.prototype.rebuildSPOPDAndRestartDaemon = function () {
//	var self=this;
//	var defer=libQ.defer();

//	self.createSPOPDFile()
//		.then(function(e)
//		{
//			var edefer=libQ.defer();
//			exec("killall spopd", function (error, stdout, stderr) {
//				edefer.resolve();
//			});
//			return edefer.promise;
//		})
//		.then(self.startSpopDaemon.bind(self))
//		.then(function(e)
//		{
//			setTimeout(function () {
//				self.logger.info("Connecting to daemon");
//				self.spopDaemonConnect(defer);
//			}, 5000);
//		});

//	return defer.promise;
//};
