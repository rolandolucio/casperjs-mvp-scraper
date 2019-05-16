/**
 * Fetch info from files that match regular expression and save to CSV
 * 
 * Loop through all the files in the origin directory
 * Then open files and if it content match a regex
 * save content into a csv file and then group them in a destination folder
 */
const fs = require('fs');
const path = require('path');
const process = require("process");

let basePath="/mnt/nvm";
let moveFrom = basePath+"/origin";
let moveTo = basePath+"/destination"
let destFile= basePath+"/results/"+Date.now()+".csv";


fs.readdir(moveFrom, (err, files) => {
  if (err) {
    console.error("Could not list the directory.", err);
    process.exit(1);
  }
  files.forEach((file, index) => {
    let fromPath = path.join(moveFrom, file);
    let toPath = path.join(moveTo, file);

    fs.stat(fromPath, (error, stat) => {
      if (error) {
        console.error("Error stating file.", error);
        return;
      }
      if (stat.isFile()){
        let fileContent = fs.readFileSync(fromPath, 'utf8');
        const regex = /<b><u>(.*?)<\/u><\/b>/g;
        let strData = fileContent.toString();
        let fileInfo = strData.match(regex);
        if( fileInfo!=null){
          let formatOut=`${fileInfo[0]},${fileInfo[1]},${file.replace('.html','')}\n`;
          formatOut=formatOut.replace(/<b><u>/g,'').replace(/<\/u><\/b>/g,'');
          fs.appendFileSync(destFile, formatOut);
          fs.rename(fromPath, toPath, function (error) {
            if (error) {
              console.error("File moving error.", error);
            } else {
              console.log("Moved file '%s' to '%s'.", fromPath, toPath);
            }
          });
        }
      }       
      else if (stat.isDirectory())
        console.log("'%s' is a directory.", fromPath);
    });
  });
});