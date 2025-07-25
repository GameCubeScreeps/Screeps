
const Movement = require('screeps-movement');
const C=require('constants');



//TODO
// add finding (in roomManager) myDamagedCreeps (and allied damaged creeps) and healing them


localheap={}

Creep.prototype.roleColonizer = function roleColonizer() {

    
    if(this.room.name!=this.memory.targetRoom)
    {
         this.travelTo(new RoomPosition(25,25,this.memory.targetRoom), { range:21, avoidHostile: true, avoidCreeps: true, avoidSk: true, avoidHostileRooms: true})
    }
    else{
        this.colonizerGetTask()
        this.say(this.memory.task)
        console.log("COLONIZER DEBUGGING")
        console.log("global.heap.rooms[",this.memory.targetRoom,"]:",global.heap.rooms[this.memory.targetRoom]==undefined)
        console.log("global.heap.rooms[",this.memory.targetRoom,"].construction:",global.heap.rooms['W3N7'].construction)
        global.heap.rooms[this.memory.targetRoom].test="test"
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
        if (global.heap.rooms[this.memory.targetRoom].construction != undefined && global.heap.rooms[this.memory.targetRoom].construction.length > 0) {
            this.memory.task = C.TASK_BUILD;
            this.say("BUILD")
        }
        else {
            this.memory.task = C.TASK_UPGRADE;
        }
    }
}
