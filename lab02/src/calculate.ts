import { ReversePolishNotationActionDict} from "./rpn.ohm-bundle";

export const rpnCalc = {
    RpnExpr_plus(x, y, _) {
        return x.calculate() + y.calculate();
    },

    RpnExpr_times(x, y, _) {
        return x.calculate() * y.calculate();
    },

    RpnExpr(e) {
        return e.calculate();
    },

    number(_) {
        return parseInt(this.sourceString);
    }
} satisfies ReversePolishNotationActionDict<number>;
