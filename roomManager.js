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
        global.heap.rooms[this.name].haulersParts=0;

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
            || this.controller.level<4)
        ) {
            this.memory.energyBalance = 0.0;
        }
        if (this.memory.energyBalance != undefined) {
            if (this.storage != undefined && this.controller.level>=4) {
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



        if ((global.heap.rooms[this.name].baseVariations == undefined) && Game.rooms[this.name].memory.finishedPlanning != true
            || this.memory.manualBasePlan != false // for debugging
        ) {
            console.log("setting base variations")
            this.visual.text("?", 25, 5)

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

            Game.rooms[this.name].memory.finishedPlanning = false

            this.memory.roomPlan = undefined
            this.memory.buildingStage = 0
            this.memory.manualBasePlan = false;
        }

        //////I messed git branch: basePlanning
        var color = 'red'
        if (Game.rooms[this.name].memory.finishedPlanning == true) {
            color = 'green'
        }
        this.visual.circle(15, 4, { fill: color, radius: 0.5 })
        if (Game.rooms[this.name].memory.finishedPlanning != true) {
            for (key in global.heap.rooms[this.name].baseVariations) {
                var variation = global.heap.rooms[this.name].baseVariations[key]

                if (global.heap.rooms[this.name].baseVariations[key].variationFinished == false) {
                    this.buildRoom(key)
                    Game.rooms[this.name].memory.finishedPlanning = false
                    break;
                }
                Game.rooms[this.name].memory.finishedPlanning = true
            }
        }

        if (Game.rooms[this.name].memory.finishedPlanning == true &&
            Game.rooms[this.name].memory.variationToBuild == undefined
        ) {

            //var variation = global.heap.rooms[this.name].baseVariations[key]
            var minRamparts = Infinity
            this.memory.buildingVariations = []
            for (key in global.heap.rooms[this.name].baseVariations) {

                this.memory.buildingVariations.push(global.heap.rooms[this.name].baseVariations[key].rampartsAmount)
                if (global.heap.rooms[this.name].baseVariations[key].rampartsAmount < minRamparts) {
                    minRamparts = global.heap.rooms[this.name].baseVariations[key].rampartsAmount
                    Game.rooms[this.name].memory.variationToBuild = key

                    this.memory.spawnPos = global.heap.rooms[this.name].baseVariations[key].spawnPos
                }
            }
            this.memory.buildingStage=3
        }


        //Forcing building room on RCL upgrade
        if (global.heap.rooms[this.name].lastRCL != this.controller.level) {
            global.heap.rooms[this.name].forcedBuild = false
            global.heap.rooms[this.name].lastRCL = this.controller.level
        }

        // here add some time-condition not to call it to often
        if ((Game.rooms[this.name].memory.variationToBuild != undefined
            && Game.time % C.BUILD_TIME_STEP == Memory.mainRooms.indexOf(this.name)) || global.heap.rooms[this.name].forcedBuild != true) {
            // Build chosen variation
            console.log("building in: ", this.name)
            global.heap.rooms[this.name].forcedBuild = true
            this.buildRoom(Game.rooms[this.name].memory.variationToBuild)
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
            auxPos=this.memory.controllerContainerPos
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
    var spawnPos=this.memory.spawnPos
    if (this.memory.fillerContainers == undefined && spawnPos!=undefined) {
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
            if (this.room.storage != undefined && this.memory.fillerContainers.length > 1) {
                var closerContainer = this.room.storage.pos.findClosestByPath(fillerContainers)
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