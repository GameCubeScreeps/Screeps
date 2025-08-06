const C = require('constants')

Room.prototype.operateTowers = function operateTowers() {
    if (global.heap.rooms[this.name].myRamparts != undefined && global.heap.rooms[this.name].myRamparts.length > 0) {
        var repairTarget = undefined
        for (r of global.heap.rooms[this.name].myRamparts) {
            var rampart = Game.getObjectById(r)
            if (rampart.hits < C.RAMPART_HITS_BOTTOM_LIMIT) {
                repairTarget = rampart
                break;
            }
        }
        if (repairTarget != undefined) {
            for (t of global.heap.rooms[this.name].myTowersId) {
                if (Game.getObjectById(t) != null) {
                    Game.getObjectById(t).repair(repairTarget)
                }
            }
        }
    }

    if (global.heap.rooms[this.name].hostiles != undefined && global.heap.rooms[this.name].hostiles.length > 0) {
        if (global.heap.rooms[this.name].myTowersId != undefined) {
            for (t of global.heap.rooms[this.name].myTowersId) {
                if (Game.getObjectById(t) != null) {
                    Game.getObjectById(t).attack(global.heap.rooms[this.name].hostiles[0])
                }
            }
        }


    }

}