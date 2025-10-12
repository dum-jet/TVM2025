import { MatchResult } from "ohm-js";
import grammar, { ArithmeticActionDict, ArithmeticSemantics } from "./arith.ohm-bundle";
import { log } from "console";

export const arithSemantics: ArithSemantics = grammar.createSemantics() as ArithSemantics;

const arithCalc = {
    Expr(e) { 
        return e.calculate(this.args.params); 
    },

    AddExpr(it1, it2, e) {
        const nodes = it1.children.map(c => c.calculate(this.args.params));
        const operations = it2.children;
        let ans = 0;
        let sign = 1;
        for (let i = 0; i < nodes.length; ++i) {
            ans += sign * nodes[i];
            sign = operations[i].sourceString == "-" ? -1 : 1;
        }
        ans += sign * e.calculate(this.args.params);
        return ans;
    },

    MulExpr(it1, it2, e) {
        const nodes = it1.children.map(c => c.calculate(this.args.params));
        const operations = it2.children;
        let ans = 1;
        let flag = 0;
        for (let i = 0; i < nodes.length; ++i) {
            if (flag == 0) {
                ans *= nodes[i];
            } else {
                if (nodes[i] == 0) throw new Error("Division by zero");
                ans /= nodes[i];
            }
            flag = operations[i].sourceString == "*" ? 0 : 1;
        }
        if (flag == 0) {
            ans *= e.calculate(this.args.params);
        } else {
            const eCalculated = e.calculate(this.args.params);
            if (eCalculated == 0) throw new Error("Division by zero");
            ans /= e.calculate(this.args.params);
        }
        return ans;
    },


    Atom(e) {
        return e.calculate(this.args.params);
    },

    Atom_paren(_, e, __) {
        return e.calculate(this.args.params);
    },

    Atom_neg(_, e) {
        return (-1) * e.calculate(this.args.params);
    },

    variable(_, __) {
        const varName = this.sourceString;
        if (varName in this.args.params) {
            return this.args.params[varName];
        } else {
            return NaN;
        }
    },

    number(_) {
        return parseInt(this.sourceString);
    },
    
} satisfies ArithmeticActionDict<number | undefined>;


arithSemantics.addOperation<Number>("calculate(params)", arithCalc);


export interface ArithActions {
    calculate(params: {[name:string]: number}): number;
}

export interface ArithSemantics extends ArithmeticSemantics
{
    (match: MatchResult): ArithActions;
}
