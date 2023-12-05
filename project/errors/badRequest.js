import { CustomError } from "./customError.js";
import { StatusCodes } from "http-status-codes";


class BadRequestError extends CustomError {
    constructor(message) {
        super(message)
        this.errorCode = StatusCodes.BAD_REQUEST
    }
}

export { BadRequestError }