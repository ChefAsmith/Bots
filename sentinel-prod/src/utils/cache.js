const fs = require('fs');
const path = require('path');

let ocdImagesPaths = [];

const loadOcdImages = () => {
  ocdImagesPaths = fs.readdirSync('./assets/ocd').map(file => path.join('./assets/ocd', file));
};

const getRandomOcdImagePath = () => {
  if (ocdImagesPaths.length === 0) {
    loadOcdImages();
  }
  return ocdImagesPaths[Math.floor(Math.random() * ocdImagesPaths.length)];
};

module.exports = {
  loadOcdImages,
  getRandomOcdImagePath
};
