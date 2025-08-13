


Creep.prototype.roleMiner= function roleMiner()
{
    var extractor=undefined
    if(Game.getObjectById(Game.rooms[this.memory.homeRoom].memory.extractorId)!=null && Game.getObjectById(Game.rooms[this.memory.homeRoom].memory.mineralId)!=null)
    {
        extractor=Game.getObjectById(Game.rooms[this.memory.homeRoom].memory.extractorId)
        if(this.pos.isNearTo(extractor))
        {
            if(extractor.cooldown==0 && this.store.getFreeCapacity(RESOURCE_ENERGY)>0)
            {
                this.harvest(Game.getObjectById(Game.rooms[this.memory.homeRoom].memory.mineralId))
            }
        }
        else{
            this.travelTo(extractor)
        }

        //add passing mineral to carrier here
        if(this.store.getFreeCapacity(RESOURCE_ENERGY)<=(_.filter(this.body, { type: WORK }).length * HARVEST_MINERAL_POWER) || this.ticksToLive<50)
        {
            for(carrier of global.heap.rooms[this.room.name].mineralCarriers)
            {
                if(this.transfer(carrier,Game.getObjectById(Game.rooms[this.memory.homeRoom].memory.mineralId).mineralType)==OK)
                {
                    break;
                }
            }
        }
    }
}
