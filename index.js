const _ = require('lodash');
const colors = require('colors');
const fs = require('fs');

//for folder reading
const { readdirSync, statSync } = require('fs');
const { join } = require('path');

const testFolder = 'tmp/';

const dirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory())

//console.log(dist)       
process.on('uncaughtException', function(err) {
    console.log(err);
});    

var media_list = {
    "cnn": "https://www.cnn.com",
    "foxnews": "https://www.foxnews.com/",
    "msnbc": "https://www.msnbc.com"
}  

const puppeteer = require('puppeteer');
async function doScreenCapture(url, site_name) {
  const browser = await puppeteer.launch({
    args: [
      // Required for Docker version of Puppeteer
      '--no-sandbox',
      '--disable-setuid-sandbox',
      // This will write shared memory files into /tmp instead of /dev/shm,
      // because Docker’s default for /dev/shm is 64MB
      '--disable-dev-shm-usage'
    ]
  });
  const page = await browser.newPage();
  await page.goto(url, {waitUntil: 'domcontentloaded'});  
  await page.waitFor(10000);
  await page.screenshot({
    fullPage: true,
    path:`${site_name}.png`
  });
  await browser.close();
}
doScreenCapture("https://www.cnn.com","cnn");
doScreenCapture("https://www.foxnews.com","fox");
doScreenCapture("https://www.msnbc.com","msnbc");