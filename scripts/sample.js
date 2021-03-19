/**
 * @license Copyright 2019 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

/**
 * @fileoverview Example script for running Lighthouse on an authenticated page.
 * See docs/recipes/auth/README.md for more.
 */

require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');
const lighthouse = require('lighthouse');
const moment = require('moment');

const ORIGIN = process.env.ORIGIN;
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

// This port will be used by Lighthouse later. The specific port is arbitrary.
const PORT = 8041;

/**
 * @param {import('puppeteer').Browser} browser
 * @param {string} ORIGIN
 */
async function login(browser) {
  const page = await browser.newPage();
  const url = `${ORIGIN}/user/login/`;

  await page.goto(url);
  await page.waitForSelector('#id_login', {visible: true});

  // Fill in and submit login form.
  const emailInput = await page.$('#id_login');
  await emailInput.type(USERNAME);
  const passwordInput = await page.$('#id_password');
  await passwordInput.type(PASSWORD);
  await Promise.all([
    page.$eval('.login', form => form.submit()),
    page.waitForNavigation(),
  ]);

  await page.close();
}

/**
 * @param {puppeteer.Browser} browser
 */
async function logout(browser) {
  const page = await browser.newPage();
  await page.goto(`${ORIGIN}/user/logout/`);
  await page.close();
}

async function main() {
  // Direct Puppeteer to open Chrome with a specific debugging port.
  const browser = await puppeteer.launch({
    args: [`--remote-debugging-port=${PORT}`],
    headless: true,
  });

  // Setup the browser session to be logged into our site.
  await login(browser);

  const url = `${ORIGIN}/page/`;
  // console.log(url);

  const resultOpts = {
    port: PORT,
    disableStorageReset: true,
    output: 'html',
  };
  const result = await lighthouse(url, resultOpts);
  const reportHtml = result.report;

  const today = moment().format('YYYY-MM-DD').toString();
  fs.writeFileSync(`./results/${today}-sample.html`, reportHtml);

  // Direct Puppeteer to close the browser as we're done with it.
  await browser.close();
}

if (require.main === module) {
  main();
} else {
  module.exports = {
    login,
    logout,
  };
}

