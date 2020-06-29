[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/hortinstein/rehoboam) 


# rehoboam

![alt text](https://github.com/hortinstein/rehoboam/blob/master/rehoboam_logo.jpg?raw=true)

A simple script that scrapes screenshots from popular news sites, runs them against OCR and runs a sentiment analysis engine against them

Examples of the screenshots and data returned can be found in the examples folder.

Right now it's a little tought to get running on a home machine, so use this gitpod link:
[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/hortinstein/rehoboam) 

then you can run it with the following command
```sh
#creates the output folder
$ mkdir out 
$ npm start
```

# Output 

Defaults to the ```out``` directory, it will output all screens and JSON containing the OCR and sentiment metadata.  An example is in the ```Example_Data``` folder.  Below is an example of the final output of just the script showing combine sentiment.

Higher is more positive, lower is more negative.

```sh 
{ cnn: 18,
  foxnews: -17,
  bbc: -65,
  aljazeera: -34,
  nytimes: -18,
  washingtonpost: -7 }
gitpod /workspace/Rehoboam $ 
```

You can combine the images in any of the out folders:
```
montage *.png -tile 7x1 -geometry +0+0 out.png
```
and get a result like this

![alt text](https://github.com/hortinstein/rehoboam/blob/master/side_by_side.png?raw=true)

# Caveats:
- *SOLVED-ish* Right now images are too small to get a good sample size, this is due to the OCR API limitations on 1 MB.
- Sentiment will change on one run to another immediately after, this was initially puzzling until I realized it was likely ads
- OCR is not great, missing a lot of words, but all metadata is captured for later analysis if  you have other ideas

# TODO:
- REFACTOR...got really lazy toward the end
- Error handling
- Paralelize retrieval of each site
- *SOLVED* See if I can get valid OCR working locally with same quality
- Revamp UI to allow for re-processing of past images
- Add data about how many words captured versus in OCR how many used
- Get other ideas about interesting metadata to add to the JSON

# Cron Command:
-  ```docker run -v /root/rehoboam/:/home/rehoboam rehoboam:latest node /home/rehoboam/index.js```
