const formatNumberDate = (dateNumber) => {
    if(dateNumber.length !== 2) {
        dateNumber = dateNumber.padStart(2, '0')
    }
    return dateNumber
}

const formatMonthFromString = (month) => {
    var d = Date.parse(month + "1, 2012");
    if(!isNaN(d)){
        return formatNumberDate((new Date(d).getMonth() + 1).toString());
    }
    return -1;
}

module.exports = { formatNumberDate, formatMonthFromString }