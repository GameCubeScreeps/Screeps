// Every constant definied in separate file
const C = require('constants');
const buildRoom = require('buildRoom');


Room.prototype.roomManager = function roomManager() {




    global.heap.rooms[this.name].hostiles = []
    global.heap.rooms[this.name].allies = []
    global.heap.rooms[this.name].myWorkers = [];
    global.heap.rooms[this.name].damagedStructuresId = []
    global.heap.rooms[this.name].containersId = []

    this.memory.repairerId = undefined

    if (Memory.mainRooms.includes(this.name)) {

        //Tracking creeps
        global.heap.rooms[this.name].fillers = 0
        global.heap.rooms[this.name].haulersParts = 0;

        //Tracking structures
        global.heap.rooms[this.name].construction = []
        this.memory.state = []
        this.memory.myStructures = []

        this.memory.myExtensions = []
        this.memory.myLabs = []
        this.memory.myTowers = []
        this.memory.myRamparts = []
        this.memory.myNuker = undefined
        this.memory.myLinks = []
        this.memory.myFactory = undefined
        this.memory.myExtractor = undefined
        this.memory.myObserver = undefined

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
                if (this.memory.energyBalance < C.BALANCER_HARVEST_LIMIT) {
                    this.memory.energyBalance = C.BALANCER_HARVEST_LIMIT;
                }
                else if (this.memory.energyBalance > C.BALANCER_USE_LIMIT) {
                    this.memory.energyBalance = C.BALANCER_USE_LIMIT
                }
                /* else */ if (this.memory.energyBalance > 0 /* &&  this.memory.energyBalance < C.BALANCER_HARVEST_LIMIT */) {
                    this.memory.energyBalance -= C.BALANCER_DECAY
                }
                else if (this.memory.energyBalance < -2 /* &&  this.memory.energyBalance > C.BALANCER_USE_LIMIT*/) {
                    this.memory.energyBalance += C.BALANCER_DECAY
                }
            }

        }

        if (this.memory.harvestingSources == undefined) {
            this.memory.harvestingSources = []
        }
        else if (this.memory.harvestingSources.length > 0) {

            this.memory.harvestingSources.sort((a, b) => a.bodyPartsCost - b.bodyPartsCost)

            var sourcesAmount = 0;
            var bodyPartsSum = 0
            var counter = 0;
            for (s of this.memory.harvestingSources) {
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
        if (this.memory.harvestingRooms == undefined) {
            this.memory.harvestingRooms = []
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
            global.heap.isSomeRoomPlanning = true; // assuring that only one room in a tick would go into room building
            if (this.memory.finishedPlanning != true) {

                console.log("Entering roomPlaning")

                if (global.heap.rooms[this.name].baseVariations == undefined) {
                    global.heap.rooms[this.name].baseVariations = []
                    //this.memory.global.heap.rooms[this.name].baseVariations=[C.LAYOUT[C.SRC_1],C.LAYOUT[C.SRC_2],C.LAYOUT[C.SRC_1_2],C.LAYOUT[C.CONTROLER],C.LAYOUT[C.SRC_1_CONTROLLER],C.LAYOUT[C.SRC_1_2_CONTROLLER]]
                    global.heap.rooms[this.name].baseVariations[C.SRC_1] = {}
                    global.heap.rooms[this.name].baseVariations[C.SRC_1].variationFinished = false;
                    global.heap.rooms[this.name].baseVariations[C.SRC_1].rampartsAmount = 0;
                    global.heap.rooms[this.name].baseVariations[C.SRC_1].startPos = 0;
                    global.heap.rooms[this.name].baseVariations[C.SRC_2] = {}
                    global.heap.rooms[this.name].baseVariations[C.SRC_2].variationFinished = false;
                    global.heap.rooms[this.name].baseVariations[C.SRC_2].rampartsAmount = 0;
                    global.heap.rooms[this.name].baseVariations[C.SRC_2].startPos = 0;
                    global.heap.rooms[this.name].baseVariations[C.SRC_1_2] = {}
                    global.heap.rooms[this.name].baseVariations[C.SRC_1_2].variationFinished = false;
                    global.heap.rooms[this.name].baseVariations[C.SRC_1_2].rampartsAmount = 0;
                    global.heap.rooms[this.name].baseVariations[C.SRC_1_2].startPos = 0;
                    global.heap.rooms[this.name].baseVariations[C.CONTROLLER] = {}
                    global.heap.rooms[this.name].baseVariations[C.CONTROLLER].variationFinished = false;
                    global.heap.rooms[this.name].baseVariations[C.CONTROLLER].rampartsAmount = 0;
                    global.heap.rooms[this.name].baseVariations[C.CONTROLLER].startPos = 0;
                    global.heap.rooms[this.name].baseVariations[C.SRC_1_CONTROLLER] = {}
                    global.heap.rooms[this.name].baseVariations[C.SRC_1_CONTROLLER].variationFinished = false;
                    global.heap.rooms[this.name].baseVariations[C.SRC_1_CONTROLLER].rampartsAmount = 0;
                    global.heap.rooms[this.name].baseVariations[C.SRC_1_CONTROLLER].startPos = 0;
                    global.heap.rooms[this.name].baseVariations[C.SRC_2_CONTROLLER] = {}
                    global.heap.rooms[this.name].baseVariations[C.SRC_2_CONTROLLER].variationFinished = false;
                    global.heap.rooms[this.name].baseVariations[C.SRC_2_CONTROLLER].rampartsAmount = 0;
                    global.heap.rooms[this.name].baseVariations[C.SRC_2_CONTROLLER].startPos = 0;
                    global.heap.rooms[this.name].baseVariations[C.SRC_1_2_CONTROLLER] = {}
                    global.heap.rooms[this.name].baseVariations[C.SRC_1_2_CONTROLLER].variationFinished = false;
                    global.heap.rooms[this.name].baseVariations[C.SRC_1_2_CONTROLLER].rampartsAmount = 0;
                    global.heap.rooms[this.name].baseVariations[C.SRC_1_2_CONTROLLER].startPos = 0;

                    //if there is spawn in room use only one variation
                    if (this.find(FIND_MY_SPAWNS).length > 0) {
                        global.heap.rooms[this.name].baseVariations = []
                        global.heap.rooms[this.name].baseVariations[C.CURRENT_SPAWNPOS] = {}
                        global.heap.rooms[this.name].baseVariations[C.CURRENT_SPAWNPOS].variationFinished = false;
                        global.heap.rooms[this.name].baseVariations[C.CURRENT_SPAWNPOS].rampartsAmount = 0;
                        global.heap.rooms[this.name].baseVariations[C.CURRENT_SPAWNPOS].startPos = 0;
                    }


                    this.memory.finalRoomPlan = undefined
                    this.memory.finalBuildingList = []
                    this.memory.minRampartsAmount = 999999
                    this.memory.finishedPlanning = false

                }
                else {

                    this.memory._beforelooping = true
                    // loop through room variations
                    var finishedCounter = 0;
                    for (key in global.heap.rooms[this.name].baseVariations) {

                        this.memory._inLoop = true
                        if (global.heap.rooms[this.name].baseVariations[key].variationFinished == false) {
                            this.visual.text(key, 25, 3)
                            console.log(key)
                            this.buildRoom(key)
                            break;
                        }
                        this.memory.finishedPlanning = true
                        finishedCounter++;
                    }
                    this.memory._afterLoop = true

                }
            }
            else {

                console.log("@@@@@@@@@@@@@@@@@@@@@@")
                //final room plan will be in this.memory.finalRoomPlan
                if (this.memory.roomPlan != undefined && this.memory.plannedRoads == true) {
                    //delete this.memory.roomPlan
                }
                //final building list wil be in this.memory.finalBuildingList
                if (this.memory.buildingList != undefined && this.memory.plannedRoads == true) {
                    //delete this.memory.buildingList
                }
                console.log(this.memory.variationToBuild)
                if (this.memory.variationToBuild == undefined) {
                    this.memory.finishedPlanning = undefined
                    console.log("Backing to planning room")
                }
                console.log(global.heap.isSomeRoomPlanning)
                if (Game.time % 5 == 0) {
                    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                    this.buildRoom(this.memory.variationToBuild)
                    global.heap.isSomeRoomPlanning = true
                }

            }
        }



    }


    this.memory.roads = []
    this.memory.containers = []


    //Finding hostile Creeps
    var hostiles = this.find(FIND_HOSTILE_CREEPS, {
        filter:
            function (enemy) {
                return !Memory.allies.includes(enemy.owner.username)
            }
    })

    if (hostiles.length > 0) {
        for (a of hostiles) {
            global.heap.rooms[this.name].hostiles.push(a.id)
        }
    }

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


    //Finding structures - single Room.Find then filtering and saving id to this.memory 
    var structures = this.find(FIND_STRUCTURES)
    for (str of structures) {

        const type = str.structureType

        if (type != STRUCTURE_RAMPART && STRUCTURE_WALL && str.hits < str.hitsMax) {
            global.heap.rooms[this.name].damagedStructuresId.push(str.id)
        }
        else if (str.hits < C.RAMPART_HITS_BOTTOM_LIMIT) {
            global.heap.rooms[this.name].damagedStructuresId.push(str.id)
        }

        if (str.my) {
            this.memory.myStructures.push(str.id)

            switch (type) {

                case STRUCTURE_EXTENSION:
                    this.memory.myExtensions.push(str.id);
                    break;
                case STRUCTURE_TOWER:
                    this.memory.myTowers.push(str.id);
                    break;
                case STRUCTURE_LAB:
                    this.memory.myLabs.push(str.id);
                    break;
                case STRUCTURE_EXTRACTOR:
                    this.memory.myExtractor = str.id;
                    break;
                case STRUCTURE_LINK:
                    this.memory.myLinks.push(str.id);
                    break;
                case STRUCTURE_NUKER:
                    this.memory.myNuker = str.id
                    break;
                case STRUCTURE_FACTORY:
                    this.memory.myFactory = str.id
                    break;
                case STRUCTURE_OBSERVER:
                    this.memory.myObserver = str.id
                    break;


            }


        }
        else if (str.owner != undefined && Memory.allies.includes(str.owner.username)) {
            // What allied structures we need to know ??
        }
        else {
            const type = str.structureType
            switch (type) {
                case STRUCTURE_CONTAINER:
                    this.memory.containers.push(str.id);
                    break;
                case STRUCTURE_ROAD:
                    this.memory.roads.push(str.id);
                    break;
            }

        }
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



}