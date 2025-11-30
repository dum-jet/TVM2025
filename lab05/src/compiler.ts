import { c as C, Op, I32 } from "@tvm/wasm";
import { Expr } from "@tvm/lab04";
import { buildOneFunctionModule, Fn } from "./emitHelper";
const { i32, get_local } = C;
   
export function getVariables(e: Expr): string[] {  
    const variables:string[] = [];
        
    function traverseForVariables(ex: Expr): void {
        switch (ex.type) {
            case 'Num':
                return;

            case 'Variable':
                if (!variables.includes(ex.name))
                    variables.push(ex.name);
                return;

            case 'UnaryExpr':
                traverseForVariables(ex.operand);
                return;

            case 'BinaryExpr':
                traverseForVariables(ex.left);
                traverseForVariables(ex.right);
                return;
                
            default:
                throw new Error("Unhandled expression type.");
        } 
    }

    traverseForVariables(e);
    return variables; 
}


export async function buildFunction(e: Expr, variables: string[]): Promise<Fn<number>>
{
    let expr = wasm(e, variables)
    return await buildOneFunctionModule("test", variables.length, [expr]);
}

function wasm(e: Expr, args: string[]): Op<I32> {
    switch (e.type) {
        case 'Num':
            return i32.const(e.value);

        case 'Variable':
            const index = args.indexOf(e.name);
            if (index == -1)
                throw new WebAssembly.RuntimeError();
            return get_local(i32, index);

        case 'UnaryExpr':
            if (e.operator == '-') 
                return i32.sub(i32.const(0), wasm(e.operand, args));
            else 
                throw new Error("Unhandled unary operation.");

        case 'BinaryExpr':
            const left = wasm(e.left, args);
            const right = wasm(e.right, args);
            switch (e.operator) {
                case '+':
                    return i32.add(left, right);
                case '-':
                    return i32.sub(left, right);
                case '*':
                    return i32.mul(left, right);
                case '/':
                    return i32.div_s(left, right);
                default:
                    throw new Error("Unhandled binary operation.");
            }
        default:
            throw new Error("Unhandled expression type.");
    }
}

/*const ops = {
    '*': i32.mul,
}*/
