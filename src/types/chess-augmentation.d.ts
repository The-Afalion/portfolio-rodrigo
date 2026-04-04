// Bypassing compiler caching issues with older chess.js typings
declare module 'chess.js' {
    export interface Chess {
        isGameOver(): boolean;
        isCheckmate(): boolean;
        isCheck(): boolean;
        isDraw(): boolean;
        undo(): any;
        pgn(): string;
        board(): any;
    }
}
