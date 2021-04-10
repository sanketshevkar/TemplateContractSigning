const { Template } = require('cicero/packages/cicero-core');
const path = require('path');
const fs = require('fs');

const main = async() =>{
    const keyStorePath = path.join(__dirname, 'developers', 'sanket', 'keystore.p12');
    const templatePath = path.join(__dirname, 'templates', 'helloworldstate');
    const template = await Template.fromDirectory(templatePath);
    const signature = await template.signContract(templatePath, keyStorePath, "123");
    console.log(signature);
}

main();