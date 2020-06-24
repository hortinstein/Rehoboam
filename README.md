[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/hortinstein/rehoboam) 


# rehoboam

![alt text](https://github.com/hortinstein/rehoboam/blob/master/rehoboam_logo.jpg?raw=true)

A simple script that scrapes screenshots from popular news sites, runs them against OCR and runs a sentiment analysis engine against them

Examples of the screenshots and data returned can be found in the examples folder.

Right now it's a little tought to get running on a home machine, so use this gitpod link:
[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/hortinstein/rehoboam) 

After the environment is built, you will need an api key for the OCR service from here: 

http://ocr.space/OCRAPI

then you can run it with the following command
```sh
#creates the output folder
$ ocr_api={MY_OCR_API} node index.js 
```

# CAVEATS:
- Right now images are too small to get a good sample size, this is due to the OCR API limitations on 1 MB.
- Sentiment will change on one run to another immediately after, this was initially puzzling until I realized it was likely ads
- OCR is not great, missing a lot of words, but all metadata is captured for later analysis if  you have other ideas

# TODO:
- REFACTOR...got really lazy toward the end
- Error handling
- Paralelize retrieval of each site
- See if I can get valid OCR working locally with same quality

