const formatDate = (date: string | Date) => {
    if (typeof date === "string") {
      date = new Date(date);
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return {
      date,
      year,
      month,
      day,
      hours,
      minutes,
    };
  }

const coralineDate = {
  toYYMMDD: (date: string | Date) => {
    const time = formatDate(date);
    const formatted = `${time.year}-${time.month}-${time.day} ${time.hours}:${time.minutes}`
    return formatted;
  }
};

export default coralineDate;
