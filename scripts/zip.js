const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

const zip = new require('node-zip')();
const unzip = require('unzip');
const colors = require('colors');
const cheerio = require('cheerio');

const DEST_FOLDER = 'build';
const MAX_SIZE = 1024 * 13;
const DIR = `${__dirname}/../${DEST_FOLDER}`;

const src = {
  html: fs.readFileSync('dist/index.html', 'UTF8'),
  js: fs.readFileSync('dist/bundle.min.js', 'UTF8')
};

const init = (src) => {
  const $ = cheerio.load(src.html);
  $('script').remove();
  let html = $.html();

  if (!fs.existsSync(DIR)){
      fs.mkdirSync(DIR);
  }

  html = html.replace('<script src="bundle.js"></script>', '');
  html = html.replace('</body>', `<script>${src.js}</script></body`);
  
  let result = fs.writeFileSync(`${DIR}/index.html`, html, 'utf8');

  zip.file('index.html', fs.readFileSync('build/index.html'));
  const data = zip.generate({base64:false,compression:'DEFLATE'});
  fs.writeFileSync('game.zip', data, 'binary');

  // run adv.
  exec('sh advzip.sh', (error, stdout, stderr) => {
    report();
    if (error !== null) {
      console.log(`exec error: ${error}`);
    }
  });


};

const report = () => {
  fs.createReadStream('game.zip')
    .pipe(unzip.Extract({ path: './' }));

  fs.createReadStream(`${DIR}/index.html`)
    .pipe(fs.createWriteStream(`${__dirname}/../dist/final.html`));  

  const stats = fs.statSync(`${__dirname}/../game.zip`);
  const remaining = MAX_SIZE - stats.size;
  let percent = Math.floor(((MAX_SIZE - remaining)  / MAX_SIZE) * 100);
  console.log();
  console.log();
  if (stats.size < MAX_SIZE) {
    console.log(' S U C C E S S ! ! '.rainbow);
    console.log('-------------------'.rainbow);
    console.log();
    console.log('Total bytes: .............. ' + stats.size);
    console.log('Remaining bytes: .......... ' + remaining);
    console.log('Percentage used:  ......... ' + percent + '%');
  } else {
    console.log('TOO BIG! :(');
    console.log('Total bytes:' + stats.size);
    console.log('Remaining bytes: ' + remaining);
  }
  console.log();
}

init(src);
