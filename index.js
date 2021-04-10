const fs = require('fs');
const forge = require('node-forge');
const {
    createSign,
    createVerify,
    createPrivateKey,
    createPublicKey
  } = require('crypto');
const { Template } = require('@accordproject/cicero-core');

//takes in name of the party signing the template, password of the pkcs#12 keystore file, templateName
const sign = async (partyName, pkcsPassword, templateName, signatureType) => {
    try {
        const timeStamp = Date.now();
        const template = await Template.fromDirectory(`./templates/${templateName}`);
        const templateHash = template.getHash();
        //pkcs#12 keystore file buffer
        const pfx = signatureType === "party" ? fs.readFileSync(`./parties/${partyName}/keystore.p12`, {encoding: 'base64'}) 
        : fs.readFileSync(`./developers/${partyName}/keystore.p12`, {encoding: 'base64'});
        // decode p12 from base64
        const p12Der = forge.util.decode64(pfx);
        // get p12 as ASN.1 object
        const p12Asn1 = forge.asn1.fromDer(p12Der);
        // decrypt p12 using the password 'password'
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, pkcsPassword);
        //X509 cert forge type
        const certificateForge = p12.safeContents[0].safeBags[0].cert;
        //Private Key forge type
        const privateKeyForge = p12.safeContents[1].safeBags[0].key;
        //convert cert and private key from forge to PEM
        const certificatePem = forge.pki.certificateToPem(certificateForge);
        const privateKeyPem = forge.pki.privateKeyToPem(privateKeyForge);
        //convert private key in pem to private key type in node
        const privateKey = createPrivateKey(privateKeyPem);

        const sign = createSign('SHA256');
        sign.write(templateHash+timeStamp);
        sign.end();
        const signature = sign.sign(privateKey, 'hex');
        /*
         * signatureDetails obeject will be stored in signatures array 
         * in manifest.json file in the template directory
         */
        const manifestString = fs.readFileSync(`./templates/${templateName}/manifest.json`);
        const manifest = JSON.parse(manifestString);
        const signatureDetails = signatureType === "party" ? {
            partyName: partyName,
            signature: signature,
            timeStamp: timeStamp,
            certificatePem: certificatePem
        } : {
            templateAuthor: partyName,
            signature: signature,
            templateHash: templateHash,
            timeStamp: timeStamp,
            certificatePem: certificatePem
        };
        const updatedManifest = signatureType === "party" ? { signatures: { parties:[...manifest.signatures.parties].concat(signatureDetails), templateAuthors: [...manifest.signatures.templateAuthors] } } 
        : { signatures: { parties: [...manifest.signatures.parties], templateAuthors:[...manifest.signatures.templateAuthors].concat(signatureDetails) } };
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
        const manifestString = fs.readFileSync(`./templates/${templateName}/manifest.json`);
        const manifest = JSON.parse(manifestString);
        const partySignatures = manifest.signatures.parties;
        const developerSignatures = manifest.signatures.templateAuthors;
        //iterates over all signature objects from manifest.json to verify the signatures
        for(let i=0; i < developerSignatures.length; i++){
            const { templateAuthor, signature, templateHash, timeStamp, certificatePem } = developerSignatures[i];
            //X509 cert converted from PEM to forge type
            const certificateForge = forge.pki.certificateFromPem(certificatePem);
            //public key in forge typenode index.js sign acme 123 helloworldstate
            const publicKeyForge = certificateForge.publicKey;
            //convert public key from forge to pem
            const publicKeyPem = forge.pki.publicKeyToPem(publicKeyForge);
            //convert public key in pem to public key type in node.
            const publicKey = createPublicKey(publicKeyPem);
            //signature verification process
            const verify = createVerify('SHA256');
            verify.write(templateHash+timeStamp);
            verify.end();
            const result = verify.verify(publicKey, signature, 'hex');
            if(!result){
                console.log(`Invalid Signature of templateAuthor: ${templateAuthor}`);
                process.exit(1);
            }
            console.log(`Signature verified for template author ${templateAuthor}`)
        }

        for(let i=0; i < partySignatures.length; i++){
            const { partyName, signature, timeStamp, certificatePem } = partySignatures[i];
            //X509 cert converted from PEM to forge type
            const certificateForge = forge.pki.certificateFromPem(certificatePem);
            //public key in forge type
            const publicKeyForge = certificateForge.publicKey;
            //convert public key from forge to pem
            const publicKeyPem = forge.pki.publicKeyToPem(publicKeyForge);
            //convert public key in pem to public key type in node.
            const publicKey = createPublicKey(publicKeyPem);
            const templateHash = template.getHash();
            //signature verification process
            const verify = createVerify('SHA256');
            verify.write(templateHash+timeStamp);
            verify.end();
            const result = verify.verify(publicKey, signature, 'hex');
            if(!result){
                console.log(`Invalid Signature of party: ${partyName}`);
                process.exit(1);
            }
            console.log(`Signature verified for party ${partyName}`)
        }
        return "All template author and party signatures verified";
    }catch(error){
        console.log(error);
    }
}

//function used to reset manifest.json file and remove older signatures.
const reset = async (templateName) => {
    const newManifest = {
        signatures:{
            templateAuthors: [],
            parties: []
        }
    };
    const data = JSON.stringify(newManifest);
    fs.writeFileSync(`./templates/${templateName}/manifest.json`, data);
    return "Manifest reset successfull"
}

const main = async (args) => {
    if(args[0]==="sign"){
        const signature = await sign(args[1], args[2], args[3], args[4]);
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