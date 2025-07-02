
// Every constant definied in separate file
const C = require('constants');
const Movement = require('screeps-movement');
const sleep = require('creepSleep')

Creep.prototype.roleCarrier = function roleCarrier() {

    /*Creep needs:
   Mandatory:
   Creep.memory.targetRoom - roomName in which is his source
   Creep.memory.sourceId - id of source from which collect 
    
   

    Will Calculate in its own:
    this.memory.targetRoomContainers - containers in targetRoom
    this.memory.closestHomeContainer - container or storage in homeRoom

    Creep.memory.spawnId - id of homeRoom spawn

   */

    if (this.memory.boostingList == undefined) {
        //this.memory.boostingList = ["KH", "KH2O", "XKH2O"];//boost types that creep accepts
        this.memory.boostingList = []
    }
    if (true /*boosting_driver(this, spawn, this.memory.boostingList, CARRY) == -1 */) {




        for (src of Game.rooms[this.memory.homeRoom].memory.harvestingSources) {
            //console.log(src.id)
            if (src.id == this.memory.sourceId) {

                src.carryPower += this.store.getCapacity() / (src.distance * 2);
                break;
            }
        }

        if (this.memory.spawnId != undefined && Game.getObjectById(this.memory.spawnId) == null) {
            this.memory.spawnId = undefined
        }

        var spawn = null;
        if (this.memory.spawnId != undefined && Game.getObjectById(this.memory.spawnId) != null) {
            spawn = Game.getObjectById(this.memory.spawnId)
        }


        if (this.memory.spawnId == undefined) {
            spawn = Game.rooms[this.memory.homeRoom].find(FIND_MY_STRUCTURES, {
                filter: function (str) {
                    return str.structureType === STRUCTURE_SPAWN && str.name.endsWith('1')
                }
            })
            if (spawn.length > 0) {
                this.memory.spawnId = spawn[0].id
            }
        }


        if (this.memory.targetRoomContainers != undefined && this.memory.targetRoomContainers.length > 0) {
            for (let i = 0; i < this.memory.targetRoomContainers.length; i++) {
                if (Game.getObjectById(this.memory.targetRoomContainers[i]) == null) {
                    this.memory.targetRoomContainers = undefined;
                    break;
                }
            }
        }

        if (this.store.getFreeCapacity() == 0 || this.ticksToLive < this.memory.sourceDistance * 1.1) {
            this.memory.collecting = false;
        }
        else if (this.store.getUsedCapacity(RESOURCE_ENERGY) == 0 || this.memory.collecting == undefined) {
            this.memory.collecting = true;
            this.memory.closestHomeContainer = undefined;
        }



        // define containers from which creep should withdraw resources
        if (this.memory.targetRoomContainers == undefined ||
            (this.memory.targetRoomContainers != undefined && this.memory.targetRoomContainers.length == 0)) {

            if (this.memory.targetRoom == this.memory.homeRoom) {
                //if creep.target_room is creep.home_room
                var spawnPos = Game.rooms[this.room.name].memory.spawnPos
                var containers = this.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType === STRUCTURE_CONTAINER
                            && ((structure.pos.x != spawnPos.x - 2 || structure.pos.y != spawnPos.y - 2) &&
                                (structure.pos.x != spawnPos.x + 2 || structure.pos.y != spawnPos.y - 2))
                            && (structure.pos.inRangeTo(Game.rooms[this.memory.homeRoom].controller.pos, 4) == false);
                    }
                });
                this.memory.targetRoomContainers = [];
                for (let i = 0; i < containers.length; i++) {
                    this.memory.targetRoomContainers.push(containers[i].id);
                }

            }
            else {
                //get containers of target_room
                if (Game.rooms[this.memory.targetRoom] != undefined) {
                    var containers = Game.rooms[this.memory.targetRoom].find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return structure.structureType === STRUCTURE_CONTAINER;
                        }
                    });
                    this.memory.targetRoomContainers = [];
                    for (let i = 0; i < containers.length; i++) {
                        this.memory.targetRoomContainers.push(containers[i].id);
                    }
                }

            }

        }


        if (this.memory.collecting) {// if creep have free space


            if ((Game.rooms[this.memory.targetRoom] == undefined || this.pos.inRangeTo(spawn, 4))
                && global.heap.rooms[this.memory.homeRoom].defensiveQueue != undefined &&
                !global.heap.rooms[this.memory.homeRoom].defensiveQueue.some(obj => obj.type === C.ROLE_SOLDIER)
            ) {
                const destination = new RoomPosition(25, 25, this.memory.targetRoom);
                this.moveTo(destination, { reusePath: 25, avoidCreeps: true });
            }
            if (this.memory.targetRoomContainers != undefined && this.memory.targetRoomContainers.length > 0) {// find max_container and take resources from it or go sleep

                //finding max_container
                if (this.memory.maxContainer == undefined) {
                    var biggest_resource = 0;
                    for (let i = 0; i < this.memory.targetRoomContainers.length; i++) {
                        var container = Game.getObjectById(this.memory.targetRoomContainers[i]);
                        if (container.store.getUsedCapacity() > biggest_resource) {
                            this.memory.maxContainer = container.id;
                            biggest_resource = container.store.getUsedCapacity();
                        }
                    }
                }
                else if (Game.getObjectById(this.memory.maxContainer) != null) {
                    if (Game.getObjectById(this.memory.maxContainer).store.getUsedCapacity() == 0) {
                        this.memory.maxContainer = undefined;
                    }
                }
                else {
                    this.memory.maxContainer = undefined;
                }


                if (this.memory.maxContainer != undefined && Game.getObjectById(this.memory.maxContainer) != null) {
                    // take all resources from container
                    for (let resource in Game.getObjectById(this.memory.maxContainer).store) {
                        if (this.withdraw(Game.getObjectById(this.memory.maxContainer), resource) == ERR_NOT_IN_RANGE
                            || this.pos.inRangeTo(spawn, 4)) {
                            this.moveTo(Game.getObjectById(this.memory.maxContainer).pos, { reusePath: 21, avoidCreeps: true });
                            break;
                        }
                    }

                    if (Game.getObjectById(this.memory.maxContainer).store.getUsedCapacity() < (this.store.getCapacity() - this.store.getUsedCapacity()) * 0.8 && Game.getObjectById(this.memory.maxContainer).store.getUsedCapacity() < 2000) {
                        if (this.store[RESOURCE_ENERGY] == 0) {
                            var avoid = [];
                            if (this.pos.inRangeTo(spawn, 3)) {
                                avoid.push(spawn)
                            }
                            if (this.room.storage != undefined && this.pos.inRangeTo(this.room.storage, 3)) {
                                avoid.push(this.room.storage)
                            }
                            if (this.memory.homeContainer != undefined && Game.getObjectById(this.memory.homeContainer) != null &&
                                this.pos.inRangeTo(Game.getObjectById(this.memory.homeContainer), 3)) {
                                avoid.push(Game.getObjectById(this.memory.homeContainer));
                            }

                            if (avoid.length == 0 && this.pos.inRangeTo(Game.getObjectById(this.memory.maxContainer).pos.x, Game.getObjectById(this.memory.maxContainer).pos.y, 3)) {
                                this.sleep(((this.store.getCapacity() - this.store.getUsedCapacity()) - Game.getObjectById(this.memory.maxContainer).store.getUsedCapacity()) / 25);

                            }

                        }
                    }
                }


            }
            else {// no containers - look for dropped resources, if no resource go sleep

                if (this.memory.resourceToCollect == undefined && this.memory.targetRoom != undefined && Game.rooms[this.memory.targetRoom] != undefined) {

                    var carrierCapacity = this.store.getCapacity()
                    var carrierUsedCapacity = this.store.getUsedCapacity()
                    var dropped_resource = undefined
                        var dropped_resource = Game.rooms[this.memory.targetRoom].find(FIND_DROPPED_RESOURCES, {
                            filter: function (resource) {
                                return resource.amount >= carrierCapacity - carrierUsedCapacity
                            }
                        });
                    

                    if (dropped_resource != undefined && dropped_resource != null && dropped_resource.length > 0) {
                        // var closest_resource = this.pos.findClosestByPath(dropped_resource);
                        var max_res_amount = 0;
                        var max_res_id = undefined;
                        for (let a of dropped_resource) {
                            if (a.amount > max_res_amount) {
                                max_res_amount = a.amount;
                                max_res_id = a.id;
                            }
                        }
                        if (max_res_id != null) {
                            this.memory.resourceToCollect = max_res_id;
                        }

                    }
                    if (this.store[RESOURCE_ENERGY] == 0) {
                        var avoid = [];
                        if (this.pos.inRangeTo(spawn, 3)) {
                            avoid.push(spawn)
                        }
                        if (this.room.storage != undefined && this.pos.inRangeTo(this.room.storage, 3)) {
                            avoid.push(this.room.storage)
                        }
                        if (this.memory.homeContainer != undefined && Game.getObjectById(this.memory.homeContainer) != null &&
                            this.pos.inRangeTo(Game.getObjectById(this.memory.homeContainer), 3)) {
                            avoid.push(Game.getObjectById(this.memory.homeContainer));
                        }

                        if (avoid.length == 0) {
                            this.sleep(20);
                        }
                    }

                }


                if (this.memory.resourceToCollect != undefined) {
                    if (Game.getObjectById(this.memory.resourceToCollect) != null) {
                        this.memory.maxContainer = undefined;
                        if (this.pickup(Game.getObjectById(this.memory.resourceToCollect)) == ERR_NOT_IN_RANGE
                            || this.pos.inRangeTo(spawn, 4)) {
                            this.moveTo(Game.getObjectById(this.memory.resourceToCollect), { reusePath: 21, avoidCreeps: true });
                        }
                    }
                    else {
                        delete this.memory.resourceToCollect;
                    }
                    return;
                }

            }

            var avoid = [];
            if (this.pos.inRangeTo(spawn, 3)) {
                avoid.push(spawn)
            }
            if (this.room.storage != undefined && this.pos.inRangeTo(this.room.storage, 3)) {
                avoid.push(this.room.storage)
            }
            if (this.memory.homeContainer != undefined && Game.getObjectById(this.memory.homeContainer) != null &&
                this.pos.inRangeTo(Game.getObjectById(this.memory.homeContainer), 3)) {
                avoid.push(Game.getObjectById(this.memory.homeContainer));
            }

            if (avoid.length > 0 && (Game.getObjectById(this.memory.maxContainer) != null && Game.getObjectById(this.memory.maxContainer).store.getUsedCapacity() < (this.store.getCapacity() - this.store.getUsedCapacity()) * 0.8 && Game.getObjectById(this.memory.maxContainer).store.getUsedCapacity() < 2000) == true) {
                
                this.fleeFrom(avoid, 3);
            }

        }
        else {//creep is full - go home_room_container
            if (Game.rooms[this.memory.homeRoom].storage != undefined && Game.rooms[this.memory.homeRoom].controller.level >= 4) {
                // if home_room have storage
                this.memory.homeContainer = Game.rooms[this.memory.homeRoom].storage.id;
            }
            else {
                //if(this.memory.targetRoom!=this.memory.homeRoom)
                //{
                if (this.memory.homeContainer != undefined && Game.getObjectById(this.memory.homeContainer) == null
                    || (this.memory.homeContainer != undefined &&
                        Game.getObjectById(this.memory.homeContainer).store.getCapacity() - Game.getObjectById(this.memory.homeContainer).store.getUsedCapacity() == 0)) {
                    this.memory.homeContainer = undefined
                }
                var spawnPos = Game.rooms[this.room.name].memory.spawnPos
                //find containers that are fillers containers or controller container
                if (spawnPos != undefined) {
                    var container = this.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return structure.store != undefined && structure.store.getCapacity() - structure.store.getUsedCapacity() > 0
                                && structure.structureType != STRUCTURE_TERMINAL &&
                                ((structure.structureType == STRUCTURE_CONTAINER && structure.pos.x == spawnPos.x + 2 && structure.pos.y == spawnPos.y - 2)
                                    || (structure.structureType == STRUCTURE_CONTAINER && structure.pos.x == spawnPos.x - 2 && structure.pos.y == spawnPos.y - 2)
                                    || structure.structureType == STRUCTURE_CONTAINER && structure.pos.inRangeTo(Game.rooms[this.memory.homeRoom].controller, 4));
                        }
                    });
                    if (container != null) {
                        this.memory.homeContainer = container.id;
                    }
                    else if (spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                        //target room do not have containers - store in spawn
                        this.memory.homeContainer = spawn.id;
                    }
                    else if (global.heap.rooms[this.memory.homeRoom].myWorkers != undefined && global.heap.rooms[this.memory.homeRoom].myWorkers.length > 0) {

                        // no free space in any structure - put energy into random worker
                        var workersAmount = global.heap.rooms[this.memory.homeRoom].myWorkers.length
                        this.memory.homeContainer = global.heap.rooms[this.memory.homeRoom].myWorkers[Math.random(workersAmount)]
                        if (Game.rooms[this.memory.homeRoom].memory.energyBalance != undefined) {
                            Game.rooms[this.memory.homeRoom].memory.energyBalance += C.BALANCER_CARRIER_STEP
                        }

                    }
                    else{
                        if (Game.rooms[this.memory.homeRoom].memory.energyBalance != undefined) {
                            Game.rooms[this.memory.homeRoom].memory.energyBalance += 2*C.BALANCER_CARRIER_STEP
                        }
                        this.moveTo(new RoomPosition(spawnPos.x,spawnPos.y,this.memory.homeRoom),{reusePath: 20, range: 8})
                        
                    }
                }
                else{
                    this.moveTo(new RoomPosition(25,25,this.memory.homeRoom),{reusePath: 20, range: 8})
                }

                //}
            }
            if (this.memory.homeContainer != undefined && Game.getObjectById(this.memory.homeContainer) != null) {

                //testing - it might be a bad idea - passing energy to workers
                if (Game.rooms[this.memory.homeRoom].memory.energyBalance > C.ENERGY_BALANCER_UPGRADER_START) {
                    for (w of global.heap.rooms[this.memory.homeRoom].myWorkers) {
                        var worker = Game.getObjectById(w)
                        if (worker == null) { continue; }
                        if (worker.pos.isNearTo(this.pos) && worker.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                            var transferResut = this.transfer(worker, RESOURCE_ENERGY)
                            if (transferResut == OK && this.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
                                this.memory.collecting = true;
                                return;
                            }
                        }
                    }
                }





                ///

                if (Game.getObjectById(this.memory.homeContainer).structureType == STRUCTURE_STORAGE) {
                    for (let res in this.store) {
                        var amount = this.store[RESOURCE_ENERGY]
                        var transferResut = this.transfer(Game.getObjectById(this.memory.homeContainer), res);
                        if (transferResut == ERR_NOT_IN_RANGE) {
                            this.moveTo(Game.getObjectById(this.memory.homeContainer), { reusePath: 21, avoidSk: true, avoidCreeps: true });
                            break;
                        }
                        else if (transferResut == OK) {

                            /*
                            if (Game.rooms[this.memory.homeRoom].memory.delivered_energy == undefined) {
                                Game.rooms[this.memory.homeRoom].memory.delivered_energy = this.store[RESOURCE_ENERGY]
                            }
                            else {
                                Game.rooms[this.memory.homeRoom].memory.delivered_energy += this.store[RESOURCE_ENERGY]
                            }*/
                            this.memory.maxContainer = undefined;
                        }
                    }
                }
                else {
                    for (let res in this.store) {

                        var transferResut = this.transfer(Game.getObjectById(this.memory.homeContainer), res);
                        if (Game.getObjectById(this.memory.homeContainer) != null && Game.getObjectById(this.memory.homeContainer).store.getFreeCapacity(RESOURCE_ENERGY) == 0) {

                            if (Game.rooms[this.memory.homeRoom].memory.energyBalance != undefined) {
                                Game.rooms[this.memory.homeRoom].memory.energyBalance += C.BALANCER_CARRIER_STEP
                            }

                            this.fleeFrom([Game.getObjectById(this.memory.homeContainer)], 3)
                            //this.drop(RESOURCE_ENERGY)
                            this.memory.homeContainer = undefined
                            break;
                        }
                        if (transferResut == ERR_NOT_IN_RANGE) {

                            this.moveTo(Game.getObjectById(this.memory.homeContainer), { reusePath: 21, avoidSk: true, avoidCreeps: true });

                            break;
                        }
                        else if (transferResut == ERR_FULL) {

                            this.memory.maxContainer = undefined;
                            if (Game.rooms[this.memory.homeRoom].memory.delivered_energy == undefined) {
                                Game.rooms[this.memory.homeRoom].memory.delivered_energy = this.store[RESOURCE_ENERGY]
                            }
                            else if (Game.rooms[this.memory.homeRoom].memory.energyBalance != undefined) {
                                Game.rooms[this.memory.homeRoom].memory.energyBalance += C.BALANCER_CARRIER_STEP
                            }
                            

                            //this.drop(RESOURCE_ENERGY)

                        }
                        else if (transferResut == OK) {

                            this.memory.maxContainer = undefined;
                        }
                        /*
                        if (this.pos.inRangeTo(Game.getObjectById(this.memory.homeContainer), 3)
                            && !this.pos.isNearTo(Game.getObjectById(this.memory.homeContainer))) {
                            var empty_carriers = this.pos.findInRange(FIND_MY_CREEPS, 1, {
                                filter:
                                    function (cr) {
                                        return cr.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                                    }
                            })
                            if (empty_carriers.length > 0) {

                                this.transfer(empty_carriers[0], RESOURCE_ENERGY)
                            }
                        }
                            */

                    }
                }
            }
        }



    }

};