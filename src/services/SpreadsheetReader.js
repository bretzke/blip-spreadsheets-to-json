const XLSX = require('xlsx');

module.exports = class SpreadsheetReader {
    static readSpreadsheet(filename, configs = {}) {
        const bots = {};
        const workbook = XLSX.readFile(filename);

        Object.entries(workbook.Sheets).forEach(([index, page]) => {
            if (configs.pages.indexOf(index.toLowerCase()) > -1) {
                const botKeys = {};
                const columnsLetter = {};
                const rows = [];

                Object.entries(page).forEach(([key, value]) => {
                    if (typeof value.v === 'undefined') return;

                    let data = value.v;
                    if (Object.keys(columnsLetter).length < 2) {
                        data = data.toLowerCase();
                        if (configs.columnBotName === data) {
                            columnsLetter.bot = key.replace(/[^a-zA-Z]/, '');
                            botKeys.bot = [];
                        } else if (configs.columnBotKey === data) {
                            columnsLetter.key = key.replace(/[^a-zA-Z]/, '');
                            botKeys.key = [];
                        }
                    } else {
                        let i = key.indexOf(columnsLetter.bot) > -1 ? 'name' : false;
                        i = !i && key.indexOf(columnsLetter.key) > -1 ? 'key' : i;

                        if (i) {
                            if (typeof rows[key.replace(/[^0-9]/, '')] === 'undefined')
                                rows[key.replace(/[^0-9]/, '')] = {
                                    name: false,
                                    key: false
                                };

                            rows[key.replace(/[^0-9]/, '')][i] = data;
                        }
                    }
                });

                if (rows.length) bots[index.toLowerCase()] = rows;
            }
        });
        return bots;
    }
};
