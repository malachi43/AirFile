import { paginate } from "./pagination.js";


const getFileHistory = async (req) => {
    try {
        let { docs, numOfPages, hasNext, hasPrev } = await paginate({
            req,
            model: 'FileHistory',
            contentPerPage: 9,
            projection: { _id: 0, 'metadata._id': 0, '__v': 0 }
        })
        console.log(docs.map(file => ({ creationDate: file.createdOn, filename: file.metadata.originalName, fileStatus: file.metadata.isLocked ? "locked" : "unlocked" })))
        return {
            docs,
            numOfPages,
            hasNext,
            hasPrev
        }
    } catch (error) {
        throw error
    }

}


export { getFileHistory }