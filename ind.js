const forge = require('node-forge');
var fs = require('fs');

const pfx = fs.readFileSync(`./parties/magnetocorp/certificate.p12`,{encoding: 'base64'});
// decode p12 from base64
var p12Der = forge.util.decode64(pfx);
// get p12 as ASN.1 object
var p12Asn1 = forge.asn1.fromDer(p12Der);
// decrypt p12 using the password 'password'
var p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, '123');
var certificate = forge.pki.certificateToPem(p12.safeContents[0].safeBags[0].cert);
var publicKey = forge.pki.publicKeyToPem(p12.safeContents[0].safeBags[0].cert.publicKey);
var privateKey = forge.pki.publicKeyToPem(p12.safeContents[1].safeBags[0].key);
console.log(certificate)
console.log(publicKey)
console.log(privateKey)