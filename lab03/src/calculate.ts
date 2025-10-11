import { MatchResult } from "ohm-js";
import grammar, { ArithmeticActionDict, ArithmeticSemantics } from "./arith.ohm-bundle";

export const arithSemantics: ArithSemantics = grammar.createSemantics() as ArithSemantics;

const arithCalc = {
    Expr(e) { 
        return e.calculate(this.args.params); 
    },

    AddExpr_plus(x, _, y) {
        return x.calculate(this.args.params) + y.calculate(this.args.params);
    },

    AddExpr_minus(x, _, y) {
        return x.calculate(this.args.params) - y.calculate(this.args.params);
    },

    AddExpr(e) {
        return e.calculate(this.args.params);
    },

    MulExpr_times(x, _, y) {
        return x.calculate(this.args.params) * y.calculate(this.args.params);
    },

    MulExpr_division(x, _, y) {
        const yCalculated = y.calculate(this.args.params);
        if (yCalculated == 0) {
            throw new Error("Division by zero")
        }
        return x.calculate(this.args.params) / y.calculate(this.args.params);
    },

    MulExpr(e) {
        return e.calculate(this.args.params);
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
    }
    
} satisfies ArithmeticActionDict<number | undefined>;


arithSemantics.addOperation<Number>("calculate(params)", arithCalc);


export interface ArithActions {
    calculate(params: {[name:string]: number}): number;
}

export interface ArithSemantics extends ArithmeticSemantics
{
    (match: MatchResult): ArithActions;
}
