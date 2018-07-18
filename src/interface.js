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

class Resources
{
    constructor()
    {    
        //maybe it would be better if we found a way to load this with javascript in the future
        var img = document.getElementById('spritesheet');
        var srcCanvas = document.createElement('canvas');

        srcCanvas.width = 2000;
        srcCanvas.height = 667;

        this.gameImages = [];

        // iterate through each chunk of the source image and give it its own canvas.
        //we start with the white pieces...
        for (var i = 0; i <=5; i++)
        {
            this.gameImages.push(document.createElement('canvas'));
            var context = this.gameImages[i].getContext("2d");
            context.drawImage(img, i*333, 0, 333, 333, 0, 0, 64, 64);
        }

        //... and finish with the black pieces.
        for (var i = 0; i <=5; i++)
        {
            this.gameImages.push(document.createElement('canvas'));
            var context = this.gameImages[i].getContext("2d");
            context.drawImage(img, i*333, 333, 333, 333, 0, 0, 64, 64);
        }
    }
    
    
}

class Board
{
    constructor(board)
    {
        this.res = new Resources();
        this.board = document.getElementById(board);
        this.ctx = this.board.getContext("2d");
        this.state = [];
        for(var i = 0; i < 8; i++)
        {
            for(var j = 0; j < 8; j++)
            {
                this.state.push(new Space(i, j, new Piece(Pieces.EMPTY, Sides.EMPTY)));
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

        //draw pieces next
        for (var i = 0; i < this.state.length; i++) 
        {
            var x = this.state[i];
            if (x.piece.img > -1) {
                this.ctx.drawImage(this.res.gameImages[x.piece.img], x.x * 64, x.y *64);
                
            }
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