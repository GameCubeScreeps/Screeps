function harvesterBody(cap,ifLimit=true)// return array with max possible work parts for builder
{
    var parts=[];
    var reqHarvPower=(SOURCE_ENERGY_CAPACITY/ENERGY_REGEN_TIME)-(2*HARVEST_POWER);

    if(cap>(BODYPART_COST[MOVE]+(2*BODYPART_COST[WORK]))*reqHarvPower && ifLimit==true)
    {
        cap=(BODYPART_COST[MOVE]+(2*BODYPART_COST[WORK]))*reqHarvPower;
    }
    parts.push(MOVE)
    parts.push(CARRY)
    parts.push(WORK)
    parts.push(WORK)
    cap-=(BODYPART_COST[MOVE]+(2*BODYPART_COST[WORK]));

    for(let i=0;i<Math.floor(cap/(BODYPART_COST[MOVE]+(2*BODYPART_COST[WORK])));i++)
    {
        parts.push(MOVE)
        parts.push(WORK)
        parts.push(WORK)
        cap-=(BODYPART_COST[MOVE]+(2*BODYPART_COST[WORK]))
    }
    
    return parts;
}
module.exports = harvesterBody;