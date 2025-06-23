// Every constant definied in separate file
const C = require('constants');

const roleScout = require('roleScout')
const roleHarvester = require('roleHarvester')
const roleCarrier = require('roleCarrier')
const roleWorker=require('roleWorker')
const roleFiller=require('roleFiller')
const roleRepairer=require('roleRepairer')
const roleHauler=require('roleHauler')


Room.prototype.creepsManager = function creepsManager() {

    global.heap.rooms[this.name].haveScout = false

    for (var cr in Memory.creeps) {  //clearing data about dead creeps
        if (!Game.creeps[cr]) {
            delete Memory.creeps[cr];
        }
    }

    for (cr in Game.creeps) {

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
            case C.ROLE_WORKER:
                creep.roleWorker()
                global.heap.rooms[this.name].workersParts+=_.filter(this.body, { type: WORK }).length
                continue
            case C.ROLE_FILLER:
                creep.roleFiller()
                global.heap.rooms[this.name].fillers++;
                continue
            case C.ROLE_REPAIRER:
                creep.roleRepairer()
                continue
            case C.ROLE_HAULER:
                creep.roleHauler()
                continue
        }
    }

    //console.log(this.name, " have scout: ", global.heap.rooms[this.name].haveScout)
}