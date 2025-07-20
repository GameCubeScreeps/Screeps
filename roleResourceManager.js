

const C=require('constants')

localHeap={}

Creep.prototype.roleResourceManager = function roleResourceManager(creep, spawn) {//transfer energy grom containers to storage


    //Needs:
    // global.heap.rooms[this.memory.homeRoom].managerLinkId

    var terminal = this.room.terminal;
    var storage = this.room.storage;
    localHeap.task = undefined;
    if (this.global.heap.rooms[this.memory.homeRoom].managerLinkId != undefined) {
        var managerLink = Game.getObjectById(this.global.heap.rooms[this.memory.homeRoom].managerLinkId);
        if (managerLink == null) {
            this.global.heap.rooms[this.memory.homeRoom].managerLinkId = undefined
        }
    }
    if (storage != undefined && (creep.pos.x != storage.pos.x - 1 || creep.pos.y != storage.pos.y + 1)) {
        this.travelTo(new RoomPosition(storage.pos.x - 1, storage.pos.y + 1, this.roomname));
        return;
    }
    else {

        if (terminal != undefined && storage != undefined) {



            if ((terminal.store[RESOURCE_ENERGY] < C.TERMINAL_BOTTOM_ENERGY && storage.store[RESOURCE_ENERGY] > C.STORAGE_TO_TERMINAL_ENERGY)
                || (this.room.controller.level == 8 && storage.store[RESOURCE_ENERGY] > STORAGE_CAPACITY * 0.8 && terminal.store.getFreeCapacity(RESOURCE_ENERGY) > C.TERMINAL_FREE_BUFFOR)) {
                localHeap.task = C.TASK_FILL_TERMINAL_ENERGY;
                localHeap.energyToTerminal = true;
                localHeap.energyFromTerminal = false;
            }
            else if (terminal.store[RESOURCE_ENERGY] > C.TERMINAL_TOP_ENERGY && storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                localHeap.task = C.TASK_FILL_TERMINAL_ENERGY;
                localHeap.energyFromTerminal = true;
                localHeap.energyToTerminal = false;
            }
            else if (terminal.store[RESOURCE_ENERGY] > C.TERMINAL_BOTTOM_ENERGY && terminal.store[RESOURCE_ENERGY] < C.STORAGE_TO_TERMINAL_ENERGY) {
                localHeap.task = undefined;
                localHeap.energyFromTerminal = -1;
                localHeap.energyToTerminal = -1;
            }

        }
        if (managerLink != undefined) {
            if (managerLink.store[RESOURCE_ENERGY] < C.LINK_BOTTOM_ENERGY && storage != undefined) {
                //creep.say(C.TASK_FILL_TERMINAL_ENERGY)
                localHeap.task = C.TASK_FILL_TERMINAL_ENERGY;

            }
            if (this.room.memory.sourcesLinksId != undefined && this.room.memory.sourcesLinksId.length > 0) {
                var energyAtSourceLink = 0;
                var canTheyTransfer = false
                for (let id of this.room.memory.sourcesLinksId) {
                    var srcLink = Game.getObjectById(id)
                    if (srcLink != null) {
                        energyAtSourceLink += srcLink.store[RESOURCE_ENERGY]
                        if (srcLink.cooldown == 0) { canTheyTransfer = true }
                    }
                }
                if (energyAtSourceLink > 600 && canTheyTransfer == true) {
                    localHeap.task = C.TASK_TAKE_FROM_LINK
                    //creep.say("Take from link")
                }
                // /creep.say(energyAtSourceLink)
            }
        }
        if (Memory.fastRCLUpgrade != undefined && Memory.fastRCLUpgrade == this.room.name && terminal.store.getFreeCapacity(RESOURCE_ENERGY) > C.TERMINAL_FASTRCL_FREE_BUFFOR
            && storage.store.getFreeCapacity(RESOURCE_ENERGY) > C.STORAGE_FASTRCL_BOTTOM_ENERGY && terminal.store[RESOURCE_CATALYZED_GHODIUM_ACID]>0
        ) {
            localHeap.task = C.XTASK_XGH2O_TRANSFER
        }

        //}







        if (localHeap.task == C.TASK_FILL_TERMINAL_ENERGY) {
            clearCreepStore(storage, RESOURCE_ENERGY);
            if (storage.store[RESOURCE_ENERGY] > 0) {
                creep.withdraw(storage, RESOURCE_ENERGY)
            }
            else if (terminal != undefined && terminal.store[RESOURCE_ENERGY] > 0) {
                creep.withdraw(terminal, RESOURCE_ENERGY)
            }

            creep.transfer(managerLink, RESOURCE_ENERGY)
            //creep.say(managerLink.pos.x)
        }
        else if (localHeap.task == C.TASK_FILL_TERMINAL_ENERGY) {
            clearCreepStore(storage, RESOURCE_ENERGY);
            creep.withdraw(storage, RESOURCE_ENERGY);
            creep.transfer(terminal, RESOURCE_ENERGY);
        }
        else if (localHeap.task == C.TASK_FILL_TERMINAL_ENERGY) {
            clearCreepStore(storage, RESOURCE_ENERGY);
            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                creep.transfer(storage, RESOURCE_ENERGY);
            }
            else {
                creep.withdraw(terminal, RESOURCE_ENERGY);
            }


        }
        else if (localHeap.task == C.TASK_TAKE_FROM_LINK) {
            clearCreepStore(storage, RESOURCE_ENERGY);
            creep.withdraw(managerLink, RESOURCE_ENERGY)
            creep.transfer(storage, RESOURCE_ENERGY)
        }
        else if (localHeap.task == C.XTASK_XGH2O_TRANSFER) {
            
            if (Memory.fastRCLUpgrade == this.room.name) {
                if(terminal.store[RESOURCE_CATALYZED_GHODIUM_ACID]==0){localHeap.task=undefined;}
                clearCreepStore(storage, RESOURCE_CATALYZED_GHODIUM_ACID);
                if (creep.store.getUsedCapacity(RESOURCE_CATALYZED_GHODIUM_ACID) > 0) {
                    creep.transfer(storage, RESOURCE_CATALYZED_GHODIUM_ACID);
                }
                else {
                    creep.withdraw(terminal, RESOURCE_CATALYZED_GHODIUM_ACID);
                }
            }
            else {
                if(storage.store[RESOURCE_CATALYZED_GHODIUM_ACID]==0){localHeap.task=undefined;}
                clearCreepStore(storage, RESOURCE_CATALYZED_GHODIUM_ACID);
                if (creep.store.getUsedCapacity(RESOURCE_CATALYZED_GHODIUM_ACID) > 0) {

                    creep.withdraw(storage, RESOURCE_CATALYZED_GHODIUM_ACID);
                }
                else {
                    creep.transfer(terminal, RESOURCE_CATALYZED_GHODIUM_ACID);
                }
            }

        }
        else if (storage != undefined) {
            //return;
            //withdrawing all resources (except T3) from storage
            console.log("no task")
            for (let res in storage.store) {
                if (res == RESOURCE_ENERGY || (res.startsWith("X") && !(res.endsWith("X"))) && Memory.fastRCLUpgrade == undefined) {
                    continue
                }
                if (creep.store.getFreeCapacity(res) == creep.store.getCapacity() && creep.withdraw(storage, res) == OK) {
                    //creep.say("withdrawa; ", res)
                    return;
                }
            }

            //transfering to terminal
            for (let res in creep.store) {
                if (res != RESOURCE_ENERGY && creep.transfer(terminal, res) == OK) {
                    return
                }
                else if (res == RESOURCE_ENERGY && creep.transfer(storage, res) == OK) {
                    //creep.say("transfer energy")
                    return;
                }
            }
        }


    }


};

Creep.prototype.clearCreepStore = function clearCreepStore(storage, res) {
    //creep.say("clearing")
    for (r in this.store) {
        if (r != res && this.transfer(storage, r) == OK) {
            return;
        }
    }
}
