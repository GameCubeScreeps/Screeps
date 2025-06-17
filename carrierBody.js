// Every constant definied in separate file
const C = require('constants');

function carrierBody(cap)// return array with max possible work parts for builder
{
    var segmentCost = BODYPART_COST[MOVE] + BODYPART_COST[CARRY] + BODYPART_COST[CARRY]
    var maxSegments = Math.floor(C.CREEP_MAX_BODYPARTS / 3)

    if (cap / segmentCost > maxSegments) {
        cap = segmentCost * maxSegments
    }
    var parts = [];
    parts.push(MOVE);
    parts.push(CARRY);
    parts.push(CARRY);
    cap -= 150;
    for (let i = 0; i < Math.floor(cap / 150); i++) {
        parts.push(MOVE);
        parts.push(CARRY);
        parts.push(CARRY);
    }
    return parts;
}
module.exports = carrierBody;