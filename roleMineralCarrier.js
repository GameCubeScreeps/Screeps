const C=require('constants')


localHeap={}
Creep.prototype.roleMineralCarrier = function roleMineralCarrier()
{
    

    if(this.store.getUsedCapacity()==0) 
    {// is empty
        localHeap.task=C.TASK_COLLECT_MINERAL
    }
    else if(this.store.getFreeCapacity(RESOURCE_ENERGY)==0)
    {//is full
        localHeap.task=C.TASK_STORE_MINERAL
    }


    if(localHeap.task==C.TASK_COLLECT_MINERAL)
    {
        this.taskCollectMineral()
    }
    else if(localHeap.task==C.TASK_STORE_MINERAL)
    {
        this.taskStoreMineral(localHeap.storage)
    }
}