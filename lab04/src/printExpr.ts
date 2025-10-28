import { Expr } from "./ast";

function getPrecedence(op: string): number {
    switch (op) {
        case '+':
        case '-':
            return 1;
        case '*':
        case '/':
            return 2;
        default:
            throw new SyntaxError();
    }
}

function isCommutative(op: String): boolean {
    switch (op) {
        case '+':
        case '*':
            return true;
        case '-':
        case '/':
            return false;
        default:
            throw new SyntaxError();
    }
}

function needsParentheses(parentOp: string, childExpr: Expr, isLeftChild: boolean): boolean {
    if (childExpr.type !== 'BinaryExpr')
        return false;

    const parentPrec = getPrecedence(parentOp);
    const childPrec = getPrecedence(childExpr.operator);
    if (childPrec < parentPrec) {
        return true;
    } else if (childPrec > parentPrec) {
        return false;
    } else {
        if (!isLeftChild && !( isCommutative(parentOp) && parentOp==childExpr.operator))
            return true;
        return false;
    }
}

export function printExpr(e: Expr): string {
    switch (e.type) {
        case 'Num':
            return e.value.toString();

        case 'Variable':
            return e.name;

        case 'UnaryExpr':
            if (needsParentheses(e.operator, e.operand, true))
                return e.operator + "(" + printExpr(e.operand) + ")";
            return e.operator + printExpr(e.operand);
        
        case 'BinaryExpr':
            let leftStr: string = printExpr(e.left);
            let rightStr: string = printExpr(e.right);
            if (needsParentheses(e.operator, e.left, true))
                leftStr = "(" + leftStr + ")";
            if (needsParentheses(e.operator, e.right, false))
                rightStr = "(" + rightStr + ")";
            return leftStr + " " + e.operator + " " + rightStr;
        
        default:
            throw new Error("Unhandled expression type");
    }
}
