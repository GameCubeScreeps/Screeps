


const TEST_CONST = "testttttt"

for (spawnName in Game.spawns) {
    global.heap.userName = Game.spawns[spawnName].owner.username
    break;
}
const USERNAME = global.heap.userName
const SIGN_TEXT = 'What are you ? To define is to limit'
//CPU/Benchmarking 
const AVG_STEP = 5000

//Creep Roles
const ROLE_HARVESTER = 'harvester'
const ROLE_CARRIER = 'carrier'
const ROLE_FILLER = 'filler'
const ROLE_SOLDIER = 'soldier'
const ROLE_SCOUT = 'scout'
const ROLE_WORKER = 'worker'
const ROLE_REPAIRER = 'repairer'
const ROLE_HAULER = 'hauler'
const ROLE_RESERVER = 'reserver'
const ROLE_RAMPART_REPAIRER = 'rampart_repairer'
const ROLE_RESOURCE_MANAGER = 'resource_manager'


//Creep constants
const CREEP_MAX_BODYPARTS = 50; // maximum creep body length - couldn't find in API
const HAULER_REQ_CARRY_PARTS = 6;

//Creeps tasks
const TASK_UPGRADE = 'upgrade'
const TASK_BUILD = 'build'
const TASK_COLLECT = 'collect'
const TASK_FILL_UPGRADERS_CONTAIER = 'fill_upgraders_container'
const TASK_FILL_EXTENSIONS = 'fill_extensions'
const TASK_FILL_SPAWN = 'fill_spawn'
const TASK_REPAIR_RAMPARTS = 'repair_ramparts'
const TASK_FILL_TERMINAL_ENERGY = 'fill_terminal_energy'
const TASK_FILL_STORAGE_ENERGY = 'fill_storage_energy'
const TASK_FILL_LINK = 'fill_link'
const TASK_TAKE_FROM_LINK = 'take_from_link'
const TASK_XGH2O_TRANSFER = "xgh20_transfer"


//Economy const
const BALANCER_STEP = 1// value by which workers and carriers change value of balancer
const BALANCER_WORKER_STEP = 3
const BALANCER_CARRIER_STEP = 1
const BALANCER_DECAY = 10 // natural decay towards 0 of balancer
const BALANCER_HARVEST_LIMIT = 1000.0 // harvesting limit of balancer - if that would go too high then it would take a lot of time to switch to using energy
const BALANCER_USE_LIMIT = 1000 // carrying balancer of balancer
const UPGRADE_FACTOR = 10000
const STORAGE_BALANCER_START = 50000
const ENERGY_BALANCER_UPGRADER_START = 50
const ENERGY_BALANCER_WORKER_SPAWN = 750
const HARVESTING_BODYPARTS_FRACTION = 0.7 // percentage of body parts that we destinate to gather (harvest and carry) energy
const CONTROLLER_DOWNGRADE_BOTTOM_LIMIT = 0.3 // below that percentage of downgrade workers will ignore construction sites
const CONTROLLER_DOWNGRADE_TOP_LIMIT = 0.8
const STORAGE_ENERGY_UPGRADE_LIMIT = 5000 // below that amount workers wouldn't take energy from storage
const RAMPART_HITS_BOTTOM_LIMIT = 5000
const TOWER_BOTTOM_LIMIT = 0.4
const TOWER_UP_LIMIT = 0.8
const RAMPART_DECAY_LIMIT = 40
const TERMINAL_BOTTOM_ENERGY = 30000
const TERMINAL_TOP_ENERGY = 35000
const TERMINAL_FREE_BUFFOR = 10000
const TERMINAL_FASTRCL_FREE_BUFFOR = 1000
const STORAGE_TO_TERMINAL_ENERGY = 40000
const STORAGE_FASTRCL_BOTTOM_ENERGY = 5000
const LINK_BOTTOM_ENERGY = LINK_CAPACITY * (7 / 8)

// Room Visualization
const OUTLINE_COLOR = 'black'
const TEXT_COLOR = '#fc03b6'
const FILL_COLOR = 'grey'

// Room Layout Variations
const SRC_1 = 'src_1'
const SRC_2 = 'src_2'
const SRC_1_2 = 'src_1_2'
const SRC_1_CONTROLLER = 'src_1_controller'
const SRC_2_CONTROLLER = 'src_2_controller'
const SRC_1_2_CONTROLLER = 'src_1_2_controller'
const CONTROLLER = 'controller'
const CURRENT_SPAWNPOS = 'spawn_position'
const LAYOUT = {
    SRC_1: 'src_1',
    SRC_2: 'src_2',
    SRC_1_2: 'src_1_2',
    SRC_1_CONTROLLER: 'src_1_controller',
    SRC_2_CONTROLLER: 'src_2_controller',
    SRC_1_2_CONTROLLER: 'src_1_2_controller',
}
const BUILD_TIME_STEP = 2


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
    ROLE_RESERVER,
    ROLE_RAMPART_REPAIRER,
    ROLE_RESOURCE_MANAGER,

    CREEP_MAX_BODYPARTS,
    HAULER_REQ_CARRY_PARTS,
    TASK_UPGRADE,
    TASK_BUILD,
    TASK_COLLECT,
    TASK_FILL_UPGRADERS_CONTAIER,
    TASK_FILL_EXTENSIONS,
    TASK_FILL_SPAWN,
    TASK_REPAIR_RAMPARTS,
    TASK_FILL_TERMINAL_ENERGY,
    TASK_FILL_LINK,
    TASK_TAKE_FROM_LINK,
    TASK_XGH2O_TRANSFER,


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
    CONTROLLER_DOWNGRADE_BOTTOM_LIMIT,
    CONTROLLER_DOWNGRADE_TOP_LIMIT,
    STORAGE_ENERGY_UPGRADE_LIMIT,
    RAMPART_HITS_BOTTOM_LIMIT,
    TOWER_BOTTOM_LIMIT,
    TOWER_UP_LIMIT,
    RAMPART_DECAY_LIMIT,
    TERMINAL_BOTTOM_ENERGY,
    TERMINAL_TOP_ENERGY,
    TERMINAL_FREE_BUFFOR,
    TERMINAL_FASTRCL_FREE_BUFFOR,
    STORAGE_TO_TERMINAL_ENERGY,
    STORAGE_FASTRCL_BOTTOM_ENERGY,
    LINK_BOTTOM_ENERGY,

    OUTLINE_COLOR,
    TEXT_COLOR,
    FILL_COLOR,

    SRC_1,
    SRC_2,
    SRC_1_2,
    CONTROLLER,
    SRC_1_CONTROLLER,
    SRC_2_CONTROLLER,
    SRC_1_2_CONTROLLER,
    CURRENT_SPAWNPOS,
    LAYOUT,

    BUILD_TIME_STEP
};

