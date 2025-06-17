
function findRoute(starting_pos, destination) {

    var ret = PathFinder.search(starting_pos, destination, {
        //maxRooms: 64,
        
        plainCost: 2,
        range: 5 ,
        swampCost: 2,
        maxOps: 8000,

        roomCallback: function (roomName) {

            //let room = spawn.room.name;
            // In this example `room` will always exist, but since 
            // PathFinder supports searches which span multiple rooms 
            // you should be careful!
            //costs = new PathFinder.CostMatrix;

            let room = Game.rooms[roomName];
            if (!room) { return; }

           // if (roomName == spawn.room.name) {
           //     costs = roomCM;
           // }
           // else {
                // setting costmatrix for for rooms other than spawnRoom
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
            //}
            //let 



            //spawn.
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
            //spawn.
            room.find(FIND_CONSTRUCTION_SITES, {
                filter: function (construction) {
                    return construction.structureType != STRUCTURE_ROAD;
                }
            }).forEach(function (struct) {
                costs.set(struct.pos.x, struct.pos.y, 255);
            });

            //favour roads under construction
            //spawn.
            room.find(FIND_CONSTRUCTION_SITES, {
                filter: function (construction) {
                    return construction.structureType == STRUCTURE_ROAD;
                }
            }).forEach(function (struct) {
                costs.set(struct.pos.x, struct.pos.y, 1);
            });

            /*
            //ignore walls
            if (roomName == spawn.room.name) {

                for (let i = 0; i < 50; i++) {
                    for (let j = 0; j < 50; j++) {
                        if (spawn.memory.room_plan[i][j] == STRUCTURE_RAMPART && costs.get(i, j) < 255) {
                            costs.set(i, j, 1);
                        }
                    }
                }
            }
            */

           // costs.set(destination.x, destination.y, 255);

            return costs;
        }
    });

    

    for (a of ret.path) {
        //console.log(a)
        if( Game.rooms[a.roomName]!=undefined)
        {
            Game.rooms[a.roomName].visual.circle(a.x, a.y, { fill: 'white', radius: 0.5, stroke: 'red' });
        }
        
    }

    //console.log("Route from: ", starting_pos, " to: ", destination, " incomplete: ", ret.incomplete," length: ",ret.path.length)

    return ret
}


module.exports = findRoute