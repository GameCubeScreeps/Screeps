

const C=require('constants')

localHeap={}

Creep.prototype.roleResourceManager = function roleResourceManager() {//transfer energy grom containers to storage


    //Needs:
    // global.heap.rooms[this.memory.homeRoom].managerLinkId

    var terminal = this.room.terminal;
    var storage = this.room.storage;
    localHeap.task = undefined;
    if (global.heap.rooms[this.memory.homeRoom].managerLinkId != undefined) {
        var managerLink = Game.getObjectById(global.heap.rooms[this.memory.homeRoom].managerLinkId);
        if (managerLink == null) {
            this.global.heap.rooms[this.memory.homeRoom].managerLinkId = undefined
        }
    }
    if (storage != undefined && (this.pos.x != storage.pos.x - 1 || this.pos.y != storage.pos.y + 1)) {
        this.travelTo(new RoomPosition(storage.pos.x - 1, storage.pos.y + 1, this.room.name));
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
                }
            }
        }
        if (Memory.fastRCLUpgrade != undefined && Memory.fastRCLUpgrade == this.room.name && terminal.store.getFreeCapacity(RESOURCE_ENERGY) > C.TERMINAL_FASTRCL_FREE_BUFFOR
            && storage.store.getFreeCapacity(RESOURCE_ENERGY) > C.STORAGE_FASTRCL_BOTTOM_ENERGY && terminal.store[RESOURCE_CATALYZED_GHODIUM_ACID]>0
        ) {
            localHeap.task = C.XTASK_XGH2O_TRANSFER
        }

        //}







        if (localHeap.task == C.TASK_FILL_TERMINAL_ENERGY) {
            this.clearCreepStore(storage, RESOURCE_ENERGY);
            if (storage.store[RESOURCE_ENERGY] > 0) {
                this.withdraw(storage, RESOURCE_ENERGY)
            }
            else if (terminal != undefined && terminal.store[RESOURCE_ENERGY] > 0) {
                this.withdraw(terminal, RESOURCE_ENERGY)
            }

            this.transfer(managerLink, RESOURCE_ENERGY)
            //this.say(managerLink.pos.x)
        }
        else if (localHeap.task == C.TASK_FILL_TERMINAL_ENERGY) {
            this.clearCreepStore(storage, RESOURCE_ENERGY);
            this.withdraw(storage, RESOURCE_ENERGY);
            this.transfer(terminal, RESOURCE_ENERGY);
        }
        else if (localHeap.task == C.TASK_FILL_TERMINAL_ENERGY) {
            this.clearCreepStore(storage, RESOURCE_ENERGY);
            if (this.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                this.transfer(storage, RESOURCE_ENERGY);
            }
            else {
                this.withdraw(terminal, RESOURCE_ENERGY);
            }


        }
        else if (localHeap.task == C.TASK_TAKE_FROM_LINK) {
            this.clearCreepStore(storage, RESOURCE_ENERGY);
            this.withdraw(managerLink, RESOURCE_ENERGY)
            this.transfer(storage, RESOURCE_ENERGY)
        }
        else if (localHeap.task == C.XTASK_XGH2O_TRANSFER) {
            
            if (Memory.fastRCLUpgrade == this.room.name) {
                if(terminal.store[RESOURCE_CATALYZED_GHODIUM_ACID]==0){localHeap.task=undefined;}
                this.clearCreepStore(storage, RESOURCE_CATALYZED_GHODIUM_ACID);
                if (this.store.getUsedCapacity(RESOURCE_CATALYZED_GHODIUM_ACID) > 0) {
                    this.transfer(storage, RESOURCE_CATALYZED_GHODIUM_ACID);
                }
                else {
                    this.withdraw(terminal, RESOURCE_CATALYZED_GHODIUM_ACID);
                }
            }
            else {
                if(storage.store[RESOURCE_CATALYZED_GHODIUM_ACID]==0){localHeap.task=undefined;}
                this.clearCreepStore(storage, RESOURCE_CATALYZED_GHODIUM_ACID);
                if (this.store.getUsedCapacity(RESOURCE_CATALYZED_GHODIUM_ACID) > 0) {

                    this.withdraw(storage, RESOURCE_CATALYZED_GHODIUM_ACID);
                }
                else {
                    this.transfer(terminal, RESOURCE_CATALYZED_GHODIUM_ACID);
                }
            }

        }
        else if (storage != undefined) {
            //return;
            for (let res in storage.store) {
                if (res == RESOURCE_ENERGY || (res.startsWith("X") && !(res.endsWith("X"))) && Memory.fastRCLUpgrade == undefined) {
                    continue
                }
                if (this.store.getFreeCapacity(res) == this.store.getCapacity() && this.withdraw(storage, res) == OK) {
                    //this.say("withdrawa; ", res)
                    return;
                }
            }

            //transfering to terminal
            for (let res in this.store) {
                if (res != RESOURCE_ENERGY && this.transfer(terminal, res) == OK) {
                    return
                }
                else if (res == RESOURCE_ENERGY && this.transfer(storage, res) == OK) {
                    //this.say("transfer energy")
                    return;
                }
            }
        }


    }


};

Creep.prototype.clearCreepStore = function clearCreepStore(storage, res) {
    //this.say("clearing")
    for (r in this.store) {
        if (r != res && this.transfer(storage, r) == OK) {
            return;
        }
    }
}
