const fs = require('fs');
  
const data = fs.readFileSync('./example_config.txt', {encoding:'utf8', flag:'r'});

const hostname = data.match(/(?<=hostname\s").+(?=")/m)[0];

console.log(hostname)
return null;