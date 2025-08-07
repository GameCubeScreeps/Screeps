const C=require('constants')


localHeap={}
Creep.prototype.roleMineralCarrier = function roleMineralCarrier()
{
    //localHeap.task=undefined
    console.log("localHeap.task before setting task: ",localHeap.task)
    if(this.store.getFreeCapacity(RESOURCE_ENERGY)>0 && this.ticksToLive>30)
    {//is full
        localHeap.task=C.TASK_COLLECT_MINERAL
    }
    else{
        localHeap.task=C.TASK_STORE_MINERAL
    }



    /*
    if(localHeap.task==C.FILL_TERMINAL_ENERGY)
    {
        this.say("!")
    }

    if(localHeap.task==undefined || localHeap.task==C.FILL_TERMINAL_ENERGY)
    {

        localHeap.task=C.TASK_COLLECT_MINERAL
    }
        */


    console.log("localHeap.task after setting task: ",localHeap.task)
    if(localHeap.task==C.TASK_COLLECT_MINERAL)
    {
        this.taskCollectMineral()
    }
    else if(localHeap.task==C.TASK_STORE_MINERAL)
    {
        this.taskStoreMineral(localHeap.storage)
    }
}