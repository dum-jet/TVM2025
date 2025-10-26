import { Dict, MatchResult, Semantics } from "ohm-js";
import grammar, { AddMulActionDict } from "./addmul.ohm-bundle";

export const addMulSemantics: AddMulSemantics = grammar.createSemantics() as AddMulSemantics;


const addMulCalc = {
    AddExp_plus: (x, _, y) => x.calculate() + y.calculate(),

    MulExp_times(x, _, y) {
        return x.calculate() * y.calculate();
    },

    Atom_paren(_, e, __) {
        return e.calculate();
    },
    
    number: (n) => parseInt(n.sourceString)
} satisfies AddMulActionDict<number>

addMulSemantics.addOperation<Number>("calculate()", addMulCalc);

interface AddMulDict extends Dict {
    calculate(): number;
}

interface AddMulSemantics extends Semantics
{
    (match: MatchResult): AddMulDict;
}