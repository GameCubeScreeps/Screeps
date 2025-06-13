// Every constant definied in separate file
const C = require('constants');
//defining local heap
const localHeap = {}



class harvestingSourceRequestFarmer {
    constructor(sourceId, sourceRoom) {
        this.sourceId = sourceId;
        this.sourceRoom = sourceRoom
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

class generalRoomRequest {
    constructor(roomName, type) {
        this.roomName = roomName
        this.type = type;
    }
}

//TODO
//define: global.heap.rooms[].hostiles

Room.prototype.createRoomQueues = function createRoomQueues() {
    global.heap.rooms[this.name].defensiveQueue = []
    global.heap.rooms[this.name].harvestingQueue = []
    global.heap.rooms[this.name].civilianQueue = []
    global.heap.rooms[this.name].offensiveQueue = []



    // Scout
    console.log("rooms to scan: ",Game.rooms[this.name].memory.roomsToScan)
    if (Game.rooms[this.name].memory.roomsToScan == undefined) {
        global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_SCOUT))
        console.log("adding: ",C.ROLE_SCOUT)
    }
    else if(Game.rooms[this.name].memory.roomsToScan!=undefined)
    {
        console.log('1')
        if(Game.rooms[this.name].memory.roomsToScan.length>0)
        {
            console.log('2')
            if(global.heap.rooms[this.name].haveScout==false)
            {
                console.log('3')
                global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_SCOUT))
                console.log("adding: ",C.ROLE_SCOUT)
            }
        }
    }

    //  Carriers / Harvesters
    var areCarriersSatisfied = true
    var areHarvestersSatisfied = true
    for (harvestingSource in this.memory.harvestingSources) {


        //Skipping reserved by not "me"
        if (Game.rooms[harvestingSource.roomName] != undefined && Game.rooms[harvestingSource.roomName].controller.reservation != undefined
            && Game.rooms[harvestingSource.roomName].controller.reservation.username != global.heap.userName) {
            continue;
        }
        //Skippig rooms containing hostileCreeps
        if (global.heap.rooms[harvestingSource.roomName] != undefined && global.heap.rooms[harvestingSource.roomName].hostiles.length > 1 && harvestingSource.roomName != spawn.room.name) {
            continue;
        }

        //Carriers and Harvesters for sure won't be mixed on queue
        //Carriers
        if (harvestingSource.carryingPower < (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME) && harvestingSource.carryingPower < harvestingSource.harvestingPower) {
            global.heap.rooms[this.room].harvestingQueue.push(new harvestingSourceRequestCarrier(harvestingSource.roomName, harvestingSource.id, harvestingSource.distance))
            areHarvestersSatisfied = false
            break;
        }
        else if (harvestingSource.carryingPower < harvestingSource.harvestingPower) {
            //Harvesters
            global.heap.rooms[this.room].harvestingQueue.push(new harvestingSourceRequestFarmer(harvestingSource.id, harvestingSource.roomName))
            areCarriersSatisfied = false
            break;

        }
    }


    // Upgraders below RCL4 - wthout storage
    if (Game.rooms[this.name].storage == undefined) {
        if (Game.rooms[this.name].memory.energyUsageBalance > 0.5 && global.heap.rooms[room].civilianQueue.some(obj => obj.type === C.ROLE_UPGRADER)) {
            global.heap.rooms[this.room].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_UPGRADER))
        }
    }
    else {//Upgraders above and on RCL4
        if (Game.rooms[this.name].storage.store[RESOURCE_ENERGY] < STORAGE_BALANCER_START) {
            if (global.heap.rooms[this.name].upgradersParts < 1) {
                global.heap.rooms[this.room].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_UPGRADER))
            }
        }
        else if (global.heap.rooms[this.name].upgradersParts < Game.rooms[this.name].storage.store[RESOURCE_ENERGY] / C.UPGRADE_FACTOR) {
            global.heap.rooms[this.room].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_UPGRADER))
        }


    }








    global.heap.rooms[this.name].areHarvestingNeedsSatisfied = areHarvestersSatisfied && areCarriersSatisfied


    // Soldiers - against raids (in both homeRoom below rcl3 and remote)
    // Soldiers should add themselves (their targetRoom) to global.heap.rooms[roomName].soldier
    for (room in this.memory.harvestingRooms) {
        if (global.heap.rooms[this.name].hostiles.length > 0) {
            if (Game.rooms[this.name].memory.isHarvestingRoom && global.heap.rooms[this.name].soldier == undefined) {
                if (!global.heap.rooms[this.name].defensiveQueue.some(obj => obj.roomName === this.name)) {
                    global.heap.rooms[this.name].defensiveQueue.push(new generalRoomRequest(this.name, C.ROLE_SOLDIER))
                }
            }
        }
    }


    //logging queues
    console.log("civilian queue")
    for (a of global.heap.rooms[this.name].civilianQueue) {
        console.log(a.type)
    }


}