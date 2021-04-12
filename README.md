# Template Signing

## Project Structure

* cicero folder: contains the cicero package. This the local version of the my fork of cicero repo. I've made changes to cicero-core to make these features work.

* parties folder: contains subfolders with keystores of the parties which are going to sign the contract. Inside the individual party subfolders are the pkcs#12 keystore files, which have the x509 certificates,private-key of that party.

* developers folder: contains subfolders with keystores of the developers/template-authors who developed the template. Inside the individual party subfolders are the pkcs#12 keystore file, which have the x509 certificates,private-key of that party.

* templates folder: Contains the template that the developer/author has made and that is to be signed by the developer/author. 

* index.js file: this file has all the logic for signing and verifying the template and the contract.

* sample.md file: this file has the contract text that is going to get executed.

## Steps
 * For this repl keystores have already been generated using OpenSSL.     

* Reset the demo before starting with the signing procsess.

```
node index.js reset
```

### Signing and Verifying Template

* sign the template as a developer/template-author. This would create an archive file name `./archive.cta`. This archive file would include `signatures.json` in which the signature of thetemplate author/developer will be stored.

```
node index.js signTemplate 
```

* Unzip this `./archive.cta` to verify the template author signature in `signature.json`

```
node index.js unZipTemplate
node index.js verifyTemplateSignatures
```
### Signing and Verifying Contract

* `./sample.md` contains the contract text. First, party acme would sign this contract. `./contractSignatures.json` get created which stores the signatures.

```
 node index.js signContractAcme
```

* The party magnetocorp would sign the contract next. If they try to change the contract text/logic/model, the signing process would fail as the contract hash would change. If signature is successfull signature is added to `./contractSignatures.json`.

```
node index.js signContractMagnetoCorp
```
* Verify the contract signatures from `./contractSignatures.json`

```
node index.js signContractMagnetoCorp
```


