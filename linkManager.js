Room.prototype.linkManager = function linkManager() {

    // /** @param {Game} game **/
    //tick: function (spawn) {

    if (this.storage == undefined) {
        return;
    }
    var roomName=this.name
    // FIND managerLink
    if (this.memory.managerLinkId != undefined && Game.getObjectById(this.memory.managerLinkId) == null) {
        this.memory.managerLinkId == undefined;
    }
    if (this.memory.managerLinkId == undefined && this.memory.managerLinkPos != undefined) {
        
        var managerLink = this.find(FIND_STRUCTURES, {
            filter: function (str) {
                return str.structureType == STRUCTURE_LINK && str.pos.x == Game.rooms[roomName].memory.managerLinkPos.x && str.pos.y == Game.rooms[roomName].memory.managerLinkPos.y;
            }
        });
        if (managerLink != undefined && managerLink.length > 0) {
            this.memory.managerLinkId = managerLink[0].id;
        }
    }

    // FIND FILLER LINK
    if (this.memory.fillerLinkId != undefined && Game.getObjectById(this.memory.fillerLinkId) == null) {
        this.memory.fillerLinkId == undefined;
    }
    if (this.memory.fillerLinkId == undefined && this.memory.fillerLinkPos != undefined) {
        var managerLink = this.find(FIND_STRUCTURES, {
            filter: function (str) {
                return str.structureType == STRUCTURE_LINK && str.pos.x == Game.rooms[roomName].memory.fillerLinkPos.x && str.pos.y == Game.rooms[roomName].memory.fillerLinkPos.y;
            }
        });
        if (managerLink != undefined && managerLink.length > 0) {
            this.memory.fillerLinkId = managerLink[0].id;
        }
    }

    // FIND SOURCES LINKS

    if (this.memory.sourcesLinkPos != undefined && this.memory.harvestingRooms != undefined && this.memory.harvestingRooms.length > 0) {
        if (this.memory.sourcesLinkPos.length < this.memory.harvestingRooms[0].sources_num) {
            this.memory.sourcesLinkPos = undefined
        }
        else if (this.memory.sourcesLinkPos.length > 0) {
            for (let id of this.memory.sourcesLinkPos) {
                if (Game.getObjectById(id) == null) {
                    this.memory.sourcesLinkPos = undefined
                }
            }
        }
        else {
            this.memory.sourcesLinkPos = undefined
        }

    }
    if (this.memory.sourcesLinkPos == undefined) {
        this.memory.sourcesLinkPos = [];
        if (this.memory.sourcesLinksPos != undefined && this.memory.sourcesLinksPos.length > 0) {
            var src1Link = this.find(FIND_STRUCTURES, {
                filter: function (str) {
                    return str.structureType == STRUCTURE_LINK && str.pos.x == Game.rooms[roomName].memory.sourcesLinksPos[0].x && str.pos.y == Game.rooms[roomName].memory.sourcesLinksPos[0].y;
                }
            });
            if (src1Link != undefined && src1Link.length > 0) {
                this.memory.sourcesLinkPos.push(src1Link[0].id)
            }
        }

        if (this.memory.sourcesLinksPos != undefined && this.memory.sourcesLinksPos.length > 1) {
            var src2Link = this.find(FIND_STRUCTURES, {
                filter: function (str) {
                    return str.structureType == STRUCTURE_LINK && str.pos.x == Game.rooms[roomName].memory.sourcesLinksPos[1].x && str.pos.y == Game.rooms[roomName].memory.sourcesLinksPos[1].y;
                }
            });
            if (src2Link != undefined && src2Link.length > 0) {
                this.memory.sourcesLinkPos.push(src2Link[0].id)
            }
        }
    }

    // FIND CONTROLLER LINK

    if (this.memory.controllerLinkId != undefined && Game.getObjectById(this.memory.controllerLinkId) == null) {
        this.memory.controllerLinkId == undefined;
    }
    if (this.memory.controllerLinkId == undefined && this.memory.controllerLinikPos != undefined) {
        var controllerLink = this.find(FIND_STRUCTURES, {
            filter: function (str) {
                return str.structureType == STRUCTURE_LINK && str.pos.x == Game.rooms[roomName].memory.controllerLinikPos.x && str.pos.y == Game.rooms[roomName].memory.controllerLinikPos.y;
            }
        });
        if (controllerLink != undefined && controllerLink.length > 0) {
            this.memory.controllerLinkId = controllerLink[0].id;
        }
    }



    var managerLink = Game.getObjectById(this.memory.managerLinkId)
    var fillerLink = Game.getObjectById(this.memory.fillerLinkId)

    var controllerLink = Game.getObjectById(this.memory.controllerLinkId)
    var sourcesLinks = []
    for (let link_id of this.memory.sourcesLinkPos) {
        var link = Game.getObjectById(link_id)
        if (link != null) {
            sourcesLinks.push(link)
        }
    }

    // Driver for manager link
    if (managerLink != undefined && managerLink != null && managerLink.cooldown == 0) {
        if (managerLink != null && managerLink.cooldown == 0 && managerLink.store[RESOURCE_ENERGY] >= 700) {
            var transfered = false
            //transfer to filler link
            if (fillerLink != null && fillerLink.store.getFreeCapacity([RESOURCE_ENERGY]) > 150) {
                if (managerLink.transferEnergy(fillerLink) == 0) {
                    transfered = true;
                }

            }
            if (controllerLink != null && controllerLink.store.getFreeCapacity([RESOURCE_ENERGY]) > 150 && transfered == false) {
                managerLink.transferEnergy(controllerLink)
            }
        }
    }

    // Driver for sourcesLinks
    if (sourcesLinks != undefined && sourcesLinks.length > 0) {
        for (let src_link of sourcesLinks) {
            if (src_link.cooldown == 0 && src_link.store[RESOURCE_ENERGY] > 400) {
                var transfered = false;
                if (fillerLink != null && fillerLink.store.getFreeCapacity([RESOURCE_ENERGY]) > 150) {
                    if (src_link.transferEnergy(fillerLink) == 0) {
                        transfered = true;
                    }

                }
                if (managerLink != null && managerLink.store.getFreeCapacity([RESOURCE_ENERGY]) > 150 && transfered == false) {
                    if (src_link.transferEnergy(managerLink) == 0) {
                        transfered = true
                    }
                }
                if (managerLink != null && managerLink.store.getFreeCapacity([RESOURCE_ENERGY]) > 150 && transfered == false) {
                    if (src_link.transferEnergy(managerLink) == 0) {
                        transfered = true
                    }
                }
                if (transfered == true) {
                    //addEnergyIncome(creep,spawn,amount)
                    if (this.memory.delivered_energy == undefined) {
                        this.memory.delivered_energy = src_link.store[RESOURCE_ENERGY]*0.97
                    }
                    else {
                        this.memory.delivered_energy += src_link.store[RESOURCE_ENERGY]*0.97
                    }
                }
            }
        }
    }
    //}
}//;

//module.exports = links;