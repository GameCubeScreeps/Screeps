

Room.prototype.roomManager = new function roomManager() {


    global.heap.rooms[this.name].hostiles = []
    global.heap.rooms[this.name].allies = []
    if (Memory.mainRooms.includes(this.name)) {
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

        //TODO 
        // Implement planing base and building from that "plan"
        //this.planBase()
        //
        // Add running creeps roles
        
    }

    Game.rooms[this.name].memory.roads = []
    Game.rooms[this.name].memory.containers = []


    //Finding hostile Creeps
    var hostiles = r.find(FIND_HOSTILE_CREEPS, {
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
    var allies = r.find(FIND_HOSTILE_CREEPS, {
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