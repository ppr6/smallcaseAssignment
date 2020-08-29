const getWeightedAverage = function (obj, isDifference) {

    if (isDifference)
        //this is to calculate the weighted average when there's a delete of a buy trade
        return ((obj.weight1 * obj.value1) - (obj.weight2 * obj.value2)) / (obj.weight1 - obj.weight2);
    return ((obj.weight1 * obj.value1) + (obj.weight2 * obj.value2)) / (obj.weight1 + obj.weight2);
};

const updateWeightedAverage = function (obj) {
    var num = ((obj.weight1 * obj.value1) + (obj.weight2 * obj.value2) - (obj.tradeWeight * obj.tradeAmount));
    var den = obj.weight1 + obj.weight2 - obj.tradeWeight;
    if (den == 0) den = 1;
    return (num / den);
}

module.exports = {
    getWeightedAverage,
    updateWeightedAverage
};