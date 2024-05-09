
export function DefaultChessArray(){
    return [
        ['R','P','','','','','p','r'],
        ['N','P','','','','','p','n'],
        ['B','P','','','','','p','b'],
        ['Q','P','','','','','p','q'],
        ['K','P','','','','','p','k'],
        ['B','P','','','','','p','b'],
        ['N','P','','','','','p','n'],
        ['R','P','','','','','p','r'],
    ];
}

//move is expected to be in propper algebraic notation
//All moves are expected to be validated before being passed in, this function does not validate moves
export function ProgressBoard(move, pieceArray, blackToMove){
    //long castle
    if(move.match(/^[0oO]-[0oO]-[0oO]/g)){
        if(blackToMove){
            pieceArray[4][7] = '';
            pieceArray[0][7] = '';
            pieceArray[2][7] = 'k';
            pieceArray[3][7] = 'r';
        }
        else{
            pieceArray[4][0] = '';
            pieceArray[0][0] = '';
            pieceArray[2][0] = 'K';
            pieceArray[3][0] = 'R';
        }
    }
    //short castle
    else if(move.match(/^[0oO]-[0oO]/g)){
        if(blackToMove){
            pieceArray[4][7] = '';
            pieceArray[7][7] = '';
            pieceArray[6][7] = 'k';
            pieceArray[5][7] = 'r';
        }
        else{
            pieceArray[4][0] = '';
            pieceArray[7][0] = '';
            pieceArray[6][0] = 'K';
            pieceArray[5][0] = 'R';
        }
    }
    //pawn capture
    else if(move.match(/^[abcdefgh]x/g)){
        let pawnColumn = C(move[0]);
        let captureColumn = C(move[2]);
        let captureRow = R(move[3]);
        let pawnRow = blackToMove ? captureRow + 1 : captureRow - 1;

        //en passant
        if(pieceArray[captureColumn][captureRow] == '')
            pieceArray[captureColumn][pawnRow] = '';

        pieceArray[captureColumn][captureRow] = blackToMove ? 'p' : 'P';
        pieceArray[pawnColumn][pawnRow] = '';
            

        //promotion
        if((blackToMove && captureRow == 0) || (!blackToMove && captureRow == 7)){
            let piece = move.replace('=','')[4];
            pieceArray[captureColumn][captureRow] = blackToMove ? piece.toLowerCase() : piece.toUpperCase();
        }
    }
    //pawn move
    else if(move.match(/^[abcdefgh]/g)){
        let pawnColumn = C(move[0]);
        let pawnRow = R(move[1]);
        let originalRow = blackToMove ? pawnRow + 1 : pawnRow - 1;

        pieceArray[pawnColumn][pawnRow] = blackToMove ? 'p' : 'P';
        //for moving the pawn twice on its first move
        if(pieceArray[pawnColumn][originalRow] == '')
            pieceArray[pawnColumn][blackToMove ? originalRow + 1 : originalRow - 1] = '';
        else
            pieceArray[pawnColumn][originalRow] = '';

        //promotion
        if((blackToMove && pawnRow == 0) || (!blackToMove && pawnRow == 7)){
            let piece = move[2];
            pieceArray[pawnColumn][pawnRow] = blackToMove ? piece.toLowerCase() : piece.toUpperCase();
        }
    }
    //every other move
    else{
        let cleanMove = move.replaceAll(/[-=x#]/g, '').replaceAll('+', '');
        let coordinate = cleanMove.slice(cleanMove.length - 2);
        let column = C(coordinate[0]);
        let row = R(coordinate[1]);


        let ambiguity = cleanMove.slice(1, cleanMove.length - 2);
        let specificColumn = -1;
        let specificRow = -1;
        if(ambiguity.length != 0){
            if(ambiguity.match(/[abcdefgh]/))
                specificColumn = C(ambiguity[0]);
            if(ambiguity.match(/[12345678]/))
                specificRow = R(ambiguity[ambiguity.length-1]);
        }

        let pieceType = move[0];
        let possiblePieces = [];

        for(let i = 0; i < 8; i++)
            for(let j = 0; j < 8; j++)
                if(pieceArray[i][j] == (blackToMove ? pieceType.toLowerCase() : pieceType.toUpperCase()))
                    if((specificColumn == -1 || specificColumn == i) && (specificRow == -1 || specificRow == j))
                        possiblePieces.push({x:i, y:j});
        
        if(possiblePieces.length == 0)
            throw new Error('Possible pieces have length of 0');
        
        //only one possible piece
        if(possiblePieces.length == 1){
            pieceArray[column][row] = pieceArray[possiblePieces[0].x][possiblePieces[0].y];
            pieceArray[possiblePieces[0].x][possiblePieces[0].y] = '';
        }

        //ambiguity between multiple pieces
        else{
            for(let i = 0; i < possiblePieces.length; i++){
                let legalMoves = LegalMoves(possiblePieces[i].x, possiblePieces[i].y, pieceArray); //no need to check for illegal moves, pgn should not account for them in notation
                for(let j = 0; j < legalMoves.length; j++){
                    if(legalMoves[j].x == column && legalMoves[j].y == row){
                        pieceArray[column][row] = pieceArray[possiblePieces[i].x][possiblePieces[i].y];
                        pieceArray[possiblePieces[i].x][possiblePieces[i].y] = '';

                        legalMoves = -1;
                        break;
                    }
                }
                if(legalMoves == -1) break;
            }
        }
    }


    return pieceArray;
}


//get array of legal moves of piece at x and y coordinates
export function LegalMoves(x, y, pieceArray, refineMoves, lastMove, canCastle){
    let isWhite = pieceArray[x][y] == pieceArray[x][y].toUpperCase();
    let piece = pieceArray[x][y].toUpperCase();

    let moves = [];

    switch(piece){
        case 'P':
        let promotion = (isWhite && y == 6) || (!isWhite && y == 1);
        if(Valid(x, y + (isWhite ? 1 : -1), isWhite, pieceArray) && pieceArray[x][y + (isWhite ? 1 : -1)] == ''){
            moves.push({x:x, y:y + (isWhite ? 1 : -1), pgn:_C(x)+_R(y + (isWhite ? 1 : -1))+(promotion?'=Q':'')});
            //move twice on starting square
            if(y == (isWhite ? 1 : 6) && Valid(x, y + (isWhite ? 2 : -2), isWhite, pieceArray) && pieceArray[x][y + (isWhite ? 2 : -2)] == '')
                moves.push({x:x, y:y + (isWhite ? 2 : -2), pgn:_C(x)+_R(y + (isWhite ? 2 : -2))});
        }
        //pawn captures
        if(Valid(x-1, y + (isWhite ? 1 : -1), isWhite, pieceArray) && pieceArray[x-1][y + (isWhite ? 1 : -1)] != '')
            moves.push({x:x-1, y:y + (isWhite ? 1 : -1), pgn:_C(x)+'x'+_C(x-1)+_R(y + (isWhite ? 1 : -1))+(promotion?'=Q':'')});
        if(Valid(x+1, y + (isWhite ? 1 : -1), isWhite, pieceArray) && pieceArray[x+1][y + (isWhite ? 1 : -1)] != '')
            moves.push({x:x+1, y:y + (isWhite ? 1 : -1), pgn:_C(x)+'x'+_C(x+1)+_R(y + (isWhite ? 1 : -1))+(promotion?'=Q':'')});

        //en passant
        if(
            lastMove 
            && lastMove.y == y 
            && Math.abs(lastMove.x - x) == 1
            && pieceArray[lastMove.x][y].toLowerCase() == 'p' 
            && lastMove.prevY == (y + (isWhite ? 2 : -2))
        ){
            moves.push({x:lastMove.x, y:y + (isWhite ? 1 : -1), pgn:_C(x)+'x'+_C(lastMove.x)+_R(y + (isWhite ? 1 : -1))});
        }

        
        break;
        case 'B':
            for(let i = 1; i < 8; i++){
                if(Valid(x+i, y+i, isWhite, pieceArray)){
                    if(pieceArray[x+i][y+i] != ''){
                        moves.push({x:x+i, y:y+i, pgn:piece+'x'+_C(x+i)+_R(y+i)});
                        break;
                    }
                    else{
                        moves.push({x:x+i, y:y+i, pgn:piece+_C(x+i)+_R(y+i)});
                    }
                }
                else break;
            }
            for(let i = 1; i < 8; i++){
                if(Valid(x+i, y-i, isWhite, pieceArray)){
                    if(pieceArray[x+i][y-i] != ''){
                        moves.push({x:x+i, y:y-i, pgn:piece+'x'+_C(x+i)+_R(y-i)});
                        break;
                    }
                    else{
                        moves.push({x:x+i, y:y-i, pgn:piece+_C(x+i)+_R(y-i)});
                    }
                }
                else break;
            }
            for(let i = 1; i < 8; i++){
                if(Valid(x-i, y+i, isWhite, pieceArray)){
                    if(pieceArray[x-i][y+i] != ''){
                        moves.push({x:x-i, y:y+i, pgn:piece+'x'+_C(x-i)+_R(y+i)});
                        break;
                    }
                    else{
                        moves.push({x:x-i, y:y+i, pgn:piece+_C(x-i)+_R(y+i)});
                    }
                }
                else break;
            }
            for(let i = 1; i < 8; i++){
                if(Valid(x-i, y-i, isWhite, pieceArray)){
                    if(pieceArray[x-i][y-i] != ''){
                        moves.push({x:x-i, y:y-i, pgn:piece+'x'+_C(x-i)+_R(y-i)});
                        break;
                    }
                    else{
                        moves.push({x:x-i, y:y-i, pgn:piece+_C(x-i)+_R(y-i)});
                    }
                }
                else break;
            }
        break;
        case 'N':
            let arr = [
                {x:2,y:1},
                {x:2,y:-1},
                {x:-2,y:1},
                {x:-2,y:-1},
                {x:1,y:2},
                {x:-1,y:2},
                {x:1,y:-2},
                {x:-1,y:-2},
            ];
            for(let i = 0; i < arr.length; i++)
                if(Valid(x+arr[i].x, y+arr[i].y, isWhite, pieceArray))
                    moves.push({x:x+arr[i].x, y: y+arr[i].y, pgn:piece+(pieceArray[x+arr[i].x][y+arr[i].y] != '' ? 'x' : '')+_C(x+arr[i].x)+_R(y+arr[i].y)});

        break;
        case 'R':
            for(let i = 1; i < 8; i++){
                if(Valid(x, y+i, isWhite, pieceArray)){
                    if(pieceArray[x][y+i] != ''){
                        moves.push({x:x, y:y+i, pgn:piece+'x'+_C(x)+_R(y+i)});
                        break;
                    }
                    else{
                        moves.push({x:x, y:y+i, pgn:piece+_C(x)+_R(y+i)});
                    }
                }
                else break;
            }
            for(let i = 1; i < 8; i++){
                if(Valid(x, y-i, isWhite, pieceArray)){
                    if(pieceArray[x][y-i] != ''){
                        moves.push({x:x, y:y-i, pgn:piece+'x'+_C(x)+_R(y-i)});
                        break;
                    }
                    else{
                        moves.push({x:x, y:y-i, pgn:piece+_C(x)+_R(y-i)});
                    }
                }
                else break;
            }
            for(let i = 1; i < 8; i++){
                if(Valid(x-i, y, isWhite, pieceArray)){
                    if(pieceArray[x-i][y] != ''){
                        moves.push({x:x-i, y:y, pgn:piece+'x'+_C(x-i)+_R(y)});
                        break;
                    }
                    else{
                        moves.push({x:x-i, y:y, pgn:piece+_C(x-i)+_R(y)});
                    }
                }
                else break;
            }
            for(let i = 1; i < 8; i++){
                if(Valid(x+i, y, isWhite, pieceArray)){
                    if(pieceArray[x+i][y] != ''){
                        moves.push({x:x+i, y:y, pgn:piece+'x'+_C(x+i)+_R(y)});
                        break;
                    }
                    else{
                        moves.push({x:x+i, y:y, pgn:piece+_C(x+i)+_R(y)});
                    }
                }
                else break;
            }


        break;
        case 'Q':
            for(let i = 1; i < 8; i++){
                if(Valid(x+i, y+i, isWhite, pieceArray)){
                    if(pieceArray[x+i][y+i] != ''){
                        moves.push({x:x+i, y:y+i, pgn:piece+'x'+_C(x+i)+_R(y+i)});
                        break;
                    }
                    else{
                        moves.push({x:x+i, y:y+i, pgn:piece+_C(x+i)+_R(y+i)});
                    }
                }
                else break;
            }
            for(let i = 1; i < 8; i++){
                if(Valid(x+i, y-i, isWhite, pieceArray)){
                    if(pieceArray[x+i][y-i] != ''){
                        moves.push({x:x+i, y:y-i, pgn:piece+'x'+_C(x+i)+_R(y-i)});
                        break;
                    }
                    else{
                        moves.push({x:x+i, y:y-i, pgn:piece+_C(x+i)+_R(y-i)});
                    }
                }
                else break;
            }
            for(let i = 1; i < 8; i++){
                if(Valid(x-i, y+i, isWhite, pieceArray)){
                    if(pieceArray[x-i][y+i] != ''){
                        moves.push({x:x-i, y:y+i, pgn:piece+'x'+_C(x-i)+_R(y+i)});
                        break;
                    }
                    else{
                        moves.push({x:x-i, y:y+i, pgn:piece+_C(x-i)+_R(y+i)});
                    }
                }
                else break;
            }
            for(let i = 1; i < 8; i++){
                if(Valid(x-i, y-i, isWhite, pieceArray)){
                    if(pieceArray[x-i][y-i] != ''){
                        moves.push({x:x-i, y:y-i, pgn:piece+'x'+_C(x-i)+_R(y-i)});
                        break;
                    }
                    else{
                        moves.push({x:x-i, y:y-i, pgn:piece+_C(x-i)+_R(y-i)});
                    }
                }
                else break;
            }
            for(let i = 1; i < 8; i++){
                if(Valid(x, y+i, isWhite, pieceArray)){
                    if(pieceArray[x][y+i] != ''){
                        moves.push({x:x, y:y+i, pgn:piece+'x'+_C(x)+_R(y+i)});
                        break;
                    }
                    else{
                        moves.push({x:x, y:y+i, pgn:piece+_C(x)+_R(y+i)});
                    }
                }
                else break;
            }
            for(let i = 1; i < 8; i++){
                if(Valid(x, y-i, isWhite, pieceArray)){
                    if(pieceArray[x][y-i] != ''){
                        moves.push({x:x, y:y-i, pgn:piece+'x'+_C(x)+_R(y-i)});
                        break;
                    }
                    else{
                        moves.push({x:x, y:y-i, pgn:piece+_C(x)+_R(y-i)});
                    }
                }
                else break;
            }
            for(let i = 1; i < 8; i++){
                if(Valid(x-i, y, isWhite, pieceArray)){
                    if(pieceArray[x-i][y] != ''){
                        moves.push({x:x-i, y:y, pgn:piece+'x'+_C(x-i)+_R(y)});
                        break;
                    }
                    else{
                        moves.push({x:x-i, y:y, pgn:piece+_C(x-i)+_R(y)});
                    }
                }
                else break;
            }
            for(let i = 1; i < 8; i++){
                if(Valid(x+i, y, isWhite, pieceArray)){
                    if(pieceArray[x+i][y] != ''){
                        moves.push({x:x+i, y:y, pgn:piece+'x'+_C(x+i)+_R(y)});
                        break;
                    }
                    else{
                        moves.push({x:x+i, y:y, pgn:piece+_C(x+i)+_R(y)});
                    }
                }
                else break;
            }


        break;
        case 'K':
            let arr2 = [
                {x:0,y:-1},
                // {x:0,y:0},
                {x:0,y:1},
                {x:1,y:-1},
                {x:1,y:0},
                {x:1,y:1},
                {x:-1,y:-1},
                {x:-1,y:0},
                {x:-1,y:1},
            ];
            for(let i = 0; i < arr2.length; i++)
                if(Valid(x+arr2[i].x, y+arr2[i].y, isWhite, pieceArray))
                    moves.push({x:x+arr2[i].x, y: y+arr2[i].y, pgn:piece+(pieceArray[x+arr2[i].x][y+arr2[i].y] != '' ? 'x' : '')+_C(x+arr2[i].x)+_R(y+arr2[i].y)});

            //castling
            if(canCastle && canCastle[0] && pieceArray[1][y] == '' && pieceArray[2][y] == '' && pieceArray[3][y] == ''){
                if(!InCheck(ProgressBoard('K'+_C(3)+_R(y), duplicateArray(pieceArray), !isWhite), isWhite))
                    moves.push({x:2, y:y, pgn:'O-O-O'});
            }
            if(canCastle && canCastle[7] && pieceArray[5][y] == '' && pieceArray[6][y] == ''){
                if(!InCheck(ProgressBoard('K'+_C(5)+_R(y), duplicateArray(pieceArray), !isWhite), isWhite))
                    moves.push({x:6, y:y, pgn:'O-O'});
            }


        break;
        default: break;
    }

    //check for forced moves due to check AND refind pgn of moves due to piece ambiguity
    if(refineMoves){
        //manipulate duplicate array to check for checks in possible moves
        for(let i = moves.length-1; i >= 0; i--){
            //change duplicate array as if the move had happened
            let duplicate = ProgressBoard(moves[i].pgn, duplicateArray(pieceArray), !isWhite);

            //if the move leaves the king in check, it is illegal
            if(InCheck(duplicate, isWhite))
                moves.splice(i, 1);
        }


        let ambiguityArray = {'B':[], 'N':[], 'R':[], 'Q':[]};

        let validAmbiguity = (isWhite ? ['B', 'N', 'R', 'Q'] : ['b', 'n', 'r', 'q']);
        for(let i = 0; i < 8; i++){
            for(let j = 0; j < 8; j++){
                if(validAmbiguity.includes(pieceArray[i][j])){
                    ambiguityArray[pieceArray[i][j].toUpperCase()].push({x:i,y:j});
                }
            }
        }

        //handle piece ambiguity
        if(piece != 'P' && piece != 'K') for(let m in moves){

            if(ambiguityArray[piece].length >= 2){
                let potentialPieces = [];
                for(let i in ambiguityArray[piece]){
                    if(ambiguityArray[piece][i].x == x && ambiguityArray[piece][i].y == y)
                        continue;
                    let legalMoves = LegalMoves(ambiguityArray[piece][i].x, ambiguityArray[piece][i].y, pieceArray);
                    for(let j in legalMoves){
                        if(legalMoves[j].x == moves[m].x && legalMoves[j].y == moves[m].y){
                            potentialPieces.push(ambiguityArray[piece][i]);
                            break;
                        }
                    }
                }
                if(potentialPieces.length == 0)
                    continue;

                let columnAbiguity = false;
                let rowAbiguity = false;
                for(let i in potentialPieces){
                    if(potentialPieces[i].x != x)
                        columnAbiguity = true;
                    else rowAbiguity = true;
                }

                moves[m].pgn = moves[m].pgn[0] + (columnAbiguity ? _C(x) : '') + (rowAbiguity ? _R(y) : '') + moves[m].pgn.substring(1);
            }
        }
    }
    return moves;
}


//check to see if player is in check
export function InCheck(pieceArray, checkingWhite){
    let kingX, kingY = -1;
    Loop: for(let x in pieceArray){
        for(let y in pieceArray[x]){
            if(pieceArray[x][y] == (checkingWhite ? 'K' : 'k')){
                kingX = x;
                kingY = y;
                break Loop; //this is cursed
            }
        }
    }

    // if this takes too long, this can be sped up by changing the LegalMoves method
    // to only look for captures when specifically looking for moves that can take the king
    for(let x = 0; x < 8; x++){
        for(let y = 0; y < 8; y++){
            if(pieceArray[x][y] != '' && !(x == kingX && y == kingY)){
                let moves = LegalMoves(x, y, pieceArray, false);
                for(let i in moves){
                    if(moves[i].x == kingX && moves[i].y == kingY){
                        return true;
                    }
                }
            }
        }
    }
                

    return false;
}

//checks to see if the coordinate can be moved to by a hypothetical piece
function Valid(x, y, isWhite, pieceArray){
    if(x < 0 || x > 7 || y < 0 || y > 7) return false;
    if(pieceArray[x][y] == '') return true;
    return (pieceArray[x][y] == pieceArray[x][y].toUpperCase()) != isWhite;
}

//duplicate piece array
function duplicateArray(pieceArray){
    let duplicateArray = [['','','','','','','','',],['','','','','','','','',],['','','','','','','','',],['','','','','','','','',],
        ['','','','','','','','',],['','','','','','','','',],['','','','','','','','',],['','','','','','','','',]];
    for(let i in pieceArray)
        for(let j in pieceArray)
            duplicateArray[i][j] = pieceArray[i][j];

    return duplicateArray;
}


//parse column name to index number
function C(column){
    switch(column){
        case 'a': return 0;
        case 'b': return 1;
        case 'c': return 2;
        case 'd': return 3;
        case 'e': return 4;
        case 'f': return 5;
        case 'g': return 6;
        case 'h': return 7;
        default: throw new Error('Column '+column+' is not a valid column');
    }
}
//index number to column name
function _C(column){
    return ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][column];
}

//parse row name to index number
function R(row){
    switch(row){
        case '1': return 0;
        case '2': return 1;
        case '3': return 2;
        case '4': return 3;
        case '5': return 4;
        case '6': return 5;
        case '7': return 6;
        case '8': return 7;
        default: throw new Error('Row '+row+' is not a valid row');
    }
}
//index number to row name
function _R(row){
    return (row+1)+'';
}