const getWeightedAverage = function (obj, isDifference) {

    if (isDifference)
    //this is to calculate the weighted average when there's a delete of a buy trade
        return ((obj.weight1 * obj.value1) - (obj.weight2 * obj.value2)) / (obj.weight1 - obj.weight2);
    return ((obj.weight1 * obj.value1) + (obj.weight2 * obj.value2)) / (obj.weight1 + obj.weight2);
};

const updateWeightedAverage = function (obj) {
    obj.weight1 = obj.weight1 - obj.tradeWeight;
    return ((obj.value1 * obj.weight1) + (obj.weight2 * obj.value2)) / (obj.weight1 + obj.weight2);
}

module.exports = {
    getWeightedAverage,
    updateWeightedAverage
};