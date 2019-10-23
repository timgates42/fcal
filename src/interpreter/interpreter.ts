import Decimal from 'decimal.js';
import { FcalError } from '../FcalError';
import { TT } from '../lex/token';
import { Expr } from '../parser/expr';
import { Parser } from '../parser/parser';
import { Type } from '../types/datatype';
import { Phrases } from '../types/phrase';
import { Unit } from '../types/units';
import { Environment } from './environment';
import { FcalFunction } from './function';

export class Interpreter implements Expr.IVisitor<any> {
  private ast: Expr;
  private environment: Environment;
  constructor(source: string, phrases: Phrases, units: Unit.List, environment: Environment) {
    const parser = new Parser(source, phrases, units);
    this.environment = environment;
    this.ast = parser.parse();
  }

  public visitCallExpr(expr: Expr.Call): Type {
    const name = expr.name;
    let call: FcalFunction | undefined;
    call = this.environment.functions.get(name);
    if (call) {
      if (call.arbity !== -1) {
        if (call.arbity !== expr.argument.length) {
          FcalError.throwWithEnd(
            expr.start,
            expr.end,
            `function ${name} Expected ${call.arbity} args but got ${expr.argument.length}`,
          );
        }
      }
      const argument = Array<Type>();
      for (const param of expr.argument) {
        argument.push(this.evaluate(param));
      }
      return call.call(this.environment, argument);
    }
    throw FcalError.ErrorWithEnd(expr.start, expr.end, `${name} is not callable`);
  }
  public visitAssignExpr(expr: Expr.Assign): Type {
    const value = this.evaluate(expr.value);
    this.environment.set(expr.name, value);
    return value;
  }
  public visitVariableExpr(expr: Expr.Variable): Type {
    return this.environment.get(expr.name);
  }
  public evaluateExpression(): Type {
    const value = this.evaluate(this.ast);
    this.environment.set('_', value);
    return value;
  }

  public visitUnitConvertionExpr(expr: Expr.UnitConvertionExpr): Type {
    const value = this.evaluate(expr.expression);
    if (value instanceof Type.Numberic) {
      return Type.UnitNumber.convertToUnit(value as Type.Numberic, expr.unit);
    }
    throw FcalError.ErrorWithEnd(expr.start, expr.end, 'Expecting numeric value before in');
  }
  public visitUnitExpr(expr: Expr.UnitExpr): Type {
    const value = this.evaluate(expr.expression);
    if (value instanceof Type.Numberic) {
      return Type.UnitNumber.New((value as Type.Numberic).number, expr.unit);
    }
    throw FcalError.ErrorWithEnd(expr.start, expr.end, 'Expecting numeric value before unit');
  }

  public visitBinaryExpr(expr: Expr.Binary): Type.BNumber {
    let left = this.evaluate(expr.left) as Type.BNumber;
    const right = this.evaluate(expr.right) as Type.BNumber;
    switch (expr.operator.type) {
      case TT.PLUS:
        return left.Add(right);
      case TT.MINUS:
        return left.Sub(right);
      case TT.TIMES:
        return left.times(right);
      case TT.SLASH:
        return left.divide(right);
      case TT.MOD:
        if (right.isZero()) {
          return new Type.BNumber('Infinity');
        }
        return left.modulo(right);
      case TT.CAP:
        if (left.isNegative()) {
          if (!right.isInteger()) {
            FcalError.throwWithEnd(
              expr.left.start,
              expr.right.end,
              `Pow of operation results in complex number and complex is not supported yet`,
            );
          }
        }
        return left.power(right);
      case TT.OF:
        left = new Type.Percentage(left.number);
        const per = left as Type.Percentage;
        right.number = per.percentageValue(right.number);
        return right;
      default:
        return Type.BNumber.ZERO;
    }
  }

  public visitGroupingExpr(expr: Expr.Grouping): Type {
    return this.evaluate(expr.expression);
  }

  public visitLiteralExpr(expr: Expr.Literal): Type {
    return expr.value;
  }

  public visitUnaryExpr(expr: Expr.Unary): Type.BNumber {
    const right = this.evaluate(expr.right) as Type.BNumber;
    if (expr.operator.type === TT.MINUS) {
      return right.negated();
    }
    return right;
  }

  public visitPercentageExpr(expr: Expr.Percentage): Type {
    const value = this.evaluate(expr.expression);
    if (value instanceof Type.Numberic) {
      return Type.Percentage.New((value as Type.Numberic).number);
    }
    throw FcalError.ErrorWithEnd(expr.start, expr.end, 'Expecting numeric value in percentage');
  }
  public setValues(values: { [index: string]: Type | number | string | Decimal }) {
    for (const key in values) {
      if (values.hasOwnProperty(key)) {
        const element = values[key];
        this.environment.set(key, element);
      }
    }
  }
  private evaluate(expr: Expr): Type {
    const ast = expr.accept(this);
    return ast;
  }
}
