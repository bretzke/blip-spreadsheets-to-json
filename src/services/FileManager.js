const fs = require('fs');
const path = require('path');

module.exports = class FileManager {
    static createFile(data) {
        let { dir } = data;

        if (!FileManager.fileExists(data.dir)) {
            dir = FileManager.createDir(data.dir);
        }

        if (dir) {
            fs.writeFile(
                `${data.dir}/${data.filename}`,
                typeof data.content === 'object'
                    ? JSON.stringify(data.content, null, '    ')
                    : data.content,
                (err) => {
                    if (err) {
                        return false;
                    }

                    return true;
                }
            );
        }
    }

    static createDir(dir) {
        const dirs = dir.replace(/\\/g, '/').split('/');
        let newDir = '';

        while (dirs.length) {
            newDir += `${dirs[0]}/`;

            if (!fs.existsSync(newDir)) {
                try {
                    fs.mkdirSync(newDir);
                } catch (err) {
                    newDir = false;
                    break;
                }
            }

            dirs.shift();
        }

        return newDir;
    }

    static getFile(filename) {
        try {
            const data = fs.readFileSync(filename, 'utf8');
            return data;
        } catch (err) {
            return false;
        }
    }

    static getFilePath(filename) {
        const filePath = Array.from(
            new Set([
                ...path.join(__dirname, '../').replace(/\\/g, '/').split('/'),
                ...path.normalize(filename).replace(/\\/g, '/').split('/')
            ])
        ).join('/');

        return FileManager.fileExists(filePath) === true ? filePath.replace(/\\/g, '/') : false;
    }

    static fileExists(filePath) {
        return fs.existsSync(filePath);
    }
};
