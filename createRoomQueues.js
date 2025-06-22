// Every constant definied in separate file
const C = require('constants');
//defining local heap
const localHeap = {}



class harvestingSourceRequestFarmer {
    constructor(sourceId, sourceRoom) {
        this.sourceId = sourceId;
        this.sourceRoom = sourceRoom
        this.type = C.ROLE_HARVESTER;
    }
}

class harvestingSourceRequestCarrier {
    constructor(sourceId, roomName, distance) {
        this.sourceId = sourceId;
        this.sourceRoom = roomName
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
    //console.log("rooms to scan: ",Game.rooms[this.name].memory.roomsToScan)
    if (Game.rooms[this.name].memory.roomsToScan == undefined) {
        global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_SCOUT))
        //console.log("adding: ", C.ROLE_SCOUT)
    }
    else if (Game.rooms[this.name].memory.roomsToScan != undefined) {
        if (Game.rooms[this.name].memory.roomsToScan.length > 0) {
            if (global.heap.rooms[this.name].haveScout == false) {
                global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_SCOUT))
                //console.log("adding: ", C.ROLE_SCOUT)
            }
        }
    }


    //  Carriers / Harvesters
    var areCarriersSatisfied = true
    var areHarvestersSatisfied = true
    //console.log(this.name, " have ",this.memory.harvestingSources.length," source")
    for (harvestingSource of this.memory.harvestingSources) {

        //console.log(harvestingSource.id)
        //Skipping reserved by not "me"
        if (Game.rooms[harvestingSource.roomName] != undefined && Game.rooms[harvestingSource.roomName].controller.reservation != undefined
            && Game.rooms[harvestingSource.roomName].controller.reservation.username != global.heap.userName) {
            //console.log("skipping room reserved by not player")
            continue;
        }
        //Skippig rooms containing hostileCreeps
        if (global.heap.rooms[harvestingSource.roomName] != undefined && global.heap.rooms[harvestingSource.roomName].hostiles.length > 1 && harvestingSource.roomName != this.name) {
            //console.log("Skipping room with hostiles")
            continue;
        }

        // Fillers
        if (this.controller.level > 1 && global.heap.rooms[this.name].fillers < 4) {
            global.heap.rooms[this.name].harvestingQueue.push(new generalRoomRequest(this.name, C.ROLE_FILLER))
            //console.log("adding filler to queue")
        }


        //Carriers and Harvesters for sure won't be mixed on queue
        if (Game.rooms[this.name].storage != undefined) {
            if (harvestingSource.carryPower < harvestingSource.harvestingPower) {
                //Carriers
                global.heap.rooms[this.name].harvestingQueue.push(new harvestingSourceRequestCarrier(harvestingSource.id, harvestingSource.roomName, harvestingSource.distance))
                //console.log("Adding Carrier to queue")
                areCarriersSatisfied = false
                break;

            }//Farmers
            else if (harvestingSource.harvestingPower < (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME) && harvestingSource.harvesters < harvestingSource.maxHarvesters) {
                global.heap.rooms[this.name].harvestingQueue.push(new harvestingSourceRequestFarmer(harvestingSource.id, harvestingSource.roomName, harvestingSource.distance))
                //console.log("Adding harvester to queue")
                areHarvestersSatisfied = false
                break;
            }
        }
        else if (Game.rooms[this.name].memory.energyBalance <= 0.5) {
            if (harvestingSource.carryPower < harvestingSource.harvestingPower) {
                //Carriers
                global.heap.rooms[this.name].harvestingQueue.push(new harvestingSourceRequestCarrier(harvestingSource.id, harvestingSource.roomName, harvestingSource.distance))
                //console.log("Adding Carrier to queue")
                areCarriersSatisfied = false
                break;

            }//Farmers
            else if (harvestingSource.harvestingPower < (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME) && harvestingSource.harvesters < harvestingSource.maxHarvesters) {
                global.heap.rooms[this.name].harvestingQueue.push(new harvestingSourceRequestFarmer(harvestingSource.id, harvestingSource.roomName, harvestingSource.distance))
                //console.log("Adding harvester to queue")
                areHarvestersSatisfied = false
                break;
            }
        }


    }

    for(harvestingRoom of this.memory.harvestingRooms)
    {
        if(harvestingRoom.repairerId==undefined)
        {
            global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(harvestingRoom.name,C.ROLE_REPAIRER))
            console.log("adding repairer")
            break;
        }
    }

    


    // Workers below RCL4 - wthout storage
    if (Game.rooms[this.name].storage == undefined) {
        if (Game.rooms[this.name].memory.energyBalance > C.ENERGY_BALANCER_WORKER_SPAWN) {

            global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_WORKER))

        }
    }
    else {//Workers above and on RCL4
        if (Game.rooms[this.name].storage.store[RESOURCE_ENERGY] < C.STORAGE_BALANCER_START) {
            if (global.heap.rooms[this.name].upgradersParts < 1) {
                global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_WORKER))
            }
        }
        else if (global.heap.rooms[this.name].upgradersParts < Game.rooms[this.name].storage.store[RESOURCE_ENERGY] / C.UPGRADE_FACTOR) {
            global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_WORKER))
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

    console.log("harvestingQueue")
    for (a of global.heap.rooms[this.name].harvestingQueue) {
        console.log(a.type)
    }


}