// Every constant definied in separate file
const C = require('contants');
const { ROLE_CARRIER } = require('./constants');
//defining local heap
const localHeap = {}



class FarmingSourceRequestFarmer {
    constructor(sourceId) {
        this.sourceId = sourceId;
        this.type = ROLE_HARVESTER;
    }
}

class FarmingSourceRequestCarrier {
    constructor(roomName,sourceId,distance) {
        this.roomName=roomName
        this.sourceId = sourceId;
        this.srcDistance=distance
        this.type = ROLE_CARRIER;
    }
}

//TODO
//define: global.heap.rooms[].hostiles

Room.prototype.createRoomQueues()
{
    global.heap.farmingQueue = []
    global.heap.defensiveQueue = []
    global.heap.offensivequeue = []


    //  CARRIERS //
    for (farmingSource of this.memory.farmingSources) {
        if (farmingSource.carryingPower < farmingSource.sourcesNum * (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME)
            && farmingSource.carryingPower < farmingSource.harvestingPower) {

            //Skipping reserved by not "me"
            if (Game.rooms[farmingSource.roomName] != undefined && Game.rooms[farmingSource.roomName].controller.reservation != undefined
                && Game.rooms[farmingSource.roomName].controller.reservation.username != global.heap.userName) {
                continue;
            }
            //Skippig rooms containint hostileCreeps
            if (global.heap.rooms[farmingSource.roomName] != undefined && global.heap.rooms[farmingSource.roomName].hostiles.length > 1 && farmingSource.roomName != spawn.room.name) {
                continue;
            }
            global.heap.farmingQueue.push(new FarmingSourceRequestCarrier(farmingSource.roomName,farmingSource.id,farmingSource.distance))
            break;
        }
    }



    //harvesters
    for (farmingSource of this.memory.farmingSources) {
        if (farmingSource.harvestingPower < SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME &&
            farmingSource.farmers < farmingSource.maxFarmers) {

            //Skipping farming rooms reserved by not "my" bot
            if (Game.rooms[farmingSource.roomName] != undefined
                && Game.rooms[farmingSource.roomName].controller.reservation != undefined
                && Game.rooms[farmingSource.roomName].controller.reservation.username == global.heap.userName) {
                continue;
            }

            //We assume that sources are sorted by distance (path to spawn length)
            global.heap.farmingQueue.push(new FarmingSourceRequest(farmingSource.id, ROLE_HARVESTER))
            break;
        }

    }
}