import { conn } from "../connectToDatabase/connect.js"

const paginate = async ({ req, model, contentPerPage = 9, projection }) => {
    let { page } = req.query
    const CONTENT_PER_PAGE = contentPerPage
    const LIMIT = CONTENT_PER_PAGE
    if (page) {
        page = Number(page)
    } else {
        page = 1
    }

    const numOfDocs = await conn.model(model).countDocuments()
    const numOfPages = Math.ceil(await conn.model(model).countDocuments() / CONTENT_PER_PAGE)
    const Collection = conn.model(model)
    let docs = Collection.find()
        .skip((page - 1) * CONTENT_PER_PAGE)
        .limit(LIMIT)
        .lean()

    if (projection) {
        docs.select(projection)
    }

    docs = await docs

    return {
        docs,
        numOfPages,
        hasNext: page * CONTENT_PER_PAGE < numOfDocs,
        hasPrev: page > 1
    }
}

export { paginate }