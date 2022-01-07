module.exports = class SpreadsheetReader {
    constructor(filename) {
        this.filename = filename;
        this.bots = {};
        this.init();
    }

    init() {
        this.setConfigs();
        this.readSpreadsheet();
        this.bots = this.createBotsUnion();
        this.generateJsonFile();
    }

    setConfigs() {
        // use lowercase letter
        this.configs = {
            "path": "JSONS",
            "filenameTemplate": "deploy_99Food",
            "columnBotName": "bots",
            "columnBotKey": "key",
            "pages": [
                "dev", "hmg", "prd"
            ],
            "ignoreBots": [
                "router", "principal"
            ]
        };
    }

    readSpreadsheet() {
        let workbook = require("xlsx").readFile(this.filename);

        for(let index in workbook.Sheets) {

            if(this.configs.pages.indexOf(index.toLowerCase()) > -1) {
                let botKeys = {}
                let columnsLetter = {};
                let rows = new Array();
                for (let key in workbook.Sheets[index]) {
                    let data = workbook.Sheets[index][key];

                    if(typeof data.v === 'undefined') continue;

                    data = data.v;
                    if(Object.keys(columnsLetter).length < 2) {
                        data = data.toLowerCase();
                        if(this.configs.columnBotName == data) {
                            columnsLetter['bot'] = key.replace(/[^a-zA-Z]/, '');
                            botKeys['bot'] = new Array();
                        } else if(this.configs.columnBotKey == data) {
                            columnsLetter['key'] = key.replace(/[^a-zA-Z]/, '');
                            botKeys['key'] = new Array();
                        }
                    } else {
                        let i = (key.indexOf(columnsLetter['bot']) > -1) ? 'name' : false;
                        i = (!i && key.indexOf(columnsLetter['key']) > -1) ? 'key' : i;

                        if(i) {
                            if(typeof rows[key.replace(/[^0-9]/, '')] == 'undefined') rows[key.replace(/[^0-9]/, '')] = {'name': false, 'key': false};

                            rows[key.replace(/[^0-9]/, '')][i] = data;
                        }
                    }
                }

                if(rows.length) this.bots[index.toLowerCase()] = rows;
            }
        }
    }

    createBotsUnion() {
        let keys = Object.keys(this.bots);
        let botsUnion = {};

        keys.forEach(botKey => {
            botsUnion[botKey] = {};

            for(let index in this.bots[botKey]) {
                if(this.configs.ignoreBots.indexOf(this.bots[botKey][index].name.toLowerCase()) > -1) continue;
                
                for (let i = 0; i < keys.length; i++) {
                    const element = keys[i];

                    if(botKey == keys[i]) continue;

                    let otherBotKey = this.findBotByName(keys[i], this.bots[botKey][index].name);

                    if(otherBotKey) {
                        if(typeof botsUnion[botKey][keys[i]] == 'undefined') {
                            botsUnion[botKey][keys[i]] = {
                                "index": [],
                                "content": []
                            };
                        }

                        botsUnion[botKey][keys[i]].index.push(this.bots[botKey][index].name);
                        botsUnion[botKey][keys[i]].content.push({
                            "source_bot_key":      this.bots[botKey][index].key,
                            "destination_bot_key": otherBotKey
                        });
                    }
                }
            }
        });

        return botsUnion;
    }

    findBotByName(name, findName) {
        let key = false;
        for(let index in this.bots[name]) {
            if(this.bots[name][index].name == findName) {
                key = this.bots[name][index].key;
                break;
            }
        }
        return key;
    }

    generateJsonFile() {
        for(let key in this.bots) {
            
            for(let index in this.bots[key]) {
                let filename = `${(this.configs.filenameTemplate ? this.configs.filenameTemplate + '_' : '')}${key}_to_${index}.json`;

                this.createFile({
                    "dir": __dirname + "\\" + ((this.configs.path) ? this.configs.path + "\\" : "") + key + " to " + index,
                    filename,
                    "content": this.bots[key][index].content
                });

                this.createFile({
                    "dir": __dirname + "\\" + ((this.configs.path) ? this.configs.path + "\\" : "") + key + " to " + index,
                    "filename": filename + "c",
                    "content": this.generateJSONC(this.bots[key][index])
                });
            }
        }
    }

    generateJSONC(json) {
        let body = "[";

        while(json.index.length) {
            body += `\n    // ${json.index[0].toLowerCase().replace('-', ' ')}`;
            
            body += "\n    {"

            for(let key in json.content[0]) {
                body += `\n        "${key}": "${json.content[0][key]}"`;
                if(key != Object.keys(json.content[0])[Object.keys(json.content[0]).length - 1]) body += ","
            }

            body += `\n    }${(json.index.length > 1) ? ',' : ''}`;

            json.index.shift();
            json.content.shift();
        }
        return (body + "\n]");
    }

    createFile(json) {
        let fs = require('fs');
        if(typeof json.content == 'object') json.content = JSON.stringify(json.content, null, "    ");
        
        if (!fs.existsSync(json.dir)){
            this.dir = this.createDir(json.dir);
        }

        fs.writeFile(json.dir + '/' + json.filename, json.content, function(err, result) {});
    }

    createDir(dir) {
        let fs = require('fs');
        let dirs = dir.split('\\');
        dir = '';

        while(dirs.length) {
            dir = dir + dirs[0] + '/';

            if (!fs.existsSync(dir)){
                try {
                    fs.mkdirSync(dir);
                } catch(err) {
                    console.log({dir, err})
                }
            }

            dirs.shift();
        }

        return dir;
    }
}