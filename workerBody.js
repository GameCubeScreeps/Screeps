function workerBody(cap)// return array with max possible work parts for builder
{
    var parts=[];


    while(cap>0)
    {

        parts.push(MOVE)
        cap-=BODYPART_COST[MOVE]
        parts.push(CARRY)
        cap-=BODYPART_COST[CARRY]
        parts.push(WORK)
        cap-=BODYPART_COST[WORK]
        for(var i=0;i<cap/BODYPART_COST[WORK];i++)
        {
            parts.push(WORK)
            cap-=BODYPART_COST[WORK]
        }
        


    }
    
    return parts;
}
module.exports = workerBody;