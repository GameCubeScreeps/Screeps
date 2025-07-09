var roleWorker = require('roleWorker');
const Movement = require('screeps-movement');
const C = require('constants')
//const getMaxEnergyDeposit = require("getMaxEnergyDeposit");

localHeap = {}

Creep.prototype.roleRepairer = function roleRepairer() {

    if (Game.rooms[this.memory.homeRoom].memory.harvestingRooms != undefined) {
        for (harvestingRoom of Game.rooms[this.memory.homeRoom].memory.harvestingRooms) {
            if (harvestingRoom.name == this.memory.targetRoom) {
                harvestingRoom.repairerId = this.id
                break;
            }
        }
    }


    if (this.room.name == this.memory.targetRoom) {

        this.say(global.heap.rooms[this.memory.targetRoom].damagedStructuresId.length)
        if (this.store[RESOURCE_ENERGY] == 0) {
            this.taskCollect(localHeap)
        }
        else if (((global.heap.rooms[this.memory.targetRoom].damagedStructuresId != undefined && global.heap.rooms[this.memory.targetRoom].damagedStructuresId.length < 1) || global.heap.rooms[this.memory.targetRoom].damagedStructuresId == undefined)) {
            //this.move(BOTTOM)
            this.say("build")
            this.taskBuild(localHeap)
        }
        else {

            
            if (global.heap.rooms[this.memory.targetRoom].damagedStructuresId != undefined && global.heap.rooms[this.memory.targetRoom].damagedStructuresId.length > 0) {

                this.say("r")
                //var closest_target = this.pos.findClosestByRange(targets);

                if (localHeap.targetStructureId != undefined && Game.getObjectById(localHeap.targetStructureId) == null) {
                    localHeap.targetStructureId = undefined
                }

                if (localHeap.targetStructureId != undefined && Game.getObjectById(localHeap.targetStructureId) != null
                    && (Game.getObjectById(localHeap.targetStructureId).hits == Game.getObjectById(localHeap.targetStructureId).hitsMax
                || Game.getObjectById(localHeap.targetStructureId).room.name!=this.memory.targetRoom)) {
                    localHeap.targetStructureId = undefined
                }

                if (localHeap.targetStructureId == undefined) {
                    var aux = [];
                    for (id of global.heap.rooms[this.memory.targetRoom].damagedStructuresId) {
                        if (Game.getObjectById(id) != null && Game.getObjectById(id).room.name==this.memory.targetRoom
                            && Game.getObjectById(id).hits < Game.getObjectById(id).hitsMax) {
                            aux.push(Game.getObjectById(id))
                        }
                    }
                    var target = this.pos.findClosestByPath(aux)
                    if (target != null) {
                        localHeap.targetStructureId = target.id
                    }
                }

                if (localHeap.targetStructureId != undefined) {
                    var targetStructure = Game.getObjectById(localHeap.targetStructureId)
                    this.say(targetStructure.room.name)
                    if (targetStructure != null) {
                        if (this.repair(targetStructure) == ERR_NOT_IN_RANGE) {
                            this.moveTo(targetStructure, {  reusePath: 17, maxRooms: 1 });
                            //move_avoid_hostile(this, closest_target.pos, 2, false);
                        }
                    }
                    else {
                        localHeap.targetStructureId = undefined;

                    }
                }



            }
        }

    }
    else {
        if (this.memory.targetRoom != undefined) {
            this.moveTo(new RoomPosition(25, 25, this.memory.targetRoom), { reusePath: 17 });
        }

    }




};

