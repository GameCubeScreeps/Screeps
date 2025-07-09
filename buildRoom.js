
var RoomPositionFunctions = require('roomPositionFunctions');
const { distanceTransform } = require("./distanceTransform");
const { floodFill } = require("./floodFill");
const mincut = require("./mincut")
const C = require('constants');


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


Room.prototype.planRoadToTarget = function planRoadToTarget(roomCM, target, rcl, myRange = 1, start = this.memory.spawnPos) {

    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (this.memory.roomPlan[i][j] != 0 && this.memory.roomPlan[i][j] != STRUCTURE_ROAD && this.memory.roomPlan[i][j] != STRUCTURE_RAMPART) {
                roomCM.set(i, j, 255);
            }
            else if (this.memory.roomPlan[i][j] != 0 && this.memory.roomPlan[i][j] == STRUCTURE_ROAD
                && roomCM.get(i, j) != 255) {
                //roomCM.set(i, j, 1);
            }
        }
    }
    destination = { pos: target, range: myRange };

    var startPosition = new RoomPosition(start.x, start.y, start.roomName)

    var ret = PathFinder.search(startPosition, destination, {
        //maxRooms: 64,
        plainCost: 2,
        swampCost: 2,
        maxOps: 8000,

        roomCallback: function (roomName) {

            let room = Game.rooms[roomName];
            if (!room) { return; }

            if (roomName == this.name) {
                costs = roomCM;
            }
            else {
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

            return costs;
        }
    });


    ////////////////////////////////////

    if (ret.incomplete != true || true) {

        for (let i = 0; i < ret.path.length; i++) {

            if (i == ret.path.length - 1 && this.controller.pos.inRangeTo(ret.path[i].x, ret.path[i].y, 3)) {
                this.memory.distanceToController = ret.path.length
            }

            this.memory.roadBuildingList.push(new buildingListElement(ret.path[i].x, ret.path[i].y, ret.path[i].roomName, STRUCTURE_ROAD, rcl));
            if (ret.path[i].roomName == this.name && roomCM.get(ret.path[i].x, ret.path[i].y) < 255) {
                this.memory.roomPlan[ret.path[i].x][ret.path[i].y] = STRUCTURE_ROAD;


                if ((this.memory.roomPlan[ret.path[i].x][ret.path[i].y] == 0 || this.memory.roomPlan[ret.path[i].x][ret.path[i].y] == STRUCTURE_ROAD)
                    && isPosFree(ret.path[i].x, ret.path[i].y, ret.path[i].roomName) == true && roomCM.get(ret.path[i].x, ret.path[i].y) < 255

                ) { // tile is empty on plan and in room
                    this.memory.roomPlan[ret.path[i].x][ret.path[i].y] = STRUCTURE_ROAD;
                    //roomCM.set(ret.path[i].x, ret.path[i].y, 1);
                }
            }



        }
    }

    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (this.memory.roomPlan[i][j] == STRUCTURE_ROAD) {
                roomCM.set(i, j, 0);
            }

        }
    }

}



Room.prototype.createExtensionStamp = function createExtensionStamp(x, y, rcl) { // need min 3's from distanceTransform
    const terrain = this.getTerrain();


    this.memory.roomPlan[x][y] = STRUCTURE_EXTENSION;//middle
    this.memory.buildingList.push(new buildingListElement(x, y, this.name, STRUCTURE_EXTENSION, rcl));
    this.memory.roomPlan[x - 1][y] = STRUCTURE_EXTENSION;//left
    this.memory.buildingList.push(new buildingListElement(x - 1, y, this.name, STRUCTURE_EXTENSION, rcl));
    this.memory.roomPlan[x + 1][y] = STRUCTURE_EXTENSION;//right
    this.memory.buildingList.push(new buildingListElement(x + 1, y, this.name, STRUCTURE_EXTENSION, rcl));
    this.memory.roomPlan[x][y - 1] = STRUCTURE_EXTENSION;//up
    this.memory.buildingList.push(new buildingListElement(x, y - 1, this.name, STRUCTURE_EXTENSION, rcl));
    this.memory.roomPlan[x][y + 1] = STRUCTURE_EXTENSION;//down
    this.memory.buildingList.push(new buildingListElement(x, y + 1, this.name, STRUCTURE_EXTENSION, rcl));

    //roads around it
    if (terrain.get(x, y + 2) != TERRAIN_MASK_WALL) {
        this.memory.roomPlan[x][y + 2] = STRUCTURE_ROAD;
        this.memory.buildingList.push(new buildingListElement(x, y + 2, this.name, STRUCTURE_ROAD, rcl));
    }
    if (terrain.get(x, y - 2) != TERRAIN_MASK_WALL) {
        this.memory.roomPlan[x][y - 2] = STRUCTURE_ROAD;
        this.memory.buildingList.push(new buildingListElement(x, y - 2, this.name, STRUCTURE_ROAD, rcl));
    }
    if (terrain.get(x + 2, y) != TERRAIN_MASK_WALL) {
        this.memory.roomPlan[x + 2][y] = STRUCTURE_ROAD;
        this.memory.buildingList.push(new buildingListElement(x + 2, y, this.name, STRUCTURE_ROAD, rcl));
    }
    if (terrain.get(x - 2, y) != TERRAIN_MASK_WALL) {
        this.memory.roomPlan[x - 2][y] = STRUCTURE_ROAD;
        this.memory.buildingList.push(new buildingListElement(x - 2, y, this.name, STRUCTURE_ROAD, rcl));
    }
    if (terrain.get(x + 1, y + 1) != TERRAIN_MASK_WALL) {
        this.memory.roomPlan[x + 1][y + 1] = STRUCTURE_ROAD;
        this.memory.buildingList.push(new buildingListElement(x + 1, y + 1, this.name, STRUCTURE_ROAD, rcl));
    }
    if (terrain.get(x + 1, y - 1) != TERRAIN_MASK_WALL) {
        this.memory.roomPlan[x + 1][y - 1] = STRUCTURE_ROAD;
        this.memory.buildingList.push(new buildingListElement(x + 1, y - 1, this.name, STRUCTURE_ROAD, rcl));
    }
    if (terrain.get(x - 1, y + 1) != TERRAIN_MASK_WALL) {
        this.memory.roomPlan[x - 1][y + 1] = STRUCTURE_ROAD;
        this.memory.buildingList.push(new buildingListElement(x - 1, y + 1, this.name, STRUCTURE_ROAD, rcl));
    }
    if (terrain.get(x - 1, y - 1) != TERRAIN_MASK_WALL) {
        this.memory.roomPlan[x - 1][y - 1] = STRUCTURE_ROAD;
        this.memory.buildingList.push(new buildingListElement(x - 1, y - 1, this.name, STRUCTURE_ROAD, rcl));
    }




    return 0;
}



Room.prototype.planExtensionStamp = function planExtensionStamp(roomCM, rcl, spawnPos,type) {
    var isSuccess = false;
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (this.memory.roomPlan[i][j] != 0) {
                roomCM.set(i, j, 255);
            }

        }
    }
    let distanceCM = this.diagonalDistanceTransform(roomCM, false);


    //Seeds - starting positions for floodfill (it have to be an array - something iterable)
    // extensions are builded as close as possible to storage and spawnPos
    var seeds = [];


    if(this.memory.baseVariations[type].extensionsStampsPos!=undefined && 
        this.memory.baseVariations[type].extensionsStampsPos.length>0
    )
    {
        for(stampPos of this.memory.baseVariations[type].extensionsStampsPos)
        {
            seeds.push(stampPos)
        }
    }
    else{
        this.memory.baseVariations[type].extensionsStampsPos=[];

    }

    seeds.push(this.memory.storagePos);

    if (spawnPos != undefined) {
        seeds.push(spawnPos)
    }
    else {
        return -1;
    }
    var floodCM = this.floodFill(seeds);

    var posForStamp = new RoomPosition(0, 0, this.name);
    var minDistanceFromSpawn = 100;
    for (i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (distanceCM.get(i, j) >= 2 && floodCM.get(i, j) < minDistanceFromSpawn
                && (i > 8 && i < 43) && (j > 8 && j < 43)) {
                minDistanceFromSpawn = floodCM.get(i, j);
                posForStamp.x = i;
                posForStamp.y = j;
            }
        }
    }

    this.memory.baseVariations[type].extensionsStampsPos.push(new RoomPosition(posForStamp.x, posForStamp.y,this.name))
    
    this.createExtensionStamp(posForStamp.x, posForStamp.y, rcl);

    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (this.memory.roomPlan[i][j] != 0) {
                roomCM.set(i, j, 255);
                isSuccess = true;
            }
        }
    }

    return isSuccess;


}


Room.prototype.createManagerStamp = function createManagerStamp(x, y) {

    this.memory.roomPlan[x - 1][y - 1] = STRUCTURE_LINK;
    this.memory.buildingList.push(new buildingListElement(x - 1, y - 1, this.name, STRUCTURE_LINK, 5));
    this.memorymanager_link_pos = new RoomPosition(x - 1, y - 1, this.name);
    this.memory.roomPlan[x - 1][y] = STRUCTURE_NUKER;
    this.memory.buildingList.push(new buildingListElement(x - 1, y, this.name, STRUCTURE_NUKER, 8));
    this.memory.roomPlan[x - 1][y + 1] = STRUCTURE_TERMINAL;
    this.memory.buildingList.push(new buildingListElement(x - 1, y + 1, this.name, STRUCTURE_TERMINAL, 5));
    this.memory.roomPlan[x][y - 1] = STRUCTURE_FACTORY;
    //this.memory.buildingList.push(new buildingListElement(x, y - 1, this.name, STRUCTURE_FACTORY, 7));
    this.memory.roomPlan[x][y + 1] = STRUCTURE_SPAWN;
    this.memory.buildingList.push(new buildingListElement(x, y + 1, this.name, STRUCTURE_SPAWN, 7));
    this.memory.roomPlan[x + 1][y - 1] = STRUCTURE_STORAGE;
    this.memory.buildingList.push(new buildingListElement(x + 1, y - 1, this.name, STRUCTURE_STORAGE, 4));
    this.memory.storagePos = new RoomPosition(x + 1, y - 1, this.name);
    //this.memory.roomPlan[x + 1][y] = STRUCTURE_POWER_SPAWN;
    //this.memory.buildingList.push(new buildingListElement(x + 1, y, this.name, STRUCTURE_POWER_SPAWN, 8));

    //top horizontal edge
    this.memory.roomPlan[x - 1][y - 2] = STRUCTURE_ROAD;
    this.memory.buildingList.push(new buildingListElement(x - 1, y - 2, this.name, STRUCTURE_ROAD, 4));
    this.memory.roomPlan[x][y - 2] = STRUCTURE_ROAD;
    this.memory.buildingList.push(new buildingListElement(x, y - 2, this.name, STRUCTURE_ROAD, 4));
    this.memory.roomPlan[x + 1][y - 2] = STRUCTURE_ROAD;
    this.memory.buildingList.push(new buildingListElement(x + 1, y - 2, this.name, STRUCTURE_ROAD, 4));

    //left vertical edge
    this.memory.roomPlan[x - 2][y - 1] = STRUCTURE_ROAD;
    this.memory.buildingList.push(new buildingListElement(x - 2, y - 1, this.name, STRUCTURE_ROAD, 4));
    this.memory.roomPlan[x - 2][y] = STRUCTURE_ROAD;
    this.memory.buildingList.push(new buildingListElement(x - 2, y, this.name, STRUCTURE_ROAD, 4));
    this.memory.roomPlan[x - 2][y + 1] = STRUCTURE_ROAD;
    this.memory.buildingList.push(new buildingListElement(x - 2, y + 1, this.name, STRUCTURE_ROAD, 4));

    //bottom horizontal
    this.memory.roomPlan[x - 1][y + 2] = STRUCTURE_ROAD;
    this.memory.buildingList.push(new buildingListElement(x - 1, y + 2, this.name, STRUCTURE_ROAD, 4));
    this.memory.roomPlan[x][y + 2] = STRUCTURE_ROAD;
    this.memory.buildingList.push(new buildingListElement(x, y + 2, this.name, STRUCTURE_ROAD, 4));

    //diagonals
    this.memory.roomPlan[x + 1][y + 1] = STRUCTURE_ROAD;
    this.memory.buildingList.push(new buildingListElement(x + 1, y + 1, this.name, STRUCTURE_ROAD, 4));
    this.memory.roomPlan[x + 2][y] = STRUCTURE_ROAD;
    this.memory.buildingList.push(new buildingListElement(x + 2, y, this.name, STRUCTURE_ROAD, 4));
    this.memory.roomPlan[x + 2][y - 1] = STRUCTURE_ROAD;
    this.memory.buildingList.push(new buildingListElement(x + 2, y - 1, this.name, STRUCTURE_ROAD, 4));
}



Room.prototype.planManagerStamp = function planManagerStamp(roomCM, spawnPos) {
    var isSuccess = false;
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (this.memory.roomPlan[i][j] != 0) {
                roomCM.set(i, j, 255);
            }
        }
    }


    var posForManager = new RoomPosition(0, 0, this.name);
    seeds = [];
    if (spawnPos != undefined) {
        seeds.push(spawnPos)
    }
    else { return -1; }

    distanceCM = this.diagonalDistanceTransform(roomCM, false);


    floodCM = this.floodFill(seeds);

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

    this.createManagerStamp(posForManager.x, posForManager.y);
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (this.memory.roomPlan[i][j] != 0) {
                roomCM.set(i, j, 255);
                isSuccess = true;
            }
        }
    }
    return isSuccess;
}


//Requires:
// RoomCM - CostMatrix of a room - created when managing stages
// type - to read correct base variation spawnPos
// this.memory.roomPlan
// 
Room.prototype.planMainSpawnStamp = function planMainSpawnStamp(roomCM, spawnPos) {


    this.memory.roomPlan[spawnPos.x][spawnPos.y] = STRUCTURE_SPAWN; // seting spawn pos at plan

    this.memory.roomPlan[spawnPos.x + 1][spawnPos.y] = STRUCTURE_EXTENSION;
    this.memory.buildingList.push(new buildingListElement(spawnPos.x + 1, spawnPos.y, this.name, STRUCTURE_EXTENSION, 2));

    this.memory.roomPlan[spawnPos.x + 2][spawnPos.y] = STRUCTURE_EXTENSION;
    this.memory.buildingList.push(new buildingListElement(spawnPos.x + 2, spawnPos.y, this.name, STRUCTURE_EXTENSION, 2));

    this.memory.roomPlan[spawnPos.x + 2][spawnPos.y - 1] = STRUCTURE_EXTENSION;
    this.memory.buildingList.push(new buildingListElement(spawnPos.x + 2, spawnPos.y - 1, this.name, STRUCTURE_EXTENSION, 2));

    this.memory.roomPlan[spawnPos.x + 1][spawnPos.y - 2] = STRUCTURE_EXTENSION;
    this.memory.buildingList.push(new buildingListElement(spawnPos.x + 1, spawnPos.y - 2, this.name, STRUCTURE_EXTENSION, 2));

    this.memory.roomPlan[spawnPos.x][spawnPos.y - 1] = STRUCTURE_EXTENSION;
    this.memory.buildingList.push(new buildingListElement(spawnPos.x, spawnPos.y - 1, this.name, STRUCTURE_EXTENSION, 2));

    this.memory.roomPlan[spawnPos.x + 2][spawnPos.y - 2] = STRUCTURE_CONTAINER;
    this.memory.buildingList.push(new buildingListElement(spawnPos.x + 2, spawnPos.y - 2, this.name, STRUCTURE_CONTAINER, 2));

    this.memory.roomPlan[spawnPos.x + 2][spawnPos.y - 2] = STRUCTURE_CONTAINER;
    this.memory.buildingList.push(new buildingListElement(spawnPos.x + 2, spawnPos.y - 2, this.name, STRUCTURE_CONTAINER, 2));

    this.memory.roomPlan[spawnPos.x + 2][spawnPos.y - 3] = STRUCTURE_EXTENSION;
    this.memory.buildingList.push(new buildingListElement(spawnPos.x + 2, spawnPos.y - 3, this.name, STRUCTURE_EXTENSION, 3));

    this.memory.roomPlan[spawnPos.x + 2][spawnPos.y - 4] = STRUCTURE_EXTENSION;
    this.memory.buildingList.push(new buildingListElement(spawnPos.x + 2, spawnPos.y - 4, this.name, STRUCTURE_EXTENSION, 3));

    this.memory.roomPlan[spawnPos.x + 1][spawnPos.y - 4] = STRUCTURE_EXTENSION;
    this.memory.buildingList.push(new buildingListElement(spawnPos.x + 1, spawnPos.y - 4, this.name, STRUCTURE_EXTENSION, 3));

    //third spawn
    this.memory.roomPlan[spawnPos.x][spawnPos.y - 4] = STRUCTURE_SPAWN;
    this.memory.buildingList.push(new buildingListElement(spawnPos.x, spawnPos.y - 4, this.name, STRUCTURE_SPAWN, 8));

    this.memory.roomPlan[spawnPos.x][spawnPos.y - 3] = STRUCTURE_EXTENSION;
    this.memory.buildingList.push(new buildingListElement(spawnPos.x, spawnPos.y - 3, this.name, STRUCTURE_EXTENSION, 3));

    this.memory.roomPlan[spawnPos.x - 2][spawnPos.y - 2] = STRUCTURE_CONTAINER;
    this.memory.buildingList.push(new buildingListElement(spawnPos.x - 2, spawnPos.y - 2, this.name, STRUCTURE_CONTAINER, 3));

    this.memory.roomPlan[spawnPos.x - 1][spawnPos.y] = STRUCTURE_EXTENSION;
    this.memory.buildingList.push(new buildingListElement(spawnPos.x - 1, spawnPos.y, this.name, STRUCTURE_EXTENSION, 3));

    this.memory.roomPlan[spawnPos.x - 2][spawnPos.y] = STRUCTURE_EXTENSION;
    this.memory.buildingList.push(new buildingListElement(spawnPos.x - 2, spawnPos.y, this.name, STRUCTURE_EXTENSION, 3));

    this.memory.roomPlan[spawnPos.x - 2][spawnPos.y - 1] = STRUCTURE_EXTENSION;
    this.memory.buildingList.push(new buildingListElement(spawnPos.x - 2, spawnPos.y - 1, this.name, STRUCTURE_EXTENSION, 3));

    this.memory.roomPlan[spawnPos.x - 1][spawnPos.y - 2] = STRUCTURE_EXTENSION;
    this.memory.buildingList.push(new buildingListElement(spawnPos.x - 1, spawnPos.y - 2, this.name, STRUCTURE_EXTENSION, 3));

    this.memory.roomPlan[spawnPos.x - 2][spawnPos.y - 3] = STRUCTURE_EXTENSION;
    this.memory.buildingList.push(new buildingListElement(spawnPos.x - 2, spawnPos.y - 3, this.name, STRUCTURE_EXTENSION, 3));


    this.memory.roomPlan[spawnPos.x - 2][spawnPos.y - 4] = STRUCTURE_EXTENSION;
    this.memory.buildingList.push(new buildingListElement(spawnPos.x - 2, spawnPos.y - 4, this.name, STRUCTURE_EXTENSION, 4));
    this.memory.roomPlan[spawnPos.x - 1][spawnPos.y - 4] = STRUCTURE_EXTENSION;
    this.memory.buildingList.push(new buildingListElement(spawnPos.x - 1, spawnPos.y - 4, this.name, STRUCTURE_EXTENSION, 4));

    this.memory.roomPlan[spawnPos.x][spawnPos.y - 2] = STRUCTURE_LINK;
    this.memory.buildingList.push(new buildingListElement(spawnPos.x, spawnPos.y - 2, this.name, STRUCTURE_LINK, 3));
    this.memory.fillerLinkPos = new RoomPosition(spawnPos.x, spawnPos.y - 2, this.name)



    for (let i = 0; i < 5; i++) {
        //bottom edge
        this.memory.roomPlan[spawnPos.x - 2 + i][spawnPos.y + 1] = STRUCTURE_ROAD;
        this.memory.buildingList.push(new buildingListElement(spawnPos.x - 2 + i, spawnPos.y + 1, this.name, STRUCTURE_ROAD, 2));
        //top edge
        this.memory.roomPlan[spawnPos.x - 2 + i][spawnPos.y - 5] = STRUCTURE_ROAD;
        this.memory.buildingList.push(new buildingListElement(spawnPos.x - 2 + i, spawnPos.y - 5, this.name, STRUCTURE_ROAD, 2));
        //left edge
        this.memory.roomPlan[spawnPos.x - 3][spawnPos.y - i] = STRUCTURE_ROAD;
        this.memory.buildingList.push(new buildingListElement(spawnPos.x - 3, spawnPos.y - i, this.name, STRUCTURE_ROAD, 2));
        //right edge
        this.memory.roomPlan[spawnPos.x + 3][spawnPos.y - i] = STRUCTURE_ROAD;
        this.memory.buildingList.push(new buildingListElement(spawnPos.x + 3, spawnPos.y - i, this.name, STRUCTURE_ROAD, 2));
    }

    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (this.memory.roomPlan[i][j] != 0) {
                roomCM.set(i, j, 255);
            }
        }
    }
}



//Requires:
// RoomCM - CostMatrix of a room - created when managing stages
// this.memory.roomPlan
Room.prototype.planLabsStamp = function planLabsStamp(roomCM) {
    var isSuccess = false;
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (this.memory.roomPlan[i][j] != 0) {
                roomCM.set(i, j, 255);
            }
        }
    }

    var posForLabs = new RoomPosition(-0, -0, this.name);
    seeds = [];
    seeds.push(this.memory.storagePos);

    distanceCM = this.diagonalDistanceTransform(roomCM, false);
    floodCM = this.floodFill(seeds);

    minDistanceFromStorage = Infinity;
    for (i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (distanceCM.get(i, j) >= 3 && floodCM.get(i, j) < minDistanceFromStorage
                && i > 6 && i < 44 && j > 6 && j < 44) {
                minDistanceFromStorage = floodCM.get(i, j);
                posForLabs.x = i;
                posForLabs.y = j;
            }
        }
    }
    if (posForLabs.x != 0 && posForLabs.y != 0) {
        this.createLabsStamp(posForLabs.x, posForLabs.y)
    }


    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (this.memory.roomPlan[i][j] != 0) {
                roomCM.set(i, j, 255);
                isSuccess = true;
            }
        }
    }
    this.memory.outputLabsId = undefined
    this.memory.labsStampPos = new RoomPosition(posForLabs.x, posForLabs.y, this.name)
    return isSuccess;



}


//Require:
//this.memory.roomPlan
//this.memory.buildingList
Room.prototype.createLabsStamp = function createLabsStamp(x, y) {
    this.memory.roomPlan[x - 1][y] = STRUCTURE_LAB;
    this.memory.buildingList.push(new buildingListElement(x - 1, y, this.name, STRUCTURE_LAB, 6));
    this.memory.inputLab1Pos = new RoomPosition(x - 1, y, this.name)

    this.memory.roomPlan[x][y + 1] = STRUCTURE_LAB;
    this.memory.buildingList.push(new buildingListElement(x, y + 1, this.name, STRUCTURE_LAB, 6));
    this.memory.inputLab2Pos = new RoomPosition(x, y + 1, this.name)

    this.memory.roomPlan[x + 1][y + 1] = STRUCTURE_LAB;
    this.memory.buildingList.push(new buildingListElement(x + 1, y + 1, this.name, STRUCTURE_LAB, 6));
    this.memoryboostingLabPos = new RoomPosition(x + 1, y + 1, this.name)

    this.memory.roomPlan[x + 1][y] = STRUCTURE_LAB;
    this.memory.buildingList.push(new buildingListElement(x + 1, y, this.name, STRUCTURE_LAB, 7));

    this.memory.roomPlan[x][y - 1] = STRUCTURE_LAB;
    this.memory.buildingList.push(new buildingListElement(x, y - 1, this.name, STRUCTURE_LAB, 7));

    this.memory.roomPlan[x - 1][y - 1] = STRUCTURE_LAB;
    this.memory.buildingList.push(new buildingListElement(x - 1, y - 1, this.name, STRUCTURE_LAB, 7));

    this.memory.roomPlan[x - 2][y] = STRUCTURE_LAB;
    this.memory.buildingList.push(new buildingListElement(x - 2, y, this.name, STRUCTURE_LAB, 8));

    this.memory.roomPlan[x - 2][y + 1] = STRUCTURE_LAB;
    this.memory.buildingList.push(new buildingListElement(x - 2, y + 1, this.name, STRUCTURE_LAB, 8));

    this.memory.roomPlan[x - 1][y + 2] = STRUCTURE_LAB;
    this.memory.buildingList.push(new buildingListElement(x - 1, y + 2, this.name, STRUCTURE_LAB, 8));

    this.memory.roomPlan[x][y + 2] = STRUCTURE_LAB;
    this.memory.buildingList.push(new buildingListElement(x, y + 2, this.name, STRUCTURE_LAB, 8));

    for (let i = 0; i < 3; i++) {
        // TOP LEFT
        this.memory.roomPlan[x - 3 + i][y - i] = STRUCTURE_ROAD;
        this.memory.buildingList.push(new buildingListElement(x - 3 + i, y - i, this.name, STRUCTURE_ROAD, 6));

        // TOP RIGHT
        this.memory.roomPlan[x + i][y - 2 + i] = STRUCTURE_ROAD;
        this.memory.buildingList.push(new buildingListElement(x + i, y - 2 + i, this.name, STRUCTURE_ROAD, 6));

        // BOTTOM LEFT
        this.memory.roomPlan[x - 3 + i][y + 1 + i] = STRUCTURE_ROAD;
        this.memory.buildingList.push(new buildingListElement(x - 3 + i, y + 1 + i, this.name, STRUCTURE_ROAD, 6));

        // BOTTOM RIGHT
        this.memory.roomPlan[x + i][y + 3 - i] = STRUCTURE_ROAD;
        this.memory.buildingList.push(new buildingListElement(x + i, y + 3 - i, this.name, STRUCTURE_ROAD, 6));

        // MIDDLE
        this.memory.roomPlan[x - 2 + i][y + 2 - i] = STRUCTURE_ROAD;
        this.memory.buildingList.push(new buildingListElement(x - 2 + i, y + 2 - i, this.name, STRUCTURE_ROAD, 6));
    }
}



//Requires:
// RoomCM - CostMatrix of a room - created when managing stages
// type - to read correct base variation spawnPos
// spawnPos
// this.memory.roomPlan
Room.prototype.planTowersStamp = function planTowersStamp(roomCM, type, spawnPos) {
    var isSuccess = false;
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (this.memory.roomPlan[i][j] != 0) {
                roomCM.set(i, j, 255);
            }
        }
    }

    var posForTower = new RoomPosition(0, 0, this.name);
    seeds = [];
    seeds.push(this.memory.storagePos);
    if (spawnPos != undefined) {
        seeds.push(spawnPos)
    }

    distanceCM = this.distanceTransform(roomCM, false);
    floodCM = this.floodFill(seeds);

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

    this.createTowerStamp(posForTower.x, posForTower.y)
    this.memory.posForTowerKeeper = posForTower;

    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (this.memory.roomPlan[i][j] != 0) {
                roomCM.set(i, j, 255);
                isSuccess = true;
            }
        }
    }
    return isSuccess;


}


//Requires:
// this.memory.buildingList
// this.memory.roomPlan
Room.prototype.createTowerStamp = function createTowerStamp(x, y) {


    this.memory.roomPlan[x - 1][y - 1] = STRUCTURE_LINK;
    this.memory.buildingList.push(new buildingListElement(x - 1, y - 1, this.name, STRUCTURE_LINK, 8));

    this.memory.roomPlan[x - 1][y] = STRUCTURE_TOWER;
    this.memory.buildingList.push(new buildingListElement(x - 1, y, this.name, STRUCTURE_TOWER, 3));

    this.memory.roomPlan[x - 1][y + 1] = STRUCTURE_TOWER;
    this.memory.buildingList.push(new buildingListElement(x - 1, y + 1, this.name, STRUCTURE_TOWER, 5));

    this.memory.roomPlan[x][y + 1] = STRUCTURE_TOWER;
    this.memory.buildingList.push(new buildingListElement(x, y + 1, this.name, STRUCTURE_TOWER, 7));

    this.memory.roomPlan[x + 1][y + 1] = STRUCTURE_TOWER;
    this.memory.buildingList.push(new buildingListElement(x + 1, y + 1, this.name, STRUCTURE_TOWER, 8));

    this.memory.roomPlan[x + 1][y] = STRUCTURE_TOWER;
    this.memory.buildingList.push(new buildingListElement(x + 1, y, this.name, STRUCTURE_TOWER, 8));

    this.memory.roomPlan[x + 1][y - 1] = STRUCTURE_TOWER;
    this.memory.buildingList.push(new buildingListElement(x + 1, y - 1, this.name, STRUCTURE_TOWER, 8));

}

//Requires
//this.memory.buildingList
//this.memory.roadBuildingList
Room.prototype.buildFromLists = function buildFromLists() {




    var rcl = this.controller.level;
    if (this.memory.finalBuildingList == undefined) {
        return -1;
    }
    for (let i = 0; i < this.memory.finalBuildingList.length; i++) {
        if (Game.rooms[this.memory.finalBuildingList[i].roomName] != undefined && (this.memory.finalBuildingList[i].minRCL <= rcl || this.memory.finalBuildingList[i] == undefined)) {
            if (this.memory.finalBuildingList[i].structureType == STRUCTURE_SPAWN && this.memory.finalBuildingList[i].minRCL == 7) {
                Game.rooms[this.memory.finalBuildingList[i].roomName].createConstructionSite(this.memory.finalBuildingList[i].x, this.memory.finalBuildingList[i].y,
                    this.memory.finalBuildingList[i].structureType, this.name + "_2");

            }
            else if (this.memory.finalBuildingList[i].structureType == STRUCTURE_SPAWN && this.memory.finalBuildingList[i].minRCL == 8) {
                Game.rooms[this.memory.finalBuildingList[i].roomName].createConstructionSite(this.memory.finalBuildingList[i].x, this.memory.finalBuildingList[i].y,
                    this.memory.finalBuildingList[i].structureType, this.name + "_3");

            }
            else if (this.memory.finalBuildingList[i].structureType == STRUCTURE_RAMPART && this.memory.finalBuildingList[i].minRCL <= rcl) {
                Game.rooms[this.memory.finalBuildingList[i].roomName].createConstructionSite(this.memory.finalBuildingList[i].x, this.memory.finalBuildingList[i].y, this.memory.finalBuildingList[i].structureType);

            }
            else if (isPosFree(this.memory.finalBuildingList[i].x, this.memory.finalBuildingList[i].y, this.memory.finalBuildingList[i].roomName) == true
                && this.memory.finalBuildingList[i].minRCL <= rcl) {
                Game.rooms[this.memory.finalBuildingList[i].roomName].createConstructionSite(this.memory.finalBuildingList[i].x, this.memory.finalBuildingList[i].y, this.memory.finalBuildingList[i].structureType);
            }


        }
    }

    for (let i = 0; i < this.memory.roadBuildingList.length; i++) {

        if (this.memory.roadBuildingList[i].minRCL <= rcl && Game.rooms[this.memory.roadBuildingList[i].roomName] != undefined) {
            Game.rooms[this.memory.roadBuildingList[i].roomName].createConstructionSite(this.memory.roadBuildingList[i].x, this.memory.roadBuildingList[i].y, this.memory.roadBuildingList[i].structureType);
        }
    }
}


//Requires:
// this.memory.buildingList
// this.memory.roomPlan
//this.memory.baseVariations[type]
Room.prototype.planBorders = function planBorders(rcl, type) {



    const buildings = this.memory.buildingList;
    const sources2 = [];
    const costMap = new PathFinder.CostMatrix();
    const terrain = this.getTerrain()

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
            costMap.set(building.x, building.y, 250);
        }
    }


    const padding = 3;
    // Determine the bounding box around buildings
    buildings.forEach(building => {

        if (building.structureType == STRUCTURE_EXTENSION || building.structureType == STRUCTURE_TOWER || building.structureType == STRUCTURE_SPAWN
            || building.structureType == STRUCTURE_STORAGE || building.structureType == STRUCTURE_LAB
        ) {

            max_x = Math.max(max_x, building.x);
            min_x = Math.min(min_x, building.x);
            max_y = Math.max(max_y, building.y);
            min_y = Math.min(min_y, building.y);
            for (var x = building.x - padding; x < building.x + padding; x++) {
                for (var y = building.y - padding; y < building.y + padding; y++) {
                    //if (costMap.get(x, y) !== 250 || true) {
                    if (new RoomPosition(building.x, building.y, this.name).getRangeTo(x, y) <= 3 && costMap.get(x, y) != 255) {
                        costMap.set(x, y, 200); // Slightly lower cost to indicate preference for ramparts
                    }


                    //}
                }
            }
        }
    });



    // Use minCutToExit with the prepared sources and costMap
    const rampartPositions = mincut.minCutToExit(sources2, costMap);

    // Update roomPlan and buildingList with rampart positions
    rampartsAmount = 0;
    rampartPositions.forEach(pos => {
        this.memory.roomPlan[pos.x][pos.y] = STRUCTURE_RAMPART;

        buildings.push({ x: pos.x, y: pos.y, structureType: STRUCTURE_RAMPART, rcl });
        rampartsAmount++
        this.memory.buildingList.push(new buildingListElement(pos.x, pos.y, this.name, STRUCTURE_RAMPART, rcl));


    });



    /*
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
    */

    return rampartsAmount
}


//Requires:
// this.memory.roomPlan=[][]
// this.memory.buildingList=[]

Room.prototype.planControllerRamparts = function planControllerRamparts() {

    var controller_ramparts = this.controller.pos.getNearbyPositions();
    for (let position of controller_ramparts) {
        this.memory.roomPlan[position.x][position.y] = STRUCTURE_RAMPART;
        this.memory.buildingList.push(new buildingListElement(position.x, position.y, this.name, STRUCTURE_RAMPART, 3));
    }
}


//Requires:
// this.memory.controllerLinkPos
// this.memory.roomPlan=[][]
// this.memory.buildingList=[]
Room.prototype.planControllerContainer = function planControllerContainer(roomCM) {


    seeds = [];
    seeds.push(this.controller.pos);
    distanceCM = this.distanceTransform(roomCM, false);

    this.memory.controllerLinkPos = undefined;

    floodCM = this.floodFill(seeds);
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
        this.memory.roomPlan[posForContainer.x][posForContainer.y] = STRUCTURE_CONTAINER;
        this.memory.buildingList.push(new buildingListElement(posForContainer.x, posForContainer.y, this.name, STRUCTURE_CONTAINER, 2));
        this.memory.controllerContainerPos = posForContainer

        if (this.memory.roomPlan[posForContainer.x + 1][posForContainer.y] == 0) {
            this.memory.roomPlan[posForContainer.x + 1][posForContainer.y] = STRUCTURE_LINK;
            this.memory.buildingList.push(new buildingListElement(posForContainer.x + 1, posForContainer.y, this.name, STRUCTURE_LINK, 6));
            this.memory.controllerLinkPos = new RoomPosition(posForContainer.x + 1, posForContainer.y, this.name);
        }
    }


}

//requires:
// this.memory.harvestingSources=[]
// this.memory.roomPlan=[][]
// this.memory.buildingList=[]
Room.prototype.planSourcesContainers = function planSourcesContainers() {


    this.memory._insSourceContainers=true
    this.memory.sourcesLinksPos = []
    for (src of this.memory.harvestingSources) {

        console.log(src)
        //var source = Game.getObjectById(src.id)
        var sourcePos=src.pos
        if (sourcePos != undefined) {

            var sourcePositions = new RoomPosition(sourcePos.x,sourcePos.y,src.roomName).getN_NearbyPositions(1);
            if(Game.rooms[src.roomName]==undefined)
            {
                return -1
            }
            const terrain = Game.rooms[src.roomName].getTerrain();
            console.log("SourcePositions: ",sourcePositions)
            this.memory._sourcePositions=sourcePositions
            for (let position of sourcePositions) {
                console.log(position)
                if (terrain.get(position.x, position.y) != TERRAIN_MASK_WALL) {
                    if (src.roomName == this.name) {
                        this.memory.roomPlan[position.x][position.y] = STRUCTURE_CONTAINER;
                    }
                    this.memory._addingSourcesContainers=true
                    console.log("Adding container at: ",position.x," ",position.y)
                    this.memory.buildingList.push(new buildingListElement(position.x, position.y, src.roomName, STRUCTURE_CONTAINER, 2));
                    this.memory.finalBuildingList.push(new buildingListElement(position.x, position.y, src.roomName, STRUCTURE_CONTAINER, 2));
                    break;
                }
            }


            //Adding link in homeRoom
            var sourcePositions = new RoomPosition(sourcePos.x,sourcePos.y,src.roomName).getN_NearbyPositions(1);
            if (src.roomName == this.name) {
                for (let position of sourcePositions) {
                    var structuresOnPos = this.lookAt(position.x, position.y);
                    var isFree = true;
                    for (let str of structuresOnPos) {
                        if (/*str.structureType == STRUCTURE_CONTAINER || */ str.structureType == STRUCTURE_WALL || terrain.get(position.x, position.y) == TERRAIN_MASK_WALL
                            || this.memory.roomPlan[position.x][position.y] == STRUCTURE_CONTAINER) {
                            isFree = false;
                            break;
                        }
                    }
                    if (isFree) {
                        this.memory.roomPlan[position.x][position.y] = STRUCTURE_LINK;
                        this.memory.buildingList.push(new buildingListElement(position.x, position.y, this.name, STRUCTURE_LINK, 8));
                        this.memory.finalBuildingList.push(new buildingListElement(position.x, position.y, this.name, STRUCTURE_LINK, 8));
                        this.memory.sourcesLinksPos.push(new RoomPosition(position.x, position.y, this.name))
                        break;
                    }
                }



            }

        }

    }

    return 1
}


//requires:
// this.memory.keepersSources
// this.memory.buildingList
Room.prototype.planKeeperSourcesContainers = function planKeeperSourcesContainers(rcl) {

    for (sourceId of this.memory.keepersSources) {

        var source = Game.getObjectById(sourceId.id)
        if (source != undefined) {
            var sourcePos = source.pos.getN_NearbyPositions(1);
            const terrain = source.room.getTerrain();
            for (let position of sourcePos) {
                if (terrain.get(position.x, position.y) != TERRAIN_MASK_WALL) {
                    if (source.room.name == this.name) {
                        //this.memory.roomPlan[position.x][position.y] = STRUCTURE_CONTAINER;
                    }

                    this.memory.buildingList.push(new buildingListElement(position.x, position.y, source.room.name, STRUCTURE_CONTAINER, rcl));
                    break;
                }
            }

        }

    }
}


// requires this.memory.roomPlan=[][]
Room.prototype.visualizeBase = function visualizeBase() {
    if (this.memory.roomPlan == undefined) { return -1 }
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (this.memory.roomPlan[i][j] == STRUCTURE_EXTENSION) {
                this.visual.circle(i, j, { fill: '#ffff00', radius: 0.5, stroke: 'red' });
            }
            else if (this.memory.roomPlan[i][j] == STRUCTURE_ROAD) {
                this.visual.circle(i, j, { fill: '#666666', radius: 0.5, stroke: 'black' });
            }
            else if (this.memory.roomPlan[i][j] == STRUCTURE_CONTAINER) {
                this.visual.rect(i - 0.25, j - 0.4, 0.5, 0.8, { fill: 'red', stroke: 'black' });
            }
            else if (this.memory.roomPlan[i][j] == STRUCTURE_SPAWN) {
                this.visual.circle(i, j, { fill: '#666666', radius: 0.5, stroke: 'pink' });
            }
            else if (this.memory.roomPlan[i][j] == STRUCTURE_STORAGE) {
                this.visual.rect(i - 0.25, j - 0.4, 0.5, 0.8, { fill: '#666666', stroke: 'white' });
            }
            else if (this.memory.roomPlan[i][j] == STRUCTURE_TOWER) {
                this.visual.circle(i, j, { fill: 'red', radius: 0.5, stroke: 'red' });
            }
            else if (this.memory.roomPlan[i][j] == STRUCTURE_RAMPART) {
                this.visual.circle(i, j, { fill: 'green', radius: 0.5, stroke: 'green' });
            }
            else if (this.memory.roomPlan[i][j] == STRUCTURE_WALL) {
                this.visual.rect(i - 0.25, j - 0.4, 0.5, 0.8, { fill: '#000000', stroke: 'grey' });
            }
            else if (this.memory.roomPlan[i][j] == STRUCTURE_LINK) {
                this.visual.rect(i - 0.25, j - 0.4, 0.5, 0.8, { fill: '#000000', stroke: 'blue' });
            }
            else if (this.memory.roomPlan[i][j] == STRUCTURE_LAB) {
                this.visual.circle(i - 0.25, j - 0.4, 0.5, 0.8, { fill: 'pink', stroke: 'pink' });
            }
        }
    }
}

Room.prototype.planSpawnPos = function planSpawnPos(type) {
    if (type == undefined) { return -1; }
    var sources = this.find(FIND_SOURCES)
    var seeds = [];
    switch (type) {
        case C.SRC_1:
            {
                seeds.push(sources[0].pos)

                break;
            }
        case C.SRC_2:
            {
                if (sources.length > 1) {
                    seeds.push(sources[1].pos)
                }
                else {
                    seeds.push(sources[0].pos)
                }
                break;
            }
        case C.SRC_1_2:
            {
                if (sources.length > 1) {
                    seeds.push(sources[0].pos)
                    seeds.push(sources[1].pos)
                }
                else {
                    seeds.push(sources[0].pos)
                }
                break;
            }
        case C.CONTROLLER:
            {
                seeds.push(this.controller.pos)
                break;
            }
        case C.SRC_1_CONTROLLER:
            {
                seeds.push(sources[0].pos)
                seeds.push(this.controller.pos)
                break;
            }
        case C.SRC_2_CONTROLLER:
            {
                if (sources.length > 1) {
                    seeds.push(sources[1].pos)
                }
                else {
                    seeds.push(sources[0].pos)
                }
                seeds.push(this.controller.pos)
                break;
            }
        case C.SRC_1_2_CONTROLLER:
            {
                if (sources.length > 1) {
                    seeds.push(sources[0].pos)
                    seeds.push(sources[1].pos)
                }
                else {
                    seeds.push(sources[0].pos)
                }
                seeds.push(this.controller.pos)
                break;
            }
        case C.CURRENT_SPAWNPOS:
            {
                var spawn = this.find(FIND_MY_SPAWNS)
                this.memory.spawnPos = new RoomPosition(spawn[0].pos.x,spawn[0].pos.y,this.name)
                this.memory.baseVariations[type].spawnPos =  new RoomPosition(spawn[0].pos.x,spawn[0].pos.y,this.name)
                seeds.push(spawn[0].pos)
            }
    }



    let roomCM = new PathFinder.CostMatrix;
    const terrain = new Room.Terrain(this.name);
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (terrain.get(i, j) == 1) {
                roomCM.set(i, j, 255);
            }
        }
    }
    let distanceCM = this.distanceTransform(roomCM, false);

    var floodCM = this.floodFill(seeds);
    var minPos = new RoomPosition(0, 0, this.name)
    var minDistanceForSpawn = 999999
    for (var i = 0; i < 50; i++) {
        for (var j = 0; j < 50; j++) {
            if (distanceCM.get(i, j) >= 4 && floodCM.get(i, j) < minDistanceForSpawn && i > 7 && i < 43 && j > 7 && j < 43) {
                minDistanceForSpawn = floodCM.get(i, j);
                minPos.x = i;
                minPos.y = j + 2;
            }
        }
    }


    console.log("setting spawnPos: ", minPos)
    if (minPos.x != 0 && minPos.y != 0) {
        this.memory.baseVariations[type].spawnPos = new RoomPosition(minPos.x, minPos.y-2, this.name)

    }
    else {
        console.log("unable to find position for spawn")
        return -1
    }

}


Room.prototype.buildRoom = function buildRoom(type=C.CURRENT_SPAWNPOS) {

    

    var stage = 0
    console.log("type: ", type)
    if (this.memory.baseVariations==undefined ||this.memory.baseVariations[type]==undefined || this.memory.baseVariations[type].spawnPos == undefined) {
        this.memory.finishedPlanning = false
        this.memory.buildingStage = 0;
        stage = 0
        console.log("############")
    }
    else {
        if (this.memory.finishedPlanning == true) {
            if (this.memory.plannedRoads != true) {
                this.memory.buildingStage = 1
                stage = 1
            }
            else {
                this.memory.buildingStage = 2
                stage = 2
            }
        }

        if (this.memory.buildingStage == undefined) {
            this.memory.buildingStage = 0;
            stage = 0;
        }

    }


    if (stage == 0) {

        this.memory._inStage0 = true
        // Declaring variables for use in later stages
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

        var rows = 50;
        var cols = 50;
        this.memory.roomPlan = new Array(rows).fill(null).map(() => new Array(cols).fill(0));
        this.memory.buildingList = [];
        this.memory.roadBuildingList = [];



        this.planSpawnPos(type);

        var spawnPos = undefined
        if (this.memory.baseVariations[type] != undefined && this.memory.baseVariations[type].spawnPos != undefined) {
            spawnPos = this.memory.baseVariations[type].spawnPos
        }
        else {
            console.log("no spawn pos in stage 0")
            return -1

        }
        this.planMainSpawnStamp(roomCM, spawnPos)

        this.planManagerStamp(roomCM, spawnPos);
        this.planControllerContainer(roomCM)


        //plan_road_to_controller(spawn, roomCM);
        this.planExtensionStamp(roomCM, 4, spawnPos,type);//18 
        this.planExtensionStamp(roomCM, 5, spawnPos,type);//23
        this.planExtensionStamp(roomCM, 6, spawnPos,type);//28
        this.planExtensionStamp(roomCM, 6, spawnPos,type);//33
        this.planExtensionStamp(roomCM, 7, spawnPos,type);//38
        this.planExtensionStamp(roomCM, 7, spawnPos,type);//43
        this.planExtensionStamp(roomCM, 7, spawnPos,type);//48
        this.planExtensionStamp(roomCM, 8, spawnPos,type);//53
        this.planExtensionStamp(roomCM, 8, spawnPos,type);//58
        this.planTowersStamp(roomCM, spawnPos);
        this.planLabsStamp(roomCM);

        this.visualizeBase()

        if (Game.shard.name != 'shard3') {
            this.planControllerRamparts();
            var rampartsAmount = this.planBorders(4, type)
        }
        else {
            var rampartsAmount = 1;
        }


        this.memory._rampartsAmount = rampartsAmount
        if (rampartsAmount < this.memory.minRampartsAmount) {
            this.memory.minRampartsAmount = rampartsAmount
            this.memory.fnalRoomPlan = this.memory.roomPlan
            this.memory.finalBuildingList = this.memory.buildingList
            this.memory.variationToBuild = type
            console.log("setting best variation")
        }


        this.memory.baseVariations[key].variationFinished = true

        this.memory.roomCM = roomCM.serialize();
        this.memory.buildingStage++;
        var cpuAfter = Game.cpu.getUsed();
        this.memory.cpuSpentForStamps = cpuAfter - cpuBefore;
        return;

    }
    else if (stage == 1) {


        let roomCM1 = PathFinder.CostMatrix.deserialize(this.memory.roomCM);

        //this.planSourcesContainers();
        //this.planKeeperSourcesContainers(7)

        //and plan roads here
        // If finished scanning
        if (this.memory.roomsToScan != undefined && this.memory.roomsToScan.length == 0) {
            var spawnPos = this.memory.baseVariations[type].spawnPos

            this.planRoadToTarget(roomCM1,this.controller.pos,2,1,spawnPos)
            for (src of this.memory.harvestingSources) {
                this.planRoadToTarget(roomCM1, src.pos, 2, 1, spawnPos)
            }

            for (src of this.memory.keepersSources) {
                this.planRoadToTarget(roomCM1, src.pos, 8, 1, spawnPos)
            }

            if(this.planSourcesContainers()!=-1)
            {
                this.memory.plannedRoads = true
                this.memory.stage++;
            }

            this.memory.roomCM = roomCM1.serialize();

        }


        return
    }
    else if (stage == 2) {
        //build from lists and visualize roomPlan
        if(Game.time%11==0)
        {
            this.buildFromLists()
        }
        

        return
        // do not increment stage here
    }

    // find spawn pos for variation here
}