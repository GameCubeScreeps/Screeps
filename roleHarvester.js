
const Movement = require('screeps-movement');

Creep.prototype.roleHarvester = function roleHarvester() {



    /*Creep needs:
    Mandatory:
    Creep.memory.targetRoom - roomName in which is his source
    Creep.memory.sourceId - id of source to harvest

    Optional:
    Game.rooms[this.memory.homeRoom].memory.sourcesLinksId - Ids of links in homeRoom

    Will Calculate in its own:
    Creep.memory.closestContainerId - id of closest container in which this wll store energy
    Creep.memory.harvestingPower
    */

    if (this.memory.harvestingPower == undefined) {
        this.memory.harvestingPower = _.filter(this.body, { type: WORK }).length * HARVEST_POWER;
    }

    for (src of Game.rooms[this.memory.homeRoom].memory.harvestingSources) {
        //console.log(src.id)
        if (src.id == this.memory.sourceId) {

            src.harvestingPower+= (_.filter(this.body, { type: WORK }).length * HARVEST_POWER);
            src.harvesters++;
            break;
        }
    }

    if (this.room.name == this.memory.targetRoom /* && this.store.getFreeCapacity(RESOURCE_ENERGY) > 0*/) {
        // if have some free space and at destination room - go harvest

        if (this.memory.closestContainerId != undefined && Game.getObjectById(this.memory.closestContainerId) == null) {
            //this.say("reset");
            this.memory.closestContainerId = undefined;
        }
        if (this.memory.closestContainerId == undefined) {


            if (Game.rooms[this.memory.homeRoom].memory.sourcesLinksId != undefined && Game.rooms[this.memory.homeRoom].memory.sourcesLinksId.length > 0 && this.memory.targetRoom == this.memory.homeRoom) {
                var closestContainerId = [];
                for (let id of Game.rooms[this.memory.homeRoom].memory.sourcesLinksId) {
                    if (Game.getObjectById(id) != null) {
                        closestContainerId.push(Game.getObjectById(id))
                    }
                }
            }
            else {
                if (Game.getObjectById(this.memory.sourceId) != null) {
                    var closestContainerId = Game.getObjectById(this.memory.sourceId).pos.findInRange(FIND_STRUCTURES, 3, {
                        filter: (structure) => {
                            return structure.structureType === STRUCTURE_CONTAINER;
                        }
                    });
                }
            }
            if (closestContainerId != undefined && closestContainerId.length > 0) {
                closestContainerId = Game.getObjectById(this.memory.sourceId).pos.findClosestByRange(closestContainerId);
                if (closestContainerId != null) {
                    this.memory.closestContainerId = closestContainerId.id;
                }

            }
        }


        if (this.memory.closestContainerId != undefined && this.store.getFreeCapacity(RESOURCE_ENERGY) <= this.memory.harvestingPower) {

            //this.say("transfer")
            var energy_amount = this.store[RESOURCE_ENERGY]
            var transferResult = this.transfer(Game.getObjectById(this.memory.closestContainerId), RESOURCE_ENERGY)
            if (transferResult == ERR_NOT_IN_RANGE) {
                this.travelTo(Game.getObjectById(this.memory.closestContainerId))
                this.say("C");
            }
            else if (transferResult == OK) {
                this.harvest(Game.getObjectById(this.memory.sourceId))
                if (Game.rooms[this.room.name].memory.rawEnergyIncome == undefined) {
                    Game.rooms[this.room.name].memory.rawEnergyIncome = energy_amount
                }
                else {
                    Game.rooms[this.room.name].memory.rawEnergyIncome += energy_amount
                }
            }

        }
        else if (this.store.getFreeCapacity(RESOURCE_ENERGY) < this.memory.harvestingPower) {
            this.drop(RESOURCE_ENERGY)
        }
        if (Game.getObjectById(this.memory.sourceId) != null && Game.getObjectById(this.memory.sourceId).energy > 0
            && this.store.getFreeCapacity(RESOURCE_ENERGY) > this.memory.harvestingPower) {
            if (this.harvest(Game.getObjectById(this.memory.sourceId)) == ERR_NOT_IN_RANGE) {
                this.travelTo(Game.getObjectById(this.memory.sourceId), { reusePath: 17, range: 1 });
                //this.memory.is_working = false;
            }/*
            else if (this.harvest(Game.getObjectById(this.memory.sourceId)) == OK) { 
                this.memory.is_working = true;
            }*/
        }
        else if (Game.getObjectById(this.memory.sourceId) != null && Game.getObjectById(this.memory.sourceId).energy == 0 && this.room.name == this.memory.targetRoom
            && this.pos.isNearTo(Game.getObjectById(this.memory.sourceId))) {
            this.sleep(Game.getObjectById(this.memory.sourceId).ticksToRegeneration)
        }

    }
    else if (this.room.name != this.memory.targetRoom /*&& this.store[RESOURCE_ENERGY] == 0*/) {// not in target room and have free space - go to target room
        //const destination = new RoomPosition(25, 25, this.memory.targetRoom); 
        if (this.memory.sourceId != undefined && Game.getObjectById(this.memory.sourceId) != null) {
            this.travelTo(Game.getObjectById(this.memory.sourceId), { reusePath: 17, swampCost: 1, plainCost: 1 });
            //this.say("A");
        }
        if (Game.rooms[this.memory.targetRoom] == undefined) {
            const destination = new RoomPosition(25, 25, this.memory.targetRoom); // Replace with your destination coordinates and room name
            this.travelTo(destination, { reusePath: 25 });
        }

    }


};