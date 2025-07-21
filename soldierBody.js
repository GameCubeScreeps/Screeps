function soldierBody(cap)// return array with max possible work parts for builder
{
    var parts = [];

    while (cap > BODYPART_COST[MOVE] + BODYPART_COST[MOVE] + BODYPART_COST[RANGED_ATTACK] + BODYPART_COST[HEAL]) {

        parts.push(MOVE)
        cap -= BODYPART_COST[MOVE]
        arts.push(MOVE)
        cap -= BODYPART_COST[MOVE]
        parts.push(RANGED_ATTACK)
        cap -= BODYPART_COST[RANGED_ATTACK]
        parts.push(HEAL)
        cap -= BODYPART_COST[HEAL]


    }
    return parts;
}
module.exports = soldierBody;