const C = require('constants');


Room.prototype.visualize = function visualizeroomManager() {



    if(global.heap.rooms[this.name].energyBalance!=undefined)
    {
        console.log("energy Balance: ",global.heap.rooms[this.name].energyBalance)
        //visualize balancing
        Game.rooms[this.name].visual.rect(Game.rooms[this.name].controller.pos.x-C.BALANCER_HARVEST_LIMIT,
            Game.rooms[this.name].controller.pos.y-1,C.BALANCER_HARVEST_LIMIT*2,1,{
                fill: 'grey'
            }
        )
        // right is a lot of energy
        Game.rooms[this.name].visual.text('⛏️',Game.rooms[this.name].controller.pos.x-0.5-C.BALANCER_HARVEST_LIMIT,Game.rooms[this.name].controller.pos.y-0.3)
        Game.rooms[this.name].visual.text('⏫',Game.rooms[this.name].controller.pos.x+0.5+C.BALANCER_HARVEST_LIMIT,Game.rooms[this.name].controller.pos.y-0.3)
        Game.rooms[this.name].visual.text('🔻',Game.rooms[this.name].controller.pos.x+global.heap.rooms[this.name].energyBalance,Game.rooms[this.name].controller.pos.y-0.3)

        
    }
}