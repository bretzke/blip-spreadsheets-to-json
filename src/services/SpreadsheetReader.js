const XLSX = require('xlsx');
const REG = require('../utils/Regex');

module.exports = class SpreadsheetReader {
    static readSpreadsheet(filename, configs = {}) {
        const bots = {};
        const workbook = XLSX.readFile(filename);

        Object.entries(workbook.Sheets).forEach(([index, page]) => {
            if (configs.pages.indexOf(index.toLowerCase()) > -1) {
                const columns = [];
                const rows = [];

                Object.entries(page).forEach(([key, value]) => {
                    if (typeof value.v === 'undefined') return;

                    let data = value.v;
                    if (columns.length < configs.columns.length) {
                        data = data.toLowerCase();
                        const found = configs.columns.find((column) => column.searchIndex === data);

                        if (typeof found === 'object') {
                            columns.push({
                                index: found.searchIndex,
                                letter: key.replace(REG.onlyLetters, ''),
                                newIndexValue: found.newIndexValue
                            });
                        }
                    } else {
                        const found = columns.find((column) => key.indexOf(column.letter) > -1);

                        if (typeof found === 'object') {
                            if (typeof rows[key.replace(REG.onlyNumbers, '')] === 'undefined')
                                rows[key.replace(REG.onlyNumbers, '')] =
                                    this.getDefaultJSON(configs);

                            rows[key.replace(REG.onlyNumbers, '')][found.newIndexValue] = data;
                        }
                    }
                });

                if (rows.length) bots[index.toLowerCase()] = rows;
            }
        });
        return bots;
    }

    static getDefaultJSON(configs) {
        const json = {};

        configs.columns.forEach((column) => {
            json[column.newIndexValue] = false;
        });

        return json;
    }
};
