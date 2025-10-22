export type Expr = BinaryExpr | UnaryExpr;

export type BinaryOperator = '+' | '-' | '*' | '/';

export interface BinaryExpr {
  type: 'BinaryExpr';
  left: Expr;
  operator: BinaryOperator;
  right: Expr;
}

export interface UnaryExpr {
  type: 'UnaryExpr';
  operator: '-';
  operand: Expr;
}

export interface variable {
    type: 'variable',
    name : string
};


export interface num {
    type: 'num',
    value: number
};
