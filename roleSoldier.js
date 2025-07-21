
const Movement = require('screeps-movement');
const C=require('constants')

Creep.prototype.roleSoldier = function roleSoldier(ceep) {

    if (this.memory.isMelee == undefined) {
        for (let part of this.body) {

            if (part.type == ATTACK) {
                this.memory.isMelee = true;
            }
        }
        if (this.memory.isMelee == undefined) {
            this.memory.isMelee = false;
        }
    }
    if (this.hits < this.hitsMax) {
        this.heal(this);
    }



    if (this.room.name == this.memory.targetROom) {

        

        var targetCreep = this.pos.findClosestByRange(global.heap.rooms[this.room.name].hostiles);

        var targetStructure = this.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
            filter: function (structure) {
                return structure.structureType == STRUCTURE_INVADER_CORE
            }
        });

        if (targetStructure == null) {
            targetStructure = this.pos.findClosestByRange(global.heap.rooms[this.room.name].hostileStructures);
        }

        if (targetCreep) {

            if (this.rangedAttack(targetCreep) == ERR_NOT_IN_RANGE) {
                this.moveTo(targetthis.pos, { maxRooms: 1, avoidSk: true, avoidCreeps: true });
            }

            if (this.memory.isMelee == false) {
                if (this.pos.inRangeTo(targetCreep, 2) && (_.filter(targetCreep.body, function (part) {
                    return part.type === RANGED_ATTACK && part.hits > 0;
                }).length > 0 || _.filter(targetCreep.body, function (part) {
                    return part.type === ATTACK && part.hits > 0;
                }).length > 0)) {
                    this.fleeFrom({ targetCreep }, 3, { maxRooms: 1 })
                    this.say("flee")
                }
                else if (this.pos.isNearTo(targetthis.pos)) {
                    this.rangedMassAttack()
                }
            }

            if (this.hits < this.hitsMax / 2) {
                this.fleeFrom({ targetCreep }, 6)
            }


        }
        else if (targetStructure) {

            if (this.memory.isMelee == true) {
                if (this.attack(targetStructure) == ERR_NOT_IN_RANGE) {
                    this.moveTo(targetStructure, { maxRooms: 1, avoidCreeps: true, reusePath: 11, range: 1 });
                }

            }
            else {
                this.moveTo(targetStructure, { maxRooms: 1, avoidCreeps: true });
                this.rangedMassAttack()
            }

            if (this.hits < this.hitsMax) {
                this.heal(this);
            }
        }
        if (Game.rooms[this.memory.targetROom] != undefined && Game.rooms[this.memory.targetROom].memory.damagedCreeps.length > 0) {
            var damaged = [];
            for (cr of Game.rooms[this.memory.targetROom].memory.damagedCreeps) {
                damaged.push(Game.getObjectById(cr))
            }
            var toHeal = this.pos.findClosestByRange(damaged)
            if (toHeal != null) {
                if (this.heal(toHeal) == ERR_NOT_IN_RANGE) {
                    if (targetCreep == null) {
                        this.say("6")
                        this.moveTo(toHeal)
                    }

                    this.rangedHeal(toHeal)
                }
            }
        }
        else {
        }
    }
    else {

        if (Game.rooms[this.room.name].memory.hostiles != undefined && Game.rooms[this.room.name].memory.hostiles.length > 0) {
            this.rangedMassAttack()
            this.heal(this)
        }
        this.moveTo(new RoomPosition(25, 25, this.memory.targetROom), { reusePath: 25, avoidCreeps: true, range: 22 });

    }


    if (this.hits < this.hitsMax) {
        this.heal(this);
    }




};