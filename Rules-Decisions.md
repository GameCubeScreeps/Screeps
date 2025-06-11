Rules/Decisions/Mechanism descriptions:

**1. Mechanisms:**
  **1.1.** We use **RoomManager** who runs driver on **roomName** (insainmonkey69 has it implemented)  
  **1.2.** For spawning use **queues** of different priority (insainmonkey69 has it implemented)
  **1.3.** **Creeps** are based on **roles** - they can have tasks in range of their role but right now not using general workers with task queue
  **1.4.** **BaseLayout**:
    **1.4.1.** If room can fit Alphonzo **bunker** we can use bunker (information about room type should be stored in Memory)
    **1.4.2.** If room can't fit **bunker**, then use JeallyRabbit **dynamic stamps** (information about room type should be stored in Memory)
   ** 1.4.3.** When plannig **baseLayout** it seems to be a good idea to save some positions of the structures so later when looking for them (in **RoomManager**) we can use **lookForAt()**

**2.**Memory approach:
**2.1.** If data is needed in the same tick as it is calculated then store it in **global.heap**, else in standard **Memory** 
**2.2.** When **calculating/find()/lookFor()/lookForAt/etc** data, it should be done at highest level (e.g. if we are using **find()** to find **hostileCreeps** for our offensive code which will be used by multiple creeps then we do not call the function on the Creep level, use some kind of **RoomManager**)
**2.3.** We need to assure that whatever piece of Memory or Heap is some part of the bot using it is able not to crash if that data gets wiped, e.g. we can remove whole **Memory** object and call **Game.cpu.halt()** (clearing heap) and not crash bot, it should be able to retrevie data in few ticks

**3.Code Writing Rules**:
**3.1** Except player names - no hardcoded values, everything should be calculated if possible (e.g when calculating profit per tick from source do not call it **10**, use **SOURCE_ENERGY_CAPACITY/ENERGY_REGEN_TIME**)
**3.2** All new constants should be added/stored in separate file **constants.js**
**3.3** Code notation - I would like to propose **camelCase**
