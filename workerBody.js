function workerBody(cap,bodyScheme=[MOVE,CARRY,WORK,WORK])// return array with max possible work parts for builder
{

    var segmentCost=0;
    for(part of bodyScheme)
    {
        segmentCost+=BODYPART_COST[part]
    }
    var parts=[];

    while(cap>segmentCost)
    {
        for(part of bodyScheme)
        {
            parts.push(part)
        }
        cap-=segmentCost

        /*
        parts.push(MOVE)
        cap-=BODYPART_COST[MOVE]
        parts.push(CARRY)
        cap-=BODYPART_COST[CARRY]
        parts.push(WORK)
        cap-=BODYPART_COST[WORK]
        var counter=0;
        for(var i=0;i<Math.floor(cap/BODYPART_COST[WORK]) && i<2;i++)
        {
            parts.push(WORK)
            counter++
        }
        cap-=counter*BODYPART_COST[WORK]
        */


    }
    return parts;
}
module.exports = workerBody;