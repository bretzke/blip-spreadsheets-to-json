const SpreadsheetReader = require('./SpreadsheetReader');
const FileManager = require('./FileManager');

module.exports = class BotsToJson {
    constructor(filename) {
        this.setConfigs();
        this.bots = SpreadsheetReader.readSpreadsheet(
            `${__dirname}\\${filename}`
        );
        this.bots = this.createBotsUnion();
        this.generateJsonFile();
    }

    setConfigs() {
        // use lowercase letter
        this.configs = {
            output: '../output',
            filenameTemplate: 'deploy_99Food',
            columnBotName: 'bots',
            columnBotKey: 'key',
            pages: ['dev', 'hmg', 'prd'],
            ignoreBots: ['router']
        };
    }

    createBotsUnion() {
        const keys = Object.keys(this.bots);
        const botsUnion = {};

        keys.forEach((botKey) => {
            botsUnion[botKey] = {};

            Object.entries(this.bots[botKey]).forEach(
                // eslint-disable-next-line
                ([index, botPrincipal]) => {
                    if (
                        this.configs.ignoreBots.indexOf(
                            botPrincipal.name.toLowerCase()
                        ) > -1
                    )
                        return;

                    for (let i = 0; i < keys.length; i += 1) {
                        if (botKey === keys[i]) continue;

                        const otherBotKey = this.findBotByName(
                            keys[i],
                            botPrincipal.name
                        );

                        if (otherBotKey) {
                            if (
                                typeof botsUnion[botKey][keys[i]] ===
                                'undefined'
                            ) {
                                botsUnion[botKey][keys[i]] = {
                                    index: [],
                                    content: []
                                };
                            }

                            botsUnion[botKey][keys[i]].index.push(
                                botPrincipal.name
                            );

                            botsUnion[botKey][keys[i]].content.push({
                                source_bot_key: botPrincipal.key,
                                destination_bot_key: otherBotKey
                            });
                        }
                    }
                }
            );
        });

        return botsUnion;
    }

    findBotByName(name, findName) {
        const botFound = this.bots[name].find((bot) => {
            if (
                typeof bot === 'object' &&
                Object.prototype.hasOwnProperty.call(bot, 'name')
            ) {
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
        return {
            dir: `${__dirname}\\${
                this.configs.output ? `${this.configs.output}\\` : ''
            }${json.key} to ${json.index}`,
            filename: `${
                this.configs.filenameTemplate
                    ? `${this.configs.filenameTemplate}_`
                    : ''
            }${json.key}_to_${json.index}.json`
        };
    }

    static generateJSONC(json) {
        let body = '[';

        while (json.index.length) {
            body += `\n    // ${json.index[0].toLowerCase().replace('-', ' ')}`;

            body += '\n    {';

            // eslint-disable-next-line no-loop-func
            Object.entries(json.content[0]).forEach(([key, content]) => {
                body += `\n        "${key}": "${content || ''}"`;
                if (
                    key !==
                    Object.keys(json.content[0])[
                        Object.keys(json.content[0]).length - 1
                    ]
                )
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
