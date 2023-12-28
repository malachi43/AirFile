import fs from 'node:fs'
// import nodeFs from 'node:fs'
// import fsCyclic from '@cyclic.sh/s3fs'
// const s3 = fsCyclic(process.env.CYCLIC_BUCKET_NAME)
// const fs = process.env.NODE_ENV === "production" ? s3 : nodeFs
// console.log(fs)


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
