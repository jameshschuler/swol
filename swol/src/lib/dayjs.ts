import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(isToday);

export { dayjs };
