const C = require('constants');
RoomPositionFunctions = require('roomPositionFunctions');
const findRouteTest = require('./findRouteTest');
const sleep = require('creepSleep')
var Traveler = require('Traveler');

class FarmingRoom {
    constructor(name, harvesting_power, carry_power, sourcesNum, distance) {
        this.name = name;
        this.harvestingPower = harvesting_power;
        this.carryPower = carry_power;
        this.sourcesNum = sourcesNum;
        this.distance = distance;
        this.harvesters = 0;

        var bodyPartsCost = (sourcesNum * 12);//parts for harvesters (max farmer is made off 12 bodyparts);
        bodyPartsCost += 14;//maxRepairer
        bodyPartsCost += Math.ceil((sourcesNum * 10 * distance * 2 * 3) / 100);//distanceCarriers
        this.bodyPartsCost = bodyPartsCost;
    }
}

class FarmingSource {
    constructor(id, name, harvesting_power, carry_power, distance, maxHarvesters,pos) {
        this.id = id;
        this.roomName = name;
        this.harvestingPower = harvesting_power;
        this.carryPower = carry_power;
        this.distance = distance;
        this.maxHarvesters = maxHarvesters;
        this.pos=pos
        this.harvesters = 0;
        var bodyPartsCost = 27;//parts for harvesters (max farmer is made off 12 bodyparts);
        bodyPartsCost += 14;//maxRepairer
        bodyPartsCost += Math.ceil((10 * distance * 2 * 3) / 100);//distanceCarriers
        this.bodyPartsCost = bodyPartsCost;


        var rawSourceIncome = ((CREEP_LIFE_TIME / ENERGY_REGEN_TIME) * SOURCE_ENERGY_CAPACITY);
        var farmersCost = 950;
        var repairerCost = 750;
        var distanceCarrierParts = ((SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME) * distance * 2 * 3) / 100;
        var distanceCarriersCost = distanceCarrierParts * 50;
        var cost = farmersCost + repairerCost + distanceCarriersCost;
        var finalIncome = rawSourceIncome - cost;
        this.calculatedIncome = finalIncome;
        this.calculatedIncomePerTick = finalIncome / CREEP_LIFE_TIME
        //total_calculated_income_per_tick += finalIncome / CREEP_LIFE_TIME;
        this.incomePerBodyPart = finalIncome / bodyPartsCost;




    }
}

class KeeperRoom {
    constructor(name, harvestingPower, carryPower, sourcesNum, distance, maxHarvesters) {
        this.name = name;
        this.harvestingPower = harvestingPower;
        this.carryPower = carryPower;
        this.sourcesNum = sourcesNum;
        this.distance = distance;
        this.maxHarvesters = 5;
        this.harvesters = 0;
        this.killer = undefined;
        this.healer = undefined;
    }
}

class KeepersSource {
    constructor(id, name, harvestingPower, carryPower, distance, maxHarvesters,pos) {
        this.id = id;
        this.name = name;
        this.harvestingPower = harvestingPower;
        this.carryPower = carryPower;
        this.distance = distance;
        this.maxHarvesters = maxHarvesters;
        this.pos=pos
        this.harvesters = 0;
        this.sourcesNum = 1;
        var sourcesNum = 1;
        var bodyPartsCost = sourcesNum * 27;//parts for harvesters (max farmer is made off 12 bodyparts);
        bodyPartsCost += 14;//maxRepairer
        bodyPartsCost += Math.ceil((sourcesNum * 10 * distance * 2 * 3) / 100);//distanceCarriers
        this.bodyPartsCost = bodyPartsCost;
    }
}

class keeperMineral {
    constructor(id, name, harvestingPower, carry_power, distance) {
        this.id = id;
        this.name = name
        this.harvestingPower = harvestingPower
        this.carryPower = carryPower
        this.distance = distance;
    }
}


function generateAdjacentRooms(tileName) {
    const [letterA, numX, letterB, numY] = tileName.match(/([a-zA-Z])(\d+)([a-zA-Z])(\d+)/).slice(1);

    const adjacentTiles = [];
    adjacentTiles.push(tileName);
    for (let x = Number(numX) - 1; x <= Number(numX) + 1; x++) {
        for (let y = Number(numY) - 1; y <= Number(numY) + 1; y++) {
            if (x === Number(numX) && y === Number(numY) || x < 1 || y < 1) {
                //continue; // Skip the original tile and invalid coordinates.
            }
            adjacentTiles.push(`${letterA}${x}${letterB}${y}`);
        }
    }

    return adjacentTiles;
}

function areRoomsAdjacent(tileName1, tileName2) {
    const [letterA1, numX1, letterB1, numY1] = tileName1.match(/([a-zA-Z])(\d+)([a-zA-Z])(\d+)/).slice(1);
    const [letterA2, numX2, letterB2, numY2] = tileName2.match(/([a-zA-Z])(\d+)([a-zA-Z])(\d+)/).slice(1);

    const xDiff = Math.abs(Number(numX1) - Number(numX2));
    const yDiff = Math.abs(Number(numY1) - Number(numY2));

    return (
        xDiff <= 1 && yDiff <= 1 &&
        (letterA1 === letterA2 || Math.abs(letterA1.charCodeAt(0) - letterA2.charCodeAt(0)) <= 1) &&
        (letterB1 === letterB2 || Math.abs(letterB1.charCodeAt(0) - letterB2.charCodeAt(0)) <= 1)
    );
}

function isRoomKeepersRoom(coordinate) {
    // Extract the numeric parts from the coordinate string
    const match = coordinate.match(/W(\d+)N(\d+)|W(\d+)S(\d+)|E(\d+)S(\d+)|E(\d+)N(\d+)/);

    if (!match) {
        return false; // Return false if the format does not match
    }

    // Extract the numeric values, which could be in different capturing groups
    const x = parseInt(match[1] || match[3] || match[5] || match[7], 10);
    const y = parseInt(match[2] || match[4] || match[6] || match[8], 10);

    // Get the last digit of both coordinates
    const lastDigitX = x % 10;
    const lastDigitY = y % 10;

    // Check if both last digits are in the range <4,6>
    return (lastDigitX >= 4 && lastDigitX <= 6) && (lastDigitY >= 4 && lastDigitY <= 6);
}

Creep.prototype.roleScout = function roleScout(homeSpawn) {

    homeSpawn = Game.getObjectById(this.memory.homeSpawnID)
    if (homeSpawn == null) {
        this.suicide()
    }
    //homeSpawn.pos
    //homeSpawn object

    if (Game.rooms[this.memory.homeRoom].memory.roomsToScan == undefined) {
        Game.rooms[this.memory.homeRoom].memory.roomsToScan = [];
        var rooms_around = generateAdjacentRooms(this.memory.homeRoom)
        for (r of rooms_around) {
            if (Game.map.findRoute(this.memory.homeRoom, r).length <= 2) {
                Game.rooms[this.memory.homeRoom].memory.roomsToScan.push(r)
            }
        }
    }
    else if (Game.rooms[this.memory.homeRoom].memory.roomsToScan.length == 0) {
        Game.rooms[this.memory.homeRoom].memory.if_success_planning_base = false
        Game.rooms[this.memory.homeRoom].memory.forcedUpgrades[Game.rooms[this.memory.homeRoom].controller.level - 1] = 0
        this.suicide();
    }

    if (Game.rooms[this.memory.homeRoom].memory.roomsToScan != undefined && Game.rooms[this.memory.homeRoom].memory.roomsToScan.length > 0) {
        if (this.room.name != Game.rooms[this.memory.homeRoom].memory.roomsToScan[0]) {

            /*
            const exitDir = this.room.findExitTo(Game.rooms[this.memory.homeRoom].memory.roomsToScan[0]);
            const exit = this.pos.findClosestByRange(exitDir);
            this.moveTo(exit, { reusePath: 21, avoidHostile: true, avoidCreeps: true, avoidSk: true });
            */
           this.travelTo(new RoomPosition(25,25,Game.rooms[this.memory.homeRoom].memory.roomsToScan[0]),{range: 22})



        }
        else {
            Game.rooms[this.memory.homeRoom].memory.roomsToScan.shift();
            if ((this.room.find(FIND_HOSTILE_CREEPS).length > 0 || this.room.find(FIND_STRUCTURES, {
                filter: function (structure) {
                    return structure.structureType == STRUCTURE_KEEPER_LAIR;
                }
            }).length > 0)
                && this.room.find(FIND_SOURCES).length > 2
                    /*&& areRoomsAdjacent(this.memory.homeRoom, this.room.name) == true */) {
                this.say("Keepers");
                var sources = this.room.find(FIND_SOURCES);
                var mineral = this.room.find(FIND_MINERALS);
                //Game.rooms[this.memory.homeRoom].memory.src1=sources;
                sources.push(mineral[0]);
                //Game.rooms[this.memory.homeRoom].memory.src2=sources;
                var sourcesNum = sources.length;
                var maxHarvesters = 0;
                for (src in sources) {
                    maxHarvesters += src.pos.getOpenPositions().length;
                }
                var avgDistance = 0;

                // Keepers sources
                for (src in sources) {
                    var ret = findRouteTest(homeSpawn.pos, src.pos.getNearbyPositions())


                    avgDistance += ret.path.length;

                    var newKeeperSource = new KeepersSource(sources[i].id, this.room.name, 0, 0, ret.path.length, src.pos.getOpenPositions().length,src.pos)

                    // check if this source is already scanned or in other use
                    var alreadyUsed = false;

                    // If source is used in other room or on creep homeRoom
                    for (otherRoom in Memory.mainRooms) {
                        if (Game.rooms[otherRoom].memory.keepersSources.some(obj => obj.id === src.id)) {
                            alreadyUsed = true
                        }
                    }

                    if (alreadyUsed && ret.path.length < 125) {
                        Game.rooms[this.memory.homeRoom].memory.keepersSources.push(newKeeperSource)
                    }



                }

                //Keepers rooms

                var new_keeper_room = new KeeperRoom(this.room.name, 0, 0, sourcesNum, avgDistance, maxHarvesters);

                var alreadyUsed = false

                for (otherRoom in Memory.mainRooms) {
                    if (Game.rooms[otherRoom].memory.keepersRooms.some(obj => obj.id === src.id)) {
                        alreadyUsed = true
                    }
                }

                if (alreadyUsed == false && ret.path.length < 100) {
                    Game.rooms[this.memory.homeRoom].memory.keepersRooms.push(new_keeper_room);

                }

            }
            else if (this.room.find(FIND_HOSTILE_CREEPS).length == 0 &&
                (this.room.find(FIND_SOURCES).length >= 1)) {
                this.say("farming");
                var sources = this.room.find(FIND_SOURCES);
                var sourcesNum = sources.length;
                var maxHarvesters = 0;
                for (src of sources) {
                    maxHarvesters += src.pos.getOpenPositions().length;
                }
                var avgDistance = 0;
                for (src of sources) {
                    var ret = findRouteTest(homeSpawn.pos, src.pos.getNearbyPositions())

                    avgDistance += ret.path.length;

                    var new_farming_source = new FarmingSource(src.id, this.room.name, 0, 0, ret.path.length, Math.max(1, src.pos.getOpenPositions().length),src.pos)

                    var alreadyUsed = false
                    //If other player is reserving room (if player is enemy - we will try to harvest there)
                    if (this.room.controller != undefined && this.room.controller.reservation != undefined && this.room.controller.reservation.username != C.USERNAME
                        && Memory.enemies.includes(this.room.controller.reservation.username)
                    ) {

                        alreadyUsed = true
                    }

                    // If source is used in other room or on creep homeRoom
                    for (otherRoom of Memory.mainRooms) {
                        if (Game.rooms[otherRoom].memory.harvestingSources.some(obj => obj.id === src.id)) {
                            alreadyUsed = true
                        }
                    }


                    var isRoadSafe = true;

                    for (position of ret.path) {
                        if (isRoomKeepersRoom(position.roomName) == true) {
                            isRoadSafe = false
                            break;
                        }
                    }

                    if (ret.path.length < 100 && alreadyUsed != true
                        && isRoadSafe == true
                    ) {
                        Game.rooms[this.memory.homeRoom].memory.harvestingSources.push(new_farming_source);
                    }



                }

                //farmingRoom
                avgDistance = avgDistance / sources.length;
                var newFarming = new FarmingRoom(this.room.name, 0, 0, sourcesNum, avgDistance);
                //this.say(this.room.controller.owner);



                var alreadyUsed = false;
                for (otherRoom of Memory.mainRooms) {
                    if (Game.rooms[otherRoom].memory.harvestingRooms.some(obj => obj.name === this.room.name)) {
                        alreadyUsed = true
                    }
                }

                if (!alreadyUsed) {
                    Game.rooms[this.memory.homeRoom].memory.harvestingRooms.push(newFarming);
                }
            }

        }
    }

}
