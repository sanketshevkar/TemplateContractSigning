const fs = require('fs');
const forge = require('node-forge');

const pfx = fs.readFileSync(`./parties/acme/keystore.p12`, {encoding: 'base64'});
const p12Der = forge.util.decode64(pfx);
// get p12 as ASN.1 object
const p12Asn1 = forge.asn1.fromDer(p12Der);
// decrypt p12 using the password 'password'
const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, "123");
//X509 cert forge type
const certificateForge = p12.safeContents[0].safeBags[0].cert;
console.log(certificateForge.subject.attributes);