"use strict";

const globalConfig = require("jspm/lib/global-config");

const JSPM_GITHUB_AUTH_TOKEN = process.env.JSPM_GITHUB_AUTH_TOKEN;

if (JSPM_GITHUB_AUTH_TOKEN) {
	console.log("Setting JSPM GitHub auth token");
	globalConfig.set("registries.github.auth ", JSPM_GITHUB_AUTH_TOKEN);
}
