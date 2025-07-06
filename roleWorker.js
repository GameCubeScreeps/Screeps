//const { boosting_driver } = require('boosting_driver');
const C = require('constants')
const Movement = require('screeps-movement');
const creepsTasks = require('creepsTasks')


/*Creep needs:
   Mandatory:
   Creep.memory.homeRoom - roomName in which creep will operate
    
   Creep base its decisions on Game.rooms[this.memory.homeRoom].memory.energyBalance
   lower values means we are using more energy than harvesting
   higher value means we are harvesting more than using

    Will Calculate in its own:
    this.memory.workPartsNum - 
    this.memory.boosters - acceptable boosters - putting only upgrade controller for now
    localHeap.task - currently done task -> colelct/upgrade/build 

   */

localHeap = {}

Creep.prototype.roleWorker = function roleWorker() {

    

    if (this.memory.workPartsNum == undefined) {
        this.memory.workPartsNum = _.filter(this.body, { type: WORK }).length
    }




    if (this.memory.boosters == undefined) {
        this.memory.boosters = ["XGH2O"];//boost types that creep accepts
    }
    // else 
    if (true /*boosting_driver(creep, , this.memory.boosters, WORK) == -1 */) {

        if (this.room.name != this.memory.homeRoom) {
            //this condition allows sending workers to remote rooms
            this.moveTo(new RoomPosition(25, 25, this.memory.homeRoom))
            return
        }

        //this.say(localHeap.task)

        if (this.store.getUsedCapacity(RESOURCE_ENERGY) == 0
        ) {
            //this.say("Cla")
            localHeap.task = C.TASK_COLLECT
            this.memory.task = C.TASK_COLLECT
        }
        else {
            if (this.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && global.heap.rooms[this.memory.homeRoom].building == true
                && this.room.controller.ticksToDowngrade > (CONTROLLER_DOWNGRADE[this.room.controller.level]*C.CONTROLLER_DOWNGRADE_BOTTOM_LIMIT)) {

                //this.say("B")
                localHeap.task = C.TASK_BUILD
                this.memory.task = C.TASK_BUILD


            }
            else {
                //this.say("U")
                localHeap.task = C.TASK_UPGRADE
                this.memory.task = C.TASK_UPGRADE
            }
        }

        //console.log( this.room.controller.ticksToDowngrade ,"> ",(CONTROLLER_DOWNGRADE[this.room.controller.level]*C.CONTROLLER_DOWNGRADE_BOTTOM_LIMIT))




        if (localHeap.task == C.TASK_UPGRADE) // if upgrading go upgrade
        {
            //this.say("w1")
            if (this.taskUpgrade(localHeap) == -1) {
                localHeap.task = undefined
            }
            return;



        }
        else if (localHeap.task == C.TASK_COLLECT) {// go to deposits

            this.say("w2")
            if (this.taskCollect(localHeap) == -1) {
                //this.say("c->?")
                localHeap.task = undefined
                //this.say(localHeap.task)
            }
            return
        }
        else if (localHeap.task == C.TASK_BUILD) {

            //this.say("w3")
            this.taskBuild(localHeap)
            return;




        }

    }

}