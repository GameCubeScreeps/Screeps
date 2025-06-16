// Every constant definied in separate file
const C = require('constants');

const roleScout = require('roleScout')
const roleHarvester = require('roleHarvester')
const roleCarrier = require('roleCarrier')

Room.prototype.creepsManager = function creepsManager() {

    global.heap.rooms[this.name].haveScout = false


    for (cr in Game.creeps) {
        if (!Game.creeps[cr]) {
            delete Memory.creeps[cr];
            continue
        }

        var creep = Game.creeps[cr];

        if (creep.ticksToLive > creep.memory.TimeToSleep) {
            //creep.say('💤')
            continue;
        }

        role = creep.memory.role
        switch (role) {
            case C.ROLE_SCOUT:
                creep.roleScout()
                console.log("scout pos: ", creep.pos)
                global.heap.rooms[this.name].haveScout = true
                continue;
            case C.ROLE_HARVESTER:
                creep.roleHarvester()
                continue;
            case C.ROLE_CARRIER:
                creep.roleCarrier()
                continue
        }
    }

    console.log(this.name, " have scout: ", global.heap.rooms[this.name].haveScout)
}