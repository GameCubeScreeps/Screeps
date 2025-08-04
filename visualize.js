const C = require('constants');


Room.prototype.visualize = function visualizeroomManager() {


    // energyBalance visualization
    if (Game.rooms[this.name].memory.energyBalance != undefined) {
        console.log("energy Balance: ", Game.rooms[this.name].memory.energyBalance)
        //visualize balancing
        Game.rooms[this.name].visual.rect(Game.rooms[this.name].controller.pos.x - (C.BALANCER_HARVEST_LIMIT / 500),
            Game.rooms[this.name].controller.pos.y - 1, (C.BALANCER_HARVEST_LIMIT / 500) * 2, 1, {
            fill: C.FILL_COLOR
        }
        )
        // right is a lot of energy
        Game.rooms[this.name].visual.text('⛏️', Game.rooms[this.name].controller.pos.x + 0.5 + (C.BALANCER_HARVEST_LIMIT / 500), Game.rooms[this.name].controller.pos.y - 0.3)
        Game.rooms[this.name].visual.text('⏫', Game.rooms[this.name].controller.pos.x - 0.5 - (C.BALANCER_HARVEST_LIMIT / 500), Game.rooms[this.name].controller.pos.y - 0.3)
        Game.rooms[this.name].visual.text('🔻', Game.rooms[this.name].controller.pos.x + (Game.rooms[this.name].memory.energyBalance / 500), Game.rooms[this.name].controller.pos.y - 0.3)


    }


    //progress/tick visualization
    if (Game.rooms[this.name].memory.progressSum != undefined && Game.rooms[this.name].memory.progressCounter != undefined) {

        if (Game.time % C.AVG_STEP == 0) {
            Game.rooms[this.name].memory.progressSum = 0;
            Game.rooms[this.name].memory.progressCounter = 0
        }
        var auxText = '⬆️' + (Math.round((Game.rooms[this.name].memory.progressSum / Game.rooms[this.name].memory.progressCounter) * 100) / 100) + "/t"
        var blockPos = new RoomPosition(this.controller.pos.x, this.controller.pos.y, this.name)
        var blockPosWidth = 4
        var blockPosHeight = 1
        this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.text(auxText, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)

        //Game.rooms[this.name].visual.text('⬆️' + (Math.round((Game.rooms[this.name].memory.progressSum / Game.rooms[this.name].memory.progressCounter) * 100) / 100) + "/t",
        //    Game.rooms[this.name].controller.pos.x + 1.5, Game.rooms[this.name].controller.pos.y + 1, { color: C.TEXT_COLOR })



        var ttu = (Game.rooms[this.name].controller.progressTotal - Game.rooms[this.name].controller.progress) / (Math.round((Game.rooms[this.name].memory.progressSum / Game.rooms[this.name].memory.progressCounter) * 100) / 100)
        var blockPos = new RoomPosition(this.controller.pos.x-4, this.controller.pos.y, this.name)
        var blockPosWidth = 4
        var blockPosHeight = 1
        this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.text('🕓' + Math.round((ttu)), blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)


    }

    //Cpu usage visualization
    if (global.heap.rooms[mainRoom].avgCpu != undefined) {

        //avg cpu
        tempAvg = (Math.round((global.heap.rooms[this.name].avgCpu) * 100) / 100)
        var blockPos = new RoomPosition(38, 1, this.name)
        var blockPosWidth = 6
        var blockPosHeight = 1
        this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.text("avgCpu: " + tempAvg, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)

        //usedCpu
        tempUsed = (Math.round((global.heap.rooms[this.name].usedCpu) * 100) / 100)
        var blockPos = new RoomPosition(38, 2, this.name)
        var blockPosWidth = 6
        var blockPosHeight = 1
        this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.text("usedCpu: " + tempUsed, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)

    }

    //Memory


    //Heap
    var heapData = Game.cpu.getHeapStatistics()
    var blockPos = new RoomPosition(38, 3, this.name)
    var blockPosWidth = 8
    var blockPosHeight = 1

    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    var usedHeap = (Math.round((heapData.used_heap_size / 1024) / 1024) * 100) / 100
    this.visual.text("Heap: " + usedHeap + " MB\\" + (heapData.heap_size_limit / 1024) / 1024 + " MB", blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)



    //Player Name
    var blockPos = new RoomPosition(22, 1, this.name)
    var blockPosWidth = 6
    var blockPosHeight = 1
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.text(C.USERNAME, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)


    //GCL Data
    var progress = (Math.round((Game.gcl.progress / Game.gcl.progressTotal) * 100))
    var blockPos = new RoomPosition(22, 2, this.name)
    var blockPosWidth = 6
    var blockPosHeight = 1
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.text("GCL: " + Game.gcl.level + " " + progress + "%", blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)



    //building
    //global.heap.rooms[this.name].construction
    var color = 'red'
    if (global.heap.rooms[this.name].construction != undefined && global.heap.rooms[this.name].construction.length > 0) {
        color = 'green'
    }
    var blockPos = new RoomPosition(44, 2, this.name)
    var blockPosWidth = 1
    var blockPosHeight = 1
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: color })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.text('🔨', blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)






    //harvesting data
    var blockPos = new RoomPosition(3, 1, this.name)
    var blockPosWidth = 8
    var blockPosHeight = 1
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.text("Harvesting data", blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)




    if (this.memory.harvestingSources != undefined) {
        for (src of this.memory.harvestingSources) {

            blockPos.y += blockPosHeight
            var blockPosWidth = 8
            var blockPosHeight = 1
            this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
            this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
            this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
            this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
            this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })

            var aux = Math.round((src.harvestingPower / (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME)) * Math.min(1, src.carryPower / src.harvestingPower) * 100)
            this.visual.text(src.roomName + " (" + src.pos.x + " " + src.pos.y + ") -> " + aux + "%"
                , blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)


        }
    }
    blockPos.y += blockPosHeight

    //Used Body Parts
    var blockPosWidth = 8
    var blockPosHeight = 1
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })

    var maxBodyParts=(CONTROLLER_STRUCTURES[STRUCTURE_SPAWN][this.controller.level])*(CREEP_LIFE_TIME/CREEP_SPAWN_TIME)
    this.visual.text("UsedBodyParts: "+ global.heap.rooms[this.name].creepsBodyParts+"\\"+maxBodyParts, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)
     blockPos.y += blockPosHeight

    //Creeps data

    //Workers
    var blockPosWidth = 8
    var blockPosHeight = 1
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })

    var maxBodyParts=(CONTROLLER_STRUCTURES[STRUCTURE_SPAWN][this.controller.level])*(CREEP_LIFE_TIME/CREEP_SPAWN_TIME)
    this.visual.text("Workers Parts: "+ global.heap.rooms[this.name].workersParts, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)



}