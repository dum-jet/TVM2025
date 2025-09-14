import { Dict, MatchResult, Semantics } from "ohm-js";
import grammar, { AddMulActionDict } from "./addmul.ohm-bundle";

export const addMulSemantics: AddMulSemantics = grammar.createSemantics() as AddMulSemantics;


const addMulCalc = {
    Exp: (e) => e.calculate(),

    AddExp_plus(x, _, y) {
        return x.calculate() + y.calculate();
    },

    AddExp(e) {
        return e.calculate();
    },

    MulExp_times(x, _, y) {
        return x.calculate() * y.calculate();
    },

    MulExp(e) {
        return e.calculate();
    },

    Atom(e) {
        return e.calculate();
    },

    Atom_paren(_, e, __) {
        return e.calculate();
    },

    number(_) {
        return parseInt(this.sourceString);
    }
} satisfies AddMulActionDict<number>

addMulSemantics.addOperation<Number>("calculate()", addMulCalc);

interface AddMulDict extends Dict {
    calculate(): number;
}

interface AddMulSemantics extends Semantics
{
    (match: MatchResult): AddMulDict;
}