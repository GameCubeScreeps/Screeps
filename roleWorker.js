//const { boosting_driver } = require('boosting_driver');
const C = require('constants')
const Movement = require('screeps-movement');

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

        if (this.store.getUsedCapacity() == 0 //&& Game.rooms[this.memory.homeRoom].memory.energyBalance!=undefined && Game.rooms[this.memory.homeRoom].memory.energyBalance>C.ENERGY_BALANCER_UPGRADER_START
        ) {
            localHeap.task = C.TASK_COLLECT
        }


        if (localHeap.task == undefined) {
            if (!(localHeap.task == C.TASK_UPGRADE && this.store.getUsedCapacity() > 0 && global.heap.rooms[this.memory.homeRoom].building == true
                && this.room.controller.ticksToDowngrade < (CONTROLLER_DOWNGRADE[this.room.controller.level]))) {
                if (global.heap.rooms[this.memory.homeRoom].building == true
            /*&& this.room.controller.ticksToDowngrade > (CONTROLLER_DOWNGRADE[this.room.controller.level] * C.CONTROLLER_DOWNGRADE_LIMIT)*/) {
                    localHeap.task = C.TASK_BUILD
                }
                else {
                    localHeap.task = C.TASK_UPGRADE
                }
            }
        }







        if (localHeap.task == C.TASK_UPGRADE) // if upgrading go upgrade
        {
            if (global.heap.rooms[this.memory.homeRoom].building == true &&
                this.room.controller.ticksToDowngrade > (CONTROLLER_DOWNGRADE[this.room.controller.level] * C.CONTROLLER_DOWNGRADE_TOP_LIMIT)
            ) {
                localHeap.task = C.TASK_BUILD
                return;

            }
            if (this.store.getUsedCapacity() == 0) {
                localHeap.task = undefined
            }
            if (!this.pos.isNearTo(this.room.controller)) {
                this.moveTo(this.room.controller, { maxStuck: 10 })
            }
            var upgradeResult = this.upgradeController(this.room.controller);
            //this.moveTo(this.room.controller, { reusePath: 17,maxRooms:1 });
            if (upgradeResult == ERR_NOT_IN_RANGE || upgradeResult == -9) {
                this.moveTo(this.room.controller, { reusePath: 17, maxRooms: 1 });
            }

            //Sharing energy
            if (this.store[RESOURCE_ENERGY] > 0 && global.heap.rooms[this.memory.homeRoom].myWorkers != undefined && global.heap.rooms[this.memory.homeRoom].myWorkers.length > 0) {
                for (a of global.heap.rooms[this.memory.homeRoom].myWorkers) {
                    cr = Game.getObjectById(a)
                    if (cr == null) { continue; }

                    if (cr != null && cr.store[RESOURCE_ENERGY] < this.store[RESOURCE_ENERGY] &&
                        (cr.pos.getMyRangeTo(this.room.controller.pos) < this.pos.getMyRangeTo(this.room.controller.pos)
                            || (Game.getObjectById(this.memory.deposit) != undefined && cr.pos.getMyRangeTo(Game.getObjectById(this.memory.deposit).pos) > this.pos.getMyRangeTo(Game.getObjectById(this.memory.deposit).pos))
                        )
                        && this.pos.getMyRangeTo(cr.pos) < 1.5) {

                        this.upgradeController(this.room.controller);
                        if (!this.pos.isNearTo(this.room.controller)) {
                            this.transfer(cr, RESOURCE_ENERGY)
                        }


                        break;
                    }
                }
            }


        }
        else if (localHeap.task == C.TASK_COLLECT) {// go to deposits

            if(this.store.getFreeCapacity(RESOURCE_ENERGY)==0)
            {
                localHeap.task=undefined
                return;
            }
            if (Game.getObjectById(this.memory.deposit) != null && Game.getObjectById(this.memory.deposit).store[RESOURCE_ENERGY] == 0 && Game.rooms[this.memory.homeRoom].memory.energyBalance != undefined) {
                Game.rooms[this.memory.homeRoom].memory.energyBalance -= C.BALANCER_WORKER_STEP
                this.memory.deposit = undefined
            }

            if ((this.memory.deposit != undefined && Game.getObjectById(this.memory.deposit) != null && Game.getObjectById(this.memory.deposit).store[RESOURCE_ENERGY] == 0
            /* && Game.getObjectById(this.memory.deposit).structureType != STRUCTURE_LINK*/)
                || (Game.getObjectById(Game.rooms[this.memory.homeRoom].memory.controllerLinkId) != null && Game.rooms[this.memory.homeRoom].memory.controllerLinkId != this.memory.deposit && Game.getObjectById(Game.rooms[this.memory.homeRoom].memory.controllerLinkId).store[RESOURCE_ENERGY] > 0)
                || (Game.rooms[this.memory.homeRoom].memory.controllerContainerId != undefined && Game.getObjectById(Game.rooms[this.memory.homeRoom].memory.controllerContainerId) != null && Game.rooms[this.memory.homeRoom].memory.controllerContainerId != this.memory.deposit && Game.getObjectById(Game.rooms[this.memory.homeRoom].memory.controllerContainerId).store[RESOURCE_ENERGY] > 0)) {



                this.memory.deposit = undefined;

            }

            if (Game.getObjectById(this.memory.deposit) == null) {
                this.memory.deposit = undefined
            }

            if (this.memory.deposit == undefined /*&& Game.time % 4 == 0*/) {

                if (Game.rooms[this.memory.homeRoom].memory.controllerLinkId != undefined && Game.getObjectById(Game.rooms[this.memory.homeRoom].memory.controllerLinkId) != null
                    && Game.getObjectById(Game.rooms[this.memory.homeRoom].memory.controllerLinkId).store[RESOURCE_ENERGY] > 0) {
                    this.memory.deposit = Game.rooms[this.memory.homeRoom].memory.controllerLinkId
                }
                else {


                    var deposits = this.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return structure.structureType === STRUCTURE_STORAGE &&
                                structure.store[RESOURCE_ENERGY] > C.STORAGE_ENERGY_UPGRADE_LIMIT;
                        }
                    });
                    deposits = deposits.concat(this.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return structure.structureType === STRUCTURE_CONTAINER
                                && structure.store[RESOURCE_ENERGY] >= this.store.getCapacity();
                        }
                    }));
                    this.say(deposits.length)
                    if (deposits.length == 0 && false) {
                        deposits = this.room.find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return structure.structureType === STRUCTURE_SPAWN &&
                                    structure.store[RESOURCE_ENERGY] > CARRY_CAPACITY;
                            }
                        });
                    }
                    else {
                        if (Game.rooms[this.memory.homeRoom].memory.energyBalance != undefined) {
                            Game.rooms[this.memory.homeRoom].memory.energyBalance -= C.BALANCER_WORKER_STEP

                        }
                    }
                    if (this.room.controller == undefined) { this.suicide() }

                    var deposit = this.room.controller.pos.findClosestByRange(deposits);
                    if (deposit != null) {

                        this.memory.deposit = deposit.id;
                    }
                    else {
                        if (Game.rooms[this.memory.homeRoom].memory.energyBalance != undefined) {
                            Game.rooms[this.memory.homeRoom].memory.energyBalance -= C.BALANCER_WORKER_STEP

                        }
                    }
                }
            }

            if (Game.getObjectById(this.memory.deposit) != null) {
                if ((this.room.controller.level >= 4 && this.room.storage != undefined && this.room.storage.store[RESOURCE_ENERGY] > C.STORAGE_ENERGY_UPGRADE_LIMIT && this.memory.deposit != undefined)
                    || (Game.rooms[this.memory.homeRoom].memory.energyBalance != undefined && Game.rooms[this.memory.homeRoom].memory.energyBalance > C.BALANCER_HARVEST_LIMIT)) {
                    if (this.withdraw(Game.getObjectById(this.memory.deposit), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        this.moveTo(Game.getObjectById(this.memory.deposit), { reusePath: 17, maxRooms: 1 });
                        //move_avoid_hostile(creep,Game.getObjectById(this.memory.deposit).pos,1);

                    }
                }
                else {
                    this.memory.deposit = undefined
                }
            }
            else { // collect dropped energy
                const droppedEnergy = this.room.find(FIND_DROPPED_RESOURCES, {
                    filter: resource => resource.resourceType == RESOURCE_ENERGY
                })
                const closestDroppedEnergy = this.pos.findClosestByRange(droppedEnergy)
                if (droppedEnergy.length > 0) {
                    if (this.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) {
                        // Move to it
                        this.moveTo(closestDroppedEnergy, { reusePath: 17, maxRooms: 1 });
                        //move_avoid_hostile(creep,closestDroppedEnergy.pos);
                    }
                }
            }
        }
        else if (localHeap.task == C.TASK_BUILD) {


            if (global.heap.rooms[this.memory.homeRoom].building == true &&
                this.room.controller.ticksToDowngrade < (CONTROLLER_DOWNGRADE[this.room.controller.level] * C.CONTROLLER_DOWNGRADE_BOTTOM_LIMIT)
            ) {
                localHeap.task = C.TASK_UPGRADE
                return;

            }

            if (global.heap.rooms[this.memory.homeRoom].building != true) {
                localHeap.task = undefined
            }
            else {
                var sites = []
                var toFocus = null
                for (c of global.heap.rooms[this.memory.homeRoom].construction) {
                    if (Game.getObjectById(c) != null) {
                        sites.push(Game.getObjectById(c))
                        var type = Game.getObjectById(c).structureType
                        if (type === STRUCTURE_SPAWN) {
                            toFocus = Game.getObjectById(c)
                            break
                        }
                        else if (toFocus == null && type === STRUCTURE_CONTAINER) {
                            toFocus = Game.getObjectById(c)
                            //break
                        }
                        else if (toFocus == null && type === STRUCTURE_EXTENSION) {
                            toFocus = Game.getObjectById(c)
                            //break;
                        }
                    }
                }
                if (toFocus != null) {
                    //this.say(this.build(toFocus))
                    if (this.build(toFocus) == ERR_NOT_IN_RANGE) {
                        this.moveTo(toFocus, { range: 2, maxRooms: 1 })
                    }
                }
                else if (sites.length > 0) {

                    var closest = this.pos.findClosestByRange(sites)
                    if (closest != null) {
                        if (this.build(closest) == ERR_NOT_IN_RANGE) {
                            this.moveTo(closest, { range: 2, maxRooms: 1 })
                        }
                    }
                }
            }




        }

    }

};
