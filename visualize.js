const C = require('constants');


Room.prototype.visualize = function visualizeroomManager() {


    // energyBalance visualization
    if (Game.rooms[this.name].memory.energyBalance != undefined) {
        console.log("energy Balance: ", Game.rooms[this.name].memory.energyBalance)
        //visualize balancing
        Game.rooms[this.name].visual.rect(Game.rooms[this.name].controller.pos.x - C.BALANCER_HARVEST_LIMIT,
            Game.rooms[this.name].controller.pos.y - 1, C.BALANCER_HARVEST_LIMIT * 2, 1, {
            fill: 'grey'
        }
        )
        // right is a lot of energy
        Game.rooms[this.name].visual.text('⛏️', Game.rooms[this.name].controller.pos.x - 0.5 - C.BALANCER_HARVEST_LIMIT, Game.rooms[this.name].controller.pos.y - 0.3)
        Game.rooms[this.name].visual.text('⏫', Game.rooms[this.name].controller.pos.x + 0.5 + C.BALANCER_HARVEST_LIMIT, Game.rooms[this.name].controller.pos.y - 0.3)
        Game.rooms[this.name].visual.text('🔻', Game.rooms[this.name].controller.pos.x + Game.rooms[this.name].memory.energyBalance, Game.rooms[this.name].controller.pos.y - 0.3)


    }


    //progress/tick visualization
    if (Game.rooms[this.name].memory.progressSum != undefined && Game.rooms[this.name].memory.progressCounter != undefined) {

        Game.rooms[this.name].visual.text('⬆️' + (Math.round((Game.rooms[this.name].memory.progressSum / Game.rooms[this.name].memory.progressCounter) * 100) / 100) + "/t",
            Game.rooms[this.name].controller.pos.x + 1.5, Game.rooms[this.name].controller.pos.y + 1, { color: C.TEXT_COLOR })


        var ttu = (Game.rooms[this.name].controller.progressTotal - Game.rooms[this.name].controller.progress) / (Math.round((Game.rooms[this.name].memory.progressSum / Game.rooms[this.name].memory.progressCounter) * 100) / 100)


        this.visual.rect(this.controller.pos.x, this.controller.pos.y, 3, 1.5, { fill: 'grey' })

        this.visual.line(this.controller.pos.x, this.controller.pos.y, this.controller.pos.x, this.controller.pos.y + 1.5, { color: 'C.OUTLINE_COLOR' }) // left vertical
        this.visual.line(this.controller.pos.x + 3, this.controller.pos.y, this.controller.pos.x + 3, this.controller.pos.y + 1.5, { color: 'C.OUTLINE_COLOR' }) // right vertical
        this.visual.line(this.controller.pos.x, this.controller.pos.y + 1.5, this.controller.pos.x + 3, this.controller.pos.y + 1.5, { color: 'C.OUTLINE_COLOR' }) // horozontal below controler
        this.visual.line(this.controller.pos.x, this.controller.pos.y, this.controller.pos.x + 3, this.controller.pos.y, { color: 'C.OUTLINE_COLOR' }) // horizontal above
        Game.rooms[this.name].visual.text('🕓' + Math.round((ttu)), Game.rooms[this.name].controller.pos.x + 1.5, Game.rooms[this.name].controller.pos.y - 1.5, { color: C.TEXT_COLOR })
    }

}