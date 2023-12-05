import fs from 'node:fs'
// import { fileURLToPath } from 'node:url'
// import { dirname } from 'node:path'
// const __filename = import.meta.url
// const __dirname = dirname(fileURLToPath(__filename))

const mkdir = (directory) => {
    directory.split('/').reduce((parentDirectory, subFolder) => {
        let currentPath = parentDirectory + subFolder
        if (!fs.existsSync(currentPath)) {
            fs.mkdirSync(currentPath)
        }
        return currentPath + "/"
    }, "")
    return
}

export { mkdir }
