const fs = require('fs');
  
const data = fs.readFileSync('./example_config.txt', {encoding:'utf8', flag:'r'});

const hostname = data.match(/(?<=hostname\s").+(?=")/m)[0];

const version = data.match(/(?<=release\s).+(?=$)/m)[0];

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
let query = [];

let splitExc = data.split("\nvlan");
splitExc.shift();
splitExc.forEach(interface => {
  //link ID with name
  let vlanID = parseInt(interface.match(/\d+/)[0]);
  let vlanName = interface.match(/(?<=name\s").+(?=")/)[0];
  vlans = [...vlans, {ID:vlanID, name:vlanName}];

  interface.split("\n").forEach(line => {
    if (line.includes("tagged"||"untagged") && !line.includes("no")) {

      let tagstate = !line.includes("untagged");
      
      let portRaw = line.match(/(?<=tagged |,)[^,||\n^\u000D]+/g)
                    /** sorting out hyphened and Trk elements */
                    .map(string=> string.includes("-") 
                    ? unhyphen(string) : string)
                    .map(string=> string.includes("Trk") 
                    ? trkInfo.find(trk=> trk.trunkID 
                    == string.toLowerCase().match(/trk\d+/)[0]).portID
                    /** Trk Elements get their ChannelGroup attached into the rawPort ID to work with later */
                    .map(trkElement=>`${string.toLowerCase().match(/(?<=trk)\d+/)[0]}T${trkElement}`) : string);
      
                    portRaw.flat().forEach(rawPort=> {

                      let cleanPort = rawPort.toString().includes("T") ? rawPort.match(/(?<=T).+/)[0] : rawPort;
                      let group = rawPort.toString().includes("T") ? rawPort.match(/.+(?=T)/)[0] : 0;

                      ports = [...ports, {portID:cleanPort,vlanID:vlanID,tagstate:tagstate,group:group}];
                      query = [...query, ``];

                    })
                    
      // console.log(`vlan: ${vlanID} \n tag: ${tagstate} \n ports: ${portRaw} \n ------`)
      // console.log(vlanID, tagstate, portRaw.flat())

    }
  })

});

console.log(hostname, version, trkInfo, vlans, `\n${'-'.repeat(50)}\n`, ports);
return null;