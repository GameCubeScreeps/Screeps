
const Movement = require('screeps-movement');
const C=require('constants');
const { TASK_HARVEST } = require('./constants');



//TODO
// add finding (in roomManager) myDamagedCreeps (and allied damaged creeps) and healing them


localheap={}

Creep.prototype.roleColonizer = function roleColonizer() {

    if(this.room.name!=this.memory.targetRoom)
    {
        this.travelTo(25,25,this.memory.targetRoom)
    }
    else{
        this.colonizerGetTask()

        if(this.memory.task==C.TASK_HARVEST)
        {
            this.taskHarvest(localheap)
        }
        else if(this.memory.task==C.TASK_BUILD)
        {
            this.taskBuild(localheap)
        }
        else if(this.memory.task==C.TASK_UPGRADE)
        {
            this.taskUpgrade(localheap) 
        }

    }



};

Creep.prototype.colonizerGetTask=function colonizerGetTask() {
    if (this.store[RESOURCE_ENERGY] == 0) {
        this.memory.task = C.TASK_HARVEST;
    }
    if (this.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
        if (global.heap.rooms[this.room.name].construction != undefined && global.heap.rooms[this.room.name].construction.length > 0) {
            this.memory.task = C.TASK_BUILD;
        }
        else {
            this.memory.task = C.TASK_UPGRADE;
        }
    }
}
