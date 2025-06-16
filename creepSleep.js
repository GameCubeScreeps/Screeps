Creep.prototype.sleep = function sleep(ticks) {
    if (this.memory.timeToSleep == undefined || (this.memory.timeToSleep!=undefined && this.memory.timeToSleep>this.ticksToLive)) {
        this.memory.timeToSleep = this.ticksToLive - ticks;
    }

}