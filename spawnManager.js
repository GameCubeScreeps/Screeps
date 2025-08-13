// Every constant definied in separate file
const C = require('constants');

const harvesterBody = require('harvesterBody')
const carrierBody = require('carrierBody')
const workerBody = require('workerBody')
const { result } = require('lodash');
const repairerBody = require('repairerBody');
const soldierBody=require('soldierBody')
const minerBody=require('minerBody')


//defining local heap
const localHeap = {}

Room.prototype.spawnManager = function spawnManager() {



    var spawn = Game.spawns[this.name + '_1']
    if (spawn == undefined && Game.spawns['Spawn1'] != undefined && Game.spawns['Spawn1'].room.name == this.name) {
        spawn = Game.spawns['Spawn1']
    }

    if (spawn == undefined) {
        return -1;
    }


    if (global.heap.rooms[this.name].defensiveQueue.length > 0) {
        var request = global.heap.rooms[this.name].defensiveQueue[0]
        var type = request.type
        var energyCap = Game.rooms[this.name].energyAvailable

        switch (type) {
            case C.ROLE_SOLDIER:
                {
                    var result = spawn.spawnCreep(soldierBody(energyCap,request.isMelee), C.ROLE_SOLDIER + '_' + this.name + Game.time, { memory: { role: C.ROLE_SOLDIER, homeRoom: this.name, targetRoom: request.roomName } })
                    if (result == OK) {
                        global.heap.rooms[this.name].defensiveQueue.shift()

                    }
                    break;
                }
        }
    }
    else if (global.heap.rooms[this.name].harvestingQueue.length > 0) {

        var request = global.heap.rooms[this.name].harvestingQueue[0]
        var type = request.type
        var energyCap = Game.rooms[this.name].energyAvailable

        switch (type) {
            case C.ROLE_HARVESTER:
                {
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
                    if (result == OK) {
                        global.heap.rooms[this.name].harvestingQueue.shift()

                    }
                    break;
                }
            case C.ROLE_HAULER:
                {
                    var result = spawn.spawnCreep(carrierBody(energyCap), C.ROLE_HAULER + '_' + this.name + Game.time, { memory: { role: C.ROLE_HAULER, homeRoom: this.name } })
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
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
                    console.log("trying spawn worker")
                    var body=[]
                    if( this.energyAvailable<=SPAWN_ENERGY_CAPACITY){body=[WORK,CARRY,MOVE]}
                    else{body=workerBody(energyCap)}
                    var result = spawn.spawnCreep(body, C.ROLE_WORKER + '_' + this.name + Game.time, { memory: { role: C.ROLE_WORKER, homeRoom: this.name } })
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }
            case C.ROLE_REPAIRER:
                {
                    var result = spawn.spawnCreep(repairerBody(energyCap), C.ROLE_REPAIRER + '_' + this.name + Game.time, { memory: { role: C.ROLE_REPAIRER, targetRoom: request.roomName, homeRoom: this.name } })
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }
            case C.ROLE_RESERVER:
                {
                    var result = spawn.spawnCreep([MOVE, CLAIM], C.ROLE_RESERVER + '_' + this.name + Game.time, { memory: { role: C.ROLE_RESERVER, homeRoom: this.name, targetRoom: request.roomName } })
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }
            case C.ROLE_RAMPART_REPAIRER:
                {
                    var result = spawn.spawnCreep(workerBody(energyCap), C.ROLE_RAMPART_REPAIRER + '_' + this.name + Game.time, { memory: { role: C.ROLE_RAMPART_REPAIRER, homeRoom: this.name } })
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }
            case C.ROLE_RESOURCE_MANAGER:
                {
                    var result = spawn.spawnCreep(carrierBody(energyCap), C.ROLE_RESOURCE_MANAGER + '_' + this.name + Game.time, { memory: { role: C.ROLE_RESOURCE_MANAGER, homeRoom: this.name } })
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }
            case C.ROLE_CLAIMER:
                {
                    var result = spawn.spawnCreep([MOVE,MOVE,CLAIM], C.ROLE_CLAIMER + '_' + this.name + Game.time, { memory: { role: C.ROLE_CLAIMER, homeRoom: this.name, targetRoom: request.roomName } })
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }
            case C.ROLE_COLONIZER:
                {
                    var result = spawn.spawnCreep(workerBody(energyCap,[MOVE,CARRY,WORK,MOVE]), C.ROLE_COLONIZER + '_' + this.name + Game.time, { memory: { role: C.ROLE_COLONIZER, homeRoom: this.name, targetRoom: request.roomName } })
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }
            case C.ROLE_MINER:
                {
                    var result = spawn.spawnCreep(minerBody(energyCap), C.ROLE_MINER + '_' + this.name + Game.time, { memory: { role: C.ROLE_MINER, homeRoom: this.name } })
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }
            case C.ROLE_MINERAL_CARRIER:
                {
                    var result = spawn.spawnCreep(carrierBody(energyCap), C.ROLE_MINERAL_CARRIER + '_' + this.name + Game.time, { memory: { role: C.ROLE_MINERAL_CARRIER, homeRoom: this.name } })
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }


        }
    }
    else if (global.heap.rooms[this.name].offensiveQueue.length > 0) {

    }
}