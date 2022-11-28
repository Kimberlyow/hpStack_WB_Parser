const fs = require('fs');
  
const data = fs.readFileSync('./example_config.txt', {encoding:'utf8', flag:'r'});

const hostname = data.match(/(?<=hostname\s").+(?=")/m)[0];

let hpTrunk = data.match(/(?<=trunk\s).+(?=\slacp)/gm);

let ports = [];

hpTrunk.forEach(trkLine => {
  let trunk = trkLine.match(/trk\d+/)[0];
  if (trkLine.includes("-")) {
    if (trkLine.includes("A"||"B") && !trkLine.includes("/")) {
      let port = {trunkID:trunk, portID:trkLine.match(/(?<=^|\-)[AB]\d/g)};
      ports = [...ports, port];
    } else if (!trkLine.includes("A"||"B") && !trkLine.includes("/")) {
      let firstInt = parseInt(trkLine.match(/\d+(?=\-)/)[0]);
      let lastInt = parseInt(trkLine.match(/(?<=-)\d+/)[0]);
      let sequence = [];
      for (let i = 0; i <= lastInt-firstInt; i++) {
        sequence = [...sequence, firstInt+i];
      }
      let port = {trunkID:trunk, portID:sequence}
      ports = [...ports, port];
    }
  }
})

console.log(hostname, ports)
return null;