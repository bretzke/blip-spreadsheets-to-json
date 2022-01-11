const fs = require('fs');

module.exports = class FileManager {
    static createFile(data) {
        let { dir } = data;

        if (!fs.existsSync(data.dir)) {
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
        const dirs = dir.replace('/', '\\').split('\\');
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
};
