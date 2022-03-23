const path = require('path');
const SpreadsheetReader = require('./SpreadsheetReader');
const FileManager = require('./FileManager');

module.exports = class BotsToJson {
    constructor(filename) {
        this.setConfigs();
        this.init(filename);
    }

    init(filename) {
        const filePath = FileManager.getFilePath(filename);

        if (!filePath) {
            console.error(`Arquivo não encontrado! | ${filename}`);
            return;
        }

        this.bots = SpreadsheetReader.readSpreadsheet(filePath, {
            pages: this.configs.pages,
            columns: this.configs.columns
        });
        this.fixBotName();
        this.bots = this.createBotsUnion();
        this.generateJsonFile();
    }

    fixBotName() {
        Object.entries(this.bots).forEach(([key, bots]) => {
            Object.entries(bots).forEach(([index, bot]) => {
                if (typeof bot === 'object' && typeof bot.name === 'string') {
                    this.bots[key][index].name = bot.name.toLowerCase().replace('-', ' ');
                }
            });
        });
    }

    setConfigs() {
        this.configs = JSON.parse(FileManager.getFile(FileManager.getFilePath('config.json')));
    }

    createBotsUnion() {
        const keys = Object.keys(this.bots);
        const botsUnion = {};

        keys.forEach((botKey) => {
            botsUnion[botKey] = {};

            // eslint-disable-next-line
            Object.entries(this.bots[botKey]).forEach(([index, botPrincipal]) => {
                if (this.configs.ignoreBots.indexOf(botPrincipal.name.toLowerCase()) > -1) return;

                for (let i = 0; i < keys.length; i += 1) {
                    if (botKey === keys[i]) continue;

                    const otherBotKey = this.findBotByName(keys[i], botPrincipal.name);

                    if (otherBotKey) {
                        if (typeof botsUnion[botKey][keys[i]] === 'undefined') {
                            botsUnion[botKey][keys[i]] = {
                                index: [],
                                content: []
                            };
                        }

                        botsUnion[botKey][keys[i]].index.push(botPrincipal.name);

                        botsUnion[botKey][keys[i]].content.push({
                            source_bot_key: botPrincipal.key,
                            destination_bot_key: otherBotKey
                        });
                    }
                }
            });
        });

        return botsUnion;
    }

    findBotByName(name, findName) {
        const botFound = this.bots[name].find((bot) => {
            if (typeof bot === 'object' && Object.prototype.hasOwnProperty.call(bot, 'name')) {
                return bot.name === findName;
            }

            return false;
        });

        return typeof botFound === 'object' ? botFound.key : false;
    }

    generateJsonFile() {
        Object.entries(this.bots).forEach(([key, botPrincipal]) => {
            Object.entries(botPrincipal).forEach(([index, bot]) => {
                const data = this.generateDirAndFileName({ key, index });

                FileManager.createFile({
                    dir: data.dir,
                    filename: data.filename,
                    content: bot.content
                });

                FileManager.createFile({
                    dir: data.dir,
                    filename: `${data.filename}c`,
                    content: BotsToJson.generateJSONC(bot)
                });
            });
        });
    }

    generateDirAndFileName(json) {
        const dir = path.resolve(
            `src/${this.configs.output ? `${this.configs.output}/` : ''}${json.key} to ${
                json.index
            }`.replace(/\\/g, '/')
        );

        return {
            dir,
            filename: `${this.configs.filenameTemplate ? `${this.configs.filenameTemplate}_` : ''}${
                json.key
            }_to_${json.index}.json`
        };
    }

    static generateJSONC(json) {
        let body = '[';

        while (json.index.length) {
            body += `\n    // ${json.index[0]}`;

            body += '\n    {';

            // eslint-disable-next-line no-loop-func
            Object.entries(json.content[0]).forEach(([key, content]) => {
                body += `\n        "${key}": "${content || ''}"`;
                if (key !== Object.keys(json.content[0])[Object.keys(json.content[0]).length - 1])
                    body += ',';
            });

            body += `\n    }${json.index.length > 1 ? ',' : ''}`;

            json.index.shift();
            json.content.shift();
        }
        body += '\n]';

        return body;
    }
};
