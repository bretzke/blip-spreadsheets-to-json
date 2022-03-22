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
        const dirs = dir.replaceAll('/', '\\').split('\\');
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
        let exists = false;
        let filePath;

        for (let i = 0; i < 3; i += 1) {
            switch (i) {
                case 0:
                    filePath = path.resolve(filename);
                    break;
                case 1:
                    filePath = path.resolve(`../${filename}`);
                    break;
                default:
                    filePath = path.resolve(`./${filename}`);
                    break;
            }

            exists = FileManager.fileExists(filePath);
            if (exists) break;
        }

        return exists === true ? filePath.replace(/\\/g, '/') : false;
    }

    static fileExists(filePath) {
        return fs.existsSync(filePath);
    }
};
