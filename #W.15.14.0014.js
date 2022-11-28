const fs = require('fs');
  
const data = fs.readFileSync('./example_config.txt', {encoding:'utf8', flag:'r'});

console.log(data)
return null;