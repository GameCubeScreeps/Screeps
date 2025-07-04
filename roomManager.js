// Every constant definied in separate file
const C = require('constants');


Room.prototype.roomManager = function roomManager() {

    global.heap.rooms[this.name] = {}
    global.heap.rooms[this.name].hostiles = []
    global.heap.rooms[this.name].allies = []
    if (Memory.mainRooms.includes(this.name)) {

        global.heap.rooms[this.name].construction = []
        Game.rooms[this.name].memory.state = []
        Game.rooms[this.name].memory.myStructures = []
        Game.rooms[this.name].memory.myExtensions = []
        Game.rooms[this.name].memory.myLabs = []
        Game.rooms[this.name].memory.myTowers = []
        Game.rooms[this.name].memory.myRamparts = []
        Game.rooms[this.name].memory.myNuker = undefined
        Game.rooms[this.name].memory.myLinks = []
        Game.rooms[this.name].memory.myFactory = undefined
        Game.rooms[this.name].memory.myExtractor = undefined
        Game.rooms[this.name].memory.myObserver = undefined

        var constr = Game.rooms[this.name].find(FIND_CONSTRUCTION_SITES)
        if (constr.length > 0) {
            global.heap.rooms[this.name].building = true
            for (c of constr) {
                global.heap.rooms[this.name].construction.push(c.id)
            }
            console.log("construction sites in: ", this.name, " ", constr.length)
        }
        else {
            if (global.heap.rooms[this.name].building != undefined) {
                delete global.heap.rooms[this.name].building
            }
        }

        if (Game.rooms[this.name].memory.energyBalance == undefined && Game.rooms[this.name].storage == undefined) {
            Game.rooms[this.name].memory.energyBalance = 0.0;
            console.log("Setting balancer")
        }
        if (Game.rooms[this.name].memory.energyBalance != undefined) {
            if (Game.rooms[this.name].storage != undefined) {
                delete Game.rooms[this.name].memory.energyBalance
                console.log("removing balancer")
            }
            else {
                console.log("asd")
                if (Game.rooms[this.name].memory.energyBalance < C.BALANCER_HARVEST_LIMIT) {
                    Game.rooms[this.name].memory.energyBalance = C.BALANCER_HARVEST_LIMIT;
                    console.log("below bottom edge")
                }
                else if (Game.rooms[this.name].memory.energyBalance > C.BALANCER_USE_LIMIT) {
                    Game.rooms[this.name].memory.energyBalance = C.BALANCER_USE_LIMIT
                    console.log("Above top edge")
                }
                else if (Game.rooms[this.name].memory.energyBalance > -1 && Game.rooms[this.name].memory.energyBalance < C.BALANCER_HARVEST_LIMIT) {
                    Game.rooms[this.name].memory.energyBalance -= C.BALANCER_DECAY
                }
                else if (Game.rooms[this.name].memory.energyBalance < -2 && Game.rooms[this.name].memory.energyBalance > C.BALANCER_USE_LIMIT) {
                    Game.rooms[this.name].memory.energyBalance += C.BALANCER_DECAY
                }
            }

        }

        if (Game.rooms[this.name].memory.harvestingSources == undefined) {
            Game.rooms[this.name].memory.harvestingSources = []
        }
        else if (Game.rooms[this.name].memory.harvestingSources.length > 0) {

            Game.rooms[this.name].memory.harvestingSources.sort((a, b) => a.bodyPartsCost - b.bodyPartsCost)

            var sourcesAmount = 0;
            var bodyPartsSum = 0
            var counter = 0;
            for (s of Game.rooms[this.name].memory.harvestingSources) {
                bodyPartsSum += s.bodyPartsCost
                counter++;
                if (bodyPartsSum >= (CREEP_LIFE_TIME / CREEP_SPAWN_TIME) * C.HARVESTING_BODYPARTS_FRACTION) {
                    break;
                }
            }
            while (Game.rooms[this.name].memory.harvestingSources.length > counter) {
                Game.rooms[this.name].memory.harvestingSources.pop()
            }

            for (s of Game.rooms[this.name].memory.harvestingSources) {
                s.harvestingPower = 0;
                s.carryPower = 0;
                s.harvesters = 0;
            }

        }
        if (Game.rooms[this.name].memory.harvestingRooms == undefined) {
            Game.rooms[this.name].memory.harvestingRooms = []
        }

        if (Game.rooms[this.name].memory.keepersSources == undefined) {
            Game.rooms[this.name].memory.keepersSources = []
        }

        if (Game.rooms[this.name].memory.keepersRooms == undefined) {
            Game.rooms[this.name].memory.keepersRooms = []
        }

        if (Game.rooms[this.name].memory.forcedUpgrades == undefined) {
            Game.rooms[this.name].memory.forcedUpgrades = [0, 0, 0, 0, 0, 0, 0, 0]
        }


        Game.rooms[this.name].memory.progressOld = Game.rooms[this.name].memory.progress;
        Game.rooms[this.name].memory.progress = Game.rooms[this.name].controller.progress;
        if (Game.rooms[this.name].memory.progressOld != 0) {
            Game.rooms[this.name].memory.progressSum += (Game.rooms[this.name].memory.progress - Game.rooms[this.name].memory.progressOld);
        }
        Game.rooms[this.name].memory.progressCounter += 1;



        //TODO 
        // Implement planing base and building from that "plan"
        //this.buildRoom()


    }

    Game.rooms[this.name].memory.roads = []
    Game.rooms[this.name].memory.containers = []


    //Finding hostile Creeps
    var hostiles = Game.rooms[this.name].find(FIND_HOSTILE_CREEPS, {
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
    var allies = Game.rooms[this.name].find(FIND_HOSTILE_CREEPS, {
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


    //Finding structures - single Room.Find then filtering and saving id to Game.rooms[this.name].memory 
    var structures = this.find(FIND_STRUCTURES)
    for (str of structures) {
        if (str.my) {
            Game.rooms[this.name].memory.myStructures = str.id
            const type = str.structureType
            switch (type) {

                case STRUCTURE_EXTENSION:
                    Game.rooms[this.name].memory.myExtensions.push(str.id);
                    break;
                case STRUCTURE_TOWER:
                    Game.rooms[this.name].memory.myTowers.push(str.id);
                    break;
                case STRUCTURE_LAB:
                    Game.rooms[this.name].memory.myLabs.push(str.id);
                    break;
                case STRUCTURE_EXTRACTOR:
                    Game.rooms[this.name].memory.myExtractor = str.id;
                    break;
                case STRUCTURE_LINK:
                    Game.rooms[this.name].memory.myLinks.push(str.id);
                    break;
                case STRUCTURE_NUKER:
                    Game.rooms[this.name].memory.myNuker = str.id
                    break;
                case STRUCTURE_FACTORY:
                    Game.rooms[this.name].memory.myFactory = str.id
                    break;
                case STRUCTURE_OBSERVER:
                    Game.rooms[this.name].memory.myObserver = str.id
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
                    Game.rooms[this.name].memory.containers.push(str.id);
                    break;
                case STRUCTURE_ROAD:
                    Game.rooms[this.name].memory.roads.push(str.id);
                    break;
            }

        }
    }



}