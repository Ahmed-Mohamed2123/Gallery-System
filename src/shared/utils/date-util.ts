import * as moment from "moment";
export class DateUtil {
    static diff(startDate: Date, endDate: Date, unitOfTime?: any) {
        return moment(startDate).diff(endDate, unitOfTime)
    }

    static toMoment(date: Date) {
        return moment(date);
    }
}