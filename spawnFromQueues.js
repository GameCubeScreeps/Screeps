// Every constant definied in separate file
const C = require('contants');
const { result } = require('lodash');
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
        return -1;
    }

    
    if(global.heap.rooms[this.name].defensiveQueue.length>0)
    {

    }
    else if(global.heap.rooms[this.name].harvestingQueue.length>0)
    {

    }
    else if(global.heap.rooms[this.name].civilianQueue.length>0)
    {
        var request=global.heap.rooms[this.name].civilianQueue[0]
        type=request.type
        switch (type){
            case C.ROLE_SCOUT:
                var  result=spawn.spawnCreep([MOVE],'scout_'+this.name+Game.time,{ memory: { role: 'scout', homeRoom: this.name } })
                if(result==OK)
                {
                    global.heap.rooms[this.name].civilianQueue.shift()
                    break;
                }
        }
    }
    else if(global.heap.rooms[this.name].offensiveQueue.length>0)
    {

    }
}