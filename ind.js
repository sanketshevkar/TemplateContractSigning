const { Template, Contract } = require('cicero/packages/cicero-core');
const path = require('path');
const fs = require('fs');
const unzip = require('unzipper')

const signContractAcme = async() =>{
    const templateBuffer = fs.readFileSync( './archive.cta' )
    const template = await Template.fromArchive(templateBuffer);
    const keyStorePath = path.join(__dirname, 'parties', 'acme', 'keystore.p12');
    const contractPath = path.join(__dirname, 'sample.md');
    const contractText = fs.readFileSync(contractPath, 'utf8');
    const contract = new Contract(template);
    const signature = contract.signInstance(contractText, null, keyStorePath, "123");
    const data = JSON.stringify(signature);
    const signaturePath = path.join(__dirname, 'contractSignatures.json');
    fs.writeFileSync(signaturePath, data);
    return signature;
}

const signContractMagnetoCorp = async() =>{
    const templateBuffer = fs.readFileSync( './archive.cta' )
    const template = await Template.fromArchive(templateBuffer);
    const keyStorePath = path.join(__dirname, 'parties', 'magnetocorp', 'keystore.p12');
    const contractPath = path.join(__dirname, 'sample.md');
    const signaturePath = path.join(__dirname, 'contractSignatures.json');
    const signatureString = fs.readFileSync(signaturePath, {encoding: 'utf-8'});
    const signatureObject = JSON.parse(signatureString);
    const contractText = fs.readFileSync(contractPath, 'utf8');
    const contract = new Contract(template);
    const signature = contract.signInstance(contractText, signatureObject, keyStorePath, "123");
    const newSignatureObject = {
        contractSignatures: signature
    };
    if(typeof(signature) === Object){
        const data = JSON.stringify(newSignatureObject);
        fs.writeFileSync(signaturePath, data);
        return signature;
    }else{
        return signature;
    }
    
}

const unZipTemplate = async() =>{
    const dirPath = path.join(__dirname, 'archive.cta');
    const destPath = path.join(__dirname, 'helloworldstateTemplate');
    fs.createReadStream(dirPath).pipe(unzip.Extract({ path: destPath }));
    return 'file unzipped in ./helloworldstateTemplate'
}

const reset = () =>{
    const archivePath = path.join(__dirname, 'archive.cta');
    const contractPath = path.join(__dirname, 'helloworldstateTemplate');
    const signaturePath = path.join(__dirname, 'contractSignatures.json');
    try {
        fs.unlinkSync(archivePath);
        fs.unlinkSync(signaturePath);
        removeDir(contractPath)
        return 'reset Successfull'
      } catch(err) {
        return "Already Reset"
      }
}

const removeDir = (path) =>{
    if (fs.existsSync(path)) {
      const files = fs.readdirSync(path)
  
      if (files.length > 0) {
        files.forEach(function(filename) {
          if (fs.statSync(path + "/" + filename).isDirectory()) {
            removeDir(path + "/" + filename)
          } else {
            fs.unlinkSync(path + "/" + filename)
          }
        })
        fs.rmdirSync(path)
      } else {
        fs.rmdirSync(path)
      }
    } else {
      console.log("Directory path not found.")
    }
  }

const signTemplate = async() =>{
    const keyStorePath = path.join(__dirname, 'developers', 'sanket', 'keystore.p12');
    const templatePath = path.join(__dirname, 'templates', 'helloworldstateTemplate');
    const template = await Template.fromDirectory(templatePath);
    const archiveBuffer = await template.toArchive('ergo', {}, keyStorePath, "123");
    fs.writeFile('./archive.cta', archiveBuffer, function(err) {
        if (err) throw 'error writing file: ' + err;
        });
    return "Template signed successfully";
}

const verifyTemplateSignatures = async() =>{
    const signaturePath = path.join(__dirname, 'helloworldstateTemplate','signatures.json');
    const signatureString = fs.readFileSync(signaturePath, {encoding: 'utf-8'});
    const signatureObject = JSON.parse(signatureString);
    const contractPath = path.join(__dirname, 'helloworldstateTemplate');
    const template = await Template.fromDirectory(contractPath);
    const response = template.verifySignatures(signatureObject);
    return response
}

const verifyContractSignatures = async() =>{
    const templateBuffer = fs.readFileSync( './archive.cta' )
    const template = await Template.fromArchive(templateBuffer);
    const signaturePath = path.join(__dirname, 'contractSignatures.json');
    const signatureString = fs.readFileSync(signaturePath, {encoding: 'utf-8'});
    const signatureObject = JSON.parse(signatureString);
    const contractPath = path.join(__dirname, 'sample.md');
    const contractText = fs.readFileSync(contractPath, 'utf8');
    const contract = new Contract(template);
    const response = contract.verifySignatures(contractText, signatureObject);
    console.log(response)
}

const main = async (args) => {
    if(args[0]==="signTemplate"){
        const signature = await signTemplate();
        console.log(signature);
    }else if(args[0]==="signContractAcme"){
        const result = await signContractAcme();
        console.log(result);
    }
    else if(args[0]==="signContractMagnetoCorp"){
        const result = await signContractMagnetoCorp();
        console.log(result);
    }else if(args[0]==="unZipTemplate"){
        const result = await unZipTemplate();
        console.log(result);
    }else if(args[0]==="reset"){
        const result = await reset();
        console.log(result);
    }else if(args[0]==="verifyTemplateSignatures"){
        const result = await verifyTemplateSignatures();
        console.log(result);
    }else if(args[0]==="verifyContractSignatures"){
        const result = await verifyContractSignatures();
        console.log(result);
    }else{
        console.log("!Inavlid operation!");
    }
}

let args = process.argv.slice(2)
main(args)
