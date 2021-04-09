# Template Signing

## Project Structure 

* parties folder: contains subfolders with keystores of the parties which are going to sign the contract. Inside the individual party subfolders are the pkcs#12 keystore files, which have the x509 certificates,private-key of that party.

* developers folder: contains subfolders with keystores of the developers/template-authors who developed the template. Inside the individual party subfolders are the pkcs#12 keystore file, which have the x509 certificates,private-key of that party.

* templates folder: unzipped from the archive files and stored in a directory. Currently contains helloworldstate template. Within the folder of each template, a manifest.json is to be created before signing. It would have a single object 'signatures' which would be an empty array when initialized. 
These templates can be edited to make smart legal contracts.

* index.js file: this file has all the logic for signing and verifying the template.

## Steps
 * For this repl keystores have already been generated using OpenSSL.

* install the node packages

```
npm install --save
```            

* Reset the manifest.json file, to remove all the exising signatures.

```
node index.js reset helloworldstate
```
* sign the template as a developer/template-author named sanket. Changing the name of developer in the script would give error beacuse it picks up keystore from folder named as sanket in developers folder. 
`(./developers/sanket/keystore.p12)`

```
node index.js sign sanket 123 helloworldstate developer
```

- `sign` is the function name, 
- `sanket` is the developer/template-author name, 
- `123` is the pkcs#12 keystore password, 
- `helloworldstate` is the template 
- `developer` signifies that a developer/template-author is signing this template. 
* If you check ./templates/helloworldstate/manifest.json youl'll find the templateAuthor, signature, templateHash, timestamp, certificate of the developer/template-author in signatures.templateAuthors object.

* sign the contract using party - acme

```
node index.js sign acme 123 helloworldstate party
```

- `sign` is the function name
- `acme` is the partyname
- `123` is the pkcs#12 keystore password
- `helloworldstate` is the template
- `party` signifies that a party is signing this contract. 
* If you check ./templates/helloworldstate/manifest.json youl'll find the partyName, signature, timestamp, certificate of the party in signatures.parties object.

* sign the template using party - magnetocorp

```
node index.js sign magnetocorp 123 helloworldstate party
```

* verify the template/contract

```
node index.js verify helloworldstate
```
- `verify` is function name 
- `helloworldstate` the template name
* If template-author/developer and party signatures are verified successfully, it would show a message `Signature verified for {partyName/templateAuthor}`, if not verified successfully then exits the programme.

* You can play around with the certificate, signature, timestamp inside `./templates/helloworldstate/manifest.json`. If the signs are changed the slightest, verification would fail. If the template code is change, in that case also the verification would fail.

