const { exec } = require('child_process');
//let state='find . -type f | wc -l';
let state='npm run casper 22220000 3';
let p_list=new Array();


let nCurrent=20000000;
console.log(nCurrent);
let nStep=10;
let rndBase = 0;
let rndTop = 0;

let procMax=60;
let procNow=0;
let isSubSeq=0;

for (let i = 0; i < 20; i++) {
    (function(i){
        let req=`npm run casper ${nCurrent} ${nStep} ${rndBase} ${rndTop} ${isSubSeq}`;
        console.log(req);
        //let child = exec(state);
        let child = exec(req);
        nCurrent+=nStep;
        // Add the child process to the list for tracking
        p_list.push({process:child, content:""});
        procNow++;
        // Listen for any response:
        child.stdout.on('data', function (data) {

            console.log(child.pid, data);
            p_list[i].content += data;
        });

        // Listen for any errors:
        child.stderr.on('data', function (data) {
            console.error(child.pid,"src", data);
            p_list[i].content += data;
        }); 

        // Listen if the process closed
        child.on('close', function(exit_code) {
            console.log('Closed before stop: Closing code: ', exit_code);
        });
    })(i)
}
