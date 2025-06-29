const C = require('constants');



//TODO:
//Add avopiding hostile areas during STATE_UNDER_ATTACK

Creep.prototype.taskFillTowers = function taskFillTowers() {
    if (this.memory.targetTower != undefined && this.memory.targetTower.store[RESOURCE_ENERGY] > TOWER_CAPACITY * TOWER_UP_LIMIT) {
        this.memory.targetTower = undefined
    }

    if (this.memory.targetTower == undefined) {
        var towersBelowLimit = [];
        for (t of global.heap.rooms[this.memory.homeRoom].myTowers) {
            if (Game.getObjectById(t) != null && Game.getObjectById(t).store[RESOURCE_ENERGY] < TOWER_CAPACITY * TOWER_BOTTOM_LIMIT) {
                towersBelowLimit.push(Game.getObjectById(t))
            }
        }
        var targetTower = this.pos.findClosestByPath(towersBelowLimit)
        if (targetTower != null) {
            this.memory.targetTower = targetTower.id
        }
    }

    if (this.memory.targetTower != undefined) {
        if (this.transfer(Game.getObjectById(this.memory.targetTower), RESOURCCE_ENERGY) == ERR_NOT_IN_RANGE) {

            this.moveTo(Game.getObjectById(this.memory.targetTower), { reusePath: 11 })
        }
    }

}

//TASK_REPAIR_RAMPARTS
Creep.prototype.taskRepairRamparts = function taskRepairRamparts() {
    this.say("Rep")
    if ((this.memory.minRampartId != undefined && Game.getObjectById(this.memory.minRampartId) == null)) {
        this.memory.minRampartId = undefined
        this.say("und")
    }

    if (this.memory.minRampartId == undefined) {
        var minRampartId = undefined
        var minRampartHits = Infinity
        var minimalRamparts = []// there can be more than one here
        for (r of global.heap.rooms[this.memory.homeRoom].myRamparts) {
            if (Game.getObjectById(r) != null && Game.getObjectById(r).hits < minRampartHits
        && Game.getObjectById(r).ticksToDecay>30) {
                minRampartHits = Game.getObjectById(r).hits
                minRampartId = r
            }
        }

        //finding ramparts that are minimal
        for (r of global.heap.rooms[this.memory.homeRoom].myRamparts) {
            if (Game.getObjectById(r) != null && Game.getObjectById(r).hits == minRampartHits) {
                minimalRamparts.push(Game.getObjectById(r))
            }
        }
        if(this.pos.findClosestByPath(minimalRamparts)!=null)
        {
            this.say("def")
            this.memory.minRampartId = this.pos.findClosestByPath(minimalRamparts).id
        }
        
    }
    this.say(this.memory.minRampartId)
    if (this.memory.minRampartId != undefined) {
        
        if (Game.getObjectById(this.memory.minRampartId) != null) {
            this.say("1")
            if (this.repair(Game.getObjectById(this.memory.minRampartId)) == ERR_NOT_IN_RANGE) {
                this.say("2")
                this.moveTo(Game.getObjectById(this.memory.minRampartId), { reusePath: 11 })
            }
        }

    }
}

//TASK_COLLECT
Creep.prototype.taskCollect = function taskCollect() {// go to deposits

    if (this.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
        localHeap.task = undefined
        this.memory.task = 'undefined_debugging'
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