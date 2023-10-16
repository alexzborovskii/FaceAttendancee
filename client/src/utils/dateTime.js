// Create iso string date with local date time

const dateTime = (date) => {
    
    const localTimezoneOffset =
    date.getTimezoneOffset() * -1; 
    const localTime = new Date(
    date.getTime() +
        localTimezoneOffset * 60 * 1000); 
    const isoString = localTime.toISOString();
    return isoString;
}

export default dateTime;