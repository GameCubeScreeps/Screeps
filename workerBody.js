function workerBody(cap)// return array with max possible work parts for builder
{
    var parts=[];
    console.log("cap: ",cap)

    while(cap>BODYPART_COST[MOVE]+BODYPART_COST[CARRY]+BODYPART_COST[WORK])
    {

        parts.push(MOVE)
        cap-=BODYPART_COST[MOVE]
        parts.push(CARRY)
        cap-=BODYPART_COST[CARRY]
        parts.push(WORK)
        cap-=BODYPART_COST[WORK]
        console.log("cap2: ",cap)
        var counter=0;
        for(var i=0;i<Math.floor(cap/BODYPART_COST[WORK]) && i<2;i++)
        {
            parts.push(WORK)
            counter++
        }
        cap-=counter*BODYPART_COST[WORK]


    }
    console.log("parts: ",parts)
    return parts;
}
module.exports = workerBody;