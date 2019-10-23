import Big = require('decimal.js');
import { NumberSystem } from './numberSystem';
import { UnitMeta } from './units';
export abstract class Type {
  public abstract TYPE: DATATYPE;
  public abstract TYPERANK: TYPERANK;
  public abstract print(): string;
  public toString(): string {
    return this.print();
  }
}

export enum DATATYPE {
  NUMBER,
  UNIT,
  PERCENTAGE,
}
export enum TYPERANK {
  PERCENTAGE,
  NUMBER,
  UNIT,
}

/**
 * Represents a type of variable or value
 */
// tslint:disable-next-line:no-namespace
export namespace Type {
  export abstract class Numberic extends Type {
    public number: Big.Decimal;
    public leftflag: boolean;
    public numberSys: NumberSystem;
    constructor(value: string | Big.Decimal | number) {
      super();
      if (value instanceof Big.Decimal) {
        this.number = value;
      } else {
        this.number = new Big.Decimal(value);
      }
      this.numberSys = NumberSystem.Decimal;
      this.leftflag = false;
    }
    public setSystem(numberSys: NumberSystem) {
      this.numberSys = numberSys;
    }
    public toNumericString(): string {
      return this.numberSys.to(this.number);
    }
    public print(): string {
      return this.toNumericString();
    }

    public Add(value: Numberic): Numberic {
      // check type to see which datatype operation
      // if both type is same na right variable operation
      this.leftflag = true;
      if (this.TYPE >= value.TYPE) {
        // check typerandk to see which will be the return type
        if (this.TYPERANK <= value.TYPERANK) {
          return value.newNumeric(this.plus(value).number);
        }
        return this.plus(value);
      }
      if (value.TYPERANK >= this.TYPERANK) {
        return value.plus(this);
      }
      return this.newNumeric(value.plus(this).number);
    }

    public Sub(value: Numberic): Numberic {
      return this.Add(value.negated());
    }

    public times(value: Numberic): Numberic {
      // check type to see which datatype operation
      // if both type is same na right variable operation
      this.leftflag = true;
      if (this.TYPE >= value.TYPE) {
        // check typerandk to see which will be the return type
        if (this.TYPERANK <= value.TYPERANK) {
          return value.newNumeric(this.mul(value).number);
        }
        return this.mul(value);
      }
      if (value.TYPERANK >= this.TYPERANK) {
        return value.mul(this);
      }
      return this.newNumeric(value.mul(this).number);
    }

    public divide(value: Numberic): Numberic {
      // console.log(`DIVIDE ${this.number.toString()} ${value.number.toString()}`);
      // check type to see which datatype operation
      // if both type is same na right variable operation
      this.leftflag = true;
      if (this.TYPE >= value.TYPE) {
        // check typerandk to see which will be the return type
        if (this.TYPERANK <= value.TYPERANK) {
          if (this.TYPERANK === value.TYPERANK) {
            return this.newNumeric(this.div(value).number);
          }
          return value.newNumeric(this.div(value).number);
        }
        return this.div(value);
      }
      if (value.TYPERANK >= this.TYPERANK) {
        return value.div(this);
      }
      return this.newNumeric(value.div(this).number);
    }

    public power(value: Numberic): Numberic {
      // console.log(`CAP ${this.number.toString()} ${value.number.toString()}`);
      // check type to see which datatype operation
      // if both type is same na right variable operation
      this.leftflag = true;
      if (this.TYPE >= value.TYPE) {
        // check typerandk to see which will be the return type
        if (this.TYPERANK <= value.TYPERANK) {
          if (this.TYPERANK === value.TYPERANK) {
            return this.newNumeric(this.pow(value).number);
          }
          return value.newNumeric(this.pow(value).number);
        }
        return this.pow(value);
      }
      if (value.TYPERANK >= this.TYPERANK) {
        return value.pow(this);
      }
      return this.newNumeric(value.pow(this).number);
    }

    public modulo(value: Numberic): Numberic {
      // check type to see which datatype operation
      // if both type is same na right variable operation
      this.leftflag = true;
      if (this.TYPE >= value.TYPE) {
        // check typerandk to see which will be the return type
        if (this.TYPERANK <= value.TYPERANK) {
          if (this.TYPERANK === value.TYPERANK) {
            return this.newNumeric(this.mod(value).number);
          }
          return value.newNumeric(this.mod(value).number);
        }
        return this.mod(value);
      }
      if (value.TYPERANK >= this.TYPERANK) {
        return value.mod(this);
      }
      return this.newNumeric(value.mod(this).number);
    }

    public abstract newNumeric(value: Big.Decimal): Numberic;
    public abstract isZero(): boolean;
    public abstract isNegative(): boolean;
    public abstract isInteger(): boolean;
    public abstract negated(): Numberic;
    public abstract plus(value: Numberic): Numberic;
    public abstract mul(value: Numberic): Numberic;
    public abstract div(value: Numberic): Numberic;
    public abstract pow(value: Numberic): Numberic;
    public abstract mod(value: Numberic): Numberic;
  }
  /**
   * Basic Number type
   */
  export class BNumber extends Numberic {
    public static ZERO = BNumber.New(new Big.Decimal(0));
    public static New(value: string | Big.Decimal | number) {
      return new BNumber(value);
    }
    public TYPERANK: TYPERANK;
    public TYPE: DATATYPE;
    constructor(value: string | Big.Decimal | number) {
      super(value);
      this.TYPE = DATATYPE.NUMBER;
      this.TYPERANK = TYPERANK.NUMBER;
    }
    public isZero(): boolean {
      return this.number.isZero();
    }
    public isNegative(): boolean {
      return this.number.isNegative();
    }
    public isInteger(): boolean {
      return this.number.isInteger();
    }
    public negated(): Numberic {
      return BNumber.New(this.number.negated());
    }
    public div(value: Numberic): Numberic {
      return BNumber.New(this.number.div(value.number));
    }
    public pow(value: Numberic): Numberic {
      return BNumber.New(this.number.pow(value.number));
    }
    public mod(value: Numberic): Numberic {
      return BNumber.New(this.number.modulo(value.number));
    }
    public mul(value: Numberic): Numberic {
      // if (value instanceof BNumber) {
      // }
      return BNumber.New(this.number.mul(value.number));
      // return value.mul(value.newNumeric(this.number));
    }
    public plus(value: Numberic): Numberic {
      // if (value instanceof BNumber) {
      // }
      return BNumber.New(this.number.plus(value.number));
      // return value.plus(value.newNumeric(this.number));
    }
    public newNumeric(value: Big.Decimal): Numberic {
      return BNumber.New(value);
    }
  }
  /**
   * Percentage type
   */
  export class Percentage extends Numberic {
    public static New(value: string | Big.Decimal): Percentage {
      return new Percentage(value);
    }
    private static base = new Big.Decimal(100);
    public TYPE: DATATYPE;
    public TYPERANK: TYPERANK;
    constructor(value: string | Big.Decimal) {
      super(value);
      this.TYPE = DATATYPE.PERCENTAGE;
      this.TYPERANK = TYPERANK.PERCENTAGE;
    }
    public isZero(): boolean {
      return this.number.isZero();
    }
    public isNegative(): boolean {
      return this.number.isNegative();
    }
    public isInteger(): boolean {
      return this.number.isInteger();
    }
    public negated(): Numberic {
      return Percentage.New(this.number.negated());
    }
    public plus(value: Numberic): Numberic {
      if (value.TYPE === DATATYPE.PERCENTAGE) {
        return Percentage.New(this.number.plus(value.number));
      }
      return Percentage.New(value.number.plus(this.percentageValue(value.number)));
    }
    public mul(value: Numberic): Numberic {
      if (value.TYPE === DATATYPE.PERCENTAGE) {
        return Percentage.New(this.number.mul(value.number));
      }
      return Percentage.New(value.number.mul(this.percentageValue(value.number)));
    }
    public div(value: Numberic): Numberic {
      if (value.TYPE === DATATYPE.PERCENTAGE) {
        return Percentage.New(this.number.div(value.number));
      }
      if (value.leftflag) {
        return Percentage.New(value.number.div(this.percentageValue(value.number)));
      }
      return Percentage.New(this.percentageValue(value.number).div(value.number));
    }
    public pow(value: Numberic): Numberic {
      if (value.TYPE === DATATYPE.PERCENTAGE) {
        return Percentage.New(this.number.pow(value.number));
      }
      if (value.leftflag) {
        return Percentage.New(value.number.pow(this.percentageValue(value.number)));
      }
      return Percentage.New(this.percentageValue(value.number).pow(value.number));
    }
    public mod(value: Numberic): Numberic {
      if (value.TYPE === DATATYPE.PERCENTAGE) {
        return Percentage.New(this.number.mod(value.number));
      }
      if (value.leftflag) {
        return Percentage.New(value.number.mod(this.percentageValue(value.number)));
      }
      return Percentage.New(this.percentageValue(value.number).mod(value.number));
    }
    public percentageValue(value: Big.Decimal): Big.Decimal {
      return value.mul(this.number.div(Percentage.base));
    }
    public print(): string {
      return `% ${this.toNumericString()}`;
    }
    public newNumeric(value: Big.Decimal): Numberic {
      return Percentage.New(value);
    }
  }
  /**
   * Number with unit
   */
  export class UnitNumber extends Numberic {
    public static New(value: string | Big.Decimal, unit: UnitMeta): UnitNumber {
      return new UnitNumber(value, unit);
    }
    public static convertToUnit(value: Numberic, unit: UnitMeta): UnitNumber {
      if (value instanceof UnitNumber) {
        const value2 = value as UnitNumber;
        if (value2.unit.id === unit.id && value2.unit.unitType !== unit.unitType) {
          return UnitNumber.New(value2.convert(unit.ratio, unit.bias), unit);
        }
      }
      return UnitNumber.New(value.number, unit);
    }
    public TYPE: DATATYPE;
    public TYPERANK: TYPERANK;
    public unit: UnitMeta;
    constructor(value: string | Big.Decimal, unit: UnitMeta) {
      super(value);
      this.unit = unit;
      this.TYPE = DATATYPE.UNIT;
      this.TYPERANK = TYPERANK.UNIT;
    }

    public newNumeric(value: Big.Decimal): Numberic {
      return new UnitNumber(value, this.unit);
    }
    public isZero(): boolean {
      return this.number.isZero();
    }
    public isNegative(): boolean {
      return this.number.isNegative();
    }
    public isInteger(): boolean {
      return this.number.isInteger();
    }
    public negated(): Numberic {
      return this.newNumeric(this.number.negated());
    }
    public plus(value: Numberic): Numberic {
      if (value instanceof UnitNumber) {
        const right = value as UnitNumber;
        if (this.unit.id === right.unit.id && this.unit.unitType === right.unit.unitType) {
          return this.newNumeric(this.number.add(right.number));
        }
        if (this.unit.id !== right.unit.id) {
          return right.newNumeric(this.number.add(right.number));
        }
        return right.newNumeric(this.convert(right.unit.ratio, right.unit.bias).add(right.number));
      }
      return this.newNumeric(this.number.plus(value.number));
    }
    public mul(value: Numberic): Numberic {
      if (value instanceof UnitNumber) {
        const right = value as UnitNumber;
        if (this.unit.id === right.unit.id && this.unit.unitType === right.unit.unitType) {
          return this.newNumeric(this.number.mul(right.number));
        }
        if (this.unit.id !== right.unit.id) {
          return right.newNumeric(this.number.mul(right.number));
        }
        return right.newNumeric(this.convert(right.unit.ratio, right.unit.bias).mul(right.number));
      }
      return this.newNumeric(this.number.mul(value.number));
    }
    public div(value: Numberic): Numberic {
      let left: Numberic;
      let right: Numberic;
      if (this.leftflag) {
        left = this;
        right = value;
      } else {
        right = this;
        left = value;
      }
      if (value instanceof UnitNumber) {
        const left1: UnitNumber = left as UnitNumber;
        const right1: UnitNumber = right as UnitNumber;
        if (left1.unit.unitType === right1.unit.unitType) {
          return left1.newNumeric(left1.number.div(right1.number));
        }
        if (left1.unit.id !== right1.unit.id) {
          return left1.newNumeric(left1.number.div(right.number));
        }
        return left1.newNumeric(left1.number.div(right1.convert(left1.unit.ratio, left1.unit.bias)));
      }
      return this.newNumeric(left.number.div(right.number));
    }
    public pow(value: Numberic): Numberic {
      let left: Numberic;
      let right: Numberic;
      if (this.leftflag) {
        left = this;
        right = value;
      } else {
        right = this;
        left = value;
      }
      if (value instanceof UnitNumber) {
        const left1: UnitNumber = left as UnitNumber;
        const right1: UnitNumber = right as UnitNumber;
        if (left1.unit.unitType === right1.unit.unitType) {
          return left1.newNumeric(left1.number.pow(right1.number));
        }

        if (left1.unit.id !== right1.unit.id) {
          return left1.newNumeric(left1.number.pow(right.number));
        }

        return left1.newNumeric(left1.number.pow(right1.convert(left1.unit.ratio, left1.unit.bias)));
      }

      return this.newNumeric(left.number.pow(right.number));
    }
    public mod(value: Numberic): Numberic {
      let left: Numberic;
      let right: Numberic;

      if (this.leftflag) {
        left = this;
        right = value;
      } else {
        right = this;
        left = value;
      }

      if (value instanceof UnitNumber) {
        const left1: UnitNumber = left as UnitNumber;
        const right1: UnitNumber = right as UnitNumber;

        if (left1.unit.id !== right1.unit.id) {
          return left1.newNumeric(left1.number.mod(right1.number));
        }

        if (left1.unit.unitType === right1.unit.unitType) {
          return left1.newNumeric(left1.number.mod(right1.number));
        }

        return left1.newNumeric(left1.number.mod(right1.convert(left1.unit.ratio, left1.unit.bias)));
      }

      return this.newNumeric(left.number.mod(right.number));
    }

    public convert(ratio: Big.Decimal, bias: Big.Decimal): Big.Decimal {
      return this.number
        .mul(this.unit.ratio)
        .add(this.unit.bias)
        .minus(bias)
        .div(ratio);
    }

    public print(): string {
      if (this.number.lessThanOrEqualTo(1) && !this.number.isNegative()) {
        return `${this.toNumericString()} ${this.unit.singular}`;
      }
      return `${this.toNumericString()} ${this.unit.plural}`;
    }
  }
}
