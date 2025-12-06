import { Expr } from "../../lab04";

export function cost(e: Expr): number
{
    switch (e.type) {
        case "Num": 
            return 0;
        case "Variable": 
            return 1;
        case "UnaryExpr":
            return cost(e.operand) + 1;
        case "BinaryExpr":
            return cost(e.left) + cost(e.right) + 1;
    }
    
}