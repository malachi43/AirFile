import { CustomError } from "./customError.js";
import { StatusCodes } from "http-status-codes";


class NotFoundError extends CustomError {
    constructor(message) {
        super(message)
        this.errorCode = StatusCodes.NOT_FOUND
    }
}

export { NotFoundError }