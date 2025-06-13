const C = require('contants');

const findRouteTest = require('./findRouteTest');

class farmingRoom {
    constructor(name, harvesting_power, carry_power, sourcesNum, distance, maxFarmers) {
        this.name = name;
        this.harvesting_power = harvesting_power;
        this.carry_power = carry_power;
        this.sourcesNum = sourcesNum;
        this.distance = distance;
        this.maxFarmers = maxFarmers;

        this.farmers = 0;

        var body_parts_cost = (sourcesNum * 12);//parts for farmers (max farmer is made off 12 bodyparts);
        body_parts_cost += 14;//maxRepairer
        body_parts_cost += Math.ceil((sourcesNum * 10 * distance * 2 * 3) / 100);//distanceCarriers
        this.body_parts_cost = body_parts_cost;
    }
}

class farmingSource {
    constructor(id, name, harvesting_power, carry_power, distance, maxFarmers) {
        this.id = id;
        this.name = name;
        this.harvesting_power = harvesting_power;
        this.carry_power = carry_power;
        this.distance = distance;
        this.maxFarmers = maxFarmers;
        this.farmers = 0;
        this.sourcesNum = 1;
        var sourcesNum = 1;
        var body_parts_cost = sourcesNum * 27;//parts for farmers (max farmer is made off 12 bodyparts);
        body_parts_cost += 14;//maxRepairer
        body_parts_cost += Math.ceil((sourcesNum * 10 * distance * 2 * 3) / 100);//distanceCarriers
        this.body_parts_cost = body_parts_cost;
    }
}

class keeperRoom {
    constructor(name, harvesting_power, carry_power, sourcesNum, distance, maxFarmers) {
        this.name = name;
        this.harvesting_power = harvesting_power;
        this.carry_power = carry_power;
        this.sourcesNum = sourcesNum;
        this.distance = distance;
        this.maxFarmers = 5;
        this.farmers = 0;
        this.killer = undefined;
        this.healer = undefined;
    }
}

class keeperSource {
    constructor(id, name, harvesting_power, carry_power, distance, maxFarmers) {
        this.id = id;
        this.name = name;
        this.harvesting_power = harvesting_power;
        this.carry_power = carry_power;
        this.distance = distance;
        this.maxFarmers = maxFarmers;
        this.farmers = 0;
        this.sourcesNum = 1;
        var sourcesNum = 1;
        var body_parts_cost = sourcesNum * 27;//parts for farmers (max farmer is made off 12 bodyparts);
        body_parts_cost += 14;//maxRepairer
        body_parts_cost += Math.ceil((sourcesNum * 10 * distance * 2 * 3) / 100);//distanceCarriers
        this.body_parts_cost = body_parts_cost;
    }
}

class keeperMineral {
    constructor(id, name, harvesting_power, carry_power, distance) {
        this.id = id;
        this.name = name
        this.harvesting_power = harvesting_power
        this.carry_power = carry_power
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

Creep.prototype.roleScout = function roleScout(creep, spawn) {



    if (Game.rooms[creep.memory.homeRoom].memory.roomsToScan == undefined) {
        Game.rooms[creep.memory.homeRoom].memory.roomsToScan = [];
        var rooms_around = generateAdjacentRooms(creep.memory.homeRoom)
        for (r of rooms_around) {
            if (Game.map.findRoute(creep.memory.homeRoom, r).length <= 2) {
                Game.rooms[creep.memory.homeRoom].memory.roomsToScan.push(r)
            }
        }
    }
    else if (Game.rooms[creep.memory.homeRoom].memory.roomsToScan.length == 0) {
        Game.rooms[creep.memory.homeRoom].memory.if_success_planning_base = false
        Game.rooms[creep.memory.homeRoom].memory.forced_upgrades[spawn.room.controller.level - 1] = 0
        creep.suicide();
    }

    if (Game.rooms[creep.memory.homeRoom].memory.roomsToScan != undefined && Game.rooms[creep.memory.homeRoom].memory.roomsToScan.length > 0) {
        if (creep.room.name != Game.rooms[creep.memory.homeRoom].memory.roomsToScan[0]) {
            //creep.say("MOV");

            //creep.moveTo(new RoomPosition(25, 25, Game.rooms[creep.memory.homeRoom].memory.roomsToScan[0]), { reusePath: 21, avoidHostile: true, avoidCreeps: true, avoidSk: true })

            const exitDir = creep.room.findExitTo(Game.rooms[creep.memory.homeRoom].memory.roomsToScan[0]);
            const exit = creep.pos.findClosestByRange(exitDir);
            creep.moveTo(exit, { reusePath: 21, avoidHostile: true, avoidCreeps: true, avoidSk: true });




        }
        else {
            Game.rooms[creep.memory.homeRoom].memory.roomsToScan.shift();
            if ((creep.room.find(FIND_HOSTILE_CREEPS).length > 0 || creep.room.find(FIND_STRUCTURES, {
                filter: function (structure) {
                    return structure.structureType == STRUCTURE_KEEPER_LAIR;
                }
            }).length > 0)
                && creep.room.find(FIND_SOURCES).length > 2
                    /*&& areRoomsAdjacent(creep.memory.homeRoom, creep.room.name) == true */) {
                creep.say("Keepers");
                is_keeper_room = true;
                var sources = creep.room.find(FIND_SOURCES);
                var mineral = creep.room.find(FIND_MINERALS);
                //Game.rooms[creep.memory.homeRoom].memory.src1=sources;
                sources.push(mineral[0]);
                //Game.rooms[creep.memory.homeRoom].memory.src2=sources;
                var sourcesNum = sources.length;
                var maxFarmers = 0;
                for (let i = 0; i < sourcesNum; i++) {
                    maxFarmers += sources[i].pos.getOpenPositions().length;
                }
                var avgDistance = 0;
                for (let i = 0; i < sources.length; i++) {
                    var ret = findRouteTest(spawn.pos, sources[i].pos.getNearbyPositions())

                    if (ret.incomplete == false || true) {
                        avgDistance += ret.path.length;

                        var new_keeper_source = new keeperSource(sources[i].id, creep.room.name, 0, 0, ret.path.length, sources[i].pos.getOpenPositions().length)

                        // check if this source is already scanned or in other use
                        var is_already_scanned = false;
                        for (let src of Game.rooms[creep.memory.homeRoom].memory.keepersSources) {
                            if (src.id == new_keeper_source.id) {
                                already_scanned = true;
                                break
                            }
                        }

                        var in_other_use = false;
                        for (let main_spawn_id of Memory.main_spawns) {
                            var other_spawn = Game.getObjectById(main_spawn_id);
                            if (other_spawn != null && other_spawn != spawn && other_creep.memory.homeRoom != creep.memory.homeRoom) {
                                for (let other_keeper_source of other_Game.rooms[creep.memory.homeRoom].memory.keepersSources) {

                                    if ((other_keeper_source.id == sources[i].id)) {
                                        in_other_use = true;
                                        break
                                    }
                                }
                            }
                        }
                        if (!is_already_scanned && !in_other_use && ret.path.length < 125) {
                            Game.rooms[creep.memory.homeRoom].memory.keepersSources.push(new_keeper_source)
                        }

                    }

                }
                var new_keeper_room = new keeperRoom(creep.room.name, 0, 0, sourcesNum, avgDistance, maxFarmers);
                var in_other_use = false;
                var already_scanned = false;

                for (let i = 0; i < Game.rooms[creep.memory.homeRoom].memory.keepersRooms.length; i++) {


                    for (let j = 0; j < Game.rooms[creep.memory.homeRoom].memory.keepersRooms.length; j++) {
                        if (Game.rooms[creep.memory.homeRoom].memory.keepersRooms[j].name == creep.room.name) {
                            already_scanned = true;
                        }
                    }


                    //console.log("BEFORE OTHER SPAWNS FARMING SOURCES LOOP")
                    for (let main_spawn_id of Memory.main_spawns) {
                        //console.log("main spawn id: ",main_spawn_id)
                        var other_spawn = Game.getObjectById(main_spawn_id);
                        if (other_spawn != null && other_spawn != spawn && other_creep.memory.homeRoom != creep.memory.homeRoom) {
                            for (let other_keeper_source of other_Game.rooms[creep.memory.homeRoom].memory.keepersSources) {
                                //console.log(other_keeper_source.id," ",other_keeper_source.name)
                                if (sources != undefined && sources.length > 0 && (other_keeper_source.id == sources[i].id || other_keeper_source.name == sources[i].name) && other_keeper_source.name != creep.memory.homeRoom) {
                                    //cconsole.log("source: ", sources[i].id, " in use by: ", other_spawn.name);
                                    //console.log("SKIIIIIIIIIIIPING")
                                    in_other_use = true;
                                    continue
                                }
                            }
                        }
                    }
                }

                Game.rooms[creep.memory.homeRoom].memory.keeper_room_already_scanned = already_scanned;
                Game.rooms[creep.memory.homeRoom].memory.keeper_room_in_other_use = in_other_use;

                if (already_scanned == false && in_other_use == false && ret.path.length < 100) {
                    Game.rooms[creep.memory.homeRoom].memory.keepersRooms.push(new_keeper_room);

                }

            }
            else if (creep.room.find(FIND_HOSTILE_CREEPS).length == 0 &&
                (creep.room.find(FIND_SOURCES).length >= 1 )) {
                creep.say("farming");
                var sources = creep.room.find(FIND_SOURCES);
                var sourcesNum = sources.length;
                var maxFarmers = 0;
                for (let i = 0; i < sourcesNum; i++) {
                    maxFarmers += sources[i].pos.getOpenPositions().length;
                }
                var avgDistance = 0;
                for (let i = 0; i < sources.length; i++) {
                    var ret = findRouteTest(spawn.pos, sources[i].pos.getNearbyPositions())

                    avgDistance += ret.path.length;

                    var new_farming_source = new farmingSource(sources[i].id, creep.room.name, 0, 0, ret.path.length, Math.max(1, sources[i].pos.getOpenPositions().length))

                    var already_scanned = false;
                    for (let j = 0; j < Game.rooms[creep.memory.homeRoom].memory.farmingSources.length; j++) {
                        if (Game.rooms[creep.memory.homeRoom].memory.farmingSources[j].id == sources[i].id) {
                            already_scanned = true;
                        }

                        if (creep.room.controller != undefined) {
                            if (creep.room.controller.reservation != undefined) {

                                if ((creep.room.controller.reservation.username == USERNAME) && already_scanned == false) {
                                    //already_scanned = true;
                                }
                                else if (creep.room.controller.reservation.username == 'Invader') {
                                    var invader_core = creep.room.find(FIND_STRUCTURES, {
                                        filter: function (hostile) {
                                            return hostile.structureType == STRUCTURE_INVADER_CORE;
                                        }
                                    });
                                    if (invader_core != undefined && invader_core.length > 0) {
                                        already_scanned = false;
                                    }

                                }
                            }

                            var in_other_use = false;
                            for (let main_spawn_id of Memory.main_spawns) {
                                var other_spawn = Game.getObjectById(main_spawn_id);
                                if (other_spawn != null && other_spawn != spawn && other_creep.memory.homeRoom != creep.memory.homeRoom) {
                                    for (let other_farming_source of other_Game.rooms[creep.memory.homeRoom].memory.farmingSources) {
                                        //console.log(other_farming_source.id," ",other_farming_source.name)
                                        if ((other_farming_source.id == sources[i].id || other_farming_source.name == sources[i].name) && other_farming_source.name != creep.memory.homeRoom) {
                                            in_other_use = true;
                                            break
                                        }
                                    }
                                }
                            }

                        }

                    }

                    var is_road_safe = true;

                    for (position of ret.path) {
                        if (isRoomKeepersRoom(position.roomName) == true) {
                            is_road_safe = false
                            break;
                        }
                    }

                    //console.log(already_scanned, " ",in_other_use)
                    if (already_scanned == false && ret.path.length < 100 && in_other_use != true
                        && is_road_safe == true // && ret.path.incomplete==false
                        //&& ret.incomplete==false
                    ) {
                        Game.rooms[creep.memory.homeRoom].memory.farmingSources.push(new_farming_source);
                        console.log("adding source")

                    }
                    else {
                        console.log("not added source at: ", creep.room.name)
                        console.log("already scanned: ", already_scanned == false)
                        console.log("ret.path.length < 100: ", ret.path.length < 100)
                        console.log("in_other_use != true: ", in_other_use != true)
                        console.log("is_road_safe == true: ", is_road_safe == true)
                        console.log("ret.path.incomplete==false: ", ret.path.incomplete == false)
                    }



                }
                avgDistance = avgDistance / sources.length;
                var new_farming = new farmingRoom(creep.room.name, 0, 0, sourcesNum, avgDistance, maxFarmers);
                //creep.say(creep.room.controller.owner);
                var already_scanned = false;
                for (let i = 0; i < Game.rooms[creep.memory.homeRoom].memory.farming_rooms.length; i++) {
                    if (Game.rooms[creep.memory.homeRoom].memory.farming_rooms[i].name == creep.room.name) {
                        already_scanned = true;
                    }

                    if (creep.room.controller != undefined) {
                        if (creep.room.controller.reservation != undefined) {

                            if ((creep.room.controller.reservation.username == USERNAME || creep.room.controller.reservation.username == 'Jeally_Rabbit') && already_scanned == false) {
                                already_scanned = true;
                            }
                            else if (creep.room.controller.reservation.username == 'Invader') {
                                var invader_core = creep.room.find(FIND_STRUCTURES, {
                                    filter: function (hostile) {
                                        return hostile.structureType == STRUCTURE_INVADER_CORE;
                                    }
                                });
                                if (invader_core != undefined && invader_core.length > 0) {
                                    already_scanned = false;
                                }

                            }
                        }

                        var in_other_use = false;
                        for (let main_spawn_id in Memory.main_spawns) {
                            var other_spawn = Game.getObjectById(main_spawn_id);
                            if (other_spawn != null && other_spawn != spawn && other_creep.memory.homeRoom != creep.memory.homeRoom) {
                                for (let other_farming in other_Game.rooms[creep.memory.homeRoom].memory.farming_rooms) {

                                    if (other_farming == creep.room.name && creep.room.name != creep.memory.homeRoom) {
                                        //cconsole.log("room: ", creep.room.name, " in use by: ", other_spawn.name);
                                        in_other_use = true;
                                        break
                                    }
                                }
                            }
                        }

                    }

                }

                //console.log(' ')
                //console.log(already_scanned, " ",in_other_use)
                if (already_scanned == false && avgDistance < 100 && in_other_use != true
                    && is_road_safe == true
                ) {
                    Game.rooms[creep.memory.homeRoom].memory.farming_rooms.push(new_farming);
                    //console.log("adding source from: ", creep.room.name)
                }
                else {
                    //console.log("skipping source in room: ", creep.room.name)
                }
                //console.log(" ")
                // }


            }

        }
    }

}
