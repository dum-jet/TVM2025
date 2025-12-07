import { Expr } from "../../lab04";
import { cost } from "./cost";
import { printExpr } from "../../lab04";

function hashExpr(e: Expr): string {
    return printExpr(e);
}

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
            for (var key in leftMatch) {
                if (key in rightMatch && hashExpr(leftMatch[key]) !== hashExpr(rightMatch[key]))
                    return null;
            }
            return {...leftMatch, ...rightMatch};
        }
    }
}

function resolveVariables(rule: Expr, match: {[x: string] : Expr}) : Expr {
    switch (rule.type) {
        case "Num": return rule;
        case "Variable": return match[rule.name] || rule;
        case "UnaryExpr": 
            return {type: "UnaryExpr", operator: "-", operand: resolveVariables(rule.operand, match)};
        case "BinaryExpr": 
            return {
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

function collectVars(e: Expr, vars: Set<string>) {
    switch (e.type) {
        case "Num": return;
        case "Variable": vars.add(e.name); return;
        case "UnaryExpr": collectVars(e.operand, vars); return;
        case "BinaryExpr": 
            collectVars(e.left, vars); 
            collectVars(e.right, vars); 
            return;
    }
}

function sameVarSet(e1: Expr, e2: Expr): boolean {
    const e1_vars = new Set<string>();
    const e2_vars = new Set<string>();
    collectVars(e1, e1_vars);
    collectVars(e2, e2_vars);
    if (e1_vars.size !== e2_vars.size) return false;
    for (const v of e1_vars) 
        if (!e2_vars.has(v)) 
            return false;
    for (const v of e2_vars) 
        if (!e1_vars.has(v)) 
            return false;
    return true;
}

function applyIdentitiesToNode(e: Expr, identities: [Expr, Expr][]) : Expr 
{
    let currentExpr = foldConstants(e);
    let currentCost = cost(currentExpr);

    loop1:
    while (true) {
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

function getAllRewrites(e: Expr, identities: [Expr, Expr][]): Set<Expr> {
    const results = new Set<Expr>();
    // to current node 
    for (const [e1, e2] of identities) {
        const match = matchVariables(e1, e);
        if (match !== null) {  
            const newExpr = foldConstants(resolveVariables(e2, match));
            results.add(newExpr);
        }
    }

    // recursively to subnodes of e
    switch (e.type) {
        case "Num":
        case "Variable":
            break;
        case "UnaryExpr":
            for (const newOperand of getAllRewrites(e.operand, identities))
                results.add({type: "UnaryExpr", operator: e.operator, operand: newOperand});
            break;
        case "BinaryExpr":
            for (const newLeft of getAllRewrites(e.left, identities)) 
                results.add({type: "BinaryExpr", left: newLeft, operator: e.operator, right: e.right});
            
            for (const newRight of getAllRewrites(e.right, identities))
                results.add({type: "BinaryExpr", left: e.left, operator: e.operator, right: newRight});
    }
    return results;
}

function applyToRoot(e: Expr, identities: [Expr, Expr][]): Set<Expr> {
    const results = new Set<Expr>();
    for (const [e1, e2] of identities) {
        const match = matchVariables(e1, e);
        if (match !== null) {  
            const newExpr = foldConstants(resolveVariables(e2, match));
            results.add(newExpr);
        }
    }
    return results;
}

function applyRecursively(e: Expr, identities: [Expr, Expr][]): Set<Expr> {
    const results = new Set<Expr>();
    
     switch (e.type) {
        case "Num":
        case "Variable":
            return results;
        case "UnaryExpr":
            for (const newOperand of applyRecursively(e.operand, identities))
                results.add({type: "UnaryExpr", operator: e.operator, operand: newOperand});
            break;
        case "BinaryExpr":
            for (const newLeft of applyRecursively(e.left, identities)) 
                results.add({type: "BinaryExpr", left: newLeft, operator: e.operator, right: e.right});
            
            for (const newRight of applyRecursively(e.right, identities))
                results.add({type: "BinaryExpr", left: e.left, operator: e.operator, right: newRight});
    }
    for (const [e1, e2] of identities) {
        const match = matchVariables(e1, e);
        if (match !== null) {  
            const newExpr = foldConstants(resolveVariables(e2, match));
            results.add(newExpr);
        }
    }
    return results;
}

export function simplify(e: Expr, identities: [Expr, Expr][]) : Expr
{
    // turn around some of the identities
    const idents = [...identities];
    for (const [e1, e2] of identities) {
        if (e2.type === "Num"|| e2.type === "Variable") 
            continue;
        if (sameVarSet(e1, e2))
            idents.push([e2, e1]);
    }

    const visited = new Set<string>();
    let bestExpr = foldConstants(e);
    let bestCost = cost(bestExpr);
    const queue: { expr: Expr, cost: number }[] = [{expr: bestExpr, cost: bestCost}];

    const MAX_ITERATIONS = 1000; 
    const QUEUE_LIMIT = 700;
    let iteration = 0;


    while (queue.length > 0 && iteration < MAX_ITERATIONS) {
        queue.sort((a, b) => a.cost - b.cost);
    
        const current = queue.shift();

        if (current === undefined) break;
        if (current.cost < bestCost) {
            bestCost = current.cost;
            bestExpr = current.expr;
        }

        const currentHash = hashExpr(current.expr);
        if (visited.has(currentHash)) 
            continue;
        visited.add(currentHash);
        for (const r of applyRecursively(current.expr, idents)) {
            const form = foldConstants(r);
            const formHash = hashExpr(form);

            if (visited.has(formHash)) 
                continue;
            visited.add(currentHash);

            queue.push({expr: form, cost: cost(form)});
        }
        
        for (const r of applyToRoot(current.expr, idents)) {
            const form = foldConstants(r);
            const formHash = hashExpr(form);

            if (visited.has(formHash)) 
                continue;

            queue.push({expr: form, cost: cost(form)});
        }
        if (queue.length > QUEUE_LIMIT) {
            queue.sort((a, b) => a.cost - b.cost);
            queue.splice(QUEUE_LIMIT);
        }
        ++iteration;
    }

    return bestExpr;
}