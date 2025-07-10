const C = require('constants');

Creep.prototype.roleReserver = function roleReserver() {

    for(r of Game.rooms[this.memory.homeRoom].memory.harvestingRooms)
    {
        if(r.name==this.memory.targetRoom)
        {
            r.reserverId=this.id
            break;
        }
    }
    

    if (this.memory.targetRoom) {
        if (this.room.name == this.memory.targetRoom && this.memory.targetRoom != this.memory.homeRoom) {// if in target room - go claim 

            if (this.room.controller) {
                if ((this.room.controller.reservation != undefined && this.room.controller.reservation.username != undefined
                    && this.room.controller.reservation.username == C.USERNAME && this.room.controller.reservation.ticksToEnd < 4990)
                    || this.room.controller.reservation == undefined) {
                    var signText = C.SIGN_TEXT

                    if (this.room.controller.text != signText) {
                        this.signController(this.room.controller, signText)
                    }
                    if (this.reserveController(this.room.controller) == ERR_NOT_IN_RANGE) {
                        this.moveTo(this.room.controller, { reusePath: 11, range: 1 });
                    }
                }
                else {
                    if (!this.pos.isNearTo(this.room.controller.pos)) {
                        this.moveTo(this.room.controller, { reusePath: 15, maxRooms: 1 })
                    }
                    else  {


                        if (this.reserveController(this.room.controller) == ERR_INVALID_TARGET) {
                            this.attackController(this.room.controller)
                        }
                    }

                    if (this.room.controller.reservation != undefined && this.room.controller.reservation.username != undefined
                        && this.room.controller.reservation.username == 'Invader') {
                        if (this.attackController(this.room.controller) == ERR_NOT_IN_RANGE) {
                            this.moveTo(this.room.controller, { reusePath: 19 });
                        }

                    }


                }
            }

        }
        else { // not in target room - go claim
            if (Game.rooms[this.memory.targetRoom] != undefined) {
                this.moveTo(Game.rooms[this.memory.targetRoom].controller, { reusePath: 12 });
            }
            else {
                this.moveTo(new RoomPosition(25,25,this.memory.targetRoom), {range: 21, reusePath: 19 });

            }

        }
    }
    else {
        this.say("No Target");
    }

};