// Every constant definied in separate file
const C = require('constants');
const buildRoom = require('buildRoom');
const operateTowers = require('operateTowers')


class Variation {
    constructor(variationName, variationFinished, rampartsAmount, spawnPos) {
        this.variationName = variationName
        this.variationFinished = variationFinished;
        this.rampartsAmount = rampartsAmount;
        this.spawnPos = spawnPos;
    }
}

Room.prototype.roomManager = function roomManager() {

    

    global.heap.rooms[this.name].state = []
    global.heap.rooms[this.name].hostiles = []
    global.heap.rooms[this.name].hostileHealPower = 0;
    global.heap.rooms[this.name].hostileAttackPower = 0;
    global.heap.rooms[this.name].hostileRangedAttackPower = 0;
    global.heap.rooms[this.name].hostileStructures = []
    global.heap.rooms[this.name].allies = []
    global.heap.rooms[this.name].myWorkers = [];
    global.heap.rooms[this.name].myHealPower = 0;
    global.heap.rooms[this.name].myAttackPower = 0;
    global.heap.rooms[this.name].myRangedAttackPower = 0;
    global.heap.rooms[this.name].damagedStructuresId = []
    global.heap.rooms[this.name].containersId = []
    global.heap.rooms[this.name].construction = []

    

    this.memory.repairerId = undefined

    if (Memory.mainRooms.includes(this.name)) {
        //If it is one of main rooms 





        //spawnID
        if ((this.memory.spawnId != undefined && Game.getObjectById(this.memory.spawnId) == null) || this.memory.spawnId == undefined) {
            var sp = this.find(FIND_MY_SPAWNS)
            if (sp.length > 0) {
                this.memory.spawnId = sp[0].id
            }
        }

        

        if (Memory.roomsToColonize.some(e => e.name==this.name) && this.controller.level > 1 && this.memory.spawnId != undefined) {
            //Room is finished being colonizer
            if (Memory.manualColonize = this.name) {
                Memory.manualColonize = '??'
            }

            //Remove that roomName from array
            var index = array.indexOf(this.name);
            if (index !== -1) {
                Memory.manualColonize.splice(index, 1);
            }
            delete global.heap.rooms[this.name].claimer
        }


        //Tracking creeps
        global.heap.rooms[this.name].fillers = 0
        global.heap.rooms[this.name].rampartRepairersPower = 0;


        //Tracking structures
        this.memory.state = []
        this.memory.myStructures = []

        global.heap.rooms[this.name].myExtensions = []
        global.heap.rooms[this.name].myLabs = []
        global.heap.rooms[this.name].myTowersId = []
        global.heap.rooms[this.name].towersNeedRefill = false
        global.heap.rooms[this.name].myRamparts = []
        global.heap.rooms[this.name].myNuker = undefined
        global.heap.rooms[this.name].myLinks = []
        global.heap.rooms[this.name].myFactory = undefined
        global.heap.rooms[this.name].myExtractor = undefined
        global.heap.rooms[this.name].myObserver = undefined



        if (this.memory.energyBalance == undefined && (this.storage == undefined
            || this.controller.level < 4)
        ) {
            this.memory.energyBalance = 0.0;
        }
        if (this.memory.energyBalance != undefined) {
            if (this.storage != undefined && this.controller.level >= 4) {
                delete this.memory.energyBalance
            }
            else {
                if (this.memory.energyBalance < -C.BALANCER_HARVEST_LIMIT) {
                    this.memory.energyBalance = -C.BALANCER_HARVEST_LIMIT;
                }
                else if (this.memory.energyBalance > C.BALANCER_USE_LIMIT) {
                    this.memory.energyBalance = C.BALANCER_USE_LIMIT
                }
                if (this.memory.energyBalance > 0 /* &&  this.memory.energyBalance < C.BALANCER_HARVEST_LIMIT */) {
                    this.memory.energyBalance -= C.BALANCER_DECAY
                }
                else if (this.memory.energyBalance < 0 /* &&  this.memory.energyBalance > C.BALANCER_USE_LIMIT*/) {
                    this.memory.energyBalance += C.BALANCER_DECAY
                }
            }

        }

        if (this.memory.harvestingSources == undefined) {
            this.memory.harvestingSources = []
        }
        else if (this.memory.harvestingSources.length > 0) {

            this.memory.harvestingRooms = []

            this.memory.harvestingSources.sort((a, b) => a.bodyPartsCost - b.bodyPartsCost)

            var sourcesAmount = 0;
            var bodyPartsSum = 0
            var counter = 0;
            for (s of this.memory.harvestingSources) {

                if (this.memory.harvestingRooms.findIndex(room => room.name == s.roomName) == -1) {
                    this.memory.harvestingRooms.push({ name: s.roomName, repairerId: undefined })
                }
                bodyPartsSum += s.bodyPartsCost
                counter++;
                if (bodyPartsSum >= (CREEP_LIFE_TIME / CREEP_SPAWN_TIME) * C.HARVESTING_BODYPARTS_FRACTION) {
                    break;
                }
            }
            while (this.memory.harvestingSources.length > counter) {
                this.memory.harvestingSources.pop()
            }

            for (s of this.memory.harvestingSources) {
                s.harvestingPower = 0;
                s.carryPower = 0;
                s.harvesters = 0;
            }

        }




        if (this.memory.keepersSources == undefined) {
            this.memory.keepersSources = []
        }

        if (this.memory.keepersRooms == undefined) {
            this.memory.keepersRooms = []
        }

        if (this.memory.forcedUpgrades == undefined) {
            this.memory.forcedUpgrades = [0, 0, 0, 0, 0, 0, 0, 0]
        }

        global.heap.rooms[this.name].workersParts = 0;


        this.memory.progressOld = this.memory.progress;
        this.memory.progress = this.controller.progress;
        if (this.memory.progressOld != 0) {
            this.memory.progressSum += (this.memory.progress - this.memory.progressOld);
        }
        else { this.memory.progressSum = (this.memory.progress - this.memory.progressOld); }
        this.memory.progressCounter += 1;


        ////// START OF BUILDING ROOM MESS

        if (global.heap.isSomeRoomPlanning == false) {
            //this.visualizeBase() // debugging
             // assuring that only one room in a tick would go into room building
            if (this.memory.finishedPlanning != true) {
                global.heap.isSomeRoomPlanning = true;

                if (this.memory.baseVariations == undefined) {
                    this.memory.baseVariations = {}
                    this.memory.baseVariations[C.SRC_1] = {}
                    this.memory.baseVariations[C.SRC_1].variationFinished = false;
                    this.memory.baseVariations[C.SRC_1].rampartsAmount = 0;
                    this.memory.baseVariations[C.SRC_1].spawnPos = undefined
                    this.memory.baseVariations[C.SRC_2] = {}
                    this.memory.baseVariations[C.SRC_2].variationFinished = false;
                    this.memory.baseVariations[C.SRC_2].rampartsAmount = 0;
                    this.memory.baseVariations[C.SRC_2].spawnPos = undefined
                    this.memory.baseVariations[C.SRC_1_2] = {}
                    this.memory.baseVariations[C.SRC_1_2].variationFinished = false;
                    this.memory.baseVariations[C.SRC_1_2].rampartsAmount = 0;
                    this.memory.baseVariations[C.SRC_1_2].spawnPos = undefined
                    this.memory.baseVariations[C.CONTROLLER] = {}
                    this.memory.baseVariations[C.CONTROLLER].variationFinished = false;
                    this.memory.baseVariations[C.CONTROLLER].rampartsAmount = 0;
                    this.memory.baseVariations[C.CONTROLLER].spawnPos = undefined
                    this.memory.baseVariations[C.SRC_1_CONTROLLER] = {}
                    this.memory.baseVariations[C.SRC_1_CONTROLLER].variationFinished = false;
                    this.memory.baseVariations[C.SRC_1_CONTROLLER].rampartsAmount = 0;
                    this.memory.baseVariations[C.SRC_1_CONTROLLER].spawnPos = undefined
                    this.memory.baseVariations[C.SRC_2_CONTROLLER] = {}
                    this.memory.baseVariations[C.SRC_2_CONTROLLER].variationFinished = false;
                    this.memory.baseVariations[C.SRC_2_CONTROLLER].rampartsAmount = 0;
                    this.memory.baseVariations[C.SRC_2_CONTROLLER].spawnPos = undefined
                    this.memory.baseVariations[C.SRC_1_2_CONTROLLER] = {}
                    this.memory.baseVariations[C.SRC_1_2_CONTROLLER].variationFinished = false;
                    this.memory.baseVariations[C.SRC_1_2_CONTROLLER].rampartsAmount = 0;
                    this.memory.baseVariations[C.SRC_1_2_CONTROLLER].spawnPos = undefined

                    //if there is spawn in room use only one variation
                    if (this.find(FIND_MY_SPAWNS).length > 0) {
                        this.memory.baseVariations = {}
                        this.memory.baseVariations[C.CURRENT_SPAWNPOS] = {}
                        this.memory.baseVariations[C.CURRENT_SPAWNPOS].variationFinished = false;
                        this.memory.baseVariations[C.CURRENT_SPAWNPOS].rampartsAmount = 0;
                        this.memory.baseVariations[C.CURRENT_SPAWNPOS].spawnPos = undefined
                        //this.memory.baseVariations.push(new Variation(C.CURRENT_SPAWNPOS,false,undefined,0))
                    }


                    this.memory.finalRoomPlan = undefined
                    this.memory.finalBuildingList = []
                    this.memory.minRampartsAmount = 999999
                    this.memory.finishedPlanning = false

                }
                else {

                    // loop through room variations
                    var finishedCounter = 0;
                    for (key in this.memory.baseVariations) {

                        if (this.memory.baseVariations[key].variationFinished == false) {
                            this.visual.text(key, 25, 3)
                            this.buildRoom(key)
                            break;
                        }
                        this.memory.finishedPlanning = true
                        finishedCounter++;
                    }

                }
            }
            else {

                //final room plan will be in this.memory.finalRoomPlan
                if (this.memory.roomPlan != undefined && this.memory.plannedRoads == true) {
                    //delete this.memory.roomPlan
                }
                //final building list wil be in this.memory.finalBuildingList
                if (this.memory.buildingList != undefined && this.memory.plannedRoads == true) {
                    //delete this.memory.buildingList
                }
                if (this.memory.variationToBuild == undefined) {
                    this.memory.finishedPlanning = undefined
                }
                if (Game.time % 5 == 0) {
                    this.buildRoom(this.memory.variationToBuild)
                    //global.heap.isSomeRoomPlanning = true
                }

            }
        }

    }


    this.memory.roads = []

    //finding construction sites
    var constr = this.find(FIND_CONSTRUCTION_SITES)


    if (constr.length > 0) {

        
        global.heap.rooms[this.name].building = true
        for (c of constr) {
            global.heap.rooms[this.name].construction.push(c.id)
        }
    }
    else {
        if (global.heap.rooms[this.name].building != undefined) {
            delete global.heap.rooms[this.name].building
        }
    }

    


    //Finding hostile Creeps
    var hostiles = this.find(FIND_HOSTILE_CREEPS, {
        filter:
            function (enemy) {
                return !Memory.allies.includes(enemy.owner.username)
            }
    })

    if (hostiles.length > 0) {
        for (a of hostiles) {
            global.heap.rooms[this.name].hostiles.push(a)
            global.heap.rooms[this.name].hostileHealPower += _.filter(a.body, { type: HEAL }).length * HEAL_POWER
            global.heap.rooms[this.name].hostileAttackPower += _.filter(a.body, { type: ATTACK }).length * ATTACK_POWER
            global.heap.rooms[this.name].hostileRangedAttackPower += _.filter(a.body, { type: RANGED_ATTACK }).length * RANGED_ATTACK_POWER
        }
    }

    //Finding hostileStructures
    global.heap.rooms[this.name].hostileStructures = this.find(FIND_HOSTILE_STRUCTURES, {
        filter: function (structure) {
            //return structure.my==false && 
            return structure.structureType != STRUCTURE_CONTROLLER
                && structure.structureType != STRUCTURE_CONTAINER
                && structure.structureType != STRUCTURE_ROAD
                && !Memory.allies.includes(structure.owner.name)
        }
    });

    //Finding allied Creeps
    var allies = this.find(FIND_HOSTILE_CREEPS, {
        filter:
            function (ally) {
                return Memory.allies.includes(ally.owner.username)
            }
    })

    if (allies.length > 0) {
        for (a of allies) {
            global.heap.rooms[this.name].allies.push(a.id)
        }
    }


    //Finding structures - single Room.Find then filtering and saving id to heap
    var structures = this.find(FIND_STRUCTURES)
    for (str of structures) {

        const type = str.structureType

        if (type != STRUCTURE_RAMPART && type != STRUCTURE_WALL && str.hits < str.hitsMax) {
            global.heap.rooms[this.name].damagedStructuresId.push(str.id)
        }
        /*
        else if ((type == STRUCTURE_RAMPART || type == STRUCTURE_WALL) && str.hits < C.RAMPART_HITS_BOTTOM_LIMIT) {
            global.heap.rooms[this.name].damagedStructuresId.push(str.id)
        }
            */


        if (str.my && Memory.mainRooms.includes(this.name)) {
            this.memory.myStructures.push(str.id)

            switch (type) {

                case STRUCTURE_EXTENSION:
                    global.heap.rooms[this.name].myExtensions.push(str.id);
                    break;
                case STRUCTURE_TOWER:
                    global.heap.rooms[this.name].myTowersId.push(str.id);
                    if (str.store[RESOURCE_ENERGY] < TOWER_CAPACITY * C.TOWER_BOTTOM_LIMIT) {
                        global.heap.rooms[this.name].towersNeedRefill = true
                    }
                    break;
                case STRUCTURE_LAB:
                    global.heap.rooms[this.name].myLabs.push(str.id);
                    break;
                case STRUCTURE_EXTRACTOR:
                    global.heap.rooms[this.name].myExtractor = str.id;
                    break;
                case STRUCTURE_LINK:
                    global.heap.rooms[this.name].myLinks.push(str.id);
                    if (this.storage != undefined && str.pos.x == this.storage.pos.x - 2 && str.pos.y == this.storage.pos.y) {
                        global.heap.rooms[this.name].managerLinkId = str.id
                    }
                    break;
                case STRUCTURE_NUKER:
                    global.heap.rooms[this.name].myNuker = str.id
                    break;
                case STRUCTURE_FACTORY:
                    global.heap.rooms[this.name].myFactory = str.id
                    break;
                case STRUCTURE_OBSERVER:
                    global.heap.rooms[this.name].myObserver = str.id
                    break;
                case STRUCTURE_RAMPART:
                    global.heap.rooms[this.name].myRamparts.push(str.id)
                case STRUCTURE_SPAWN:
                    if (str.name != undefined && str.name.endsWith('1')) {
                        this.memory.spawnPos = str.pos
                    }
                    break;



            }


        }
        else if (str.owner != undefined && Memory.allies.includes(str.owner.username) && false) {
            // What allied structures we need to know ??
        }
        else {
            const type = str.structureType
            switch (type) {
                case STRUCTURE_CONTAINER:
                    global.heap.rooms[this.name].containersId.push(str.id)
                    //this.memory.containersId.push(str.id);
                    break;
                case STRUCTURE_ROAD:
                    this.memory.roads.push(str.id);
                    break;
            }

        }
    }

    if (Memory.mainRooms.includes(this.name)) {
        global.heap.rooms[this.name].rampartsAmount = global.heap.rooms[this.name].myRamparts.length

        global.heap.rooms[this.name].rampartsEnergyNeedPerTick = (global.heap.rooms[this.name].rampartsAmount * (RAMPART_DECAY_AMOUNT / REPAIR_POWER)) / RAMPART_DECAY_TIME

        global.heap.rooms[this.name].requiredRampartsRepairersPower = global.heap.rooms[this.name].rampartsEnergyNeedPerTick * 2

    }

    // Upgraders container
    if (this.memory.upgradersContainerId != undefined && Game.getObjectById(this.memory.upgradersContainerId) == null) {
        this.memory.upgradersContainerId = undefined
    }

    if (this.memory.upgradersContainerId == undefined) {
        if (this.memory.controllerContainerPos != undefined) {
            auxPos = this.memory.controllerContainerPos
            var cont = this.find(FIND_STRUCTURES, {
                filter:
                    function (str) {
                        return str.structureType === STRUCTURE_CONTAINER && str.pos.x == auxPos.x
                            && str.pos.y == auxPos.y
                    }
            });
            if (cont.length > 0) {
                this.memory.upgradersContainerId = cont[0].id
            }
        }
    }

    // Defining fillers containers
    var spawnPos = this.memory.spawnPos
    if (this.memory.fillerContainers == undefined && spawnPos != undefined) {
        var fillerContainers = this.find(FIND_STRUCTURES, {
            filter: function (structure) {
                return structure.structureType == STRUCTURE_CONTAINER &&
                    ((structure.pos.x == spawnPos.x + 2 && structure.pos.y == spawnPos.y - 2) ||
                        (structure.pos.x == spawnPos.x - 2 && structure.pos.y == spawnPos.y - 2));
            }
        });

        if (fillerContainers.length > 0) {
            this.memory.fillerContainers = [];
            for (let i = 0; i < fillerContainers.length; i++) {
                this.memory.fillerContainers.push(fillerContainers[i].id)
            }
            if (this.storage != undefined && this.memory.fillerContainers.length > 1) {
                var closerContainer = this.storage.pos.findClosestByPath(fillerContainers)
                if (closerContainer.id != this.memory.fillerContainers[0]) {
                    var aux = this.memory.fillerContainers[0]
                    this.memory.fillerContainers[0] = this.memory.fillerContainers[1]
                    this.memory.fillerContainers[1] = aux;
                }
            }
        }
    }


    //Finding my workers
    var workers = this.find(FIND_MY_CREEPS, {
        filter:
            function (cr) {
                return cr.memory.role == C.ROLE_WORKER
            }
    })
    for (w of workers) {
        global.heap.rooms[this.name].myWorkers.push(w.id)
    }

    this.operateTowers()


}