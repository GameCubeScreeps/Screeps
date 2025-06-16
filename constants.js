


const TEST_CONST="testttttt"

for (spawnName in Game.spawns) {
      global.heap.userName = Game.spawns[spawnName].owner.username
      break;
    }
const USERNAME=global.heap.userName
//Creep Roles
const ROLE_HARVESTER='harvester'
const ROLE_CARRIER='carrier'
const ROLE_FILLER='filler'
const ROLE_SOLDIER='soldier'
const ROLE_SCOUT='scout'
const ROLE_UPGRADER='upgrader'

//Creep constants
const CREEP_MAX_BODYPARTS=50;

//Economy const
const BALANCER_STEP=0.01
const BALANCER_DECAY=0.01
const BALANCER_HARVEST_LIMIT=2.0
const BALANCER_USE_LIMIT=-2.0
const UPGRADE_FACTOR=10000
const STORAGE_BALANCER_START=50000
const ENERGY_BALANCER_UPGRADER_START=0.5
const HARVESTING_BODYPARTS_FRACTION=0.8



// Room Visualization
const OUTLINE_COLOR = 'black'
const TEXT_COLOR = '#fc03b6'

module.exports={
    TEST_CONST,
    USERNAME,
    ROLE_HARVESTER,
    ROLE_CARRIER,
    ROLE_FILLER,
    ROLE_SOLDIER,
    ROLE_SCOUT,
    ROLE_UPGRADER,
    CREEP_MAX_BODYPARTS,
    BALANCER_STEP,
    BALANCER_DECAY,
    BALANCER_HARVEST_LIMIT,
    BALANCER_USE_LIMIT,
    UPGRADE_FACTOR,
    STORAGE_BALANCER_START,
    ENERGY_BALANCER_UPGRADER_START,
    HARVESTING_BODYPARTS_FRACTION,
    OUTLINE_COLOR,
    TEXT_COLOR
};

