var pem = require('pem');
var fs = require('fs');
const {
    createSign,
    createVerify,
    createPrivateKey,
    X509Certificate
  } = require('crypto');
const { Template } = require('@accordproject/cicero-core');

//this functions takes in the buffer of certificate.pfx which is a pkcs#12 keystore,
//it returns ssslcert object which has the x509 certificate, privateKey and CA certificate.
const importPKCS = async (pfx) => {
    return new Promise((resolve, reject) => {
        pem.readPkcs12(pfx, { p12Password: "123" }, function (err, sslcert){
            if(err){
                reject(err);
            }
            resolve(sslcert);
        });
    })
}

//takes in name of the party signing the template, password of the pkcs#12 keystore file, templateName
const sign = async (partyName, pkcsPassword, templateName) => {
    try {
        const timeStamp = Date.now();
        const template = await Template.fromDirectory(`./templates/${templateName}`);
        const templateHash = template.getHash();
        //pkcs#12 keystore file buffer
        const pfx = fs.readFileSync(`./parties/${partyName}/certificate.pfx`);
        const manifestString = fs.readFileSync(`./templates/${templateName}/manifest.json`);
        const manifest = JSON.parse(manifestString);
        const keys = await importPKCS(pfx, pkcsPassword);
        const privateKey = createPrivateKey(keys.key);
        const certificate = await new X509Certificate(keys.cert);

        const sign = createSign('SHA256');
        sign.write(templateHash+timeStamp);
        sign.end();
        const signature = sign.sign(privateKey, 'hex');
        //signatureDetails obeject will be stored in signatures array in manifest.json file in the 
        //template directory
        const signatureDetails = {
            partyName: partyName,
            signature: signature,
            timeStamp: timeStamp,
            certificateString: certificate
        };
        const updatedManifest = { signatures: [...manifest.signatures].concat(signatureDetails) };
        const data = JSON.stringify(updatedManifest);
        fs.writeFileSync(`./templates/${templateName}/manifest.json`, data);
        return signatureDetails;
    } catch (error) {
        console.log(error);
    }
}

const verify = async (templateName) => {
    try{
        const template = await Template.fromDirectory(`./templates/${templateName}`);
        const templateHash = template.getHash();
        const manifestString = fs.readFileSync(`./templates/${templateName}/manifest.json`);
        const manifest = JSON.parse(manifestString);
        const signaturesArray = manifest.signatures;
        //iterates over all signature objects from manifest.json to verify the signatures
        for(let i=0; i < signaturesArray.length; i++){
            const { partyName, signature, timeStamp, certificateString } = signaturesArray[i];
            const certificate = await new X509Certificate(certificateString);
            const publicKey = certificate.publicKey;
            const verify = createVerify('SHA256');
            verify.write(templateHash+timeStamp);
            verify.end();
            const result = verify.verify(publicKey, signature, 'hex');
            if(!result){
                console.log(`Invalid Signature of party: ${partyName}`);
                process.exit(1);
            }
            return result;
        }
    }catch(error){
        console.log(error);
    }
}

//function used to reset manifest.json file and remove older signatures.
const reset = async (templateName) => {
    const newManifest = { signatures: [] };
    const data = JSON.stringify(newManifest);
    fs.writeFileSync(`./templates/${templateName}/manifest.json`, data);
    return "Manifest reset successfull"
}

const main = async (args) => {
    if(args[0]==="sign"){
        const signature = await sign(args[1], args[2], args[3]);
        console.log(signature);
    }else if(args[0]==="verify"){
        const result = await verify(args[1]);
        console.log(result);
    }else if(args[0]==="reset"){
        const result = await reset(args[1]);
        console.log(result);
    }else{
        console.log("!Inavlid operation!");
    }
}

let args = process.argv.slice(2);
main(args);