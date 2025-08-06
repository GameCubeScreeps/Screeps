


Creep.prototype.roleMiner()
{
    var extractor=undefined
    if(Game.getObjectById(Game.rooms[this.name].extractorId)!=null && Game.getObjectById(Game.rooms[this.name].mineralId)!=null)
    {
        extractor=Game.getObjectById(Game.rooms[this.name].extractorId)
        if(this.pos.isNearTo(extractor))
        {
            if(extractor.cooldown==0 && this.store.getFreeCapacity(RESOURCE_ENERGY)>0)
            {
                this.harvest(Game.getObjectById(Game.rooms[this.name].mineralId))
            }
        }
        else{
            this.travelTo(extractor)
        }
    }
}

