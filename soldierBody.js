function soldierBody(cap,isMelee)// return array with max possible work parts for builder
{
    var parts = [];

    var attackType=RANGED_ATTACK
    var healAttack=HEAL
    if(isMelee==true)
    {
        attackType=ATTACK
        healAttack=ATTACK
    }

    while (cap > BODYPART_COST[MOVE] + BODYPART_COST[MOVE] + BODYPART_COST[attackType] + BODYPART_COST[healAttack]) {

        parts.push(MOVE)
        cap -= BODYPART_COST[MOVE]
        parts.push(MOVE)
        cap -= BODYPART_COST[MOVE]
        parts.push(attackType)
        cap -= BODYPART_COST[attackType]
        parts.push(healAttack)
        cap -= BODYPART_COST[healAttack]


    }
    return parts;
}
module.exports = soldierBody;