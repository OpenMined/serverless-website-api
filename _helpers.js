import fs from 'fs';

export const loadFromOffline = path => {
    if(process.env.IS_OFFLINE) {
        try {
            const data = fs.readFileSync(path);
            return JSON.parse(data);
        } catch(err) {
            if(err) return null;
        }
    }
}

export const saveToOffline = (path, data) => {
    if(process.env.IS_OFFLINE) {
        fs.writeFile(path, JSON.stringify(data), (err) => {
            if (err) console.error(err);

            console.log(`Successfully created file at ${path}`);
        });
    }
}