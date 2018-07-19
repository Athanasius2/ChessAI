/*
Some major issues that still need to be fixed:
1)  I'm managing my components in a really terrible way, making the board do all the work.
there should probably be some sort of Game class to take care of these things...

Suggested improvements for our future selves:
1)  make Board.getAdjacent return a set of all 8 adjacent spaces, 
    ordered numerically from North to North-West (counted in a clockwise direction)

2)  make Board.state a 2D array.

3)  I added Board.getSpace later.  Replace 'return this.state[x + y * 8];' whereever possible
    to make code more safe and readable

*/

const Pieces = 
{
    KING : 0,
    QUEEN : 1,
    BISHOP : 2,
    KNIGHT : 3,
    ROOK : 4,
    PAWN : 5,
    EMPTY: 6
};

const Sides = 
{
    WHITE : 0,
    BLACK : 1,
    EMPTY : 2
};

const Directions = 
{
    NORTH : 0,
    NORTHEAST : 1, 
    EAST : 2, 
    SOUTHEAST : 3,
    SOUTH : 4,
    SOUTHWEST : 5,
    WEST : 6,
    NORTHWEST : 7
};

class Resources
{
    constructor(image)
    {    
        //maybe it would be better if we found a way to load this with javascript in the future
        var img = image;
        
        this.gameImages = [];

        for (var i = 0; i <=5; i++)
        {
            // iterate through each chunk of the source image and give it its own canvas.
            //we start with the white pieces...
            this.gameImages.push(document.createElement('canvas'));
            var context = this.gameImages[i].getContext("2d");
            context.drawImage(img, i*333, 0, 333, 333, 0, 0, 64, 64);
        }

        //... and finish with the black pieces.
        for (var i = 0; i <=5; i++)
        {
            this.gameImages.push(document.createElement('canvas'));
            var context = this.gameImages[i+6].getContext("2d");
            context.drawImage(img, i*333, 333, 333, 333, 0, 0, 64, 64);
        }
    } 
}

class Board
{
    constructor(boardCanvas, resource)
    {
        this.res = resource;
        this.boardCanvas = document.getElementById(boardCanvas);
        this.ctx = this.boardCanvas.getContext("2d");
        this.state = [];
        this.selected = null;
        for(var i = 0; i < 8; i++)
        {
            for(var j = 0; j < 8; j++)
            {
                this.state.push(new Space(j, i, new Piece(Pieces.EMPTY, Sides.EMPTY)));
            }
        }
        this.state[0].piece = new Piece(Pieces.ROOK, Sides.BLACK);
        this.state[1].piece = new Piece(Pieces.KNIGHT, Sides.BLACK);
        this.state[2].piece = new Piece(Pieces.BISHOP, Sides.BLACK);
        this.state[3].piece = new Piece(Pieces.QUEEN, Sides.BLACK);
        this.state[4].piece = new Piece(Pieces.KING, Sides.BLACK);
        this.state[5].piece = new Piece(Pieces.BISHOP, Sides.BLACK);
        this.state[6].piece = new Piece(Pieces.KNIGHT, Sides.BLACK);
        this.state[7].piece = new Piece(Pieces.ROOK, Sides.BLACK);

        this.state[56].piece = new Piece(Pieces.ROOK, Sides.WHITE);
        this.state[57].piece = new Piece(Pieces.KNIGHT, Sides.WHITE);
        this.state[58].piece = new Piece(Pieces.BISHOP, Sides.WHITE);
        this.state[59].piece = new Piece(Pieces.QUEEN, Sides.WHITE);
        this.state[60].piece = new Piece(Pieces.KING, Sides.WHITE);
        this.state[61].piece = new Piece(Pieces.BISHOP, Sides.WHITE);
        this.state[62].piece = new Piece(Pieces.KNIGHT, Sides.WHITE);
        this.state[63].piece = new Piece(Pieces.ROOK, Sides.WHITE);

        for (var i = 8; i <= 15; i++)
        {
            this.state[i].piece = new Piece(Pieces.PAWN, Sides.BLACK);
        }

        for (var i = 48; i <= 55; i++)
        {
            this.state[i].piece = new Piece(Pieces.PAWN, Sides.WHITE);
        }
    }


    draw()
    {
        this.ctx.fillStyle = 'rgb(233, 150, 122)';

        //draw the board first...
        //if checker is true we draw a square.  We use this to 
        //alternate between dark and light squares
        this.ctx.clearRect(0, 0, this.boardCanvas.clientWidth, this.boardCanvas.clientHeight);
        var checker = false;
        for ( var y = 0; y < 8; y++ )
        {
            for ( var x = 0; x < 8; x++ )
            {
                if (checker)
                {
                    this.ctx.fillRect(x * 64, y * 64, 64, 64);
                    checker = false;
                }
                else
                {
                    checker = true;
                }
            }
            checker = !checker;
        }

        //draw selected space
        if(this.selected != null)
        {
            this.ctx.fillStyle = 'rgb(133, 193, 233)';
            this.ctx.fillRect(this.selected.x * 64, this.selected.y * 64, 64, 64);
        }

        //draw valid moves
        if (this.selected != null)
        {
            var moves = this.validMoves(this.selected);
            
            for(var i = 0; i < moves.length; i++)
            {
                var x = moves[i];
                this.ctx.fillStyle = 'rgb(125, 206, 160)';
                this.ctx.fillRect(x.x * 64, x.y * 64, 64, 64);
            }
        }

        //draw pieces next
        for (var i = 0; i < this.state.length; i++) 
        {
            var x = this.state[i];
            if (x.piece.img > -1) {
                this.ctx.drawImage(this.res.gameImages[x.piece.img], x.x * 64, x.y *64);
            }

        }
    }

    getSpace(x, y)
    {
        if (x > 7 || x < 0 || y > 7 || y < 0)
        {
            throw "space: (" + x + ", " + y + ") out of bounds";
        }
        return this.state[x + y * 8];
    }

    selectSpace(x, y)
    {
        this.selected = this.getSpace(x, y);
        if (this.selected.piece.type == Pieces.EMPTY)
        {
            this.selected = null;
        }
    }

    //returns spaces adjacent and diagonal to this space using 
    //numbers to signify direction.  Returns null if adj is off the board
    getAdjacent(space, dir){
        if (space.x > 7 || space.x < 0 || space.y > 7 || space.y < 0)
        {
            throw "space: (" + space.x + ", " + space.y + ") out of bounds";
        }

        var x = space.x;
        var y = space.y;
        switch (dir)
        {
            case Directions.NORTH: //North
            if (y == 0) return null;
            y--;
            return this.state[x + y * 8];
            break;
            case Directions.SOUTH: //South
            if (y == 7) return null;
            y++;
            return this.state[x + y * 8];
            break;
            case Directions.EAST: //East
            if (x == 7) return null;
            x++;
            return this.state[x + y * 8];
            break;
            case Directions.WEST: //West
            if (x == 0) return null;
            x--;
            return this.state[x + y * 8];
            break;
            case Directions.NORTHEAST: //North-East
            if (x == 7 || y == 0) return null;
            x++;
            y--;
            return this.state[x + y * 8];
            break;
            case Directions.SOUTHEAST: //South-East
            if (x == 7 || y == 7) return null;
            x++;
            y++;
            return this.state[x + y * 8];
            break;
            case Directions.NORTHWEST: //North-West
            if (x == 0 || y == 0) return null;
            x--;
            y--;
            return this.state[x + y * 8];
            break;
            case Directions.SOUTHWEST: //South-West
            if (x == 0 || y == 7) return null;
            x--;
            y++;
            return this.state[x + y * 8];
            break;
            default:
            throw "'dir' must be in range 0 <= dir <= 7.  'dir' = " + dir;
        }
    }

    //returns a set of 'Spaces' that are valid moves
    //I'm not necessarily accounting for Check yet, so that should happen soon
    validMoves(spc)
    {
        var moves = [];
        var adj;
        switch(spc.piece.type)
        {
            case Pieces.EMPTY:
            return moves;
            break;
            case Pieces.KING:
            //iterate through all the directions and add them if they are valid
            for (var i = Directions.NORTH; i <= Directions.NORTHWEST; i++)
            {
                adj = this.getAdjacent(spc, i);
                if ( adj != null && adj.piece.side != spc.piece.side ) 
                   moves.push(adj);
            }
            return moves;
            break;
            case Pieces.QUEEN:
            //Go straight until you hit your own piece or go off the board in each direction
            for (var i = Directions.NORTH; i <= Directions.NORTHWEST; i++)
            {
                adj = spc;
                var j = 0;
                do
                {
                    adj = this.getAdjacent(adj, i);
                    if (adj == null || adj.piece.side == spc.piece.side)
                        break;
                    
                    moves.push(adj);

                    if (adj.piece.side != spc.piece.side && adj.piece.side != Sides.EMPTY)
                        break;
                    
                }
                while(j++ <= 7)
            }
            return moves;
            break;
            case Pieces.BISHOP:
            //do the same as for the Queen, but only check diagonals
            for (var i = Directions.NORTHEAST; i <= Directions.NORTHWEST; i += 2)
            {
                adj = spc;
                var j = 0;
                do
                {
                    adj = this.getAdjacent(adj, i);
                    if (adj == null || adj.piece.side == spc.piece.side)
                        break;
                    
                    moves.push(adj);

                    if (adj.piece.side != spc.piece.side && adj.piece.side != Sides.EMPTY)
                        break;
                    
                }
                while(j++ <= 7)
            }
            return moves;
            break;
            case Pieces.ROOK:
            //do the same as for the Queen, but only check sides
            for (var i = Directions.NORTH; i <= Directions.WEST; i += 2)
            {
                adj = spc;
                var j = 0;
                do
                {
                    adj = this.getAdjacent(adj, i);
                    if (adj == null || adj.piece.side == spc.piece.side)
                        break;
                    
                    moves.push(adj);

                    if (adj.piece.side != spc.piece.side && adj.piece.side != Sides.EMPTY)
                        break;
                    
                }
                while(j++ <= 7)
            }
            return moves;
            break;

            //For now we are adding spaces to move one by one.
            //If the space is on the board, and the piece on that space
            //is not on the same side is the knight, we add the space
            case Pieces.KNIGHT:
            var space;
            if (spc.x >= 2)
            {
                if (spc.y >= 1)
                {
                    space = this.getSpace(spc.x - 2, spc.y - 1);
                    if (space.piece.side != spc.piece.side)
                        moves.push(space);
                }
                if (spc.y <= 6)
                {
                    space = this.getSpace(spc.x - 2, spc.y + 1);
                    if (space.piece.side != spc.piece.side)
                        moves.push(space);
                }
            }
            if (spc.x <= 5)
            {
                if (spc.y >= 1)
                {
                    space = this.getSpace(spc.x + 2, spc.y - 1);
                    if (space.piece.side != spc.piece.side)
                        moves.push(space);
                }
                if (spc.y <= 6)
                {
                    space = this.getSpace(spc.x + 2, spc.y + 1);
                    if (space.piece.side != spc.piece.side)
                        moves.push(space);
                }
            }
            
            if (spc.y >= 2)
            {
                if (spc.x >= 1)
                {
                    space = this.getSpace(spc.x - 1, spc.y - 2);
                    if (space.piece.side != spc.piece.side)
                        moves.push(space);
                }
                if (spc.x <= 6)
                {
                    space = this.getSpace(spc.x + 1, spc.y - 2);
                    if (space.piece.side != spc.piece.side)
                        moves.push(space);
                }
            }
            if (spc.y <= 5)
            {
                if (spc.x >= 1)
                {
                    space = this.getSpace(spc.x - 1, spc.y + 2);
                    if (space.piece.side != spc.piece.side)
                        moves.push(space);
                }
                if (spc.x <= 6)
                {
                    space = this.getSpace(spc.x + 1, spc.y + 2);
                    if (space.piece.side != spc.piece.side)
                        moves.push(space);
                }
            }
            return moves;
            break;

            //TODO: implement En Passant
            //TODO: implement first move double move
            case Pieces.PAWN:
            var adj;
            if (spc.piece.side == Sides.WHITE)
            {
                adj = this.getAdjacent(spc, Directions.NORTH); //first space
                if (adj.piece.side != spc.piece.side)
                {
                    moves.push(adj);
                    adj = this.getAdjacent(adj, Directions.NORTH);
                    if (adj.piece.side != spc.piece.side)
                        moves.push(adj);
                }
                adj = this.getAdjacent(spc, Directions.NORTHWEST);
                if (adj != null && adj.piece.side != spc.Sides && adj.piece.side != Sides.EMPTY)
                {
                    moves.push(adj);
                }
                adj = this.getAdjacent(spc, Directions.NORTHEAST);
                if (adj != null && adj.piece.side != spc.Sides && adj.piece.side != Sides.EMPTY)
                {
                    moves.push(adj);
                }

            }
            
            if (spc.piece.side == Sides.BLACK)
            {
                adj = this.getAdjacent(spc, Directions.SOUTH); //first space
                if (adj.piece.side != spc.piece.side)
                {
                    moves.push(adj);
                    adj = this.getAdjacent(adj, Directions.SOUTH);
                    if (adj.piece.side != spc.piece.side)
                        moves.push(adj);
                }
                adj = this.getAdjacent(spc, Directions.SOUTHWEST);
                if (adj != null && adj.piece.side != spc.Sides && adj.piece.side != Sides.EMPTY)
                {
                    moves.push(adj);
                }
                adj = this.getAdjacent(spc, Directions.SOUTHEAST);
                if (adj != null && adj.piece.side != spc.Sides && adj.piece.side != Sides.EMPTY)
                {
                    moves.push(adj);
                }

            }

            return moves;
            break;
            default:
            throw "Type " + spc.piece.type + " at Space: " + spc + " is not valid";
        }
    }

    

    isValidMove()
    {

    }

    isInCheck()
    {
        
    }
}



class Piece
{
    //TODO make sure 'type' and 'side' are valid values.
    constructor(type, side)
    {
        if (type == Pieces.EMPTY || side == Sides.EMPTY)
        {
            this.value = 0;
            this.type = Pieces.EMPTY;
            this.side = Sides.EMPTY;
            this.img = -1;
            return;
        }

        this.type = type;
        this.side = side;
        //we will use img to access the array of canvases stored in Board.  We are calculated the index the image is stored at.
        this.img = type + side * 6;

        //These value are based on the official Chess standard.  I think there are more 
        //dynamic ways of assessing piece value based on context that could be valuable for 
        //an AI to interpret
        switch (type)
        {
            case Pieces.KING:
            this.value = 0;
            break;
            case Pieces.QUEEN:
            this.value = 9;
            break;
            case Pieces.BISHOP:
            this.value = 3;
            break;
            case Pieces.KNIGHT:
            this.value = 3;
            break;
            case Pieces.PAWN:
            this.value = 1;
            break;
        }
    }   
}

//'Space' is a data structure for keeping track of ordered pairs representing spaces on the board, 
//and the piece at each space
class Space
{
    constructor(x, y, piece)
    {
        this.x = x;
        this.y = y;
        this.piece = piece;
        this.string = this.string(x, y);
    }

    

    //returns a coordinate string for the space using 
    //chess' standard coordinate system
    string(x, y)
    {
        if (x > 7 || x < 0 || y > 7 || y < 0)
            throw "Invalid Space: (" + x + ", " + y + ")";
        
        var yStr = 8 - y;
        switch(x)
        {
            case 0:
            var str = "a" + yStr;
            break;
            case 1:
            var str = "b" + yStr;
            break;
            case 2:
            var str = "c" + yStr;
            break;
            case 3:
            var str = "d" + yStr;
            break;
            case 4:
            var str = "e" + yStr;
            break;
            case 5:
            var str = "f" + yStr;
            break;
            case 6:
            var str = "g" + yStr;
            break;
            case 7:
            var str = "h" + yStr;
            break;
        }
        return str;
    }

    
}