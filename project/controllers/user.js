import { StatusCodes } from "http-status-codes";
import { conn } from "../connectToDatabase/connect.js";
import { BadRequestError } from "../errors/badRequest.js";
import { asyncWrapper } from "../lib/asyncWrapper.js";
import { paginate } from "../utils/pagination.js";
import halson from 'halson'

const getUsers = asyncWrapper(async (req, res) => {
    let { docs, numOfPages, hasNext, hasPrev } = await paginate({ req, model: 'User', contentPerPage: 9, projection: { '__v': 0, email: 0 } })
    if (!docs) throw new BadRequestError(`No users available`)

    docs = docs.map(user => {
        const resource = halson({ ...user })
            .addLink('self', { href: '/users' })
            .addLink('user_info', `/users/${user._id}`)

        return resource
    })

    res.status(StatusCodes.OK).json({ data: docs, count: (await docs).length, hasNext, hasPrev, numOfPages })
})


const getSingleUser = asyncWrapper(async (req, res) => {
    const { id } = req.params
    const User = conn.model('User')
    const user = await User.findById(id)
        .select({ '__v': 0 })
        .lean()

    if (!user) throw new BadRequestError(`No user with id:${user._id}`)

    const resource = halson({ ...user })
        .addLink('self', { href: `/users/${user._id}` })
        .addLink('getUsers', { href: '/users?page=<insert-page-number>' })

    res.status(StatusCodes.OK).json({ data: resource })
})

export { getUsers, getSingleUser }