const casper = require('casper').create({
  pageSettings: {
    loadImages:  false,        // do not load images
    allowMedia: false         // do not load NPAPI plugins (Flash, Silverlight, ...)
  }
});
const fs = require('fs');
const utils = require('utils');
const http = require('http');

const nFrom = casper.cli.get(0) != undefined?casper.cli.get(0):20000000;
let nCount = casper.cli.get(1) != undefined?casper.cli.get(1):0;
const nRandomF = casper.cli.get(2) != undefined?casper.cli.get(2):0;
const nRandomT = casper.cli.get(3) != undefined?casper.cli.get(3):0;
let isSubSeq = casper.cli.get(4) != undefined?casper.cli.get(4):0;
const nTo= nFrom + nCount;
let nCurrent=nFrom;
let nTry=nFrom;
let isRandom = false;

let targetUri= 'http://site.com/path/';

if( nRandomF >0 && nRandomT >0 && nRandomF < nRandomT){
  isRandom=true;
}

let basePath="/mnt/nvm";
let destFile= basePath+"/results/seq."+ nFrom.toString() +".csv";

if(isRandom){
  destFile= basePath+"/random.csv"
}

const cmd=`npm run casper ${nCurrent} ${nCount} ${nRandomF} ${nRandomT} ${isSubSeq}`;
console.log (`{"code":0,"cmd":"${cmd}","init":${nFrom}}`);

let start = new Date();
let nPeticiones=1;
let nErrors=0;
let nOk=0;
let nUk=0;
let code=0;
let siteFail=0;


casper.start().repeat(nCount, function() {
  
  if(code==999){
    casper.exit();
  }
  if(code>=400){
    let haltFor= Math.floor(Math.random() * (300000 - 1000) + 1000);
    let output={
      code,
      siteFail,
      msg:"resume after "+ haltFor/1000 + " seconds",      
    };
    console.log(JSON.stringify(output));
    casper.wait(haltFor, function(){ });
  } 
  code=0;
  casper.thenOpen(targetUri, function(response) {

    if (response == undefined || response.status >= 400){
      code=response.status;
      siteFail++;      
    }else{
      this.click('#n_CI');
      casper.waitForSelector("form input[name='telefono']", function() {
        if(isRandom){
          let rndN=Math.floor(Math.random() * (nRandomT - nRandomF) + nRandomF);
          nTry=nFrom+rndN;
        }else{
          isSubSeq=1;
          nTry=nCurrent;
        }
        casper.sendKeys('input[name = telefono ]', nTry.toString());
        //casper.capture('captures/'+nCurrent+'.png');
        this.click('input[type="button"][name="s_button"]');
        this.wait(1, function() {
            let html=this.page.content;
            const regex = /<b><u>(.*?)<\/u><\/b>/g;
            // Transform data Buffer to string.
            let strData = html.toString();
            let fileInfo = strData.match(regex);
            if( fileInfo!=null){ 
              nOk++;
              let formatOut=`${fileInfo[0]},${fileInfo[1]},${nTry}\n`;
              formatOut=formatOut.replace(/<b><u>/g,'').replace(/<\/u><\/b>/g,'');
              fs.write(destFile,formatOut, 'a');
              code=1
            }else{
              let itsErr= strData.match(/Disculpe, No se han encontrado/);
              if( itsErr!=null){
                //not found - err page
                nErrors++;
              }else if ( strData.match(/<h1>Server Error<\/h1>/) != null ||
                strData.match(/Error<\/span>/) != null  ){
                //<span class="cf-error-type"> //cloud flare
                //<h1>Server Error</h1> //asp error
                code=500;
                siteFail++; 
              }else{
                // Unknown (uk) formats
                nUk++;
                code=2;
                let ukfile=basePath+'/uk/'+nTry+'.html'
                fs.write(ukfile, html, 'w');
              }
            }            
            let output={
              code,
              req:nPeticiones,
              ok:nOk,
              err:nErrors,
              uk:nUk,
              phone: nTry,
              isRandom,
              isSubSeq
            };
            console.log(JSON.stringify(output));
            nCurrent++;
            nPeticiones++;
        });
      });
    } 
  });
});
casper.then(function (){
  let end = new Date() - start;
  console.log(JSON.stringify({
    code:100,
    time:end/1000,
    req:nPeticiones,
    ok:nOk,
    err:nErrors,
    uk:nUk,
  }));
});
casper.run(function(){
  this.echo('Done.').exit();
});