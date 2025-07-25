// Every constant definied in separate file
const C = require('constants');

const roleScout = require('roleScout')
const roleHarvester = require('roleHarvester')
const roleCarrier = require('roleCarrier')
const roleWorker = require('roleWorker')
const roleFiller = require('roleFiller')
const roleRepairer = require('roleRepairer')
const roleHauler = require('roleHauler')
const roleReserver = require('roleReserver')
const roleRampartRepairer = require('roleRampartRepairer')
const roleResourceManager=require('roleResourceManager')
const roleSoldier=require('roleSoldier')


Room.prototype.creepsManager = function creepsManager() {

    global.heap.rooms[this.name].haveScout = false;
    global.heap.rooms[this.name].haulersParts = 0;
    global.heap.rooms[this.name].resourceManagerId = undefined;

    for (var cr in Memory.creeps) {  //clearing data about dead creeps
        if (!Game.creeps[cr]) {
            delete Memory.creeps[cr];
        }
    }

    for (cr in Game.creeps) {

        var creep = Game.creeps[cr];
        if (creep == undefined || creep.memory == undefined) {
            creep.suicide()
            continue
        }

        if (creep.ticksToLive > creep.memory.TimeToSleep
            || creep.memory.homeRoom != this.name
        ) {
            //creep.say('💤')
            continue;
        }

        role = creep.memory.role
        switch (role) {
            case C.ROLE_SCOUT:
                creep.roleScout()
                console.log("scout pos: ", creep.pos)
                global.heap.rooms[this.name].haveScout = true
                continue;
            case C.ROLE_HARVESTER:
                creep.roleHarvester()
                continue;
            case C.ROLE_CARRIER:
                creep.roleCarrier()
                continue
            case C.ROLE_WORKER:
                creep.roleWorker()
                global.heap.rooms[this.name].workersParts += _.filter(creep.body, { type: WORK }).length
                continue
            case C.ROLE_FILLER:
                creep.roleFiller()
                global.heap.rooms[this.name].fillers++;
                continue
            case C.ROLE_REPAIRER:
                creep.roleRepairer()
                continue
            case C.ROLE_HAULER:
                global.heap.rooms[this.name].haulersParts += _.filter(creep.body, { type: CARRY }).length
                creep.roleHauler()
                continue
            case C.ROLE_RESERVER:
                creep.roleReserver()
                break;
            case C.ROLE_RAMPART_REPAIRER:
                creep.roleRampartRepairer()
                global.heap.rooms[this.name].rampartRepairersPower += _.filter(creep.body, { type: WORK }).length
                break;
            case C.ROLE_RESOURCE_MANAGER:
                creep.roleResourceManager()
                global.heap.rooms[this.name].resourceManagerId = creep.id
                break;
            case C.ROLE_SOLDIER:
                creep.roleSoldier()
                global.heap.rooms[creep.memory.targetRoom].myHealPower +=_.filter(creep.body, { type: HEAL }).length*HEAL_POWER;
                global.heap.rooms[creep.memory.targetRoom].myAttackPower +=_.filter(creep.body, { type: ATTACK }).length*ATTACK_POWER;
                global.heap.rooms[creep.memory.targetRoom].myRangedAttackPower +=_.filter(creep.body, { type: RANGED_ATTACK }).length*RANGED_ATTACK_POWER;
                break;
            case C.ROLE_CLAIMER:
                creep.roleClaimer() 
                global.heap.rooms[this.memory.targetRoom].claimer=creep.id
            case C.ROLE_COLONIZER: 
                creep.roleColonizer()
                global.heap.rooms[this.memory.targetRoom].colonizers.push(creep.id)
        }
    }

    //console.log(this.name, " have scout: ", global.heap.rooms[this.name].haveScout)
}