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

    //Manual colonizing
    if (Memory.manualColonize == undefined) {
      Memory.manualColonize = '??'
    }


    //automatic colonizing
    if (Memory.roomsToColonize == undefined || true) {
      Memory.roomsToColonize = []
    }

    //Setting allies
    Memory.allies = ["JeallyRabbi", "Alphonzo", "insainmonkey", "Trepidimous"]

    //Setting enemies
    Memory.enemies = ["IronVengeance"]
    //Defining global.heap.rooms which is supposed to have identical structure as Memory.rooms but is available always on the same tick and is not using Memory limit
    //Heap size limit is much higher than Memory size limit - as mentioned somewhere on discord it is notable achivement to reach Heap size limit
    if (global.heap.rooms == undefined) {
      global.heap.rooms = []
      console.log("setting global heap")
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

    //Getting current userName - dump first iteration over spawns//
    for (spawnName in Game.spawns) {
      global.heap.userName = Game.spawns[spawnName].owner.username
      break;
    }


    if (!Memory.roomsToColonize.some(e => e.name === Memory.manualColonize) && Memory.manualColonize != '??') {
      Memory.roomsToColonize.push({ name: Memory.manualColonize })
      global.heap.rooms[Memory.manualColonize] = {}

    }

    if (Memory.roomsToColonize.length > 0) {
      for (r of Memory.roomsToColonize) {
        if (r.colonizer == undefined) {
          minDistance = Infinity
          for (m of Memory.mainRooms) {
            if (Game.map.getRoomLinearDistance(m, r.name) < minDistance) {
              minDistance = Game.map.getRoomLinearDistance(m, r.name)
              r.colonizer = m;
            }
          }
        }
      }
    }

    console.log(C.USERNAME)

    for (colonizeRoom of Memory.roomsToColonize) {
      console.log("Setting heap for (colonization): ", colonizeRoom.name)
      global.heap.rooms[colonizeRoom.name] = {}
      global.heap.rooms[colonizeRoom.name].claimer = undefined
      global.heap.rooms[colonizeRoom.name].colonizers = []
      global.heap.rooms[colonizeRoom.name].maxColonizers = C.DEFAULT_COLONIZERS_AMOUNT // as we get vision on that room it will be definied in roomManager
    }


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
