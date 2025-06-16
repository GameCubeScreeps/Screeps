


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
const ROLE_WORKER='worker'

//Creep constants
const CREEP_MAX_BODYPARTS=50; // maximum creep body length - couldn't find in API

//Creeps tasks
const TASK_UPGRADE='upgrade'
const TASK_BUILD='build'
const TASK_COLLECT='collect'

//Economy const
const BALANCER_STEP=0.01 // value by which workers and carriers change value of balancer
const BALANCER_DECAY=0.001 // natural decay towards 0 of balancer
const BALANCER_HARVEST_LIMIT=2.0 // harvesting limit of balancer - if that would go too high then it would take a lot of time to switch to using energy
const BALANCER_USE_LIMIT=-2.0 // carrying balancer of balancer
const UPGRADE_FACTOR=10000
const STORAGE_BALANCER_START=50000
const ENERGY_BALANCER_UPGRADER_START=0.5
const HARVESTING_BODYPARTS_FRACTION=0.8 // percentage of body parts that we destinate to gather (harvest and carry) energy
const CONTROLLER_DOWNGRADE_LIMIT=0.5 // below that percentage of downgrade workers will ignore construction sites
const STORAGE_ENERGY_UPGRADE_LIMIT=5000 // below that amount workers wouldn't take energy from storage


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
    ROLE_WORKER,
    CREEP_MAX_BODYPARTS,
    TASK_UPGRADE,
    TASK_BUILD,
    TASK_COLLECT,
    BALANCER_STEP,
    BALANCER_DECAY,
    BALANCER_HARVEST_LIMIT,
    BALANCER_USE_LIMIT,
    UPGRADE_FACTOR,
    STORAGE_BALANCER_START,
    ENERGY_BALANCER_UPGRADER_START,
    HARVESTING_BODYPARTS_FRACTION,
    CONTROLLER_DOWNGRADE_LIMIT,
    STORAGE_ENERGY_UPGRADE_LIMIT,
    OUTLINE_COLOR,
    TEXT_COLOR
};

