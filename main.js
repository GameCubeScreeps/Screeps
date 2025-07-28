//defining global heap
var heap = {}
global.heap = heap;


// Every constant definied in separate file
const C = require('constants')



//Profiler to check what CPU usage is
const profiler = require('screeps-profiler');
const createRoomQueues = require('createRoomQueues')
const spawnManager = require('spawnManager')
const roomManager = require('roomManager')
const creepsManager = require('creepsManager')
const visualize = require('visualize');
const { USERNAME } = require('./constants');


// This line monkey patches the global prototypes.
profiler.enable();
module.exports.loop = function () {
  profiler.wrap(function () {

    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")



    

    //Setting allies
    Memory.allies = ["JeallyRabbit", "Alphonzo", "insainmonkey", "Trepidimous"]

    //Setting enemies
    Memory.enemies = ["IronVengeance"]
    //Defining global.heap.rooms which is supposed to have identical structure as Memory.rooms but is available always on the same tick and is not using Memory limit
    //Heap size limit is much higher than Memory size limit - as mentioned somewhere on discord it is notable achivement to reach Heap size limit
    if (global.heap.rooms == undefined) {
      global.heap.rooms = []
      console.log("setting global heap")
    }

    

    //automatic colonizing
    if (Memory.roomsToColonize == undefined || true) {
      Memory.roomsToColonize = []
    }

    //Manual colonizing
    if (Memory.manualColonize == undefined) {
      Memory.manualColonize = '??'
    }

    if (!Memory.roomsToColonize.some(e => e.name === Memory.manualColonize) && Memory.manualColonize != '??') {
      Memory.roomsToColonize.push({ name: Memory.manualColonize })
      global.heap.rooms[Memory.manualColonize] = {}

    }


    console.log("Memory.roomsToColonize: ", Memory.roomsToColonize)
    for (colonizeRoom of Memory.roomsToColonize) {
      if (global.heap.rooms[colonizeRoom.name] == undefined) {
        global.heap.rooms[colonizeRoom.name] = {}
      }

      global.heap.rooms[colonizeRoom.name].claimer = undefined
      global.heap.rooms[colonizeRoom.name].colonizers = []
      global.heap.rooms[colonizeRoom.name].maxColonizers = C.DEFAULT_COLONIZERS_AMOUNT // as we get vision on that room it will be definied in next step


      if (Game.rooms[colonizeRoom.name] != undefined && Game.rooms[colonizeRoom.name].controller.level <= 2 && Game.rooms[colonizeRoom.name].memory.spawnId == undefined) {//Room is being colonized

        global.heap.rooms[colonizeRoom.name].maxColonizers = 0;
        global.heap.rooms[colonizeRoom.name].colonizeSources = Game.rooms[colonizeRoom.name].find(FIND_SOURCES)
        for (s of global.heap.rooms[colonizeRoom.name].colonizeSources) {
          s.maxHarvesters = s.pos.getOpenPositions().length;
          global.heap.rooms[colonizeRoom.name].maxColonizers += s.maxHarvesters;
          s.harvesters = [];
        }

        if (Game.rooms[colonizeRoom.name].memory.buildingList != undefined && Game.rooms[colonizeRoom.name].memory.buildingList.length > 0) {
          for (building of Game.rooms[colonizeRoom.name].memory.buildingList) {
            if (building.structureType == STRUCTURE_SPAWN) {
              Game.rooms[colonizeRoom.name].createConstructionSite(building.x, building.y, building.structureType, colonizeRoom.name + '_1')
              break;
            }
          }
        }
      }

    }


    Memory.mainRooms = []
    global.heap.isSomeRoomPlanning = false;


    for (roomName in Game.rooms) {



      if (global.heap.rooms[roomName] == undefined) {
        global.heap.rooms[roomName] = {}
        console.log("Setting heap for ", roomName)
      }

      if (Game.rooms[roomName].controller != undefined && Game.rooms[roomName].controller.my) {
        Memory.mainRooms.push(roomName)
      }

      Game.rooms[roomName].roomManager()

    }

    //Getting current userName - dumb first iteration over spawns//
    for (spawnName in Game.spawns) {
      global.heap.userName = Game.spawns[spawnName].owner.username
      break;
    }




    //chosing colonizer
    if (Memory.roomsToColonize.length > 0) {
      for (r of Memory.roomsToColonize) {
        if (r.colonizer == undefined) {
          minDistance = Infinity
          for (m of Memory.mainRooms) {
            if (Game.map.getRoomLinearDistance(m, r.name) < minDistance
              && Game.rooms[m].storage != undefined && Game.rooms[m].storage[RESOURCE_ENERGY] > C.COLONIZE_ENERGY_LIMIT
              && r.name != m) {
              minDistance = Game.map.getRoomLinearDistance(m, r.name)
              r.colonizer = m;
            }
          }
        }
      }
    }

    console.log(C.USERNAME)




    for (mainRoom of Memory.mainRooms) {

      console.log("--------------- ", mainRoom, "---------------")

      var start = Game.cpu.getUsed()

      Game.rooms[mainRoom].creepsManager()

      Game.rooms[mainRoom].createRoomQueues()

      Game.rooms[mainRoom].spawnManager()

      Game.rooms[mainRoom].visualize()

      global.heap.rooms[mainRoom].usedCpu = Game.cpu.getUsed() - start
      if (global.heap.rooms[mainRoom].cpuSum == undefined || global.heap.rooms[mainRoom].avgCounter > C.AVG_STEP) {
        global.heap.rooms[mainRoom].cpuSum = global.heap.rooms[mainRoom].usedCpu
        global.heap.rooms[mainRoom].avgCounter = 1;
      }
      else {
        global.heap.rooms[mainRoom].cpuSum += global.heap.rooms[mainRoom].usedCpu
        global.heap.rooms[mainRoom].avgCounter++;
        global.heap.rooms[mainRoom].avgCpu = global.heap.rooms[mainRoom].cpuSum / global.heap.rooms[mainRoom].avgCounter

      }

      console.log("Used cpu: ", Game.cpu.getUsed() - start)

    }


  });


}
