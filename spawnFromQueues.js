// Every constant definied in separate file
const C = require('contants');
//defining local heap
const localHeap = {}

Room.prototype.spawnFromQueues = new function spawnFromQueues() {



    var spawn=Game.spawns[this.name+'_1']
    if(spawn==undefined && Game.spawns['Spawn1']!=undefined && Game.spawns['Spawn1'].room.name==this.name)
    {
        spawn=Game.spawns['Spawn1']
    }

    if(spawn==undefined)
    {
        console.log("Spawn for: ",this.name," is undefined")
    }

    if(global.heap.rooms[this.name].defensiveQueue.length>0)
    {

    }
    else if(global.heap.rooms[this.name].harvestingQueue.length>0)
    {

    }
    else if(global.heap.rooms[this.name].civilianQueue.length>0)
    {

    }
    else if(global.heap.rooms[this.name].offensiveQueue.length>0)
    {

    }
}