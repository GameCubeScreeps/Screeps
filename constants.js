


const TEST_CONST = "testttttt"

for (spawnName in Game.spawns) {
    global.heap.userName = Game.spawns[spawnName].owner.username
    break;
}
const USERNAME = global.heap.userName

//CPU/Benchmarking 
const AVG_STEP=15000

//Creep Roles
const ROLE_HARVESTER = 'harvester'
const ROLE_CARRIER = 'carrier'
const ROLE_FILLER = 'filler'
const ROLE_SOLDIER = 'soldier'
const ROLE_SCOUT = 'scout'
const ROLE_WORKER = 'worker'
const ROLE_REPAIRER = 'repairer'
const ROLE_HAULER = 'hauler'


//Creep constants
const CREEP_MAX_BODYPARTS = 50; // maximum creep body length - couldn't find in API
const HAULER_REQ_CARRY_PARTS=3;

//Creeps tasks
const TASK_UPGRADE = 'upgrade'
const TASK_BUILD = 'build'
const TASK_COLLECT = 'collect'
const TASK_FILL_UPGRADERS_CONTAIER='fill_upgraders_container'
const TASK_FILL_EXTENSIONS='fill_extensions'
const TASK_FILL_SPAWN='fill_spawn'


//Economy const
const BALANCER_STEP = 0.01 // value by which workers and carriers change value of balancer
const BALANCER_WORKER_STEP=0.03
const BALANCER_CARRIER_STEP = 0.01
const BALANCER_DECAY = 0.005 // natural decay towards 0 of balancer
const BALANCER_HARVEST_LIMIT = -2.0 // harvesting limit of balancer - if that would go too high then it would take a lot of time to switch to using energy
const BALANCER_USE_LIMIT = 2.0 // carrying balancer of balancer
const UPGRADE_FACTOR = 10000
const STORAGE_BALANCER_START = 50000
const ENERGY_BALANCER_UPGRADER_START = 0.5
const ENERGY_BALANCER_WORKER_SPAWN=1.5
const HARVESTING_BODYPARTS_FRACTION = 0.8 // percentage of body parts that we destinate to gather (harvest and carry) energy
const CONTROLLER_DOWNGRADE_LIMIT = 0.5 // below that percentage of downgrade workers will ignore construction sites
const STORAGE_ENERGY_UPGRADE_LIMIT = 5000 // below that amount workers wouldn't take energy from storage
const RAMPART_HITS_BOTTOM_LIMIT=5000

// Room Visualization
const OUTLINE_COLOR = 'black'
const TEXT_COLOR = '#fc03b6'

// Room Layout Variations
const SRC_1 = 'src_1'
const SRC_2 = 'src_2'
const SRC_1_2 = 'src_1_2'
const SRC_1_CONTROLLER = 'src_1_controller'
const SRC_2_CONTROLLER = 'src_2_controller'
const SRC_1_2_CONTROLLER = 'src_1_2_controller'
const CONTROLLER = 'controller'
const LAYOUT = {
    SRC_1: 'src_1',
    SRC_2: 'src_2',
    SRC_1_2: 'src_1_2',
    SRC_1_CONTROLLER: 'src_1_controller',
    SRC_2_CONTROLLER: 'src_2_controller',
    SRC_1_2_CONTROLLER: 'src_1_2_controller',
}
const BUILD_TIME_STEP = 2000


module.exports = {
    TEST_CONST,
    AVG_STEP,
    USERNAME,
    ROLE_HARVESTER,
    ROLE_CARRIER,
    ROLE_FILLER,
    ROLE_SOLDIER,
    ROLE_SCOUT,
    ROLE_WORKER,
    ROLE_REPAIRER,
    ROLE_HAULER,

    CREEP_MAX_BODYPARTS,
    HAULER_REQ_CARRY_PARTS,
    TASK_UPGRADE,
    TASK_BUILD,
    TASK_COLLECT,
    TASK_FILL_UPGRADERS_CONTAIER,
    TASK_FILL_EXTENSIONS,
    TASK_FILL_SPAWN,

    BALANCER_STEP,
    BALANCER_WORKER_STEP,
    BALANCER_CARRIER_STEP,

    BALANCER_DECAY,
    BALANCER_HARVEST_LIMIT,
    BALANCER_USE_LIMIT,
    UPGRADE_FACTOR,
    STORAGE_BALANCER_START,
    ENERGY_BALANCER_UPGRADER_START,
    ENERGY_BALANCER_WORKER_SPAWN,
    HARVESTING_BODYPARTS_FRACTION,
    CONTROLLER_DOWNGRADE_LIMIT,
    STORAGE_ENERGY_UPGRADE_LIMIT,
    RAMPART_HITS_BOTTOM_LIMIT,

    OUTLINE_COLOR,
    TEXT_COLOR,
    SRC_1,
    SRC_2,
    SRC_1_2,
    CONTROLLER,
    SRC_1_CONTROLLER,
    SRC_2_CONTROLLER,
    SRC_1_2_CONTROLLER,
    LAYOUT,

    BUILD_TIME_STEP
};

