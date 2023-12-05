import { CustomError } from "./customError.js";
import { StatusCodes } from "http-status-codes";


class UnauthenticateError extends CustomError {
    constructor(message) {
        super(message)
        this.errorCode = StatusCodes.UNAUTHORIZED
    }
}

export { UnauthenticateError }