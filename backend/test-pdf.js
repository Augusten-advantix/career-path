const pdf = require('pdf-parse');
console.log('Type of pdf:', typeof pdf);
console.log('Is pdf a function?', typeof pdf === 'function');
console.log('Keys of pdf:', Object.keys(pdf));
if (typeof pdf === 'object') {
    console.log('pdf.default:', pdf.default);
    console.log('Type of pdf.default:', typeof pdf.default);
}
