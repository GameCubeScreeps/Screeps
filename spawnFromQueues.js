// Every constant definied in separate file
const C = require('constants');

const harvesterBody = require('harvesterBody')
const carrierBody = require('carrierBody')
const { result } = require('lodash');



//defining local heap
const localHeap = {}

Room.prototype.spawnFromQueues = function spawnFromQueues() {



    var spawn = Game.spawns[this.name + '_1']
    if (spawn == undefined && Game.spawns['Spawn1'] != undefined && Game.spawns['Spawn1'].room.name == this.name) {
        spawn = Game.spawns['Spawn1']
    }

    if (spawn == undefined) {
        console.log("Spawn for: ", this.name, " is undefined")
        return -1;
    }


    if (global.heap.rooms[this.name].defensiveQueue.length > 0) {

    }
    else if (global.heap.rooms[this.name].harvestingQueue.length > 0) {

        var request = global.heap.rooms[this.name].harvestingQueue[0]
        console.log("trying to spawn: ", request.type)
        var type = request.type
        //console.log("Type: ", type)
        var energyCap = Game.rooms[this.name].energyAvailable

        switch (type) {
            case C.ROLE_HARVESTER:
                {
                    //console.log("Spawning harvester: ")
                    //console.log("Energy Cap: ", energyCap)
                    //console.log("harvesterBody(energyCap): ", harvesterBody(energyCap))
                    var result = spawn.spawnCreep(harvesterBody(energyCap), 'harvester_' + this.name + Game.time, { memory: { role: 'harvester', homeRoom: this.name, targetRoom: request.sourceRoom, sourceId: request.sourceId } })
                    if (result == OK) {
                        global.heap.rooms[this.name].harvestingQueue.shift()

                    }
                    break;
                }
            case C.ROLE_CARRIER:
                {
                    var result = spawn.spawnCreep(carrierBody(energyCap), 'carrier' + this.name + Game.time, { memory: { role: 'carrier', homeRoom: this.name, targetRoom: request.sourceRoom, sourceId: request.sourceId } })
                    if (result == OK) {
                        global.heap.rooms[this.name].harvestingQueue.shift()

                    }
                    break;
                }
        }

    }
    else if (global.heap.rooms[this.name].civilianQueue.length > 0) {
        var request = global.heap.rooms[this.name].civilianQueue[0]
        var type = request.type
        console.log("Type: ", type)
        var energyCap = Game.rooms[this.name].energyAvailable
        switch (type) {
            case C.ROLE_SCOUT:
                {
                    var result = spawn.spawnCreep([MOVE], 'scout_' + this.name + Game.time, { memory: { role: 'scout', homeRoom: this.name, homeSpawnID: spawn.id } })
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()
                        break;
                    }

                }

        }
    }
    else if (global.heap.rooms[this.name].offensiveQueue.length > 0) {

    }
}