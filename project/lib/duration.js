import moment from "moment";

const timePassed = (time) => {
    const m1 = moment(time)
    const now = moment(Date.now())
    return moment.duration(m1.diff(now)).humanize(true)
}

export { timePassed }
