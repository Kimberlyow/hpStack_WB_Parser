const fs = require('fs');
  
const data = fs.readFileSync('./example_config.txt', {encoding:'utf8', flag:'r'});

const hostname = data.match(/(?<=hostname\s").+(?=")/m)[0];

let hpTrunk = data.match(/(?<=trunk\s).+(?=\slacp)/gm);

let trkInfo = [];

function unhyphen(line) {
  let firstInt = parseInt(line.match(/\d+(?=\-)/)[0]);
  let lastInt = parseInt(line.match(/(?<=-)\d+/)[0]);
  let sequence = [];
  for (let i = 0; i <= lastInt-firstInt; i++) {
    sequence = [...sequence, firstInt+i];
  }
  return sequence;
}

hpTrunk.forEach(trkLine => {
  let trunk = trkLine.match(/trk\d+/)[0];
  if (trkLine.includes("-")) {
    if (trkLine.includes("A"||"B") && !trkLine.includes("/")) {

      trkInfo = [...trkInfo, {trunkID:trunk, portID:trkLine.match(/(?<=^|\-)[AB]\d/g)}];

    } else if (!trkLine.includes("A"||"B"||"/")) {

      let sequence = unhyphen(trkLine);
      trkInfo = [...trkInfo, {trunkID:trunk, portID:sequence}];

    }
  }
})

let vlans = [];
let ports = [];

let splitExc = data.split("\nvlan");
splitExc.shift();
splitExc.forEach(interface => {
  //link ID with name
  let vlanID = parseInt(interface.match(/\d+/)[0]);
  let vlanName = interface.match(/(?<=name\s").+(?=")/)[0];
  vlans = [...vlans, {ID:vlanID, name:vlanName}];

  interface.split("\n").forEach(line => {
    if (line.includes("tagged"||"untagged")) {
      let tagstate = !line.includes("untagged");
      
      let portRaw = line.match(/(?<=tagged |,)[^,||\n]+/g)
                    .map(string=> string.includes("-") 
                    ? unhyphen(string) : string)
                    .map(string=> string.includes("Trk") 
                    ? trkInfo.find(trk=> trk.trunkID == string.toLowerCase().match(/trk\d+/)[0]).portID : string);
      
      console.log(`vlan: ${vlanID} \n tag: ${tagstate} \n ports: ${portRaw} \n ------`)

    }
  })

});

console.log(hostname, trkInfo, vlans)
return null;