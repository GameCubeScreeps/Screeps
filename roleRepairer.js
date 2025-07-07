var roleWorker = require('roleWorker');
const Movement = require('screeps-movement');
const C = require('constants')
//const getMaxEnergyDeposit = require("getMaxEnergyDeposit");

localHeap = {}

Creep.prototype.roleRepairer = function roleRepairer() {

    if(Game.rooms[this.memory.homeRoom].memory.harvestingRooms!=undefined)
    {
        for (harvestingRoom of Game.rooms[this.memory.homeRoom].memory.harvestingRooms) {
            if (harvestingRoom.name == this.memory.targetRoom) {
                harvestingRoom.repairerId = this.id
                break;
            }
        }
    }
    

    if (this.room.name == this.memory.targetRoom) {


        if (this.store[RESOURCE_ENERGY] == 0) {
            this.taskCollect(localHeap)
        }
        else if (((global.heap.rooms[this.memory.targetRoom].damagedStructuresId != undefined && global.heap.rooms[this.memory.targetRoom].damagedStructuresId.length < 1) || global.heap.rooms[this.memory.targetRoom].damagedStructuresId == undefined)) {
            //this.move(BOTTOM)
            this.taskBuild(localHeap)
        }
        else if (global.heap.rooms[this.memory.targetRoom].damagedStructuresId != undefined && global.heap.rooms[this.memory.targetRoom].damagedStructuresId.length >= 1) {



            if (global.heap.rooms[this.memory.targetRoom].damagedStructuresId != undefined && global.heap.rooms[this.memory.targetRoom].damagedStructuresId.length > 0) {

                //var closest_target = this.pos.findClosestByRange(targets);

                if (localHeap.targetStructureId != undefined && Game.getObjectById(localHeap.targetStructureId) == null) {
                    localHeap.targetStructureId = undefined
                }

                if (localHeap.targetStructureId == undefined) {
                    localHeap.targetStructureId = global.heap.rooms[this.memory.targetRoom].damagedStructuresId[0];//take first structure
                }

                if (localHeap.targetStructureId != undefined) {
                    var targetStructure = Game.getObjectById(localHeap.targetStructureId)
                    if (targetStructure != null && targetStructure.hits < targetStructure.hitsMax) {
                        if (this.repair(targetStructure) == ERR_NOT_IN_RANGE) {
                            this.moveTo(targetStructure, { visualizePathStyle: { stroke: 'red' }, reusePath: 17, maxRooms: 1 });
                            //move_avoid_hostile(this, closest_target.pos, 2, false);
                        }
                    }
                    else {
                        localHeap.targetStructureId = undefined;
                        global.heap.rooms[this.memory.targetRoom].damagedStructuresId = undefined;
                    }
                }



            }
            /*
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
            */
        }

    }
    else {
        if (this.memory.targetRoom != undefined) {
            this.moveTo(new RoomPosition(25, 25, this.memory.targetRoom), { reusePath: 17 });
        }


        //move_avoid_hostile(this, new RoomPosition(25, 25, this.memory.targetRoom), 5, if_avoid);
    }




};

