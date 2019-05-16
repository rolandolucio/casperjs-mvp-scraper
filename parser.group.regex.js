/**
 * Group files that match regular expression
 * 
 * Loop through all the files in the origin directory
 * Then open files and if it content match a regex
 * move it to a destination folder
 */
const fs = require('fs');
const path = require('path');
const process = require("process");

let basePath="/mnt/nvm";
let moveFrom = basePath+"/origin";
let moveTo = basePath+"/destination"

fs.readdir(moveFrom, (err, files) => {
  if (err) {
    console.error("Could not list the directory.", err);
    process.exit(1);
  }
  files.forEach((file, index) => {
    let fromPath = path.join(moveFrom, file);
    let toPath = path.join(moveTo, file);
    fs.stat(fromPath,(error, stat) => {
      if (error) {
        console.error("Error stating file.", error);
        return;
      }
      if (stat.isFile()){
        let fileContent = fs.readFileSync(fromPath, 'utf8');
        const regex = /Disculpe, No se han encontrado/;
        let strData = fileContent.toString();
        let fileInfo = strData.match(regex);
        if( fileInfo!=null){
          fs.rename(fromPath, toPath, (error)=> {
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