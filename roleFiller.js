

Creep.prototype.roleFiller = function (spawn) {

    var spawnPos=Game.rooms[this.memory.homeRoom].memory.spawnPos
    //console.log("spawnPos: ",spawnPos)
    //console.log("Game.rooms[this.memory.homeRoom].memory.spawnPos: ",Game.rooms[this.memory.homeRoom].memory.spawnPos)
    if(spawnPos==undefined)
    {
        return -1;
    }
    
    //this.say("F");
    if (this.memory.workingPos == undefined) {
        var atFirstPos = this.room.lookAt(spawnPos.x + 1, spawnPos.y - 1);
        if (atFirstPos.length == 0 ||
            (atFirstPos.length > 0 && atFirstPos[0].type != 'creep')
            || (this.pos.x == spawnPos.x + 1 && this.pos.y == spawnPos.y - 1)) {
            this.memory.workingPos = new RoomPosition(spawnPos.x + 1, spawnPos.y - 1, this.room.name);

        }
        else {
            ////this.say(2);
            var atSecondPos = this.room.lookAt(spawnPos.x + 1, spawnPos.y - 3);
            if (atSecondPos.length == 0 ||
                (atSecondPos.length > 0 && atSecondPos[0].type != 'creep')
                || (this.pos.x == spawnPos.x + 1 && this.pos.y == spawnPos.y - 3)) {
                this.memory.workingPos = new RoomPosition(spawnPos.x + 1, spawnPos.y - 3, this.room.name);

            }
            else {
                //this.say(3);
                var atThirdPos = this.room.lookAt(spawnPos.x - 1, spawnPos.y - 1);
                if (atThirdPos.length == 0 ||
                    (atThirdPos.length > 0 && atThirdPos[0].type != 'creep')
                    || (this.pos.x == spawnPos.x - 1 && this.pos.y == spawnPos.y - 1)) {
                    this.memory.workingPos = new RoomPosition(spawnPos.x - 1, spawnPos.y - 1, this.room.name);

                }
                else {
                    var atFourthPos = this.room.lookAt(spawnPos.x - 1, spawnPos.y - 3);
                    if (atFourthPos.length == 0 ||
                        (atFourthPos.length > 0 && atFourthPos[0].type != 'creep')
                        || (this.pos.x == spawnPos.x - 1 && this.pos.y == spawnPos.y - 3)) {
                        this.memory.workingPos = new RoomPosition(spawnPos.x - 1, spawnPos.y - 3, this.room.name);

                    }
                }
            }
        }

    }
    if (this.memory.workingPos != undefined && (this.pos.x != this.memory.workingPos.x || this.pos.y != this.memory.workingPos.y)) {

        //this.say("moving");
        var atPos = this.room.lookForAt(LOOK_CREEPS, this.memory.workingPos.x, this.memory.workingPos.y, this.room.name);
        this.memory.atPos = atPos;
        if (atPos.length > 0 && atPos[0].id != this.id) {
            this.memory.workingPos = undefined;
        }
        else {
            //this.say("Free");
            this.memory.atPos = undefined;
            this.moveTo(new RoomPosition(this.memory.workingPos.x, this.memory.workingPos.y, this.room.name), { range: 0 });
        }

    }
    if ((this.memory.workingPos != undefined) && this.memory.workingPos.x == this.pos.x && this.memory.workingPos.y == this.pos.y) {
        //this.say('at pos');
        this.memory.isWorking = true;
        if ((this.memory.myContainer != undefined && Game.getObjectById(this.memory.myContainer) == null)
            || (Game.getObjectById(this.memory.myContainer) != null && Game.getObjectById(this.memory.myContainer).store[RESOURCE_ENERGY] == 0)) {
            this.memory.myContainer = undefined;
            //this.say("clearing");
        }

        if (this.memory.myContainer == undefined) {
            if (this.room.memory.fillerLinkId != undefined && Game.getObjectById(this.room.memory.fillerLinkId) != null
                && Game.getObjectById(this.room.memory.fillerLinkId).store[RESOURCE_ENERGY] > 0) {
                this.memory.myContainer = this.room.memory.fillerLinkId;
            }
            else {
                var container = this.pos.findInRange(FIND_STRUCTURES, 2, {
                    filter: function (structure) {
                        return structure.structureType == STRUCTURE_CONTAINER;
                    }
                });
                if (container.length > 0) {
                    this.memory.myContainer = container[0].id;
                    if (Game.rooms[this.memory.homeRoom].memory.fillerContainers == undefined) {
                        Game.rooms[this.memory.homeRoom].memory.fillerContainers = [];
                    }
                    else {
                        if (!Game.rooms[this.memory.homeRoom].memory.fillerContainers.includes(container[0].id)) {
                            Game.rooms[this.memory.homeRoom].memory.fillerContainers.push(container[0].id)
                        }
                    }
                }
            }

        }

        if(this.memory.myContainer!=undefined && Game.getObjectById(this.memory.myContainer)!=null && Game.getObjectById(this.memory.myContainer).structureType==STRUCTURE_CONTAINER)
        {
            if(this.room.memory.fillerLinkId!=undefined && Game.getObjectById(this.room.memory.fillerLinkId)!=null && Game.getObjectById(this.room.memory.fillerLinkId).store[RESOURCE_ENERGY]>0)
            {
                this.memory.myContainer=this.room.memory.fillerLinkId;
                //this.say("C -> L")
            }
        }



        if (this.memory.myContainer != undefined) {
            if (this.memory.toFill == undefined) {
                var toFill = this.pos.findInRange(FIND_STRUCTURES, 1.7, {
                    filter: function (structure) {
                        return structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN;
                    }
                });
                if (toFill.length > 0) {
                    this.memory.toFill = [];
                    for (let i = 0; i < toFill.length; i++) {
                        this.memory.toFill.push(toFill[i].id);
                    }

                }
            }
            if (this.memory.toFill != undefined) {
                ////this.say("WITH");
                if (this.store[RESOURCE_ENERGY] == 0) {
                    ////this.say("with2")
                    if (Game.getObjectById(this.memory.myContainer) != null && Game.getObjectById(this.memory.myContainer).store[RESOURCE_ENERGY] > 0) {
                        ////this.say("with3");
                        this.withdraw(Game.getObjectById(this.memory.myContainer), RESOURCE_ENERGY);
                    }
                    else {
                        ////this.say("with4");
                        ////this.say(Game.getObjectById(Game.rooms[this.memory.homeRoom].memory.filler_link).store[RESOURCE_ENERGY>0 )
                        this.withdraw(Game.getObjectById(this.memory.myContainer), RESOURCE_ENERGY);
                    }
                }
                else {
                    var allFull = true;
                    for (let i = 0; i < this.memory.toFill.length; i++) {
                        var result = this.transfer(Game.getObjectById(this.memory.toFill[i]), RESOURCE_ENERGY);
                        //if (Game.getObjectById(this.memory.toFill[i]).store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                        //    var result=this.transfer(Game.getObjectById(this.memory.toFill[i]), RESOURCE_ENERGY);
                        if (result == OK) { allFull = false; }
                        if (result == OK && this.store[RESOURCE_ENERGY] == 0) { break; }

                        //}

                    }
                    //this.say(allFull)
                    var isContainerFull=true;
                    if (allFull && (Game.getObjectById(this.memory.myContainer) != null && Game.getObjectById(this.memory.myContainer).structureType == STRUCTURE_LINK)
                        && Game.rooms[this.memory.homeRoom].memory.fillerContainers != undefined && Game.rooms[this.memory.homeRoom].memory.fillerContainers.length > 0) {
                        //this.say("cnt")
                        for (let i = 0; i < Game.rooms[this.memory.homeRoom].memory.fillerContainers.length; i++) {
                            var result = this.transfer(Game.getObjectById(Game.rooms[this.memory.homeRoom].memory.fillerContainers[i]), RESOURCE_ENERGY)
                            if (result == OK) { isContainerFull=false;break; }
                        }
                    }
                    if(isContainerFull && allFull)
                    {
                        var spawn=Game.getObjectById(this.memory.spawnId)
                        if(spawn==null){return -1;}
                        if(spawn.spawning!=null && spawn.spawning.remainingTime!=spawn.spawning.needTime)
                        {
                            this.sleep(spawn.spawning.remainingTime/2)
                        }
                        else{
                            this.sleep(5)
                        }
                        
                    }
                }
            }

        }
    }

}