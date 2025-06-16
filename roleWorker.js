//const { boosting_driver } = require('boosting_driver');
const C = require('constants')

/*Creep needs:
   Mandatory:
   Creep.memory.homeRoom - roomName in which creep will operate
    
   

    Will Calculate in its own:
    this.memory.workPartsNum - 
    this.memory.otherWorkers - other workers -> when upgrading it will pass energy to worker which is closer to controller
    this.memory.boosters - acceptable boosters - putting only upgrade controller for now
    this.memory.task - currently done task -> colelct/upgrade/build 

   */

Creep.prototype.roleWorker = function roleWorker() {

    //this.suicide();
    if (Game.rooms[this.memory.homeRoom].memory.state.includes("STATE_UNDER_ATTACK") && Game.rooms[this.memory.homeRoom].room.controller.ticksToDowngrade > 2000) {
        this.say("rep")
        //this.roleRampartRepairer(creep);
        return;
    }
    if (this.memory.workPartsNum == undefined) {
        this.memory.workPartsNum = _.filter(this.body, { type: WORK }).length
    }
    if (this.memory.otherWorkers != undefined) {
        for (a of this.memory.otherWorkers) {
            if (Game.getObjectById(a) == null) {
                this.memory.otherWorkers == undefined
                break;
            }
        }

    }
    if (this.memory.otherWorkers == undefined) {
        var upgraders = this.room.find(FIND_MY_CREEPS, {
            filter: function (cr) {
                return cr.memory.role == 'worker' && cr.id != this.id;
            }
        })
        this.memory.otherWorkers = [];
        for (a of upgraders) {
            this.memory.otherWorkers.push(a.id)
        }


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

        if (this.store.getUsedCapacity() == 0) {
            this.memory.task = C.TASK_COLLECT
        }
        else if (global.heap.rooms[this.memory.homeRoom].building == true
            && this.room.controller.ticksToDowngrade > (CONTROLLER_DOWNGRADE[this.room.controller.level] * C.CONTROLLER_DOWNGRADE_LIMIT)) {
            this.memory.task = C.TASK_BUILD
        }
        else {
            this.memory.task = C.TASK_UPGRADE
        }




        if (this.memory.task == C.TASK_UPGRADE) // if upgrading go upgrade
        {
            if (this.store.getUsedCapacity() == 0) {
                this.memory.task = undefined
            }
            if (!this.pos.isNearTo(this.room.controller)) {
                this.moveTo(this.room.controller, { maxStuck: 10 })
            }
            var upgradeResult = this.upgradeController(this.room.controller);
            //this.moveTo(this.room.controller, { reusePath: 17,maxRooms:1 });
            if (upgradeResult == ERR_NOT_IN_RANGE || upgradeResult == -9) {
                //this.say("A");
                this.moveTo(this.room.controller, { reusePath: 17, maxRooms: 1 });
            }


            if (this.store[RESOURCE_ENERGY] > 0 && this.memory.otherWorkers != undefined && this.memory.otherWorkers.length > 0) {
                for (a of this.memory.otherWorkers) {
                    cr = Game.getObjectById(a)
                    if (cr == null) { continue; }

                    //this.say(this.pos.getRangeTo(this.room.controller))
                    if (cr != null && cr.store[RESOURCE_ENERGY] < this.store[RESOURCE_ENERGY] &&
                        (cr.pos.getMyRangeTo(this.room.controller.pos) < this.pos.getMyRangeTo(this.room.controller.pos)
                            || (Game.getObjectById(this.memory.deposit) != undefined && cr.pos.getMyRangeTo(Game.getObjectById(this.memory.deposit).pos) > this.pos.getMyRangeTo(Game.getObjectById(this.memory.deposit).pos))
                        )
                        && this.pos.getMyRangeTo(cr.pos) < 1.5) {

                        //this.say("pass")
                        this.upgradeController(this.room.controller);
                        this.transfer(cr, RESOURCE_ENERGY)

                        break;
                    }
                }
            }


        }
        else if (this.memory.task == C.TASK_COLLECT) {// go to deposits


            if ((this.memory.deposit != undefined && Game.getObjectById(this.memory.deposit) != null && Game.getObjectById(this.memory.deposit).store[RESOURCE_ENERGY] == 0
            /* && Game.getObjectById(this.memory.deposit).structureType != STRUCTURE_LINK*/)
                || (Game.getObjectById(Game.rooms[this.memory.homeRoom].memory.controllerLinkId) != null && Game.rooms[this.memory.homeRoom].memory.controllerLinkId != this.memory.deposit && Game.getObjectById(Game.rooms[this.memory.homeRoom].memory.controllerLinkId).store[RESOURCE_ENERGY] > 0)
                || (Game.rooms[this.memory.homeRoom].memory.controller_container_id != undefined && Game.getObjectById(Game.rooms[this.memory.homeRoom].memory.controller_container_id) != null && Game.rooms[this.memory.homeRoom].memory.controller_container_id != this.memory.deposit && Game.getObjectById(Game.rooms[this.memory.homeRoom].memory.controller_container_id).store[RESOURCE_ENERGY] > 0)) {
                
                if (Game.getObjectById(this.memory.deposit) != null && Game.getObjectById(this.memory.deposit).store[RESOURCE_ENERGY] == 0 && Game.rooms[this.memory.homeRoom].memory.energyBalance != undefined) {
                    Game.rooms[this.memory.homeRoom].memory.energyBalance -= C.BALANCER_STEP
                }

                this.memory.deposit = undefined;

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

                    if(deposits.length==0)
                    {
                        deposits = this.room.find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return structure.structureType === STRUCTURE_SPAWN &&
                                    structure.store[RESOURCE_ENERGY] > 0;
                            }
                        });
                    }
                    if (this.room.controller == undefined) { this.suicide() }

                    var deposit = this.room.controller.pos.findClosestByRange(deposits);
                    if (deposit != null) {
                        this.memory.deposit = deposit.id;
                    }
                    else {
                        if (Game.rooms[this.memory.homeRoom].memory.energyBalance != undefined) {
                            Game.rooms[this.memory.homeRoom].memory.energyBalance -= C.BALANCER_STEP
                        }
                    }
                }
            }

            if (Game.getObjectById(this.memory.deposit) != null) {
                if (this.memory.deposit != undefined) {
                    if (this.withdraw(Game.getObjectById(this.memory.deposit), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        this.moveTo(Game.getObjectById(this.memory.deposit), { reusePath: 17, maxRooms: 1 });
                        //move_avoid_hostile(creep,Game.getObjectById(this.memory.deposit).pos,1);

                    }
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
        else if (this.memory.task == C.TASK_BUILD) {

            if (global.heap.rooms[this.memory.homeRoom].building != true) {
                this.memory.task = undefined
            }
            else {
                var sites = []
                var toFocus = null
                for (c of global.heap.rooms[this.memory.homeRoom].construction) {
                    if (Game.getObjectById(c) != null) {
                        sites.push(Game.getObjectById(c))
                        if (Game.getObjectById(c).structureType == STRUCTURE_SPAWN) {
                            toFocus = Game.getObjectById(c)
                        }
                        else if (toFocus == null && Game.getObjectById(c).structureType == STRUCTURE_CONTAINER) {
                            toFocus = Game.getObjectById(c)
                        }
                        else if (toFocus == null && Game.getObjectById(c).structureType == STRUCTURE_EXTENSION) {
                            toFocus = Game.getObjectById(c)
                        }
                    }
                }
                if (toFocus != null) {
                    if (this.build(toFocus) == ERR_NOT_IN_RANGE) {
                        this.moveTo(toFocus, { range: 2, maxRooms: 1 })
                    }
                }
                if (sites.length > 0) {
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
