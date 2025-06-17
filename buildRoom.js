const { create } = require("lodash");
//const { move_avoid_hostile } = require("./move_avoid_hostile");
var RoomPositionFunctions = require('roomPositionFunctions');
const { distanceTransform } = require("./distanceTransform");
const { floodFill } = require("./floodFill");
const mincut = require("./mincut")


// Mandatory:
// Game.rooms[this.name].memory.spawnPos - roomPosition of spawn (spawn does not have to be there)


class buildingListElement {
    constructor(x, y, roomName, structureType, minRCL) {
        this.x = x;
        this.y = y;
        this.roomName = roomName;
        this.structureType = structureType;
        this.minRCL = minRCL;
    }
}
function isPosFree(x, y, roomName) {
    if (Game.rooms[roomName] != undefined) {
        var structuresAtPos = Game.rooms[roomName].lookForAt(LOOK_STRUCTURES, x, y)
        for (str of structuresAtPos) {
            if (str.structureType != STRUCTURE_ROAD && str.structureType != STRUCTURE_RAMPART)
                return false;
            break;
        }
        return true
    }

}


function planRoadToTarget(roomCM, target, rcl, myRange, start) {

    var spawn = Game.rooms[this.name].find(FIND_MY_STRUCTURES, {
        filter:
            function (str) {
                return str.structureType === STRUCTURE_SPAWN && str.name.endsWith('1')
            }
    })
    if (spawn.length > 0) {
        spawn = spawn[0]
    }
    else {
        return -1
    }
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (Game.rooms[this.name].memory.roomPlan[i][j] != 0 && Game.rooms[this.name].memory.roomPlan[i][j] != STRUCTURE_ROAD && Game.rooms[this.name].memory.roomPlan[i][j] != STRUCTURE_RAMPART) {
                roomCM.set(i, j, 255);
            }
            else if (Game.rooms[this.name].memory.roomPlan[i][j] != 0 && Game.rooms[this.name].memory.roomPlan[i][j] == STRUCTURE_ROAD
                && roomCM.get(i, j) != 255) {
                //roomCM.set(i, j, 1);
            }
        }
    }
    if (myRange == undefined) {
        myRange = 1;
    }

    //console.log("target: ", target);
    destination = target;
    var startingPos = new RoomPosition(spawnPos.x, spawnPos.y, this.name)
    if (start != undefined) { startingPos = start }
    //var ret = PathFinder.search(spawnPos, destination, {
    var ret = PathFinder.search(startingPos, destination, {
        //maxRooms: 64,
        range: myRange,
        plainCost: 2,
        swampCost: 2,
        maxOps: 8000,

        roomCallback: function (roomName) {

            //let room = this.name;
            // In this example `room` will always exist, but since 
            // PathFinder supports searches which span multiple rooms 
            // you should be careful!
            //costs = new PathFinder.CostMatrix;

            let room = Game.rooms[roomName];
            if (!room) { return; }

            if (roomName == this.name) {
                costs = roomCM;
            }
            else {
                // setting costmatrix for for rooms other than this.name
                //console.log(roomName);
                costs = new PathFinder.CostMatrix;
                const terrain = room.getTerrain()

                for (let y = 0; y < 50; y++) {
                    for (let x = 0; x < 50; x++) {
                        const tile = terrain.get(x, y);
                        const weight =
                            tile === TERRAIN_MASK_WALL ? 255 : // wall  => unwalkable
                                tile === TERRAIN_MASK_SWAMP ? 10 : // swamp => weight:  10
                                    2; // plain => weight:  2
                        costs.set(x, y, weight);
                    }
                }
            }



            room.find(FIND_STRUCTURES).forEach(function (struct) {
                if (struct.structureType === STRUCTURE_ROAD) {
                    // Favor roads over plain tiles
                    costs.set(struct.pos.x, struct.pos.y, 1);
                } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                    (struct.structureType !== STRUCTURE_RAMPART ||
                        !struct.my)) {
                    // Can't walk through non-walkable buildings
                    costs.set(struct.pos.x, struct.pos.y, 255);
                }
            });

            // avoid construction sites
            room.find(FIND_CONSTRUCTION_SITES, {
                filter: function (construction) {
                    return construction.structureType != STRUCTURE_ROAD;
                }
            }).forEach(function (struct) {
                costs.set(struct.pos.x, struct.pos.y, 255);
            });

            //favour roads under construction
            room.find(FIND_CONSTRUCTION_SITES, {
                filter: function (construction) {
                    return construction.structureType == STRUCTURE_ROAD;
                }
            }).forEach(function (struct) {
                costs.set(struct.pos.x, struct.pos.y, 1);
            });





            //costs.set(destination.x, destination.y, 255);

            return costs;
        }
    });




    ////////////////////////////////////

    if (ret.incomplete != true || true) {

        for (let i = 0; i < ret.path.length; i++) {

            if (i == ret.path.length - 1 && Game.rooms[this.name].controller.pos.inRangeTo(ret.path[i].x, ret.path[i].y, 3)) {
                Game.rooms[this.name].memory.distanceToController = ret.path.length
            }

            Game.rooms[this.name].memory.roadBuildingList.push(new buildingListElement(ret.path[i].x, ret.path[i].y, ret.path[i].roomName, STRUCTURE_ROAD, rcl));
            if (ret.path[i].roomName == this.name && roomCM.get(ret.path[i].x, ret.path[i].y) < 255) {
                Game.rooms[this.name].memory.roomPlan[ret.path[i].x][ret.path[i].y] = STRUCTURE_ROAD;

                //const terrain = Game.rooms[this.name].getTerrain();

                //Game.rooms[ret.path[i].roomName].visual.circle(ret.path[i].x, ret.path[i].y, { fill: '#666666', radius: 0.5, stroke: 'pink' });

                //console.log(ret.path[i].x, " ", ret.path[i].y);
                if ((Game.rooms[this.name].memory.roomPlan[ret.path[i].x][ret.path[i].y] == 0 || Game.rooms[this.name].memory.roomPlan[ret.path[i].x][ret.path[i].y] == STRUCTURE_ROAD)
                    && isPosFree(ret.path[i].x, ret.path[i].y, ret.path[i].roomName) == true && roomCM.get(ret.path[i].x, ret.path[i].y) < 255

                ) { // tile is empty on plan and in room
                    Game.rooms[this.name].memory.roomPlan[ret.path[i].x][ret.path[i].y] = STRUCTURE_ROAD;
                    //roomCM.set(ret.path[i].x, ret.path[i].y, 1);
                }
            }


            //Game.rooms[this.name].createConstructionSite(ret.path[i], STRUCTURE_ROAD);
            // }

        }
    }

    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (Game.rooms[this.name].memory.roomPlan[i][j] == STRUCTURE_ROAD) {
                roomCM.set(i, j, 0);
            }

        }
    }

}






function createExtensionStamp(x, y, rcl) { // need min 3's from distanceTransform
    const terrain = Game.rooms[this.name].getTerrain();


    Game.rooms[this.name].memory.roomPlan[x][y] = STRUCTURE_EXTENSION;//middle
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x, y, this.name, STRUCTURE_EXTENSION, rcl));
    Game.rooms[this.name].memory.roomPlan[x - 1][y] = STRUCTURE_EXTENSION;//left
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x - 1, y, this.name, STRUCTURE_EXTENSION, rcl));
    Game.rooms[this.name].memory.roomPlan[x + 1][y] = STRUCTURE_EXTENSION;//right
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x + 1, y, this.name, STRUCTURE_EXTENSION, rcl));
    Game.rooms[this.name].memory.roomPlan[x][y - 1] = STRUCTURE_EXTENSION;//up
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x, y - 1, this.name, STRUCTURE_EXTENSION, rcl));
    Game.rooms[this.name].memory.roomPlan[x][y + 1] = STRUCTURE_EXTENSION;//down
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x, y + 1, this.name, STRUCTURE_EXTENSION, rcl));

    //roads around it
    if (terrain.get(x, y + 2) != TERRAIN_MASK_WALL) {
        Game.rooms[this.name].memory.roomPlan[x][y + 2] = STRUCTURE_ROAD;
        Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x, y + 2, this.name, STRUCTURE_ROAD, rcl));
    }
    if (terrain.get(x, y - 2) != TERRAIN_MASK_WALL) {
        Game.rooms[this.name].memory.roomPlan[x][y - 2] = STRUCTURE_ROAD;
        Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x, y - 2, this.name, STRUCTURE_ROAD, rcl));
    }
    if (terrain.get(x + 2, y) != TERRAIN_MASK_WALL) {
        Game.rooms[this.name].memory.roomPlan[x + 2][y] = STRUCTURE_ROAD;
        Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x + 2, y, this.name, STRUCTURE_ROAD, rcl));
    }
    if (terrain.get(x - 2, y) != TERRAIN_MASK_WALL) {
        Game.rooms[this.name].memory.roomPlan[x - 2][y] = STRUCTURE_ROAD;
        Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x - 2, y, this.name, STRUCTURE_ROAD, rcl));
    }
    if (terrain.get(x + 1, y + 1) != TERRAIN_MASK_WALL) {
        Game.rooms[this.name].memory.roomPlan[x + 1][y + 1] = STRUCTURE_ROAD;
        Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x + 1, y + 1, this.name, STRUCTURE_ROAD, rcl));
    }
    if (terrain.get(x + 1, y - 1) != TERRAIN_MASK_WALL) {
        Game.rooms[this.name].memory.roomPlan[x + 1][y - 1] = STRUCTURE_ROAD;
        Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x + 1, y - 1, this.name, STRUCTURE_ROAD, rcl));
    }
    if (terrain.get(x - 1, y + 1) != TERRAIN_MASK_WALL) {
        Game.rooms[this.name].memory.roomPlan[x - 1][y + 1] = STRUCTURE_ROAD;
        Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x - 1, y + 1, this.name, STRUCTURE_ROAD, rcl));
    }
    if (terrain.get(x - 1, y - 1) != TERRAIN_MASK_WALL) {
        Game.rooms[this.name].memory.roomPlan[x - 1][y - 1] = STRUCTURE_ROAD;
        Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x - 1, y - 1, this.name, STRUCTURE_ROAD, rcl));
    }




    return 0;
}

function createManagerStamp(x, y) {

    Game.rooms[this.name].memory.roomPlan[x - 1][y - 1] = STRUCTURE_LINK;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x - 1, y - 1, this.name, STRUCTURE_LINK, 5));
    Game.rooms[this.name].memorymanager_link_pos = new RoomPosition(x - 1, y - 1, this.name);
    Game.rooms[this.name].memory.roomPlan[x - 1][y] = STRUCTURE_NUKER;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x - 1, y, this.name, STRUCTURE_NUKER, 8));
    Game.rooms[this.name].memory.roomPlan[x - 1][y + 1] = STRUCTURE_TERMINAL;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x - 1, y + 1, this.name, STRUCTURE_TERMINAL, 5));
    Game.rooms[this.name].memory.roomPlan[x][y - 1] = STRUCTURE_FACTORY;
    //Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x, y - 1, this.name, STRUCTURE_FACTORY, 7));
    Game.rooms[this.name].memory.roomPlan[x][y + 1] = STRUCTURE_SPAWN;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x, y + 1, this.name, STRUCTURE_SPAWN, 7));
    Game.rooms[this.name].memory.roomPlan[x + 1][y - 1] = STRUCTURE_STORAGE;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x + 1, y - 1, this.name, STRUCTURE_STORAGE, 4));
    Game.rooms[this.name].memory.storagePos = new RoomPosition(x + 1, y - 1, this.name);
    //Game.rooms[this.name].memory.roomPlan[x + 1][y] = STRUCTURE_POWER_SPAWN;
    //Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x + 1, y, this.name, STRUCTURE_POWER_SPAWN, 8));

    //top horizontal edge
    Game.rooms[this.name].memory.roomPlan[x - 1][y - 2] = STRUCTURE_ROAD;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x - 1, y - 2, this.name, STRUCTURE_ROAD, 4));
    Game.rooms[this.name].memory.roomPlan[x][y - 2] = STRUCTURE_ROAD;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x, y - 2, this.name, STRUCTURE_ROAD, 4));
    Game.rooms[this.name].memory.roomPlan[x + 1][y - 2] = STRUCTURE_ROAD;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x + 1, y - 2, this.name, STRUCTURE_ROAD, 4));

    //left vertical edge
    Game.rooms[this.name].memory.roomPlan[x - 2][y - 1] = STRUCTURE_ROAD;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x - 2, y - 1, this.name, STRUCTURE_ROAD, 4));
    Game.rooms[this.name].memory.roomPlan[x - 2][y] = STRUCTURE_ROAD;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x - 2, y, this.name, STRUCTURE_ROAD, 4));
    Game.rooms[this.name].memory.roomPlan[x - 2][y + 1] = STRUCTURE_ROAD;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x - 2, y + 1, this.name, STRUCTURE_ROAD, 4));

    //bottom horizontal
    Game.rooms[this.name].memory.roomPlan[x - 1][y + 2] = STRUCTURE_ROAD;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x - 1, y + 2, this.name, STRUCTURE_ROAD, 4));
    Game.rooms[this.name].memory.roomPlan[x][y + 2] = STRUCTURE_ROAD;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x, y + 2, this.name, STRUCTURE_ROAD, 4));

    //diagonals
    Game.rooms[this.name].memory.roomPlan[x + 1][y + 1] = STRUCTURE_ROAD;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x + 1, y + 1, this.name, STRUCTURE_ROAD, 4));
    Game.rooms[this.name].memory.roomPlan[x + 2][y] = STRUCTURE_ROAD;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x + 2, y, this.name, STRUCTURE_ROAD, 4));
    Game.rooms[this.name].memory.roomPlan[x + 2][y - 1] = STRUCTURE_ROAD;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x + 2, y - 1, this.name, STRUCTURE_ROAD, 4));
}


function planExtensionStamp(roomCM, rcl) {
    var isSuccess = false;
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (Game.rooms[this.name].memory.roomPlan[i][j] != 0) {
                roomCM.set(i, j, 255);
            }

        }
    }
    let distanceCM = Game.rooms[this.name].diagonalDistanceTransform(roomCM, false);

    //Seeds - starting positions for floodfill (it have to be an array - something iterable)
    // extensions are builded as close as possible to storage and spawnPos
    var seeds = [];
    if (Game.rooms[this.name].storage != undefined || true) {


        seeds.push(Game.rooms[this.name].memory.storagePos);

        if (Game.rooms[this.name].memory.spawnPos != undefined) {
            seeds.push(Game.rooms[this.name].memory.spawnPos)
        }
        var floodCM = Game.rooms[this.name].floodFill(seeds);

        var posForStamp = new RoomPosition(0, 0, this.name);
        var minDistanceFromSpawn = 100;
        for (i = 0; i < 50; i++) {
            for (let j = 0; j < 50; j++) {
                if (distanceCM.get(i, j) >= 2 && floodCM.get(i, j) < minDistanceFromSpawn
                    && (i > 5 && i < 45) && (j > 5 && j < 45)) {
                    minDistanceFromSpawn = floodCM.get(i, j);
                    posForStamp.x = i;
                    posForStamp.y = j;
                }
            }
        }

        createExtensionStamp(posForStamp.x, posForStamp.y, rcl);

        for (let i = 0; i < 50; i++) {
            for (let j = 0; j < 50; j++) {
                if (Game.rooms[this.name].memory.roomPlan[i][j] != 0) {
                    roomCM.set(i, j, 255);
                    isSuccess = true;
                }
            }
        }

        return isSuccess;
    }

}



function planManagerStamp(roomCM) {
    var isSuccess = false;
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (Game.rooms[this.name].memory.roomPlan[i][j] != 0) {
                roomCM.set(i, j, 255);
            }
        }
    }


    var posForManager = new RoomPosition(0, 0, this.name);
    seeds = [];
    if (Game.rooms[this.name].memory.spawnPos != undefined) {
        seeds.push(Game.rooms[this.name].memory.spawnPos)
    }
    else {
        return -2
    }
    //TESTING
    //seeds.push(Game.rooms[this.name].controller.pos);
    //TESTING

    distanceCM = Game.rooms[this.name].diagonalDistanceTransform(roomCM, false);


    Memory.roomVisuals = false;
    floodCM = Game.rooms[this.name].floodFill(seeds);
    Memory.roomVisuals = false

    minDistanceFromSpawn = 100;
    for (i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (distanceCM.get(i, j) >= 4 && floodCM.get(i, j) < minDistanceFromSpawn
                && i > 6 && i < 44 && j > 6 && j < 44) {
                minDistanceFromSpawn = floodCM.get(i, j);
                posForManager.x = i;
                posForManager.y = j;
            }
        }
    }

    createManagerStamp(posForManager.x, posForManager.y);
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (Game.rooms[this.name].memory.roomPlan[i][j] != 0) {
                roomCM.set(i, j, 255);
                isSuccess = true;
            }
        }
    }
    return isSuccess;
}

function planMainSpawnStamp(roomCM) {

    var spawnPos=null;
    if(Game.rooms[this.name].memory.spawnPos!=undefined)
    {
        spawnPos=new RoomPosition(Game.rooms[this.name].memory.spawnPos.x,Game.rooms[this.name].memory.spawnPos.y,this.name)
    }
    else{
        return -1
    }

    Game.rooms[this.name].memory.roomPlan[spawnPos.x][spawnPos.y] = STRUCTURE_SPAWN; // seting spawn pos at plan

    //if (Game.rooms[this.name].controller.level >= 2) {
    Game.rooms[this.name].memory.roomPlan[spawnPos.x + 1][spawnPos.y] = STRUCTURE_EXTENSION;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(spawnPos.x + 1, spawnPos.y, this.name, STRUCTURE_EXTENSION, 2));

    Game.rooms[this.name].memory.roomPlan[spawnPos.x + 2][spawnPos.y] = STRUCTURE_EXTENSION;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(spawnPos.x + 2, spawnPos.y, this.name, STRUCTURE_EXTENSION, 2));

    Game.rooms[this.name].memory.roomPlan[spawnPos.x + 2][spawnPos.y - 1] = STRUCTURE_EXTENSION;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(spawnPos.x + 2, spawnPos.y - 1, this.name, STRUCTURE_EXTENSION, 2));

    Game.rooms[this.name].memory.roomPlan[spawnPos.x + 1][spawnPos.y - 2] = STRUCTURE_EXTENSION;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(spawnPos.x + 1, spawnPos.y - 2, this.name, STRUCTURE_EXTENSION, 2));

    Game.rooms[this.name].memory.roomPlan[spawnPos.x][spawnPos.y - 1] = STRUCTURE_EXTENSION;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(spawnPos.x, spawnPos.y - 1, this.name, STRUCTURE_EXTENSION, 2));

    Game.rooms[this.name].memory.roomPlan[spawnPos.x + 2][spawnPos.y - 2] = STRUCTURE_CONTAINER;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(spawnPos.x + 2, spawnPos.y - 2, this.name, STRUCTURE_CONTAINER, 2));

    //if (Game.rooms[this.name].controller.level >= 3) {
    Game.rooms[this.name].memory.roomPlan[spawnPos.x + 2][spawnPos.y - 2] = STRUCTURE_CONTAINER;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(spawnPos.x + 2, spawnPos.y - 2, this.name, STRUCTURE_CONTAINER, 2));

    Game.rooms[this.name].memory.roomPlan[spawnPos.x + 2][spawnPos.y - 3] = STRUCTURE_EXTENSION;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(spawnPos.x + 2, spawnPos.y - 3, this.name, STRUCTURE_EXTENSION, 3));

    Game.rooms[this.name].memory.roomPlan[spawnPos.x + 2][spawnPos.y - 4] = STRUCTURE_EXTENSION;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(spawnPos.x + 2, spawnPos.y - 4, this.name, STRUCTURE_EXTENSION, 3));

    Game.rooms[this.name].memory.roomPlan[spawnPos.x + 1][spawnPos.y - 4] = STRUCTURE_EXTENSION;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(spawnPos.x + 1, spawnPos.y - 4, this.name, STRUCTURE_EXTENSION, 3));

    //third spawn
    Game.rooms[this.name].memory.roomPlan[spawnPos.x][spawnPos.y - 4] = STRUCTURE_SPAWN;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(spawnPos.x, spawnPos.y - 4, this.name, STRUCTURE_SPAWN, 8));

    Game.rooms[this.name].memory.roomPlan[spawnPos.x][spawnPos.y - 3] = STRUCTURE_EXTENSION;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(spawnPos.x, spawnPos.y - 3, this.name, STRUCTURE_EXTENSION, 3));

    // if (Game.rooms[this.name].controller.level >= 3) {
    Game.rooms[this.name].memory.roomPlan[spawnPos.x - 2][spawnPos.y - 2] = STRUCTURE_CONTAINER;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(spawnPos.x - 2, spawnPos.y - 2, this.name, STRUCTURE_CONTAINER, 3));

    Game.rooms[this.name].memory.roomPlan[spawnPos.x - 1][spawnPos.y] = STRUCTURE_EXTENSION;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(spawnPos.x - 1, spawnPos.y, this.name, STRUCTURE_EXTENSION, 3));

    Game.rooms[this.name].memory.roomPlan[spawnPos.x - 2][spawnPos.y] = STRUCTURE_EXTENSION;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(spawnPos.x - 2, spawnPos.y, this.name, STRUCTURE_EXTENSION, 3));

    Game.rooms[this.name].memory.roomPlan[spawnPos.x - 2][spawnPos.y - 1] = STRUCTURE_EXTENSION;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(spawnPos.x - 2, spawnPos.y - 1, this.name, STRUCTURE_EXTENSION, 3));

    Game.rooms[this.name].memory.roomPlan[spawnPos.x - 1][spawnPos.y - 2] = STRUCTURE_EXTENSION;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(spawnPos.x - 1, spawnPos.y - 2, this.name, STRUCTURE_EXTENSION, 3));

    Game.rooms[this.name].memory.roomPlan[spawnPos.x - 2][spawnPos.y - 3] = STRUCTURE_EXTENSION;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(spawnPos.x - 2, spawnPos.y - 3, this.name, STRUCTURE_EXTENSION, 3));

    // if (Game.rooms[this.name].controller.level >= 4) {
    Game.rooms[this.name].memory.roomPlan[spawnPos.x - 2][spawnPos.y - 4] = STRUCTURE_EXTENSION;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(spawnPos.x - 2, spawnPos.y - 4, this.name, STRUCTURE_EXTENSION, 4));
    Game.rooms[this.name].memory.roomPlan[spawnPos.x - 1][spawnPos.y - 4] = STRUCTURE_EXTENSION;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(spawnPos.x - 1, spawnPos.y - 4, this.name, STRUCTURE_EXTENSION, 4));
    //if (Game.rooms[this.name].controller.level >= 5) {
    Game.rooms[this.name].memory.roomPlan[spawnPos.x][spawnPos.y - 2] = STRUCTURE_LINK;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(spawnPos.x, spawnPos.y - 2, this.name, STRUCTURE_LINK, 3));
    Game.rooms[this.name].memoryfiller_link_pos = new RoomPosition(spawnPos.x, spawnPos.y - 2, this.name)

    //}
    // }
    //}

    //}


    // }

    for (let i = 0; i < 5; i++) {
        //bottom edge
        Game.rooms[this.name].memory.roomPlan[spawnPos.x - 2 + i][spawnPos.y + 1] = STRUCTURE_ROAD;
        Game.rooms[this.name].memory.buildingList.push(new buildingListElement(spawnPos.x - 2 + i, spawnPos.y + 1, this.name, STRUCTURE_ROAD, 2));
        //top edge
        Game.rooms[this.name].memory.roomPlan[spawnPos.x - 2 + i][spawnPos.y - 5] = STRUCTURE_ROAD;
        Game.rooms[this.name].memory.buildingList.push(new buildingListElement(spawnPos.x - 2 + i, spawnPos.y - 5, this.name, STRUCTURE_ROAD, 2));
        //left edge
        Game.rooms[this.name].memory.roomPlan[spawnPos.x - 3][spawnPos.y - i] = STRUCTURE_ROAD;
        Game.rooms[this.name].memory.buildingList.push(new buildingListElement(spawnPos.x - 3, spawnPos.y - i, this.name, STRUCTURE_ROAD, 2));
        //right edge
        Game.rooms[this.name].memory.roomPlan[spawnPos.x + 3][spawnPos.y - i] = STRUCTURE_ROAD;
        Game.rooms[this.name].memory.buildingList.push(new buildingListElement(spawnPos.x + 3, spawnPos.y - i, this.name, STRUCTURE_ROAD, 2));
    }

    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (Game.rooms[this.name].memory.roomPlan[i][j] != 0) {
                roomCM.set(i, j, 255);
            }
        }
    }
}


function planLabsStamp(roomCM) {
    var isSuccess = false;
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (Game.rooms[this.name].memory.roomPlan[i][j] != 0) {
                roomCM.set(i, j, 255);
            }
        }
    }

    var posForLabs = new RoomPosition(-0, -0, this.name);
    seeds = [];
    seeds.push(Game.rooms[this.name].memory.storagePos);

    distanceCM = Game.rooms[this.name].diagonalDistanceTransform(roomCM, false);
    floodCM = Game.rooms[this.name].floodFill(seeds);

    minDistanceFromStorage = Infinity;
    for (i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (distanceCM.get(i, j) >= 5 && floodCM.get(i, j) < minDistanceFromStorage
                && i > 6 && i < 44 && j > 6 && j < 44) {
                minDistanceFromStorage = floodCM.get(i, j);
                posForLabs.x = i;
                posForLabs.y = j;
            }
        }
    }
    console.log("x: ", posForLabs.x, " y: ", posForLabs.y)
    if (posForLabs.x != 0 && posForLabs.y != 0) {
        createLabsStamp(posForLabs.x, posForLabs.y)
    }


    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (Game.rooms[this.name].memory.roomPlan[i][j] != 0) {
                roomCM.set(i, j, 255);
                isSuccess = true;
            }
        }
    }
    Game.rooms[this.name].memory.outputLabsId = undefined
    Game.rooms[this.name].memory.labsStampPos = new RoomPosition(posForLabs.x, posForLabs.y, this.name)
    return isSuccess;



}

function createLabsStamp(x, y) {
    console.log("pos for labs: ", x, " ", y)
    Game.rooms[this.name].memory.roomPlan[x - 1][y] = STRUCTURE_LAB;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x - 1, y, this.name, STRUCTURE_LAB, 6));
    Game.rooms[this.name].memory.inputLab1Pos = new RoomPosition(x - 1, y, this.name)

    Game.rooms[this.name].memory.roomPlan[x][y + 1] = STRUCTURE_LAB;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x, y + 1, this.name, STRUCTURE_LAB, 6));
    Game.rooms[this.name].memory.inputLab2Pos = new RoomPosition(x, y + 1, this.name)

    Game.rooms[this.name].memory.roomPlan[x + 1][y + 1] = STRUCTURE_LAB;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x + 1, y + 1, this.name, STRUCTURE_LAB, 6));
    Game.rooms[this.name].memoryboostingLabPos = new RoomPosition(x + 1, y + 1, this.name)

    Game.rooms[this.name].memory.roomPlan[x + 1][y] = STRUCTURE_LAB;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x + 1, y, this.name, STRUCTURE_LAB, 7));

    Game.rooms[this.name].memory.roomPlan[x][y - 1] = STRUCTURE_LAB;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x, y - 1, this.name, STRUCTURE_LAB, 7));

    Game.rooms[this.name].memory.roomPlan[x - 1][y - 1] = STRUCTURE_LAB;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x - 1, y - 1, this.name, STRUCTURE_LAB, 7));

    Game.rooms[this.name].memory.roomPlan[x - 2][y] = STRUCTURE_LAB;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x - 2, y, this.name, STRUCTURE_LAB, 8));

    Game.rooms[this.name].memory.roomPlan[x - 2][y + 1] = STRUCTURE_LAB;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x - 2, y + 1, this.name, STRUCTURE_LAB, 8));

    Game.rooms[this.name].memory.roomPlan[x - 1][y + 2] = STRUCTURE_LAB;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x - 1, y + 2, this.name, STRUCTURE_LAB, 8));

    Game.rooms[this.name].memory.roomPlan[x][y + 2] = STRUCTURE_LAB;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x, y + 2, this.name, STRUCTURE_LAB, 8));

    for (let i = 0; i < 3; i++) {
        // TOP LEFT
        Game.rooms[this.name].memory.roomPlan[x - 3 + i][y - i] = STRUCTURE_ROAD;
        Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x - 3 + i, y - i, this.name, STRUCTURE_ROAD, 6));

        // TOP RIGHT
        Game.rooms[this.name].memory.roomPlan[x + i][y - 2 + i] = STRUCTURE_ROAD;
        Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x + i, y - 2 + i, this.name, STRUCTURE_ROAD, 6));

        // BOTTOM LEFT
        Game.rooms[this.name].memory.roomPlan[x - 3 + i][y + 1 + i] = STRUCTURE_ROAD;
        Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x - 3 + i, y + 1 + i, this.name, STRUCTURE_ROAD, 6));

        // BOTTOM RIGHT
        Game.rooms[this.name].memory.roomPlan[x + i][y + 3 - i] = STRUCTURE_ROAD;
        Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x + i, y + 3 - i, this.name, STRUCTURE_ROAD, 6));

        // MIDDLE
        Game.rooms[this.name].memory.roomPlan[x - 2 + i][y + 2 - i] = STRUCTURE_ROAD;
        Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x - 2 + i, y + 2 - i, this.name, STRUCTURE_ROAD, 6));
    }
}

function planTowersStamp(roomCM) {
    var isSuccess = false;
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (Game.rooms[this.name].memory.roomPlan[i][j] != 0) {
                roomCM.set(i, j, 255);
            }
        }
    }

    var posForTower = new RoomPosition(0, 0, this.name);
    seeds = [];
    seeds.push(Game.rooms[this.name].memory.storagePos);
    if (Game.rooms[this.name].memory.spawnPos != undefined) {
        seeds.push(Game.rooms[this.name].memory.spawnPos)
    }

    distanceCM = Game.rooms[this.name].distanceTransform(roomCM, false);
    //Memory.roomVisuals=false;
    floodCM = Game.rooms[this.name].floodFill(seeds);

    minDistanceFromSpawn = 100;
    for (i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (distanceCM.get(i, j) >= 3 && floodCM.get(i, j) < minDistanceFromSpawn && i > 5 && i < 45 && j > 5 && j < 45) {
                minDistanceFromSpawn = floodCM.get(i, j);
                posForTower.x = i;
                posForTower.y = j;
            }
        }
    }

    createTowerStamp(posForTower.x, posForTower.y)
    Game.rooms[this.name].memory.posForTowerKeeper = posForTower;
    //Game.rooms[this.name].memory.roomPlan[posForTower.x][posForTower.y] = STRUCTURE_TOWER;
    //Game.rooms[this.name].memory.buildingList.push(new buildingListElement(posForTower.x, posForTower.y, this.name, STRUCTURE_TOWER, rcl));

    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (Game.rooms[this.name].memory.roomPlan[i][j] != 0) {
                roomCM.set(i, j, 255);
                isSuccess = true;
            }
        }
    }
    return isSuccess;


}

function createTowerStamp(x, y) {
    //Game.rooms[this.name].memory.roomPlan[x][y - 1] = STRUCTURE_CONTAINER;
    //Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x - 1, y - 1, this.name, STRUCTURE_CONTAINER, 3));

    Game.rooms[this.name].memory.roomPlan[x - 1][y - 1] = STRUCTURE_LINK;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x - 1, y - 1, this.name, STRUCTURE_LINK, 8));

    Game.rooms[this.name].memory.roomPlan[x - 1][y] = STRUCTURE_TOWER;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x - 1, y, this.name, STRUCTURE_TOWER, 3));

    Game.rooms[this.name].memory.roomPlan[x - 1][y + 1] = STRUCTURE_TOWER;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x - 1, y + 1, this.name, STRUCTURE_TOWER, 5));

    Game.rooms[this.name].memory.roomPlan[x][y + 1] = STRUCTURE_TOWER;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x, y + 1, this.name, STRUCTURE_TOWER, 7));

    Game.rooms[this.name].memory.roomPlan[x + 1][y + 1] = STRUCTURE_TOWER;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x + 1, y + 1, this.name, STRUCTURE_TOWER, 8));

    Game.rooms[this.name].memory.roomPlan[x + 1][y] = STRUCTURE_TOWER;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x + 1, y, this.name, STRUCTURE_TOWER, 8));

    Game.rooms[this.name].memory.roomPlan[x + 1][y - 1] = STRUCTURE_TOWER;
    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(x + 1, y - 1, this.name, STRUCTURE_TOWER, 8));

}


function buildFromLists() {
    var rcl = Game.rooms[this.name].controller.level;
    for (let i = 0; i < Game.rooms[this.name].memory.buildingList.length; i++) {
        if (Game.rooms[Game.rooms[this.name].memory.buildingList[i].roomName] != undefined && (Game.rooms[this.name].memory.buildingList[i].minRCL <= rcl || Game.rooms[this.name].memory.buildingList[i] == undefined)) {
            if (Game.rooms[this.name].memory.buildingList[i].structureType == STRUCTURE_SPAWN && Game.rooms[this.name].memory.buildingList[i].minRCL == 7) {
                Game.rooms[Game.rooms[this.name].memory.buildingList[i].roomName].createConstructionSite(Game.rooms[this.name].memory.buildingList[i].x, Game.rooms[this.name].memory.buildingList[i].y,
                    Game.rooms[this.name].memory.buildingList[i].structureType, this.name + "_2");

            }
            else if (Game.rooms[this.name].memory.buildingList[i].structureType == STRUCTURE_SPAWN && Game.rooms[this.name].memory.buildingList[i].minRCL == 8) {
                Game.rooms[Game.rooms[this.name].memory.buildingList[i].roomName].createConstructionSite(Game.rooms[this.name].memory.buildingList[i].x, Game.rooms[this.name].memory.buildingList[i].y,
                    Game.rooms[this.name].memory.buildingList[i].structureType, this.name + "_3");

            }
            else if (Game.rooms[this.name].memory.buildingList[i].structureType == STRUCTURE_RAMPART && Game.rooms[this.name].memory.buildingList[i].minRCL <= rcl) {
                Game.rooms[Game.rooms[this.name].memory.buildingList[i].roomName].createConstructionSite(Game.rooms[this.name].memory.buildingList[i].x, Game.rooms[this.name].memory.buildingList[i].y, Game.rooms[this.name].memory.buildingList[i].structureType);

            }
            else if (isPosFree(Game.rooms[this.name].memory.buildingList[i].x, Game.rooms[this.name].memory.buildingList[i].y, Game.rooms[this.name].memory.buildingList[i].roomName) == true
                && Game.rooms[this.name].memory.buildingList[i].minRCL <= rcl) {
                Game.rooms[Game.rooms[this.name].memory.buildingList[i].roomName].createConstructionSite(Game.rooms[this.name].memory.buildingList[i].x, Game.rooms[this.name].memory.buildingList[i].y, Game.rooms[this.name].memory.buildingList[i].structureType);
            }


        }
    }

    for (let i = 0; i < Game.rooms[this.name].memory.roadBuildingList.length; i++) {

        if (Game.rooms[this.name].memory.roadBuildingList[i].minRCL <= rcl && Game.rooms[Game.rooms[this.name].memory.roadBuildingList[i].roomName] != undefined) {
            Game.rooms[Game.rooms[this.name].memory.roadBuildingList[i].roomName].createConstructionSite(Game.rooms[this.name].memory.roadBuildingList[i].x, Game.rooms[this.name].memory.roadBuildingList[i].y, Game.rooms[this.name].memory.roadBuildingList[i].structureType);
        }
    }
}

function planBorders(rcl,type) {
    const buildings = Game.rooms[this.name].memory.buildingList;
    const sources2 = [];
    const costMap = new PathFinder.CostMatrix();
    const terrain = Game.rooms[this.name].getTerrain()

    for (let y = 0; y < 50; y++) {
        for (let x = 0; x < 50; x++) {
            const tile = terrain.get(x, y);
            const weight =
                tile === TERRAIN_MASK_WALL ? 255 : 1// wall  => unwalkable
            //tile === TERRAIN_MASK_SWAMP ? 1 : // swamp => weight:  5
            //     1; // plain => weight:  1
            costMap.set(x, y, weight);
        }
    }
    let max_x = 0, min_x = 50, max_y = 0, min_y = 50;

    // Set high cost on building tiles
    for (let building of buildings) {
        if (building.structureType != STRUCTURE_ROAD && building.structureType != STRUCTURE_RAMPART && building.structureType != STRUCTURE_WALL
            && building.structureType != STRUCTURE_CONTAINER && building.structureType != STRUCTURE_LINK && building.structureType != STRUCTURE_EXTRACTOR
            && building.x > 4 && building.x < 46 && building.y > 4 && building.y < 46) {
            sources2.push({ x: building.x, y: building.y });
            costMap.set(building.x, building.y, 255);
        }
    }


    // Determine the bounding box around buildings
    buildings.forEach(building => {
        /*if (building.structureType != STRUCTURE_ROAD && building.structureType != STRUCTURE_RAMPART && building.structureType != STRUCTURE_WALL
            && building.structureType != STRUCTURE_CONTAINER
        )*/
        if (building.structureType == STRUCTURE_EXTENSION || building.structureType == STRUCTURE_TOWER || building.structureType == STRUCTURE_SPAWN
            || building.structureType == STRUCTURE_STORAGE || building.structureType == STRUCTURE_LAB
        ) {
            max_x = Math.max(max_x, building.x);
            min_x = Math.min(min_x, building.x);
            max_y = Math.max(max_y, building.y);
            min_y = Math.min(min_y, building.y);
        }
    });

    // Expand the bounding box slightly
    const padding = 2;
    min_x = Math.max(min_x - padding, 0);
    min_y = Math.max(min_y - padding, 0);
    max_x = Math.min(max_x + padding, 49);
    max_y = Math.min(max_y + padding, 49);

    // Set medium cost on tiles around buildings within the bounding box
    for (let x = min_x; x <= max_x; x++) {
        for (let y = min_y; y <= max_y; y++) {
            // Only set the cost if it's not a building tile
            if (costMap.get(x, y) !== 200) {
                costMap.set(x, y, 150); // Slightly lower cost to indicate preference for ramparts
            }
        }
    }

    //console.log(sources2.length);

    // Use minCutToExit with the prepared sources and costMap
    const rampartPositions = mincut.minCutToExit(sources2, costMap);

    // Update roomPlan and buildingList with rampart positions
    rampartsAmount = 0;
    rampartPositions.forEach(pos => {
        Game.rooms[this.name].memory.roomPlan[pos.x][pos.y] = STRUCTURE_RAMPART;

        buildings.push({ x: pos.x, y: pos.y, structureType: STRUCTURE_RAMPART, rcl });
        rampartsAmount++
        Game.rooms[this.name].memory.buildingList.push(new buildingListElement(pos.x, pos.y, this.name, STRUCTURE_RAMPART, rcl));


    });
    
    global.heap.rooms[this.name].baseVariations[type].rampartsAmount=rampartsAmount
    

    //terrain = Room.Terrain(this.name)
    var seeds = []
    for (var i = 0; i < 50; i++) {
        if (terrain.get(i, 0) == 0) {
            seeds.push(new RoomPosition(i, 0, this.name))
        }
        if (terrain.get(0, i) == 0) {
            seeds.push(new RoomPosition(0, i, this.name))
        }
        if (terrain.get(i, 49) == 0) {
            seeds.push(new RoomPosition(i, 49, this.name))
        }
        if (terrain.get(49, i) == 0) {
            seeds.push(new RoomPosition(49, i, this.name))
        }
    }



}


function planControllerRamparts() {
    var controller_ramparts = Game.rooms[this.name].controller.pos.getNearbyPositions();
    for (let position of controller_ramparts) {
        Game.rooms[this.name].memory.roomPlan[position.x][position.y] = STRUCTURE_RAMPART;
        Game.rooms[this.name].memory.buildingList.push(new buildingListElement(position.x, position.y, this.name, STRUCTURE_RAMPART, 4));
    }
}

function planControllerContainer( roomCM) {
    seeds = [];
    seeds.push(Game.rooms[this.name].controller.pos);
    distanceCM = Game.rooms[this.name].distanceTransform(roomCM, false);

    Game.rooms[this.name].memorycontrollerLinkPos = undefined;

    floodCM = Game.rooms[this.name].floodFill(seeds);
    var posForContainer = new RoomPosition(0, 0, this.name);

    minDistanceFromController = 100;
    for (i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (distanceCM.get(i, j) >= 2 && floodCM.get(i, j) < minDistanceFromController && i > 5 && i < 45 && j > 5 && j < 45) {
                minDistanceFromController = floodCM.get(i, j);
                posForContainer.x = i;
                posForContainer.y = j;
            }
        }
    }

    if (posForContainer.x != 0 && posForContainer.y != 0) {
        Game.rooms[this.name].memory.roomPlan[posForContainer.x][posForContainer.y] = STRUCTURE_CONTAINER;
        Game.rooms[this.name].memory.buildingList.push(new buildingListElement(posForContainer.x, posForContainer.y, this.name, STRUCTURE_CONTAINER, 2));
        Game.rooms[this.name].memory.controllerContainerPos = posForContainer
        console.log("pos for container: ", posForContainer.x, " ", posForContainer.y)

        if (Game.rooms[this.name].memory.roomPlan[posForContainer.x + 1][posForContainer.y] == 0) {
            Game.rooms[this.name].memory.roomPlan[posForContainer.x + 1][posForContainer.y] = STRUCTURE_LINK;
            Game.rooms[this.name].memory.buildingList.push(new buildingListElement(posForContainer.x + 1, posForContainer.y, this.name, STRUCTURE_LINK, 6));
            Game.rooms[this.name].memorycontrollerLinkPos = new RoomPosition(posForContainer.x + 1, posForContainer.y, this.name);
        }
    }


}



function planSourcesContainers() {

    Game.rooms[this.name].memory.sourcesLinksPos = []

    for (sourceId of Game.rooms[this.name].memory.harvestingSources) {

        var source = Game.getObjectById(sourceId.id)
        if (source != undefined) {
            var sourcePos = source.pos.getN_NearbyPositions(1);
            const terrain = source.room.getTerrain();
            for (let position of sourcePos) {
                if (terrain.get(position.x, position.y) != TERRAIN_MASK_WALL) {
                    if (source.room.name == this.name) {
                        Game.rooms[this.name].memory.roomPlan[position.x][position.y] = STRUCTURE_CONTAINER;
                    }

                    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(position.x, position.y, source.room.name, STRUCTURE_CONTAINER, 2));
                    break;
                }
            }

            var sourcePos = source.pos.getN_NearbyPositions(1);
            if (source.room.name == this.name) {
                for (let position of sourcePos) {
                    var structuresOnPos = source.room.lookAt(position.x, position.y);
                    var isFree = true;
                    for (let str of structuresOnPos) {
                        if (/*str.structureType == STRUCTURE_CONTAINER || */ str.structureType == STRUCTURE_WALL || terrain.get(position.x, position.y) == TERRAIN_MASK_WALL
                            || Game.rooms[this.name].memory.roomPlan[position.x][position.y] == STRUCTURE_CONTAINER) {
                            isFree = false;
                            break;
                        }
                    }
                    if (isFree) {
                        //console.log("pos: ",position," is free");
                        Game.rooms[this.name].memory.roomPlan[position.x][position.y] = STRUCTURE_LINK;
                        Game.rooms[this.name].memory.buildingList.push(new buildingListElement(position.x, position.y, this.name, STRUCTURE_LINK, 8));
                        Game.rooms[this.name].memory.sourcesLinksPos.push(new RoomPosition(position.x, position.y, this.name))
                        break;
                    }/*
                    else
                    {
                        console.log("pos: ",position," is not free");
                    }*/
                }



            }

        }

    }
}

function planKeeperSourcesContainers(rcl) {

    for (sourceId of Game.rooms[this.name].memory.keepersSources) {

        var source = Game.getObjectById(sourceId.id)
        if (source != undefined) {
            var sourcePos = source.pos.getN_NearbyPositions(1);
            const terrain = source.room.getTerrain();
            for (let position of sourcePos) {
                if (terrain.get(position.x, position.y) != TERRAIN_MASK_WALL) {
                    if (source.room.name == this.name) {
                        //Game.rooms[this.name].memory.roomPlan[position.x][position.y] = STRUCTURE_CONTAINER;
                    }

                    Game.rooms[this.name].memory.buildingList.push(new buildingListElement(position.x, position.y, source.room.name, STRUCTURE_CONTAINER, rcl));
                    break;
                }
            }

        }

    }
}
Spawn.prototype.buildRoom = function buildRoom(type) {

    
    var stage = undefined
    console.log("PLANING BASE AT: ", this.name)

    if (Game.rooms[this.name].memory.controllerContainerPos != undefined) {
        var cont = Game.rooms[this.name].lookForAt(LOOK_STRUCTURES, Game.rooms[this.name].memory.controllerContainerPos.x, Game.rooms[this.name].memory.controllerContainerPos.y)
        for (c of cont) {
            if (c.structureType == STRUCTURE_CONTAINER) {
                Game.rooms[this.name].memory.controllerContainerId = c.id
                break
            }
        }
        // /controllerContainerId
    }


    if (Game.rooms[this.name].memory.roomsToScan != undefined && Game.rooms[this.name].memory.roomsToScan.length > 0) {
        Game.rooms[this.name].memory.ifSuccessPlanningBase = false;
        return
    }

    if (Game.rooms[this.name].memory.ifSuccessPlanningStage == false) {
        Game.rooms[this.name].memory.buildingStage = undefined
    }
    Game.rooms[this.name].memory.ifSuccessPlanningStage = false;

    if (Game.rooms[this.name].memory.buildingStage == undefined || (Game.rooms[this.name].memory.buildingStage != undefined && Game.rooms[this.name].memory.buildingStage > 40)) { // if stage is out of bounds
        Game.rooms[this.name].memory.buildingStage = 0;
        stage = Game.rooms[this.name].memory.buildingStage;
    }




    if (Game.rooms[this.name].memory.buildingStage != undefined && Game.rooms[this.name].memory.buildingStage < 0 || Game.rooms[this.name].memory.buildingStage > 5) {
        console.log("stage out of bounds")
        if (Game.rooms[this.name].memory.buildingStage > 5) {
            //stage++
            Game.rooms[this.name].memory.buildingStage++;
        }
        return;
    }
    //Game.rooms[this.name].memory.ifSuccessPlanningBase = false;


    if (Game.rooms[this.name].memory.ifSuccessPlanningBase == true) {


        console.log("base planed, building from lists")
        visualizeBase(spawn)
        buildFromLists(spawn)
        return;
    }
    stage = Game.rooms[this.name].memory.buildingStage;

    //stage=0;
    var rows = 50;
    var cols = 50;



    console.log(this.name, " is planing ", stage, " stage")
    if (stage == 0 && Game.rooms[this.name].memory.ifSuccessPlanningBase != true) // planning stamps
    {

        var cpuBefore = Game.cpu.getUsed()
        let roomCM = new PathFinder.CostMatrix;
        const terrain = new Room.Terrain(this.name);
        for (let i = 0; i < 50; i++) {
            for (let j = 0; j < 50; j++) {
                if (terrain.get(i, j) == 1) {
                    roomCM.set(i, j, 255);
                }
            }
        }

        Game.rooms[this.name].memory.roomPlan = new Array(rows).fill(null).map(() => new Array(cols).fill(0));
        Game.rooms[this.name].memory.buildingList = [];
        Game.rooms[this.name].memory.roadBuildingList = [];

        planMainSpawnStamp(roomCM);

        planManagerStamp(roomCM);
        planControllerContainer(roomCM)


        //plan_road_to_controller(spawn, roomCM);
        planExtensionStamp(roomCM, 4);
        planExtensionStamp(roomCM, 5);
        planExtensionStamp(roomCM, 6);
        planExtensionStamp(roomCM, 6);
        planExtensionStamp(roomCM, 7);
        planExtensionStamp(roomCM, 7);
        planTowersStamp(roomCM);
        planLabsStamp(roomCM);
        planSourcesContainers(roomCM, 2);
        planKeeperSourcesContainers( 7)


        Game.rooms[this.name].memory.roomCM = roomCM.serialize();
        Game.rooms[this.name].memory.buildingStage++;
        var cpuAfter = Game.cpu.getUsed();
        Game.rooms[this.name].memory.cpuSpentForStamps = cpuAfter - cpuBefore;
    }
    else if (stage == 1 && Game.rooms[this.name].memory.ifSuccessPlanningBase != true) // planning borders
    {
        var cpuBefore = Game.cpu.getUsed()
        let roomCM_1 = PathFinder.CostMatrix.deserialize(Game.rooms[this.name].memory.roomCM);
        if (Game.shard.name != 'shard3') {
            planBorders(4,type);
        }
        Game.rooms[this.name].memory.roomCM = roomCM_1.serialize();
        Game.rooms[this.name].memory.buildingStage++;
        var cpuAfter = Game.cpu.getUsed()
        Game.rooms[this.name].memory.cpuForBorders = cpuAfter - cpuBefore
    }
    else if (stage == 2 && Game.rooms[this.name].memory.ifSuccessPlanningBase != true) // planing roads
    {
        var cpuBefore = Game.cpu.getUsed()
        let roomCM_2 = PathFinder.CostMatrix.deserialize(Game.rooms[this.name].memory.roomCM);
        planRoadToTarget(roomCM_2, Game.rooms[this.name].controller.pos.getNearbyPositions(), 2);
        var mineral = Game.rooms[this.name].find(FIND_MINERALS);
        planRoadToTarget(roomCM_2, mineral[0].pos.getNearbyPositions(), 6);
        var labs_pos = new RoomPosition(Game.rooms[this.name].memory.labsStampPos.x, Game.rooms[this.name].memory.labsStampPos.y, this.name)
        planRoadToTarget(roomCM_2, labs_pos.getNearbyPositions(), 6)
        if (Game.shard.name != 'shard3') {
            planControllerRamparts();
        }



        //planning roads to sources (in all farming rooms including main room)
        if ((Game.rooms[this.name].memory.roomsToScan != undefined && Game.rooms[this.name].memory.roomsToScan.length == 0) || Game.rooms[this.name].controller.level >= 4) {

            if (Game.rooms[this.name].memory.harvestingRooms != undefined && Game.rooms[this.name].memory.harvestingRooms.length > 0) {


                for (let src of Game.rooms[this.name].memory.harvestingSources) {
                    //console.log("src: ",src)
                    if (Game.getObjectById(src.id) != null) {
                        //console.log("planning to: ", Game.getObjectById(src.id).pos);
                        planRoadToTarget(spawn, roomCM_2, Game.getObjectById(src.id).pos.getNearbyPositions(), 2)
                        //console.log(" ");
                    }

                }
            }


        }


        Game.rooms[this.name].memory.roomCM = roomCM_2.serialize();
        Game.rooms[this.name].memory.buildingStage++;
        var cpuAfter = Game.cpu.getUsed()
        Game.rooms[this.name].memory.cpuForRoads1 = cpuAfter - cpuBefore
    }
    else if (stage == 3 && Game.rooms[this.name].memory.ifSuccessPlanningBase != true) {

        var cpuBefore = Game.cpu.getUsed()
        let roomCM_2 = PathFinder.CostMatrix.deserialize(Game.rooms[this.name].memory.roomCM);
        if ((Game.rooms[this.name].memory.roomsToScan != undefined && Game.rooms[this.name].memory.roomsToScan.length == 0) || Game.rooms[this.name].controller.level >= 4) {


            if (Game.rooms[this.name].memory.keepersSources != undefined && Game.rooms[this.name].memory.keepersSources.length > 0) {
                for (let src of Game.rooms[this.name].memory.keepersSources) {
                    //console.log("src: ",src)
                    if (Game.getObjectById(src.id) != null) {
                        //console.log("planning to: ", Game.getObjectById(src.id).pos);
                        planRoadToTarget(spawn, roomCM_2, Game.getObjectById(src.id).pos.getNearbyPositions(), 2)


                        // planning road between sources
                        for (let otherSrc of Game.rooms[this.name].memory.keepersSources) {
                            if (Game.getObjectById(otherSrc.id) != null && otherSrc.id != src.id
                                && Game.getObjectById(otherSrc.id).pos != undefined) {
                                planRoadToTarget(spawn, roomCM_2,
                                    Game.getObjectById(src.id).pos.getNearbyPositions(), 7, 2,
                                    Game.getObjectById(otherSrc.id).pos)
                            }
                        }
                        //console.log(" ");
                    }

                }
            }

        }

        Game.rooms[this.name].memory.roomCM = roomCM_2.serialize();
        Game.rooms[this.name].memory.buildingStage++;
        var cpuAfter = Game.cpu.getUsed()
        Game.rooms[this.name].memory.cpuForRoads2 = cpuAfter - cpuBefore

    }
    else if (stage == 4) {
        var cpuBefore = Game.cpu.getUsed()
        buildFromLists(spawn);
        Game.rooms[this.name].memory.buildingStage++;
        var cpuAfter = Game.cpu.getUsed()
        Game.rooms[this.name].memory.cpuForBuilding = cpuAfter - cpuBefore
    }
    else if (stage == 5) {
        var mineral = Game.rooms[this.name].find(FIND_MINERALS);
        ////console.log("mineral pos: ", mineral[0].pos);
        Game.rooms[this.name].createConstructionSite(mineral[0].pos, STRUCTURE_EXTRACTOR);
        Game.rooms[this.name].memory.buildingStage++;
        Game.rooms[this.name].memory.ifSuccessPlanningBase = true
        console.log("success plannig base: ", Game.rooms[this.name].memory.ifSuccessPlanningBase)



        delete Game.rooms[this.name].memory.roomCM
    }

    Game.rooms[this.name].memory.ifSuccessPlanningStage = true;


    // //console.log("VISUALS");

    var ifVisualize = true
    if (ifVisualize) {
        visualizeBase(spawn);
    }


}









function visualizeBase(spawn) {
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (Game.rooms[this.name].memory.roomPlan[i][j] == STRUCTURE_EXTENSION) {
                Game.rooms[this.name].visual.circle(i, j, { fill: '#ffff00', radius: 0.5, stroke: 'red' });
                ////console.log("SHOWING EXTENSION");
            }
            else if (Game.rooms[this.name].memory.roomPlan[i][j] == STRUCTURE_ROAD) {
                Game.rooms[this.name].visual.circle(i, j, { fill: '#666666', radius: 0.5, stroke: 'black' });
            }
            else if (Game.rooms[this.name].memory.roomPlan[i][j] == STRUCTURE_CONTAINER) {
                Game.rooms[this.name].visual.rect(i - 0.25, j - 0.4, 0.5, 0.8, { fill: 'red', stroke: 'black' });
            }
            else if (Game.rooms[this.name].memory.roomPlan[i][j] == STRUCTURE_SPAWN) {
                Game.rooms[this.name].visual.circle(i, j, { fill: '#666666', radius: 0.5, stroke: 'pink' });
            }
            else if (Game.rooms[this.name].memory.roomPlan[i][j] == STRUCTURE_STORAGE) {
                Game.rooms[this.name].visual.rect(i - 0.25, j - 0.4, 0.5, 0.8, { fill: '#666666', stroke: 'white' });
            }
            else if (Game.rooms[this.name].memory.roomPlan[i][j] == STRUCTURE_TOWER) {
                Game.rooms[this.name].visual.circle(i, j, { fill: 'red', radius: 0.5, stroke: 'red' });
            }
            else if (Game.rooms[this.name].memory.roomPlan[i][j] == STRUCTURE_RAMPART) {
                Game.rooms[this.name].visual.circle(i, j, { fill: 'green', radius: 0.5, stroke: 'green' });
            }
            else if (Game.rooms[this.name].memory.roomPlan[i][j] == STRUCTURE_WALL) {
                Game.rooms[this.name].visual.rect(i - 0.25, j - 0.4, 0.5, 0.8, { fill: '#000000', stroke: 'grey' });
            }
            else if (Game.rooms[this.name].memory.roomPlan[i][j] == STRUCTURE_LINK) {
                Game.rooms[this.name].visual.rect(i - 0.25, j - 0.4, 0.5, 0.8, { fill: '#000000', stroke: 'blue' });
            }
            else if (Game.rooms[this.name].memory.roomPlan[i][j] == STRUCTURE_LAB) {
                Game.rooms[this.name].visual.circle(i - 0.25, j - 0.4, 0.5, 0.8, { fill: 'pink', stroke: 'pink' });
            }
        }
    }
}

