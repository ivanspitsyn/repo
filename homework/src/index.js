const yargs = require('yargs');
const fs = require('fs');
const path = require('path');
const del = require('del');
const Observer = require('./observer');
const paths = {
  source: null,
  dist: null
};

let count = 0;

const argv = yargs
  .usage('Usage: node $0 [option]')
  .help('help')
  .alias('help', 'h')
  .version('0.0.1')
  .alias('version', 'v')
  .example('node $0 --entry [path]', 'Сортировка файлов')
  .option('entry', {
    alias: 'e',
    default: './files',
    describe: 'Путь к исходной папке',
    demandOption: true
  })
  .option('output', {
    alias: 'o',
    describe: 'Путь куда положить',
    default: '/output'
  })
  .option('delete', {
    alias: 'D',
    describe: 'Удалить исходную папку?',
    type: 'boolean',
    default: false
  })
  .epilog('Первая домашнее задание')
  .argv;
//
// -------------
//
paths.source = path.normalize(path.join(__dirname, argv.entry));
paths.dist = path.normalize(path.join(__dirname, argv.output));

const observer = new Observer(async () => {
  console.log(`*************** sorting complete (files: ${count})*************`);

  if (argv.delete) {
    console.log(paths.source);
    console.log(argv.entry);
    await del([paths.source]);
    console.log('delete folder!', paths.source);
  }
});

const createDir = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
};

const exist = (path, callb) => {
  if (fs.existsSync(path)) {
    callb(true);
  } else {
    callb(false);
  }
};

const sortfiles = (src) => {
  fs.readdir(src, (err, files) => {
    if (err) {
      throw err;
    }

    for (let index = 0; index < files.length; index++) {
      const currentUrl = path.join(src, files[index]);
      observer.addObserver(currentUrl);
      fs.stat(currentUrl, (err, state) => {
        if (err) {
          throw err;
        }

        if (state.isDirectory()) {
          sortfiles(currentUrl);
          observer.removeObserver(currentUrl);
        } else {
          const pathNewDir = path.join(paths.dist, files[index][0].toUpperCase());

          exist(pathNewDir, (status) => {
            if (status) {
              fs.copyFile(currentUrl, path.join(pathNewDir, files[index]), () => {
                count++;
                // console.log('copy file no create folder')
                observer.removeObserver(currentUrl);
              });
            } else {
              fs.mkdir(pathNewDir, () => {
                fs.copyFile(currentUrl, path.join(pathNewDir, files[index]), () => {
                  count++;
                  // console.log('copy file create folder',count)
                  observer.removeObserver(currentUrl);
                });
              });
            }
          });
        }
      });
    }
  });
};
observer.start('sorting...');
createDir(paths.dist);
sortfiles(paths.source);
// ---version
// ---help
// ---axample
// ---usage
// ---option entry
// ---option output
// ---option delete (boolean)
