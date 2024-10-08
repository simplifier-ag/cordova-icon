#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const xml2js = require('xml2js');
const colors = require('colors');
const _ = require('underscore');
const argv = require('minimist')(process.argv.slice(2));
const gm = require('gm').subClass({imageMagick: '7+'});

const SETTINGS = {
	CONFIG_FILE: argv.config || 'config.xml',
	ICON_FILE: argv.icon || 'icon.png',
	OLD_XCODE_PATH: argv['xcode-old'] || false
};

const FOLDERS = {
	IOS_XCODE: '/Assets.xcassets/AppIcon.appiconset/',
	IOS_OLD_XCODE: '/Resources/icons/',
	ANDROID: 'platforms/android/app/src/main/res/',
	OSX: '/Images.xcassets/AppIcon.appiconset/',
	WINDOWS: 'platforms/windows/images/'
};

const ICONS = {
	IOS: [{name: 'icon-20.png', size: 20},
		{name: 'icon-20@2x.png', size: 40},
		{name: 'icon-20@3x.png', size: 60},
		{name: 'icon-24@2x.png', size: 48},
		{name: 'icon-27.5@2x.png', size: 55},
		{name: 'icon-29.png', size: 29},
		{name: 'icon-29@2x.png', size: 58},
		{name: 'icon-29@3x.png', size: 87},
		{name: 'icon-33@2x.png', size: 66},
		{name: 'icon-40.png', size: 40},
		{name: 'icon-40@2x.png', size: 80},
		{name: 'icon-44@2x.png', size: 88},
		{name: 'icon-46@2x.png', size: 92},
		{name: 'icon-50.png', size: 50},
		{name: 'icon-50@2x.png', size: 100},
		{name: 'icon-51@2x.png', size: 102},
		{name: 'icon-60@2x.png', size: 120},
		{name: 'icon-60@3x.png', size: 180},
		{name: 'icon-72.png', size: 72},
		{name: 'icon-72@2x.png', size: 144},
		{name: 'icon-76.png', size: 76},
		{name: 'icon-76@2x.png', size: 152},
		{name: 'icon-83.5@2x.png', size: 167},
		{name: 'icon-86@2x.png', size: 172},
		{name: 'icon-98@2x.png', size: 196},
		{name: 'icon-108@2x.png', size: 216},
		{name: 'icon-117@2x.png', size: 234},
		{name: 'icon-1024.png', size: 1024},
		{name: 'icon.png', size: 57},
		{name: 'icon@2x.png', size: 114}
	],
	ANDROID: [
		{name: 'drawable/icon.png', size: 96},
		{name: 'drawable-hdpi/icon.png', size: 72},
		{name: 'drawable-ldpi/icon.png', size: 36},
		{name: 'drawable-mdpi/icon.png', size: 48},
		{name: 'drawable-xhdpi/icon.png', size: 96},
		{name: 'drawable-xxhdpi/icon.png', size: 144},
		{name: 'drawable-xxxhdpi/icon.png', size: 192},
		{name: 'mipmap-hdpi/icon.png', size: 72},
		{name: 'mipmap-ldpi/icon.png', size: 36},
		{name: 'mipmap-mdpi/icon.png', size: 48},
		{name: 'mipmap-xhdpi/icon.png', size: 96},
		{name: 'mipmap-xxhdpi/icon.png', size: 144},
		{name: 'mipmap-xxxhdpi/icon.png', size: 192}
	],
	OSX: [
		{name: 'icon-16x16.png', size: 16},
		{name: 'icon-32x32.png', size: 32},
		{name: 'icon-64x64.png', size: 64},
		{name: 'icon-128x128.png', size: 128},
		{name: 'icon-256x256.png', size: 256},
		{name: 'icon-512x512.png', size: 512}
	],
	WINDOWS: [
		{name: 'StoreLogo.scale-100.png', size: 50},
		{name: 'StoreLogo.scale-125.png', size: 63},
		{name: 'StoreLogo.scale-140.png', size: 70},
		{name: 'StoreLogo.scale-150.png', size: 75},
		{name: 'StoreLogo.scale-180.png', size: 90},
		{name: 'StoreLogo.scale-200.png', size: 100},
		{name: 'StoreLogo.scale-240.png', size: 120},
		{name: 'StoreLogo.scale-400.png', size: 200},

		{name: 'Square44x44Logo.scale-100.png', size: 44},
		{name: 'Square44x44Logo.scale-125.png', size: 55},
		{name: 'Square44x44Logo.scale-140.png', size: 62},
		{name: 'Square44x44Logo.scale-150.png', size: 66},
		{name: 'Square44x44Logo.scale-200.png', size: 88},
		{name: 'Square44x44Logo.scale-240.png', size: 106},
		{name: 'Square44x44Logo.scale-400.png', size: 176},

		{name: 'Square71x71Logo.scale-100.png', size: 71},
		{name: 'Square71x71Logo.scale-125.png', size: 89},
		{name: 'Square71x71Logo.scale-140.png', size: 99},
		{name: 'Square71x71Logo.scale-150.png', size: 107},
		{name: 'Square71x71Logo.scale-200.png', size: 142},
		{name: 'Square71x71Logo.scale-240.png', size: 170},
		{name: 'Square71x71Logo.scale-400.png', size: 284},

		{name: 'Square150x150Logo.scale-100.png', size: 150},
		{name: 'Square150x150Logo.scale-125.png', size: 188},
		{name: 'Square150x150Logo.scale-140.png', size: 210},
		{name: 'Square150x150Logo.scale-150.png', size: 225},
		{name: 'Square150x150Logo.scale-200.png', size: 300},
		{name: 'Square150x150Logo.scale-240.png', size: 360},
		{name: 'Square150x150Logo.scale-400.png', size: 600},

		{name: 'Square310x310Logo.scale-100.png', size: 310},
		{name: 'Square310x310Logo.scale-125.png', size: 388},
		{name: 'Square310x310Logo.scale-140.png', size: 434},
		{name: 'Square310x310Logo.scale-150.png', size: 465},
		{name: 'Square310x310Logo.scale-180.png', size: 558},
		{name: 'Square310x310Logo.scale-200.png', size: 620},
		{name: 'Square310x310Logo.scale-400.png', size: 1240},

		{name: 'Wide310x150Logo.scale-80.png', size: 248, height: 120},
		{name: 'Wide310x150Logo.scale-100.png', size: 310, height: 150},
		{name: 'Wide310x150Logo.scale-125.png', size: 388, height: 188},
		{name: 'Wide310x150Logo.scale-140.png', size: 434, height: 210},
		{name: 'Wide310x150Logo.scale-150.png', size: 465, height: 225},
		{name: 'Wide310x150Logo.scale-180.png', size: 558, height: 270},
		{name: 'Wide310x150Logo.scale-200.png', size: 620, height: 300},
		{name: 'Wide310x150Logo.scale-240.png', size: 744, height: 360},
		{name: 'Wide310x150Logo.scale-400.png', size: 1240, height: 600}
	]
};

const display = {
	success: (str) => {
		console.log(`  ✓  ${str}`.green);
	},
	error: (str) => {
		console.error(`  ✗  ${str}`.red);
	},
	header: (str) => {
		console.log(`\n ${str.cyan.underline}\n`);
	}
};

const getConfiguredPlatforms = (projectName) => {
	const xcodeFolder = SETTINGS.OLD_XCODE_PATH ? FOLDERS.IOS_OLD_XCODE : FOLDERS.IOS_XCODE;
	return [
		{
			name: 'ios',
			isAdded: fs.existsSync('platforms/ios'),
			iconsPath: `platforms/ios/${projectName}${xcodeFolder}`,
			icons: ICONS.IOS
		},
		{
			name: 'android',
			isAdded: fs.existsSync('platforms/android'),
			iconsPath: FOLDERS.ANDROID,
			icons: ICONS.ANDROID
		},
		{
			name: 'osx',
			isAdded: fs.existsSync('platforms/osx'),
			iconsPath: `platforms/osx/${projectName}${xcodeFolder}`,
			icons: ICONS.OSX
		},
		{name: 'windows', isAdded: fs.existsSync('platforms/windows'), iconsPath: FOLDERS.WINDOWS, icons: ICONS.WINDOWS}
	];
};

const getProjectPlatforms = (projectName) => {
	return new Promise((resolve) => {
		resolve(getConfiguredPlatforms(projectName));
	});
};

const getProjectName = () => {
	return new Promise((resolve, reject) => {
		const parser = new xml2js.Parser();
		fs.readFile(SETTINGS.CONFIG_FILE, (err, data) => {
			if (err) {
				reject(err);
			} else {
				parser.parseString(data, (err, result) => {
					if (err) {
						reject(err);
					} else {
						resolve(result.widget.name[0]);
					}
				});
			}
		});
	});
};

const generateIcon = async (platform, icon) => {
	await new Promise((resolve, reject) => {
		let srcPath = SETTINGS.ICON_FILE;
		const platformPath = srcPath.replace(/\.png$/, `-${platform.name}.png`);
		if (fs.existsSync(platformPath)) {
			srcPath = platformPath;
		}
		const dstPath = path.join(platform.iconsPath, icon.name);
		const dstDir = path.dirname(dstPath);
		if (!fs.existsSync(dstDir)) {
			fs.mkdirsSync(dstDir);
		}
		let img = gm(srcPath).resizeExact(icon.size, icon.size).alpha('Off').quality(100);
		if (icon.height) {
			img = img.crop(icon.size, icon.height, Math.round(icon.width / 2), Math.round(icon.height));
		}
		img.write(dstPath, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve();
				display.success(`${icon.name} created`);
			}
		});
	});
};

const generateIconsForPlatform = async (platform) => {
	display.header(`Generating Icons for ${platform.name}`);
	const allIcons = platform.icons.map((icon) => generateIcon(platform, icon));
	if (platform.name === 'ios') {
		fs.copySync(`${__dirname}/Contents.json`, path.join(platform.iconsPath, 'Contents.json'));
	}
	await Promise.all(allIcons);
};

const generateIcons = async (platforms) => {
	for (const platform of platforms) {
		if (platform.isAdded) {
			await generateIconsForPlatform(platform);
		}
	}
	console.log('All icons generated successfully');
};

const atLeastOnePlatformFound = () => {
	return getProjectPlatforms().then((platforms) => {
		display.header('Checking Project & Icon');
		const activePlatforms = platforms.filter((p) => p.isAdded);
		if (activePlatforms.length > 0) {
			display.success(`Platforms found: ${activePlatforms.map((p) => p.name).join(', ')}`);
			return Promise.resolve(platforms);
		} else {
			display.error('No cordova platforms found. Make sure you are in the root folder of your Cordova project and add platforms with \'cordova platform add\'');
			return Promise.reject();
		}
	});
};

const validIconExists = () => {
	return new Promise((resolve, reject) => {
		fs.exists(SETTINGS.ICON_FILE, (exists) => {
			if (exists) {
				display.success(`${SETTINGS.ICON_FILE} exists`);
				resolve();
			} else {
				display.error(`${SETTINGS.ICON_FILE} does not exist`);
				reject();
			}
		});
	});
};

const configFileExists = () => {
	return new Promise((resolve, reject) => {
		fs.exists(SETTINGS.CONFIG_FILE, (exists) => {
			if (exists) {
				display.success(`${SETTINGS.CONFIG_FILE} exists`);
				resolve();
			} else {
				display.error(`cordova's ${SETTINGS.CONFIG_FILE} does not exist`);
				reject();
			}
		});
	});
};

atLeastOnePlatformFound()
	.then(validIconExists)
	.then(configFileExists)
	.then(getProjectName)
	.then(getProjectPlatforms)
	.then(generateIcons)
	.catch((err) => {
		display.error(`An error occurred: ${err.message}`);
	});