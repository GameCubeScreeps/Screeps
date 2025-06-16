//defining global heap
const heap = {}
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


// This line monkey patches the global prototypes.
profiler.enable();
module.exports.loop = function () {
  profiler.wrap(function () {


    //Setting allies
    Memory.allies = ["JeallyRabbi", "Alphonzo", "insainmonkey", "Trepidimous"]

    //Setting enemies
    Memory.allies = ["IronVengeance"]
    //Defining global.heap.rooms which is supposed to have identical structure as Memory.rooms but is available always on the same tick and is not using Memory limit
    //Heap size limit is much higher than Memory size limit - as mentioned somewhere on discord it is notable achivement to reach Heap size limit
    if (global.heap.rooms == undefined) {
      global.heap.rooms = []
      console.log("setting global heap")
    }

    Memory.mainRooms = []

    for (roomName in Game.rooms) {

      console.log("--------------- ", roomName, "---------------")

      if (global.heap.rooms[roomName] == undefined) {
        global.heap.rooms[roomName] = {}
        console.log("Setting heap for ",roomName)
      }

      if (Game.rooms[roomName].controller != undefined && Game.rooms[roomName].controller.my) {
        Memory.mainRooms.push(roomName)
      }

      //Find hostile and friendly creeps and structures
      Game.rooms[roomName].roomManager()

    }

    //Getting current userName - dump first iteration over spawns//
    for (spawnName in Game.spawns) {
      global.heap.userName = Game.spawns[spawnName].owner.username
      break;
    }



    for (mainRoom of Memory.mainRooms) {



      Game.rooms[mainRoom].creepsManager()

      Game.rooms[mainRoom].createRoomQueues()

      Game.rooms[mainRoom].spawnFromQueues()

      Game.rooms[mainRoom].visualize()
    }

  });
}
