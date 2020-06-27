//this is the list of source media that this program will go screen grab
var media_list = {
  "cnn": "https://www.cnn.com",
  "foxnews": "https://www.foxnews.com/",
  //"msnbc": "https://www.msnbc.com",
  "bbc": "https://www.bbc.com/news",
  "aljazeera": "https://www.aljazeera.com/",
  "nytimes": "https://www.nytimes.com/",
  "washingtonpost": "https://www.washingtonpost.com/", //right now this doesnt work without stealth
}  

var SENTIMENT_OUTPUT = {};

//ocr API key
const OCR_API_KEY = process.env.ocr_api;

const ocrSpaceApi = require('ocr-space-api');
 
var OCR_OPTIONS =  { 
    apikey: OCR_API_KEY,
    language: 'eng', // Português
    imageFormat: 'image/png', // Image Type (Only png ou gif is acceptable at the moment i wrote this)
    isOverlayRequired: false
  };

//destination folder for all processed images and metadata
const OUTDIR = 'out';

const _ = require('lodash');
const colors = require('colors');
const fs = require("fs");
var natural = require('natural');
var Sentiment = require('sentiment');


//safety net       
process.on('uncaughtException', function(err) {
  console.log(err);
});    

// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra')
 
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

//timestamped for the dump of the files
const TIMESTAMP = Math.floor(new Date() / 1000);

//create a new directory for the timestamp
fs.mkdirSync(OUTDIR+"/"+TIMESTAMP);    

//for folder reading
const { readdirSync, statSync } = require('fs');
const { join } = require('path');

//definaes a simple function to read all of the directories 
const dirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory())

//gives us a list of directories to process
const dir_list = dirs(OUTDIR);

//used to output JSON to a file for later parsing.
async function output_string_to_file(path,string){
  var file_name = `${path}_ocr.json`;
  console.log("writing file: "+file_name);
  await fs.writeFile(file_name,string,function(e,r){
      if (e) console.log(e);
  });    
}    

//performs that actual capture of the screen
async function doScreenCapture(page, url, site_name) {
  
  console.log("fetching "+site_name);
 
  //sets viewport that allows to control the height and width of the image captures
  await page.setViewport({
    width: 1400,
    height: 2800,
  });

  //these awaits attempt to wait until the page is fully loaded
  //different options listed here:
  //https://stackoverflow.com/questions/52497252/puppeteer-wait-until-page-is-completely-loaded
  //all of these ensure all of the content is loaded onto the page
  await page.goto(url, { waitUntil: 'load', timeout: 0 });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 0 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });
  
  console.log("completed: "+site_name);

  //retrieves a screenshot of the page
  await page.screenshot({
    //fullPage: true,
    path:`${OUTDIR}/${TIMESTAMP}/${TIMESTAMP}_${site_name}.png`,
    
  });

}

//this function takes screenshots of all of the sites in the media list above
async function screenSources(media_list){
  const browser = await puppeteer.launch({
    args: [
      // Required for Docker version of Puppeteer
      '--no-sandbox',
      '--disable-gpu',
      '--disable-setuid-sandbox',
      // This will write shared memory files into /tmp instead of /dev/shm,
      // because Docker’s default for /dev/shm is 64MB
      '--disable-dev-shm-usage',
    ]
  });
  
  for (source in media_list){
    const page = await browser.newPage();
    
    //right now this is a hack to get wapo to render...they 
    //have some advanced bot detection that is messing with puppeteer
    if (source === "washingtonpost") {puppeteer.use(StealthPlugin())}
    
    await doScreenCapture(page,media_list[source],source);
    await page.close();
}
  await browser.close();
}


//this outputs the file in the format that we will provide by 
//consumers
async function tokenize_and_stem(source,ocr_result){
  const image_path = `${OUTDIR}/${TIMESTAMP}/${TIMESTAMP}_${source}.png`
  
  console.log("running tokenization and sentiment analysis: "+source);
  var parsed_result = {};

  parsed_result.ImagePath = image_path
  parsed_result.TimeStamp = TIMESTAMP;
  parsed_result.Source = source;
  parsed_result.original_result = ocr_result;
  
  //start to do some of the text preprocessing
  var tokenizer = new natural.WordTokenizer();
  var tokenized = tokenizer.tokenize(ocr_result);
  
  parsed_result.tokenized = tokenized;

  //runs the sentiment analysis
  var sentiment = new Sentiment();
  var sentiment_result = sentiment.analyze(tokenized.join(' '));
  
  SENTIMENT_OUTPUT[source] = sentiment_result["score"];
  parsed_result.sentiment = sentiment_result;

  console.log("sentiment score: "+ sentiment_result["score"]);
  
  
  //output it all to a string
  await output_string_to_file(image_path,JSON.stringify(parsed_result));
}


//this function uses local OCR to process each image and pull out a word list
// a/o Jun 2020 going out to a API in another function to get better fidelity 
// on the word list
async function ocrSource(media_list){
  const tesseract = require("node-tesseract-ocr")
  const config = {
    lang: "eng",
    oem: 1,
    psm: 3,
  }
 
  //based on results, these will not be used at this time
  for (source in media_list){

    const image_path = `${OUTDIR}/${TIMESTAMP}/${TIMESTAMP}_${source}.png`     
    
    console.log("OCR image: ",image_path);
 
    //run local OCR
    await tesseract.recognize(image_path, config)
    .then(text => {
      //console.log(media_list[source]," Result:", text)
      tokenize_and_stem(source,text);
      console.log("completed: ",source);
      console.log(SENTIMENT_OUTPUT);
    })
    .catch(error => {
      console.log(error.message)
    })
  }
    
}

//this function takes screenshots of all of the sites in the media list above
async function ocrAPI(media_list){
  for (source in media_list){
    const image_path = `${OUTDIR}/${TIMESTAMP}/${TIMESTAMP}_${source}.png`     
    
    console.log("OCR image: ",image_path);
 
    // Run and wait the result
    await ocrSpaceApi.parseFromLocalFile(image_path, OCR_OPTIONS)
    .then(function (parsedResult) {
      var parsedResult = JSON.parse(parsedResult);
      
      console.log('result: \n', parsedResult);
      
      tokenize_and_stem(source,parsedResult["ParsedResults"][0]["ParsedText"]);
      console.log("completed: ",source);
      
      console.log(SENTIMENT_OUTPUT);
    }).catch(function (err) {
      console.log('ERROR:', err);
    });
  }

}

//batch function to perform all of the operations
async function runScreenAndOCR(media_list){
  await screenSources(media_list);
  await ocrSource(media_list);
  //await ocrAPI(media_list);

}

runScreenAndOCR(media_list);
