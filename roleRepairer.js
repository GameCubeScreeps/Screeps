var roleWorker = require('roleWorker');
const Movement = require('screeps-movement');
const C = require('constants')
//const getMaxEnergyDeposit = require("getMaxEnergyDeposit");

localHeap={}

Creep.prototype.roleRepairer = function roleRepairer() {


    for(harvestingRoom of Game.rooms[this.memory.homeRoom].memory.harvestingRooms)
    {
        if(harvestingRoom.name==this.memory.targetRoom)
        {
            harvestingRoom.repairerId=this.id
            break;
        }
    }

    if (this.room.name == this.memory.targetRoom) {

        /*
        if(this.memory.targetRoom==spawn.room.name && spawn.memory.state!=undefined && spawn.memory.state.includes("STATE_UNDER_ATTACK"))
        {
            this.say("rep")
            this.roleRampartRepairer(this, spawn);
            return;
        }
            */

        /*
        // FINDING ALL STRUCTURES
        if (this.memory.all_structures_id != undefined && this.memory.all_structures_id.length > 0) {
            for (let id of this.memory.all_structures_id) {
                if (Game.getObjectById(id) == null) {
                    this.memory.all_structures_id = undefined;
                    break;
                }
            }
        }
        if (this.memory.all_structures_id == undefined) {
            var all_structures_id = this.room.find(FIND_STRUCTURES, {
                filter: function (object) {
                    return object.structureType != STRUCTURE_RAMPART && object.ticksToDecay != undefined;
                }
            });

            if (all_structures_id != undefined && all_structures_id.length > 0) {
                this.memory.all_structures_id = []
                for (let str of all_structures_id) {
                    this.memory.all_structures_id.push(str.id)
                }
            }
        }


        //FINDING DAMAGED STRUCTURES
        if (this.memory.all_structures_id != undefined && this.memory.all_structures_id.length > 0) {
            if (global.heap.rooms[this.memory.targetRoom].damagedStructuresId != undefined) {
                for (let str_id of global.heap.rooms[this.memory.targetRoom].damagedStructuresId) {
                    if (Game.getObjectById(str_id) == null) {
                        global.heap.rooms[this.memory.targetRoom].damagedStructuresId = undefined;
                        break;
                    }
                }
            }
            if (global.heap.rooms[this.memory.targetRoom].damagedStructuresId == undefined && Game.time % 7 == 0) {
                global.heap.rooms[this.memory.targetRoom].damagedStructuresId = [];
                for (let str of this.memory.all_structures_id) {
                    if ((Game.getObjectById(str).hits < Game.getObjectById(str).hitsMax * 0.7 && Game.getObjectById(str).structureType!=STRUCTURE_CONTAINER)
                    || (Game.getObjectById(str).hits < Game.getObjectById(str).hitsMax*0.8 && Game.getObjectById(str).structureType==STRUCTURE_CONTAINER)) {
                        global.heap.rooms[this.memory.targetRoom].damagedStructuresId.push(str)
                    }
                }
            }
        }
        */

        /*
        //FINDING CONTAINERS
        if (this.memory.containers != undefined) {
            if (this.memory.containers.length == undefined || this.memory.containers.length == 0) { this.memory.containers = undefined }

            for (containerId in this.memory.containers) {
                if (Game.getObjectById(containerId) == null) {
                    this.memory.containers = undefined
                    break;
                }
            }
        }
        if (this.memory.containers == undefined && this.store[RESOURCE_ENERGY] == 0) {
            var containers = this.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_STORAGE;
                }
            });
            this.memory.containers = [];
            if (containers != undefined && containers.length > 0) {
                for (container of containers) {
                    this.memory.containers.push(container.id)
                }

            }
        }
    */




        if (((global.heap.rooms[this.memory.targetRoom].damagedStructuresId != undefined && global.heap.rooms[this.memory.targetRoom].damagedStructuresId.length < 1) || global.heap.rooms[this.memory.targetRoom].damagedStructuresId==undefined) && this.name.startsWith('Builder') == false) {
            //this.move(BOTTOM)
            //this.say("b");
            global.heap.rooms[this.memory.targetRoom].damagedStructuresId = undefined
            this.roleWorker();
        }
        else if (global.heap.rooms[this.memory.targetRoom].damagedStructuresId != undefined && global.heap.rooms[this.memory.targetRoom].damagedStructuresId.length >= 1) {

           
            localHeap.repairing = true;

            if (localHeap.repairing && this.store[RESOURCE_ENERGY] == 0) {
                localHeap.repairing = false;

            }
            //console.log("wolne miejsce: ",this.store.getFreeCapacity());
            if (localHeap.repairing == false && this.store.getFreeCapacity() == 0) { // go repair
                localHeap.repairing = true;
            }

            if (localHeap.repairing) {

                if (global.heap.rooms[this.memory.targetRoom].damagedStructuresId != undefined && global.heap.rooms[this.memory.targetRoom].damagedStructuresId.length >0) {

                    //var closest_target = this.pos.findClosestByRange(targets);

                    if(localHeap.targetStructureId!=undefined && Game.getObjectById(localHeap.targetStructureId)==null)
                    {
                        localHeap.targetStructureId=undefined
                    }

                    if(localHeap.targetStructureId==undefined)
                    {
                        localHeap.targetStructureId=global.heap.rooms[this.memory.targetRoom].damagedStructuresId[0];//take first structure
                    }

                    if (localHeap.targetStructureId != undefined) {
                        var targetStructure = Game.getObjectById(localHeap.targetStructureId)
                        if (targetStructure != null && targetStructure.hits < targetStructure.hitsMax) {
                            if (this.repair(targetStructure) == ERR_NOT_IN_RANGE) {
                                this.moveTo(targetStructure, { visualizePathStyle: { stroke: 'red' }, reusePath: 17,maxRooms:1 });
                                //move_avoid_hostile(this, closest_target.pos, 2, false);
                            }
                        }
                        else {
                            localHeap.targetStructureId = undefined;
                            global.heap.rooms[this.memory.targetRoom].damagedStructuresId=undefined;
                        }
                    }


                }
            }
            else if (this.store[RESOURCE_ENERGY] == 0 && Game.rooms[this.memory.targetRoom].memory.containers!=undefined && Game.rooms[this.memory.targetRoom].memory.containers.length > 0) {// go to deposits
                var containers = [];
                for (containerId of Game.rooms[this.memory.targetRoom].memory.containers) {
                    if (Game.getObjectById(containerId) != null && Game.getObjectById(containerId).store[RESOURCE_ENERGY] > 0) {
                        containers.push(Game.getObjectById(containerId))
                    }

                }
                var source = this.pos.findClosestByRange(containers);
                var  withdrawResult=this.withdraw(source, RESOURCE_ENERGY)
                if (withdrawResult == ERR_NOT_IN_RANGE) {
                    this.moveTo(source, { reusePath: 17,maxRooms:1 });
                }

            }
            else if (this.store[RESOURCE_ENERGY] == 0) {
                const droppedEnergy = this.room.find(FIND_DROPPED_RESOURCES, {
                    filter: resource => resource.resourceType == RESOURCE_ENERGY
                })
                const closestDroppedEnergy = this.pos.findClosestByRange(droppedEnergy)
                if (droppedEnergy.length > 0) {
                    if (this.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) {
                        // Move to it
                        this.moveTo(closestDroppedEnergy, { visualizePathStyle: { stroke: '#ffaa00' }, reusePath: 17,maxRooms:1 });
                        //move_avoid_hostile(this, closestDroppedEnergy.pos)
                    }
                }
            }
        }

    }
    else {
        if (this.memory.targetRoom != undefined) {
            this.moveTo(new RoomPosition(25, 25, this.memory.targetRoom), { reusePath: 17 });
        }


        //move_avoid_hostile(this, new RoomPosition(25, 25, this.memory.targetRoom), 5, if_avoid);
    }




};

