import { Expr } from "../../lab04";
import { cost } from "./cost";
import { printExpr } from "../../lab04";

/*
function isApplicable(a: Expr, b: Expr) : boolean {
    if (a.type !== b.type) return false;
    switch (a.type) {
        case "Num": 
            return a.value === (b as any).value;
        case "Variable": 
            return a.name === (b as any).name;
        case "UnaryExpr": 
            return isApplicable(a.operand, (b as any).operand);
        case "BinaryExpr": {
            if (b.type === "BinaryExpr") 
                return a.operator === b.operator && isApplicable(a.left, b.left) && isApplicable(a.right, b.right);
            else
                throw new Error("binaryExpr a is not equal to b by type.");
        }
    }
}
*/

function matchVariables(rule: Expr, e: Expr) : {[x: string] : Expr} | null {
    if (rule.type === "Variable") return {[rule.name]: e};
    if (rule.type !== e.type) return null;

    switch (rule.type) {
        case "Num": 
            return rule.value === (e as any).value ? {} : null;

        case "UnaryExpr": 
            return matchVariables(rule.operand, (e as any).operand);

        case "BinaryExpr": {
            const ex = e as any;
            if (rule.operator !== ex.operator) return null;
            const leftMatch = matchVariables(rule.left, ex.left);
            if (leftMatch === null) return null;
            const rightMatch = matchVariables(rule.right, ex.right);
            if (rightMatch === null) return null;
            return {...leftMatch, ...rightMatch};
        }
    }
}

function resolveVariables(rule: Expr, match: {[x: string] : Expr}) : Expr {
    switch (rule.type) {
        case "Num": return rule;
        case "Variable": return match[rule.name] || rule;
        case "UnaryExpr": return {type: "UnaryExpr", operator: "-", operand: resolveVariables(rule.operand, match)};
        case "BinaryExpr": return {
            type: "BinaryExpr", 
            operator: rule.operator, 
            left: resolveVariables(rule.left, match), 
            right: resolveVariables(rule.right, match)
        };
    }
}


function foldConstants(e: Expr) : Expr {
    switch (e.type) {
        case "Num":
        case "Variable":
            return e;
        case "UnaryExpr":
            const foldedOperand = foldConstants(e.operand);
            if (foldedOperand.type === "Num") return {type: "Num", value: (-1) * foldedOperand.value};
            return {type: "UnaryExpr", operator: "-", operand: foldedOperand};
        case "BinaryExpr":
            const foldedLeft = foldConstants(e.left);
            const foldedRight = foldConstants(e.right);

            if (foldedLeft.type === "Num" && foldedRight.type === "Num") {
                switch (e.operator) {
                    case "+": return {type: "Num", value: foldedLeft.value + foldedRight.value};
                    case "-": return {type: "Num", value: foldedLeft.value - foldedRight.value};
                    case "*": return {type: "Num", value: foldedLeft.value * foldedRight.value};
                    case "/": {
                        if (foldedRight.value === 0) return {type: "BinaryExpr", left: foldedLeft, right: foldedRight, operator: e.operator};
                        return {type: "Num", value: foldedLeft.value / foldedRight.value};
                    }
                }
            }
            return {type: "BinaryExpr", left: foldedLeft, right: foldedRight, operator: e.operator};
    }
}

function applyIdentitiesToNode(e: Expr, identities: [Expr, Expr][]) : Expr 
{
    let currentExpr = foldConstants(e);
    let currentCost = cost(currentExpr);

    loop1:
    while (true) {
    
    loop2:
        for (const [e1, e2] of identities) {
            let match = matchVariables(e1, currentExpr);
            if (match !== null) {
                let newExpr = foldConstants(resolveVariables(e2, match));
                let newCost = cost(newExpr);
                if (newCost <= currentCost) {
                    currentExpr = newExpr;
                    currentCost = newCost;
                    continue loop1;
                }
            }
        }
        break;
    }
    return currentExpr;
}

export function simplify(e: Expr, identities: [Expr, Expr][]) : Expr
{
    const costBacklash = 2;
    let currentExpr = e;
    switch(currentExpr.type) {
        case "Num":
        case "Variable":
            return currentExpr;
        case "UnaryExpr":
            currentExpr = {
                type: "UnaryExpr",
                operator: "-",
                operand: simplify(currentExpr.operand, identities)
            };
            break;
        case "BinaryExpr":
            currentExpr = {
                type: 'BinaryExpr',
                operator: currentExpr.operator,
                left: simplify(currentExpr.left, identities),
                right: simplify(currentExpr.right, identities)
            };
            break;
    }

    let simplified = applyIdentitiesToNode(currentExpr, identities);

    return simplified;
}