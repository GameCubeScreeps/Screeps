function repairerBody(cap)// return array with max possible work parts for builder
{
    var parts=[];

    while(cap>BODYPART_COST[MOVE]+BODYPART_COST[CARRY]+BODYPART_COST[WORK])
    {

        parts.push(MOVE)
        cap-=BODYPART_COST[MOVE]
        parts.push(CARRY)
        cap-=BODYPART_COST[CARRY]
        parts.push(WORK)
        cap-=BODYPART_COST[WORK]


    }
    return parts;
}
module.exports = repairerBody;