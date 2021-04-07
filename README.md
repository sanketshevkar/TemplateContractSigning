# Template Signing

## Project Structure 

* parties: contains subfolders with of the parties which are going to sign the template. Inside the individual party subfolders are the pkcs#12 keystore file, which have the x509 certificates,private-key of that party.
* templates: unzipped from the archive files and stored in a directory. Currently contains helloworldstate template. Within the folder of each template, a manifest.json is to be created before signing. It would have a single object 'signatures' which would be an empty array when initialized.
* index.js: this file has all the logic for signing and verifying the template.

## Steps
 * For this repl keystores have already been generated using OpenSSL. But custom pkcs#12 keystores can also be used instead of them.
 * The project needs node version 15.6.0 and higher as a new class has been added from here on, which handle X509 certificates within the crypto module.
 * run the nvmsetup.sh script using the following command in the repl shell to install node v15.6.0

```
source ./nvmsetup.sh
```

*install the node packages

```
npm install --save
```            

* Reset the manifest.json file, to remove all the exising signatures.

```
node index.js reset helloworldstate
```

* sign the template using party - acme

```
node index.js sign acme 123 helloworldstate
```

* here sign is the function name, acme is the partyname, 123 is the pkcs#12 keystore password, helloworldstate is the template. If you check ./templates/helloworldstate/manifest.json youl'll find the partyName, signature, timestamp, certificate of the party.

* sign the template using party - magnetocorp

```
node index.js sign magnetocorp 123 helloworldstate
```

* verify the template

```
node index.js verify helloworldstate
```
* verify is function name and helloworldstate the template name. if verified suucessfully, it returns true, if not verified then exits the programme.

* You can play around with the certificate, signature, timestamp inside ./tempplates/helloworld/manifest.json. If the signs are changed the slightest, verification would fail. If the template code is change, in that case also the verification would fail.

