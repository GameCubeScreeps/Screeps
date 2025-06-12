// Every constant definied in separate file
const C = require('contants');
//defining local heap
const localHeap = {}



class harvestingSourceRequestFarmer {
    constructor(sourceId) {
        this.sourceId = sourceId;
        this.type = ROLE_HARVESTER;
    }
}

class harvestingSourceRequestCarrier {
    constructor(roomName, sourceId, distance) {
        this.roomName = roomName
        this.sourceId = sourceId;
        this.srcDistance = distance
        this.type = C.ROLE_CARRIER;
    }
}

class roomRequestSoldier {
    constructor(roomName) {
        this.roomName = roomName
        this.type = C.ROLE_SOLDIER;
    }
}

//TODO
//define: global.heap.rooms[].hostiles

Room.prototype.createRoomQueues = new function createRoomQueues() {
    global.heap.rooms[this.name].defensiveQueue = []
    global.heap.rooms[this.name].harvestingQueue = []
    global.heap.rooms[this.name].offensiveQueue = []

    //Find hostile and friendly creeps
    Game.rooms[this.name].roomManager()

    //  CARRIERS 
    for (harvestingSource of this.memory.harvestingSources) {
        if (harvestingSource.carryingPower < harvestingSource.sourcesNum * (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME)
            && harvestingSource.carryingPower < harvestingSource.harvestingPower) {

            //Skipping reserved by not "me"
            if (Game.rooms[harvestingSource.roomName] != undefined && Game.rooms[harvestingSource.roomName].controller.reservation != undefined
                && Game.rooms[harvestingSource.roomName].controller.reservation.username != global.heap.userName) {
                continue;
            }
            //Skippig rooms containint hostileCreeps
            if (global.heap.rooms[harvestingSource.roomName] != undefined && global.heap.rooms[harvestingSource.roomName].hostiles.length > 1 && harvestingSource.roomName != spawn.room.name) {
                continue;
            }
            global.heap.rooms[this.room].harvestingQueue.push(new harvestingSourceRequestCarrier(harvestingSource.roomName, harvestingSource.id, harvestingSource.distance))
            break;
        }
    }



    // Harvesters
    for (harvestingSource of this.memory.harvestingSources) {
        if (harvestingSource.harvestingPower < SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME &&
            harvestingSource.farmers < harvestingSource.maxFarmers) {

            //Skipping farming rooms reserved by not "my" bot
            if (Game.rooms[harvestingSource.roomName] != undefined
                && Game.rooms[harvestingSource.roomName].controller.reservation != undefined
                && Game.rooms[harvestingSource.roomName].controller.reservation.username == global.heap.userName) {
                continue;
            }

            //We assume that sources are sorted by distance (path to spawn length)
            global.heap.rooms[this.room].harvestingQueue.push(new harvestingSourceRequestFarmer(harvestingSource.id, ROLE_HARVESTER))
            break;
        }
    }


    // Soldiers - against raids (in both homeRoom below rcl3 and remote)
    for (room of this.memory.harvestingRooms) {
        if (global.heap.rooms[room].hostiles.length > 0) {
            if (Game.rooms[room].memory.isHarvestingRoom && global.heap.rooms[room].soldier==undefined) {
                if (!global.heap.rooms[room].defensiveQueue.some(obj => obj.roomName ===room)) {
                    global.heap.rooms[room].defensiveQueue.push(new roomRequestSoldier(room))
                }
            }
        }
    }

    // Soldiers should add themselves (their targetRoom) to global.heap.rooms[roomName].soldier


}