// Every constant definied in separate file
const C = require('constants');
const { ROLE_RESERVER } = require('./constants');
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

class soldierRequest {
    constructor(roomName, type, isMelee) {
        this.roomName = roomName
        this.type = type
        this.isMelee = isMelee
    }
}


Room.prototype.createRoomQueues = function createRoomQueues() {

    global.heap.rooms[this.name].defensiveQueue = []
    global.heap.rooms[this.name].harvestingQueue = []
    global.heap.rooms[this.name].civilianQueue = []
    global.heap.rooms[this.name].offensiveQueue = []


    // Scout
    if (this.memory.roomsToScan == undefined) {
        global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_SCOUT))
    }
    else if (this.memory.roomsToScan != undefined) {
        if (this.memory.roomsToScan.length > 0) {
            if (global.heap.rooms[this.name].haveScout == false) {
                global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_SCOUT))
            }
        }
    }

    if (this.storage != undefined) {

        if (global.heap.rooms[this.name].haulersParts < C.HAULER_REQ_CARRY_PARTS) {
            global.heap.rooms[this.name].harvestingQueue.push(new generalRoomRequest(this.name, C.ROLE_HAULER))
        }
    }


    //  Carriers / Harvesters
    var areCarriersSatisfied = true
    var areHarvestersSatisfied = true
    for (harvestingSource of this.memory.harvestingSources) {

        //Skipping reserved by not "me"
        if (Game.rooms[harvestingSource.roomName] != undefined && Game.rooms[harvestingSource.roomName].controller.reservation != undefined
            && Game.rooms[harvestingSource.roomName].controller.reservation.username != global.heap.userName) {
            continue;
        }
        //Skippig rooms containing hostileCreeps
        if (global.heap.rooms[harvestingSource.roomName] != undefined && global.heap.rooms[harvestingSource.roomName].hostiles.length > 0 && harvestingSource.roomName != this.name) {

            continue;
        }

        // Fillers
        if (this.controller.level > 1 && global.heap.rooms[this.name].fillers < 4) {
            global.heap.rooms[this.name].harvestingQueue.push(new generalRoomRequest(this.name, C.ROLE_FILLER))

        }


        //Carriers and Harvesters for sure won't be mixed on queue
        if (this.storage != undefined) {
            if (harvestingSource.carryPower < harvestingSource.harvestingPower) {
                //Carriers
                if (harvestingSource.id != undefined && harvestingSource.roomName != undefined) {
                    global.heap.rooms[this.name].harvestingQueue.push(new harvestingSourceRequestCarrier(harvestingSource.id, harvestingSource.roomName, harvestingSource.distance))

                }
                areCarriersSatisfied = false
                break;

            }//Farmers
            else if (harvestingSource.harvestingPower < (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME) && harvestingSource.harvesters < harvestingSource.maxHarvesters) {
                global.heap.rooms[this.name].harvestingQueue.push(new harvestingSourceRequestFarmer(harvestingSource.id, harvestingSource.roomName, harvestingSource.distance))

                areHarvestersSatisfied = false
                break;
            }
        }
        else //if (this.memory.energyBalance <= 1.5 || true)
        {
            if (harvestingSource.carryPower < harvestingSource.harvestingPower) {
                //Carriers
                if (harvestingSource.id != undefined && harvestingSource.roomName != undefined) {
                    global.heap.rooms[this.name].harvestingQueue.push(new harvestingSourceRequestCarrier(harvestingSource.id, harvestingSource.roomName, harvestingSource.distance))

                    areCarriersSatisfied = false
                    break;

                }

            }//Farmers
            else if (harvestingSource.harvestingPower < (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME) && harvestingSource.harvesters < harvestingSource.maxHarvesters) {
                global.heap.rooms[this.name].harvestingQueue.push(new harvestingSourceRequestFarmer(harvestingSource.id, harvestingSource.roomName, harvestingSource.distance))

                areHarvestersSatisfied = false
                break;
            }
        }


    }
    if (this.memory.harvestingRooms != undefined) {
        for (harvestingRoom of this.memory.harvestingRooms) {
            if (harvestingRoom.repairerId == undefined && this.memory.roomsToScan.length == 0) {
                global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(harvestingRoom.name, C.ROLE_REPAIRER))

                break;
            }
        }
    }





    // Workers below RCL4 - wthout storage
    if (this.storage == undefined || this.controller.level < 4) {
        if (this.memory.energyBalance > C.ENERGY_BALANCER_WORKER_SPAWN && Game.time % 5 == 0) {

            global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_WORKER))

        }
    }
    else {//Workers above and on RCL4
        if (this.storage.store[RESOURCE_ENERGY] < C.STORAGE_BALANCER_START) {
            if (global.heap.rooms[this.name].workersParts < 1) {
                global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_WORKER))
            }
        }
        else if (global.heap.rooms[this.name].workersParts < this.storage.store[RESOURCE_ENERGY] / C.UPGRADE_FACTOR) {
            global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_WORKER))
        }
    }



    global.heap.rooms[this.name].areHarvestingNeedsSatisfied = areHarvestersSatisfied && areCarriersSatisfied

    console.log(global.heap.rooms[this.name].areHarvestingNeedsSatisfied)
    //Claimer and colonizers
    if (global.heap.rooms[this.name].areHarvestingNeedsSatisfied || true) {
        for (rc of Memory.roomsToColonize) {
            if (rc.colonizer = this.name) {
                if (global.heap.rooms[rc.name].claimer == undefined) {
                    global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(rc.name, C.ROLE_CLAIMER))
                    console.log("Adding claimer for: ", rc.name, " to civilian queue")
                    break;
                }
                else if (global.heap.rooms[rc.name].colonizers.length < global.heap.rooms[rc.name].maxColonizers) {
                    global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(rc.name, C.ROLE_COLONIZER))
                    console.log("Adding colonizer for: ", rc.name, " to civilian queue")
                    break;
                }
                

            }

        }
    }



    // Reservers
    if (this.controller.level >= 3) {
        if (this.memory.harvestingRooms != undefined) {
            for (room of this.memory.harvestingRooms) {
                if (room.reserverId == undefined && room.name != this.name) {
                    global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(room.name, C.ROLE_RESERVER))
                }
            }
        }

    }

    //Rampart Repairers - civilian queue
    //asdasdasdasd
    if (global.heap.rooms[this.name].requiredRampartsRepairersPower > global.heap.rooms[this.name].rampartRepairersPower) {
        if (global.heap.rooms[this.name].state.includes(C.STATE_UNDER_ATTACK)) {//Add to defensive queue
            global.heap.rooms[this.name].defensiveQueue.push(new generalRoomRequest(this.name, C.ROLE_RAMPART_REPAIRER))
        }
        else {//Add to civilian queue
            global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_RAMPART_REPAIRER))
        }

    }


    if (this.storage != undefined && global.heap.rooms[this.name].resourceManagerId == undefined) {
        global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_RESOURCE_MANAGER))
    }

    //Soldiers
    if (this.memory.harvestingRooms != undefined) {
        for (r of this.memory.harvestingRooms) {
            if (global.heap.rooms[r.name] != undefined && (global.heap.rooms[r.name].hostiles.length > 0 || global.heap.rooms[r.name].hostileStructures.length > 0)) {

                var ifNeedMelee = false;
                if (global.heap.rooms[r.name].hostiles.length == 0 && global.heap.rooms[r.name].hostileStructures.length > 0) {
                    ifNeedMelee = true
                }
                if (global.heap.rooms[r.name].myAttackPower + global.heap.rooms[r.name].myRangedAttackPower <= global.heap.rooms[r.name].hostileHealPower
                    || global.heap.rooms[r.name].myAttackPower + global.heap.rooms[r.name].myRangedAttackPower == 0
                ) {
                    global.heap.rooms[this.name].defensiveQueue.push(new soldierRequest(r.name, C.ROLE_SOLDIER, ifNeedMelee))


                }
            }
        }
    }








    console.log("defensiveQueue:")
    for (a of global.heap.rooms[this.name].defensiveQueue) {
        console.log(a.type)
    }

    console.log("civilian queue")
    for (a of global.heap.rooms[this.name].civilianQueue) {
        console.log(a.type)
    }

    console.log("harvestingQueue")
    for (a of global.heap.rooms[this.name].harvestingQueue) {
        console.log(a.type)
    }



}