const C = require('constants');


Room.prototype.visualize = function visualizeroomManager() {



    if(Game.rooms[this.name].memory.energyBalance!=undefined)
    {
        console.log("energy Balance: ",Game.rooms[this.name].memory.energyBalance)
        //visualize balancing
        Game.rooms[this.name].visual.rect(Game.rooms[this.name].controller.pos.x-C.BALANCER_HARVEST_LIMIT,
            Game.rooms[this.name].controller.pos.y-1,C.BALANCER_HARVEST_LIMIT*2,1,{
                fill: 'grey'
            }
        )
        // right is a lot of energy
        Game.rooms[this.name].visual.text('⛏️',Game.rooms[this.name].controller.pos.x-0.5-C.BALANCER_HARVEST_LIMIT,Game.rooms[this.name].controller.pos.y-0.3)
        Game.rooms[this.name].visual.text('⏫',Game.rooms[this.name].controller.pos.x+0.5+C.BALANCER_HARVEST_LIMIT,Game.rooms[this.name].controller.pos.y-0.3)
        Game.rooms[this.name].visual.text('🔻',Game.rooms[this.name].controller.pos.x+Game.rooms[this.name].memory.energyBalance,Game.rooms[this.name].controller.pos.y-0.3)

        
    }
}