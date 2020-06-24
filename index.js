const _ = require('lodash');
const colors = require('colors');
const fs = require('fs');

//for folder reading
const { readdirSync, statSync } = require('fs');
const { join } = require('path');

const testFolder = 'tmp/';

const dirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory())

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
  
  
  console.log("fetching "+site_name);
  //these awaits attempt to wait until the page is fully loaded
  //different options listed here:
  //https://stackoverflow.com/questions/52497252/puppeteer-wait-until-page-is-completely-loaded
 
  //sets viewport that allows to control the height and width of the image captures
  await page.setViewport({
    width: 1600,
    height: 3200,
  });
  
  await page.goto(url, { waitUntil: 'load', timeout: 0 });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 0 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });
  console.log("completed: "+site_name);
  //await page.waitFor(10000);  
  
  await page.setViewport({
    width: 1600,
    height: 3200,
  });
    
  await page.screenshot({
    //fullPage: true,
    path:`${site_name}.png`,
    //comment this section out to not clip the size of this page
  });
  await browser.close();
}

async function screenSources(media_list){
  for (source in media_list){
    await doScreenCapture(media_list[source],source);
  }

}

async function ocrSource(media_list){

  const tesseract = require("node-tesseract-ocr")
 
  const config = {
    lang: "eng",
    oem: 1,
    psm: 3,
  }
 
  for (source in media_list){
    console.log("OCR: ",media_list[source]);
    tesseract.recognize(`${source}.png`, config)
    .then(text => {
      console.log(media_list[source]," Result:", text)
    })
    .catch(error => {
      console.log(error.message)
    })
  }
    
}
  
async function runScreenAndOCR(media_list){
  await screenSources(media_list);
  await ocrSource(media_list);
}
runScreenAndOCR(media_list);