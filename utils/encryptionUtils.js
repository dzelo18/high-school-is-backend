const crypto = require('crypto');

let algorithm = 'aes-256-cbc';
let secret = '6E5A7134743777217A25432A462D4A61';

exports.encrypt = (data) => {
    let iv = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(secret), iv);
    let encryptedData = Buffer.concat([cipher.update(data.toString()), cipher.final()]);

    return `${iv.toString('hex')}:${encryptedData.toString('hex')}`;
}

exports.decrypt = (data) => {
    let dataComponents = data.split(':');
    let iv = Buffer.from(dataComponents[0], 'hex');
    let encryptedData = Buffer.from(dataComponents[1], 'hex');

    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(secret), iv);
    let decrypted = Buffer.concat([decipher.update(encryptedData),  decipher.final()]);

    return decrypted.toString();
}