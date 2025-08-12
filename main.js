//defining global heap
var heap = {}
global.heap = heap;

//clear all Memory
//RawMemory.set("{}")
// Every constant definied in separate file
const C = require('constants')



//Profiler to check what CPU usage is
const profiler = require('screeps-profiler');
const createRoomQueues = require('createRoomQueues')
const spawnManager = require('spawnManager')
const roomManager = require('roomManager')
const creepsManager = require('creepsManager')
const linkManager = require('linkManager')
const visualize = require('visualize');


// this line monkey patches the global prototypes.
profiler.enable();
module.exports.loop = function () {
  profiler.wrap(function () {

    var totalStart = Game.cpu.getUsed()

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
    if (Memory.roomsToColonize == undefined) {
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


    for (colonizeRoom of Memory.roomsToColonize) {
      if (global.heap.rooms[colonizeRoom.name] == undefined) {
        global.heap.rooms[colonizeRoom.name] = {}
      }

      global.heap.rooms[colonizeRoom.name].claimer = undefined
      global.heap.rooms[colonizeRoom.name].colonizers = []
      global.heap.rooms[colonizeRoom.name].maxColonizers = C.DEFAULT_COLONIZERS_AMOUNT // as we get vision on that room it will be definied in next step


      if (Game.rooms[colonizeRoom.name] != undefined) {//Room is being colonized

        global.heap.rooms[colonizeRoom.name].maxColonizers = 0;
        global.heap.rooms[colonizeRoom.name].colonizeSources = Game.rooms[colonizeRoom.name].find(FIND_SOURCES)
        for (s of global.heap.rooms[colonizeRoom.name].colonizeSources) {
          s.maxHarvesters = s.pos.getOpenPositions().length;
          global.heap.rooms[colonizeRoom.name].maxColonizers += s.maxHarvesters;
          s.harvesters = [];
        }

        /*
        if (Game.rooms[colonizeRoom.name].memory.buildingList != undefined && Game.rooms[colonizeRoom.name].memory.buildingList.length > 0) {
          console.log("Entering building spawn at: ", colonizeRoom.name)

          for (building of Game.rooms[colonizeRoom.name].memory.buildingList) {
            if (building.structureType == STRUCTURE_SPAWN) {

              if (Game.rooms[colonizeRoom.name].createConstructionSite(building.x, building.y, building.structureType, colonizeRoom.name + '_1') == ERR_FULL) {//reached limit of 100 construction sites
                for (c in Game.constructionSites) {
                  console.log(c)
                  if (Game.getObjectById(c).structureType == STRUCTURE_EXTENSION || Game.getObjectById(c).structureType == STRUCTURE_ROAD) { // remove any road or extension construction site
                    Game.getObjectById(c).remove()
                    break;
                  }

                }
              }
              break;
            }
          }
        }
          */
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
              && Game.rooms[m].storage != undefined && Game.rooms[m].storage.store[RESOURCE_ENERGY] > C.COLONIZE_ENERGY_LIMIT
              && r.name != m) {

              minDistance = Game.map.getRoomLinearDistance(m, r.name)
              r.colonizer = m;
            }
          }
        }
      }
    }

    console.log(C.USERNAME)
    console.log("Construction sites: ", Object.keys(Game.constructionSites).length)



    for (mainRoom of Memory.mainRooms) {

      console.log("--------------- ", mainRoom, "---------------")

      var start = Game.cpu.getUsed()




      Game.rooms[mainRoom].creepsManager()

      Game.rooms[mainRoom].createRoomQueues()

      Game.rooms[mainRoom].spawnManager()

      Game.rooms[mainRoom].linkManager()

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


    var totalUsedCpu = Math.round(Game.cpu.getUsed() - totalStart)
    for (mainRoom of Memory.mainRooms) {
      //total used cpu
      var blockPos = new RoomPosition(38, 0, mainRoom)
      var blockPosWidth = 6
      var blockPosHeight = 1
      Game.rooms[mainRoom].visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
      Game.rooms[mainRoom].visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
      Game.rooms[mainRoom].visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
      Game.rooms[mainRoom].visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
      Game.rooms[mainRoom].visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
      Game.rooms[mainRoom].visual.text("Cpu: " + totalUsedCpu + "\\" + Game.cpu.limit, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)

    }

    //Clearing Memory of a dead room
    var toDelete = undefined
    for (mainRoom of Memory.mainRooms) {

      if (!Game.rooms[mainRoom].controller.my) {
        toDelete = mainRoom
        break;
      }
    }
    if (toDelete != undefined) {
      //deleting construction sites of a dead room
      for (c in Game.constructionSites) {
        console.log(c)
        if (Game.getObjectById(c).room.name == toDelete || Game.rooms[toDelete].memory.harvestingRooms.find((r) => r.name == toDelete)) { // remove any road or extension construction site
          Game.getObjectById(c).remove()
        }

      }

      Memory.rooms[toDelete] = {}
      global.heap.rooms[toDelete] = {}
      var index = Memory.mainRoom.find((r) => r == toDelete);
      if (index != undefined) {
        Memory.roomsToColonize.splice(index, 1);
      }
    }


    //remocing dead construction sites
    if (Game.time % 1234 == 0) {
      for (c in Game.constructionSites) {
        //console.log(c)
        var inAnyHarvestingRoom = false
        for (m of Memory.mainRooms) {
          if (Game.getObjectById(c).room!=undefined && Game.getObjectById(c).room.name == m) {
            inAnyHarvestingRoom = true
            break
          }
          else {
            for (h of Memory.rooms[m].harvestingRooms) {
              if (Game.getObjectById(c).room!=undefined && h.name == Game.getObjectById(c).room.name) {
                inAnyHarvestingRoom = true
                break
              }
            }
          }
        }
        if (inAnyHarvestingRoom == false) {
          Game.getObjectById(c).remove()
        }

      }
    }


  });


}
