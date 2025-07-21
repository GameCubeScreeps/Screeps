//defining global heap
var heap = {}
global.heap = heap;


// Every constant definied in separate file
const C = require('constants')



//Profiler to check what CPU usage is
const profiler = require('screeps-profiler');
const createRoomQueues = require('createRoomQueues')
const spawnFromQueues = require('spawnFromQueues')
const roomManager = require('roomManager')
const creepsManager = require('creepsManager')
const visualize = require('visualize');
const { USERNAME } = require('./constants');


// This line monkey patches the global prototypes.
profiler.enable();
module.exports.loop = function () {
  profiler.wrap(function () {


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
    global.heap.isSomeRoomPlanning=false;

    for (roomName in Game.rooms) {

      

      if (global.heap.rooms[roomName] == undefined) {
        global.heap.rooms[roomName] = {}
        console.log("Setting heap for ",roomName)
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

    console.log(C.USERNAME)

    for (mainRoom of Memory.mainRooms) {

      console.log("--------------- ", mainRoom, "---------------")
      
      var start=Game.cpu.getUsed()

      Game.rooms[mainRoom].creepsManager()

      Game.rooms[mainRoom].createRoomQueues()

      Game.rooms[mainRoom].spawnFromQueues()

      Game.rooms[mainRoom].visualize()

      global.heap.rooms[mainRoom].usedCpu=Game.cpu.getUsed()-start
      if(global.heap.rooms[mainRoom].cpuSum==undefined || global.heap.rooms[mainRoom].avgCounter>C.AVG_STEP)
      {
        global.heap.rooms[mainRoom].cpuSum=global.heap.rooms[mainRoom].usedCpu
        global.heap.rooms[mainRoom].avgCounter=1;
      }
      else
      {
        global.heap.rooms[mainRoom].cpuSum+=global.heap.rooms[mainRoom].usedCpu
        global.heap.rooms[mainRoom].avgCounter++;
        global.heap.rooms[mainRoom].avgCpu=global.heap.rooms[mainRoom].cpuSum/global.heap.rooms[mainRoom].avgCounter
        
      }

      console.log("Used cpu: ",Game.cpu.getUsed()-start)  
      
    }

  });
}
