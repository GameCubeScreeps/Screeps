function minerBody(cap)
{
    var parts=[]
    segmentCost=(BODYPART_COST[CARRY]*2)+(BODYPART_COST[WORK]*5)+(BODYPART_COST[MOVE]*1)
    while(cap>=segmentCost)
    {
        parts.push(CARRY)
        parts.push(CARRY)

        parts.push(WORK)
        parts.push(WORK)
        parts.push(WORK)
        parts.push(WORK)
        parts.push(WORK)

        parts.push(MOVE)

    }
    return parts;
}
module.exports = minerBody