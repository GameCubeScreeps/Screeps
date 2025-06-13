// Every constant definied in separate file
const C = require('constants');

const roleScout = require('role.scout')


Room.prototype.creepsManager = function creepsManager() {
    
    global.heap.rooms[this.name].haveScout=false


    for (cr in Game.creeps) {
        if (!Game.creeps[cr]) {
            delete Memory.creeps[cr];
            continue
        }

        var creep = Game.creeps[cr];

        role=creep.memory.role

        switch (role)
        {
            case C.ROLE_SCOUT:
                creep.roleScout()
                console.log("scout pos: ",creep.pos)
                global.heap.rooms[this.name].haveScout=true
                continue;
            case C.ROLE_HARVESTER:
                continue;
        }
    }

    console.log(this.name," have scout: ",global.heap.rooms[this.name].haveScout)
}