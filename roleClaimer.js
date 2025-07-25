const C=require('constants')

this.prototype.roleClaimer = function roleClaimer() {


    if (this.memory.targetRoom!=undefined) {
        if (this.room.name == this.memory.targetRoom) {// if in target room - go claim 
            var colonizers = [];
            colonizers = this.room.find(FIND_MY_CREEPS, {
                filter:
                    function (cr) {
                        return cr.memory.role != undefined && cr.memory.role == C.ROLE_COLONIZER
                    }
            })

            if (colonizers.length > 0) {

                claimeResult=this.claimController(this.room.controller)
                if (claimeResult == ERR_NOT_IN_RANGE) {
                    this.travelTo(this.room.controller, { reusePath: 15, avoidSk: true, maxRooms: 1 });
                }
                if (claimeResult == ERR_INVALID_TARGET &&
                    (this.room.controller.owner != undefined && this.room.controller.owner.username != C.USERNAME )
                && !Memory.allies.includes(this.room.controller.owner.username)) {

                    this.attackController(this.room.controller);

                }
                if(claimeResult==OK)
                {
                    if(!Memory.mainRooms.includes(this.room.name))
                    {
                        Memory.mainRooms.push(this.room.name)
                    }
                }
                if (this.room.controller.text !=  C.SIGN_TEXT) {
                    this.signController(this.room.controller, C.SIGN_TEXT)
                }

            }
            this.travelTo(this.room.controller, { reusePath: 15, maxRooms: 1 });
            //this.move(LEFT)
        }
        else { // not in target room - go claim
            roomsToAvoid= (Memory.manualAvoid!= undefined ? Memory.manualAvoid: []);
            this.travelTo(this.memory.targetRoom, { avoidHostile: true, avoidCreeps: true, avoidSk: true, avoidHostileRooms: true, avoidRooms: roomsToAvoid})
        }
    }
    else {
        this.say("No Target");
    }

};