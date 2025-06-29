


//const { move_avoid_hostile } = require("./move_avoid_hostile");
var sleep = require('creepSleep');
const C=require('constants')
const creepsTasks=require('creepsTasks')



Creep.prototype.roleHauler = function roleHauler(spawn) {//transfer energy grom containers (and storage) to extensions and spawn (if they are full equalize energy at containers)

    //this.move(TOP);
    //this.memory.cIdMax=undefined;

    if (this.room.controller.level <= 2 || (this.room.storage != undefined && this.room.storage.store[RESOURCE_ENERGY] == 0)) {
        this.memory.targetRoom = this.room.name;
        this.roleCarrier();
        return;
    }

    // extensions
    this.memory.extensionsFull=true;
    if (this.room.memory.myExtensions != undefined) {
        for (let id of Game.rooms[this.memory.homeRoom].memory.myExtensions) {
            if (Game.getObjectById(id) == null) {
                this.memory.extensionsId = undefined;
                break;
            }
            else if(Game.getObjectById(id).store.getFreeCapacity(RESOURCE_ENERGY)>0){
                this.memory.extensionsFull=false;
                break
            }
        }
    }





    

    if (this.store[RESOURCE_ENERGY] == 0) {
        //this.memory.task=undefined // check if that is good idea
        this.memory.task=C.TASK_COLLECT
    }
   


    //Assigning tasks
    if (this.memory.task == undefined) {

        this.memory.containerToFill = undefined;

        var spawn = null;
        if (this.memory.spawnId != undefined && Game.getObjectById(this.memory.spawnId) != null) {
            spawn = Game.getObjectById(this.memory.spawnId)
        }


        if (this.memory.spawnId == undefined) {
            spawn = Game.rooms[this.memory.homeRoom].find(FIND_MY_STRUCTURES, {
                filter: function (str) {
                    return str.structureType === STRUCTURE_SPAWN && str.name.endsWith('1')
                }
            })
            if (spawn.length > 0) {
                this.memory.spawnId = spawn[0].id
            }
            else{
                spawn=null
            }
        }


        
        if (this.room.memory.fillerContainers != undefined && this.room.memory.fillerContainers.length > 0
            //for testing - do not fill filler  containers on rcl 8
            && this.room.controller.level<8
        ) {
            var minEnergy = CONTAINER_CAPACITY
            for (cont of this.room.memory.fillerContainers) {
                if (Game.getObjectById(cont) != null && Game.getObjectById(cont).store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    this.memory.task = 'FILL_FILLERS_CONTAINERS'
                    if (Game.getObjectById(cont).store[RESOURCE_ENERGY] < minEnergy) {
                        minEnergy = Game.getObjectById(cont).store[RESOURCE_ENERGY]
                        this.memory.containerToFill = cont
                    }
                    //break;
                }
            }
        }
        if(global.heap.rooms[this.name].towersNeedRefill==true)
        {
            this.memory.task=C.TASK_FILL_TOWERS
        }
        else if (this.memory.extensionsFull == false && this.memory.task==undefined) {
            this.memory.task = C.TASK_FILL_EXTENSIONS
        }
        else if (this.memory.task==undefined && this.room.memory.upgradersContainer != undefined && Game.getObjectById(this.room.memory.upgradersContainer) != null
            && Game.getObjectById(this.room.memory.upgradersContainer).store.getFreeCapacity(RESOURCE_ENERGY) >= this.store.getCapacity(RESOURCE_ENERGY) / 2) {
            this.memory.task = C.TASK_FILL_UPGRADERS_CONTAIER
            this.memory.containerToFill = this.room.memory.upgradersContainer
        }
        
        else if (spawn!=null && spawn.store!=undefined && spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && this.memory.task==undefined) {
            this.memory.task = C.FILL_SPAWN

        }
        else {
            spawnPos=Game.rooms[this.memory.homeRoom].memory.spawnPos
            this.fleeFrom({ spawnPos }, 6)
        }
    }

    if(this.memory.task==C.TASK_FILL_TOWERS)
    {
        this.taskFillTowers();
        return
    }
    
    if (this.memory.task==C.TASK_COLLECT) // if is empty go to container
    {// go to container
        if(this.store.getFreeCapacity(RESOURCE_ENERGY)==0)
        {
            this.memory.task=undefined;
            return;
        }
        if (this.room.storage != undefined /* && this.memory.cIdMax==undefined */ /* && (this.memory.cIdMax!=undefined && Game.getObjectById(this.memory.cIdMax)==null)*/) {
            var containers = this.room.storage;
            this.memory.cIdMax = this.room.storage.id;
        }
        else {

            /*
            if (this.room.memory.containers != undefined && this.room.memory.containers.length > 0) {
                for (id of this.room.memory.containers) {
                    if (Game.getObjectById(this.room.memory.containers) == null) {
                        this.room.memory.containers = undefined;
                        break;
                    }
                }
            }

            if (this.room.memory.containers == undefined) {
                if (this.memory.containers_renew == undefined) {
                    this.memory.containers_renew = 1;
                }
                else {
                    this.memory.containers_renew++;
                }
                var containers = this.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType === STRUCTURE_CONTAINER;
                    }
                });
                containers = containers.concat(this.room.find(FIND_RUINS, {
                    filter: (structure) => {
                        return structure.store[RESOURCE_ENERGY] > 50;
                    }
                }));
                if (containers != undefined && containers.length > 0) {
                    this.room.memory.containers = [];
                    for (cont of containers) {
                        this.room.memory.containers.push(cont.id)
                    }
                }
            }
            */
            var containers=undefined;

            if (this.room.memory.containers != undefined && this.room.memory.containers.length > 0) {
                var containers = [];
                for (id of this.room.memory.containers) {
                    containers.push(Game.getObjectById(this.room.memory.containers))
                }

                var max_energy = 0;
                if ((this.memory.cIdMax == -1 || this.memory.cIdMax == undefined) && containers != undefined) {
                    for (let i = 0; i < containers.length; i++) {
                        //console.log(containers[i].store.getCapacity(RESOURCE_ENERGY));
                        if (containers[i] == undefined) { continue; }
                        if (containers[i].store[RESOURCE_ENERGY] / containers[i].store.getCapacity(RESOURCE_ENERGY) > max_energy) {
                            max_energy = containers[i].store[RESOURCE_ENERGY] / containers[i].store.getCapacity(RESOURCE_ENERGY);
                            //this.memory.cIdMax = i;
                            this.memory.cIdMax = containers[i].id;
                        }
                    }
                }

            }



        }




        //this.say("A");
        if (this.memory.cIdMax != undefined && Game.getObjectById(this.memory.cIdMax) != null) {
            //this.memory.cIdMax=-1;
            //var withdraw_amount = Math.min(this.store[RESOURCE_ENERGY].getFreeCapacity, Game.getObjectById(this.memory.cIdMax).store[RESOURCE_ENERGY]);
            if (this.withdraw(Game.getObjectById(this.memory.cIdMax), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {// if creep have no energy go to container and withdraw energy
                this.moveTo(Game.getObjectById(this.memory.cIdMax));
                //this.say("M");
                //move_avoid_hostile(creep, Game.getObjectById(this.memory.cIdMax).pos, 1, false);
            }
            else if (Game.getObjectById(this.memory.cIdMax).store[RESOURCE_ENERGY] == 0) {
                this.memory.cIdMax = undefined;
            }
            else {
                this.memory.cIdMax = undefined;
            }
        }
        else {
            if (this.store[RESOURCE_ENERGY] == 0) {
                var avoid = [];

                if (this.pos.inRangeTo(Game.rooms[this.memory.homeRoom].memory.spawnPos, 3)) {
                    avoid.push(Game.rooms[this.memory.homeRoom].memory.spawnPos)
                }
                if (this.room.storage != undefined && this.pos.inRangeTo(this.room.storage, 3)) {
                    avoid.push(this.room.storage)
                }
                if (avoid.length > 0) {
                    this.fleeFrom(avoid, 3);
                }
                else {
                    this.sleep(20);

                }

            }
            this.memory.cIdMax = undefined;
        }

    }

   

    if (this.memory.task == 'FILL_FILLERS_CONTAINERS') {
        if (Game.getObjectById(this.memory.containerToFill) != null && Game.getObjectById(this.memory.containerToFill).store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            this.memory.task = undefined
            return;
        }
        if (this.transfer(Game.getObjectById(this.memory.containerToFill), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(Game.getObjectById(this.memory.containerToFill), { reusePath: 10, avoidCreeps: false })
        }
    }


    if (this.memory.task == C.TASK_FILL_UPGRADERS_CONTAIER) {
        if (Game.getObjectById(this.memory.containerToFill) != null && Game.getObjectById(this.memory.containerToFill).store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            this.memory.task = undefined
            return;
        }
        if (this.transfer(Game.getObjectById(this.memory.containerToFill), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(Game.getObjectById(this.memory.containerToFill), { reusePath: 10, avoidCreeps: false })
        }
    }

    if (this.memory.task == C.TASK_FILL_EXTENSIONS) {
        if(this.memory.extensionsFull==true)
        {
            this.memory.task=undefined
            return;
        }
        var extensions = [];
        for (id of Game.rooms[this.memory.homeRoom].memory.myExtensions) {
            if (Game.getObjectById(id)!=null && Game.getObjectById(id).store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                extensions.push(Game.getObjectById(id));
            }

        }

        if (extensions.length > 0) {
            var closestExtension = this.pos.findClosestByRange(extensions);
            if (closestExtension) {
                if (this.transfer(closestExtension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {// if creep have some energy go to extension and fill with energy
                    this.moveTo(closestExtension, { reusePath: 11 });
                    //move_avoid_hostile(creep, closestExtension.pos, 1, false);
                }
            }

        }
        else {

            if (this.store[RESOURCE_ENERGY] == 0) {
                var avoid = [];

                if (this.pos.inRangeTo(Game.rooms[this.memory.homeRoom].memory.spawnPos, 3)) {
                    avoid.push(Game.rooms[this.memory.homeRoom].memory.spawnPos)
                }
                if (this.room.storage != undefined && this.pos.inRangeTo(this.room.storage, 3)) {
                    avoid.push(this.room.storage)
                }
                if (avoid.length > 0) {
                    this.fleeFrom(avoid, 3);
                }
                else {
                    this.sleep(20);

                }

            }
            //this.sleep(20)
        }
    }

    if (this.memory.task == C.FILL_SPAWN) {


        var spawn = null;
        if (this.memory.spawnId != undefined && Game.getObjectById(this.memory.spawnId) != null) {
            spawn = Game.getObjectById(this.memory.spawnId)
        }


        if (this.memory.spawnId == undefined) {
            spawn = Game.rooms[this.memory.homeRoom].find(FIND_MY_STRUCTURES, {
                filter: function (str) {
                    return str.structureType === STRUCTURE_SPAWN && str.name.endsWith('1')
                }
            })
            if (spawn.length > 0) {
                this.memory.spawnId = spawn[0].id
            }
        }

        
       
        if(spawn!=null)
        {
            if (this.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(spawn, { reusePath: 10, avoidCreeps: false })
        }
        if(spawn.store.getFreeCapacity(RESOURCE_ENERGY)==0)
        {
            this.memory.task=undefined
        }
        }
        
    }



};