const XLSX = require('xlsx');

module.exports = class SpreadsheetReader {
    static readSpreadsheet(filename, configs = {}) {
        const bots = {};
        const workbook = XLSX.readFile(filename);
        const defaultJSON = {};

        configs.columns.forEach((column) => {
            defaultJSON[column.newIndexValue] = false;
        });

        Object.entries(workbook.Sheets).forEach(([index, page]) => {
            if (configs.pages.indexOf(index.toLowerCase()) > -1) {
                const columns = [];
                const rows = [];

                Object.entries(page).forEach(([key, value]) => {
                    if (typeof value.v === 'undefined') return;

                    let data = value.v;
                    if (columns.length < 2) {
                        data = data.toLowerCase();
                        const found = configs.columns.find((column) => column.searchIndex === data);

                        if (typeof found === 'object') {
                            columns.push({
                                index: found.searchIndex,
                                letter: key.replace(/[^a-zA-Z]/, ''),
                                newIndexValue: found.newIndexValue
                            });
                        }
                    } else {
                        const found = columns.find((column) => key.indexOf(column.letter) > -1);

                        if (typeof found === 'object') {
                            if (typeof rows[key.replace(/[^0-9]/, '')] === 'undefined')
                                rows[key.replace(/[^0-9]/, '')] = defaultJSON;

                            rows[key.replace(/[^0-9]/, '')][found.newIndexValue] = data;
                        }
                    }
                });

                if (rows.length) bots[index.toLowerCase()] = rows;
            }
        });
        return bots;
    }
};
