const C = require('constants');
const creepsTasks=require('creepsTasks')

localHeap={}

Creep.prototype.roleRampartRepairer = function roleRampartRepairer()
{

    if(this.store[RESOURCE_ENERGY]==0)
    {
        localHeap.task=C.TASK_COLLECT
        this.memory.task=C.TASK_COLLECT
    }
    else if(this.store.getFreeCapacity(RESOURCE_ENERGY)==0)
    {
        localHeap.task=C.TASK_REPAIR_RAMPARTS
        this.memory.task=C.TASK_REPAIR_RAMPARTS
    }

    if(this.memory.task==C.TASK_COLLECT)
    {
        this.taskCollect()
    }

    if(this.memory.task==C.TASK_REPAIR_RAMPARTS)
    {
        this.taskRepairRamparts();
    }
}