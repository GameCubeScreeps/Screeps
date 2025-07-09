// Every constant definied in separate file
const C = require('constants');

const harvesterBody = require('harvesterBody')
const carrierBody = require('carrierBody')
const workerBody = require('workerBody')
const { result } = require('lodash');
const repairerBody = require('repairerBody');



//defining local heap
const localHeap = {}

Room.prototype.spawnFromQueues = function spawnFromQueues() {



    var spawn = Game.spawns[this.name + '_1']
    if (spawn == undefined && Game.spawns['Spawn1'] != undefined && Game.spawns['Spawn1'].room.name == this.name) {
        spawn = Game.spawns['Spawn1']
    }

    if (spawn == undefined) {
        //console.log("Spawn for: ", this.name, " is undefined")
        return -1;
    }


    if (global.heap.rooms[this.name].defensiveQueue.length > 0) {

    }
    else if (global.heap.rooms[this.name].harvestingQueue.length > 0) {

        //console.log("Spawning from harvesting queue")
        var request = global.heap.rooms[this.name].harvestingQueue[0]
        //console.log("trying to spawn: ", request.type)
        var type = request.type
        ////console.log("Type: ", type)
        var energyCap = Game.rooms[this.name].energyAvailable

        switch (type) {
            case C.ROLE_HARVESTER:
                {
                    ////console.log("Spawning harvester: ")
                    ////console.log("Energy Cap: ", energyCap)
                    ////console.log("harvesterBody(energyCap): ", harvesterBody(energyCap))
                    var result = spawn.spawnCreep(harvesterBody(energyCap), C.ROLE_HARVESTER + '_' + this.name + Game.time, { memory: { role: C.ROLE_HARVESTER, homeRoom: this.name, targetRoom: request.sourceRoom, sourceId: request.sourceId } })
                    if (result == OK) {
                        global.heap.rooms[this.name].harvestingQueue.shift()

                    }
                    break;
                }
            case C.ROLE_CARRIER:
                {
                    var result = spawn.spawnCreep(carrierBody(energyCap), C.ROLE_CARRIER + '_' + this.name + Game.time, { memory: { role: C.ROLE_CARRIER, homeRoom: this.name, targetRoom: request.sourceRoom, sourceId: request.sourceId } })
                    if (result == OK) {
                        global.heap.rooms[this.name].harvestingQueue.shift()

                    }
                    break;
                }
            case C.ROLE_FILLER:
                {
                    var body = [MOVE, CARRY]
                    if (spawn.room.controller.level == 7) {
                        body = [MOVE, CARRY, CARRY]
                    }
                    else if (spawn.room.controller.level == 8) {
                        body = [MOVE, CARRY, CARRY, CARRY, CARRY]
                    }
                    var result = spawn.spawnCreep(body, C.ROLE_FILLER + '_' + this.name + Game.time, { memory: { role: C.ROLE_FILLER, homeRoom: this.name, spanwId: this.id } })
                }
            case C.ROLE_HAULER:
                {
                    var result = spawn.spawnCreep(carrierBody(energyCap), C.ROLE_HAULER + '_' + this.name + Game.time, { memory: { role: C.ROLE_HAULER, homeRoom: this.name } })
                    console.log("trying to spawn hauler")
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    //console.log("Hauler spawning result: ",result)
                    break;
                }
        }

    }
    else if (global.heap.rooms[this.name].civilianQueue.length > 0) {
        var request = global.heap.rooms[this.name].civilianQueue[0]
        var type = request.type
        var energyCap = Game.rooms[this.name].energyAvailable
        switch (type) {
            case C.ROLE_SCOUT:
                {
                    var result = spawn.spawnCreep([MOVE], C.ROLE_SCOUT + '_' + this.name + Game.time, { memory: { role: C.ROLE_SCOUT, homeRoom: this.name, homeSpawnID: spawn.id } })
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }
            case C.ROLE_WORKER:
                {
                    var result = spawn.spawnCreep(workerBody(energyCap), C.ROLE_WORKER + '_' + this.name + Game.time, { memory: { role: C.ROLE_WORKER, homeRoom: this.name } })
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    //console.log("worker spawning result: ",result)
                    break;
                }
            case C.ROLE_REPAIRER:
                {
                    var result = spawn.spawnCreep(repairerBody(energyCap), C.ROLE_REPAIRER + '_' + this.name + Game.time, { memory: { role: C.ROLE_REPAIRER, targetRoom: request.roomName, homeRoom: this.name } })
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    //console.log("Repairer spawning result: ",result)
                    break;
                }
            case C.ROLE_RESERVER:
                {
                    var result = spawn.spawnCreep([MOVE, CLAIM], C.ROLE_RESERVER + '_' + this.name + Game.time, { memory: { role: C.ROLE_RESERVER, homeRoom: this.name, targetRoom: request.roomName } })
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    //console.log("Reserver spawning result: ",result)
                    break;
                }
            case C.ROLE_RAMPART_REPAIRER:
                {
                    var result = spawn.spawnCreep(workerBody(energyCap), C.ROLE_RAMPART_REPAIRER + '_' + this.name + Game.time, { memory: { role: C.ROLE_RAMPART_REPAIRER, homeRoom: this.name } })
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    //console.log("worker spawning result: ",result)
                    break;
                }

        }
    }
    else if (global.heap.rooms[this.name].offensiveQueue.length > 0) {

    }
}