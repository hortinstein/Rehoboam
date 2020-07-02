const fs = require("fs");
const _ = require('lodash');
const colors = require('colors');


//destination folder for all processed images and metadata
const OUTDIR = 'out';

//for folder reading
const { readdirSync, statSync } = require('fs');
const { join } = require('path');

//definaes a simple function to read all of the directories 
const dirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory())

//gives us a list of directories to process
const dir_list = dirs(OUTDIR);

var DATABASE = {}

async function parse_file(fullpath){
    var obj = JSON.parse(fs.readFileSync(fullpath, 'utf8'));
    DATABASE[obj.TimeStamp][obj.Source] = obj.sentiment.score;
}

async function read_each_directory(dir){
    fs.readdir(OUTDIR+'/'+dir, (err, files) => {
        DATABASE[dir] = {}; 
        files.forEach(file => {
            if (file.includes( 'json')){
                console.log(file);
                parse_file(`${OUTDIR}/${dir}/${file}`);    
                console.log(DATABASE);
            }
        });
        
    });
}

//read all the folders in the 
async function parse_all_folders(){
    dir_list.forEach(dir => {
        console.log(dir);
        read_each_directory(dir); 
    });
    console.log(DATABASE);
}

parse_all_folders();