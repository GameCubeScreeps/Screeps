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
const roleResourceManager = require('roleResourceManager')
const roleSoldier = require('roleSoldier')
const roleClaimer = require('roleClaimer')
const roleColonizer = require('roleColonizer')

Room.prototype.creepsManager = function creepsManager() {

    global.heap.rooms[this.name].haveScout = false;
    global.heap.rooms[this.name].haulersParts = 0;
    global.heap.rooms[this.name].resourceManagerId = undefined;

    global.heap.rooms[this.name].creepsBodyParts = 0
    global.heap.rooms[this.name].harvestingParts = 0;
    global.heap.rooms[this.name].civilianParts = 0;
    global.heap.rooms[this.name].militaryParts = 0;

    for (var cr in Memory.creeps) {  //clearing data about dead creeps
        if (!Game.creeps[cr]) {
            delete Memory.creeps[cr];
        }
    }

    for (cr in Game.creeps) {

        var creep = Game.creeps[cr];

        if(global.heap.rooms[creep.memory.homeRoom]!=undefined)
        {
            global.heap.rooms[creep.memory.homeRoom].creepsBodyParts += creep.body.length
        }
        



        if (creep == undefined || creep.memory == undefined || creep.memory == {}) {
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
                global.heap.rooms[creep.memory.homeRoom].civilianParts += creep.body.length
                global.heap.rooms[creep.memory.homeRoom].haveScout = true
                continue;
            case C.ROLE_HARVESTER:
                global.heap.rooms[creep.memory.homeRoom].harvestingParts += creep.body.length
                creep.roleHarvester()
                continue;
            case C.ROLE_CARRIER:
                creep.roleCarrier()
                global.heap.rooms[creep.memory.homeRoom].harvestingParts += creep.body.length
                continue
            case C.ROLE_WORKER:
                creep.roleWorker()
                global.heap.rooms[creep.memory.homeRoom].civilianParts += creep.body.length
                global.heap.rooms[creep.memory.homeRoom].workersParts += _.filter(creep.body, { type: WORK }).length
                continue
            case C.ROLE_FILLER:
                creep.roleFiller()
                global.heap.rooms[creep.memory.homeRoom].civilianParts += creep.body.length
                global.heap.rooms[creep.memory.homeRoom].fillers++;
                continue
            case C.ROLE_REPAIRER:
                creep.roleRepairer()
                global.heap.rooms[creep.memory.homeRoom].civilianParts += creep.body.length
                continue
            case C.ROLE_HAULER:
                global.heap.rooms[creep.memory.homeRoom].haulersParts += _.filter(creep.body, { type: CARRY }).length
                global.heap.rooms[creep.memory.homeRoom].civilianParts += creep.body.length
                creep.roleHauler()
                continue
            case C.ROLE_RESERVER:
                creep.roleReserver()
                global.heap.rooms[creep.memory.homeRoom].harvestingParts += creep.body.length
                break;
            case C.ROLE_RAMPART_REPAIRER:
                creep.roleRampartRepairer()
                global.heap.rooms[creep.memory.homeRoom].civilianParts += creep.body.length
                global.heap.rooms[creep.memory.homeRoom].rampartRepairersPower += _.filter(creep.body, { type: WORK }).length
                break;
            case C.ROLE_RESOURCE_MANAGER:
                creep.roleResourceManager()
                global.heap.rooms[creep.memory.homeRoom].civilianParts += creep.body.length
                global.heap.rooms[creep.memory.homeRoom].resourceManagerId = creep.id
                break;
            case C.ROLE_SOLDIER:
                creep.roleSoldier()
                global.heap.rooms[creep.memory.homeRoom].militaryParts += creep.body.length
                global.heap.rooms[creep.memory.targetRoom].myHealPower += _.filter(creep.body, { type: HEAL }).length * HEAL_POWER;
                global.heap.rooms[creep.memory.targetRoom].myAttackPower += _.filter(creep.body, { type: ATTACK }).length * ATTACK_POWER;
                global.heap.rooms[creep.memory.targetRoom].myRangedAttackPower += _.filter(creep.body, { type: RANGED_ATTACK }).length * RANGED_ATTACK_POWER;
                break;
            case C.ROLE_CLAIMER:
                creep.roleClaimer()
                global.heap.rooms[creep.memory.homeRoom].civilianParts += creep.body.length
                global.heap.rooms[creep.memory.targetRoom].claimer = creep.id
                break;
            case C.ROLE_COLONIZER:
                creep.roleColonizer()
                global.heap.rooms[creep.memory.homeRoom].civilianParts += creep.body.length
                if(global.heap.rooms[creep.memory.targetRoom].colonizers!=undefined)
                {//As room will have spawn built it will no longer have "colonizers" property but 
                    global.heap.rooms[creep.memory.targetRoom].colonizers.push(creep.id)
                }
                
                break;
        }
    }

}