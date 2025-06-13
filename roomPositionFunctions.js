RoomPosition.prototype.getNearbyPositions=function getNearbyPositions(){
    var positions=[];

    let startX=this.x-1 || 1;
    let startY=this.y-1 || 1;

    for (x=startX;x<=this.x+1 && x<49;x++)
    {
        for(y=startY;y<=this.y+1 && y<49;y++)
        {
            if(x!== this.x || y!== this.y)
            {
                positions.push(new RoomPosition(x,y,this.roomName));
            }
        }
    }
    return positions;
}

RoomPosition.prototype.getN_NearbyPositions=function getN_NearbyPositions(n){//returns positions in area nXn (creep inside)
    var positions=[];

    let startX=this.x-n || n;
    let startY=this.y-n || n;
    if(startX>0 && startY>0)
    {
        for (x=startX;x<=this.x+n && x<49;x++)
        {
            for(y=startY;y<=this.y+n && y<49;y++)
            {
                if(x!== this.x || y!== this.y)
                {
                    positions.push(new RoomPosition(x,y,this.roomName));
                }
            }
        }
    }
    
    return positions;
}


RoomPosition.prototype.getOpenPositions=function getOpenPositions(){ //returns open nearby positions around 
    let nearbyPositions = this.getNearbyPositions();

    
    let terrain = Game.map.getRoomTerrain(this.roomName);

    let walkablePositions =_.filter(nearbyPositions, function(pos)
    {
        return terrain.get(pos.x,pos.y) !== TERRAIN_MASK_WALL;

    });

    let freePositions=_.filter(walkablePositions, function(pos)
    {
        return !pos.lookFor(LOOK_CREEPS).length;

    });
    return freePositions;
    //return freePositions;
}

RoomPosition.prototype.getOpenPositions2=function getOpenPositions2(){ //returns open nearby positions around (creep can be on such pos)
    let nearbyPositions = this.getNearbyPositions();
    
    let terrain = Game.map.getRoomTerrain(this.roomName);

    let walkablePositions =_.filter(nearbyPositions, function(pos)
    {
        return terrain.get(pos.x,pos.y) !== TERRAIN_MASK_WALL;

    });

    return walkablePositions;
}

RoomPosition.prototype.getNOpenPositions=function getNOpenPositions(n){ //returns open nearby positions around
    // open means creep can walk on that position
    let nearbyPositions = this.getN_NearbyPositions(n);

    
    let terrain = Game.map.getRoomTerrain(this.roomName);

    let walkablePositions =_.filter(nearbyPositions, function(pos)
    {
        return terrain.get(pos.x,pos.y) !== TERRAIN_MASK_WALL;

    });

    let freePositions=_.filter(walkablePositions, function(pos)
    {
        return !pos.lookFor(LOOK_CREEPS).length;

    });

    return freePositions;
}

RoomPosition.prototype.getMyRangeTo = function getMyRangeTo(ps)
{
    return Math.sqrt(((this.x - ps.x)*(this.x - ps.x))+((this.y - ps.y)*(this.y - ps.y)))
}