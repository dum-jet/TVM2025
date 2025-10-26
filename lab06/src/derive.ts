import { BinaryExpr, Expr, UnaryExpr } from "../../lab04";

export function derive(e: Expr, varName: string): Expr {
    switch (e.type) {
        case 'Num':
            return {type: "Num", value: 0};

        case 'Variable':
            return {type: "Num", value: (e.name == varName ? 1 : 0)};

        case 'UnaryExpr':
            return reduceUnaryMinus(1, derive(e.operand, varName));
        
        case 'BinaryExpr':
            const du = derive(e.left, varName);
            const dv = derive(e.right, varName);
            let udv: Expr, vdu: Expr;

            switch (e.operator) {
                case '+':
                    return reduceSum(du, dv);
                case '-':
                    return reduceSub(du, dv);
                case '*':
                    udv = reduceMultiplication(e.left, dv);
                    vdu = reduceMultiplication(du, e.right);
                    return reduceSum(udv, vdu);;
                case '/':
                    udv = reduceMultiplication(e.left, dv);
                    vdu = reduceMultiplication(du, e.right);
                    const numerator = reduceSub(vdu, udv);
                    const denominator = reduceMultiplication(e.right, e.right);
                    return reduceDivision(numerator, denominator);
                default:
                    throw new Error("Unhandled binary operation.");
            }
    }
}

function isZero(e: Expr): boolean { 
    return (e.type == 'Num' && e.value == 0) ? true : false;
}

function isOne(e: Expr): boolean  { 
    return (e.type == 'Num' && e.value == 1) ? true : false;
}

function reduceMultiplication(a: Expr, b: Expr): Expr {
    let addMinus: boolean;
    [a, b, addMinus] = factorOutMinus(a, b);
    if (isZero(a) || isZero(b))
        return {type: 'Num', value: 0};
    else if (isOne(a))
        return addMinus ? reduceUnaryMinus(1, b) : b;
    else if (isOne(b))
        return addMinus ? reduceUnaryMinus(1, a) : a;
    let tmp: BinaryExpr = {type: "BinaryExpr", left: a, operator: '*', right: b};
    return addMinus ? reduceUnaryMinus(1, tmp) : tmp;
}

function reduceDivision(a: Expr, b: Expr): Expr {
    let addMinus: boolean;
    [a, b, addMinus] = factorOutMinus(a, b);
    if (isOne(b))
        return addMinus ? reduceUnaryMinus(1, a) : a;
    let tmp: BinaryExpr = {type: "BinaryExpr", left: a, operator: '/', right: b};
    return addMinus ? reduceUnaryMinus(1, tmp) : tmp;
}

function factorOutMinus(a: Expr, b: Expr): [Expr, Expr, boolean] {
    let addMinus: boolean = false;
    if (a.type == "UnaryExpr" && b.type == "UnaryExpr") {
        a = a.operand;
        b = b.operand;
    } else if (a.type == "UnaryExpr")  {
        addMinus = true;
        a = a.operand;
    } else if (b.type == "UnaryExpr") {
        addMinus = true;
        b = b.operand;
    }
    return [a, b, addMinus];
}

function reduceSum(a: Expr, b: Expr): Expr {
    if (isZero(a))
        return b;
    else if (isZero(b))
        return a;
    return  {type: "BinaryExpr", left: a, operator: '+', right: b};
}

function reduceSub(a: Expr, b: Expr): Expr {
    if (isZero(b))
        return a;
    else if (isZero(a))
        return reduceUnaryMinus(1, b);
    return  {type: "BinaryExpr", left: a, operator: '-', right: b};
}

function reduceUnaryMinus(count: number, a: Expr): Expr {
    if (a.type == "UnaryExpr") 
        return reduceUnaryMinus(count + 1, a.operand);
    if (isZero(a)) 
        return a;
    return count % 2 == 0 ? a : {type: "UnaryExpr", operator: '-', operand: a};
} 