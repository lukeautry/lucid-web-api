/**
 * This is a description of a model
 */
export interface TestModel extends Model {
  /**
   * This is a description of this model property, numberValue
   */
  numberValue: number;
  numberArray: number[];
  stringValue: string;
  stringArray: string[];
  boolValue: boolean;
  boolArray: boolean[];
  modelValue: TestSubModel;
  modelsArray: TestSubModel[];
  dateValue?: Date;
  optionalString?: string;
}

export interface TestSubModel extends Model {
  email: string;
}

export interface Model {
  id: number;
}

export class TestClassBaseModel {
  public id: number;
}

export class TestClassModel extends TestClassBaseModel {
  public publicStringProperty: string;
  public optionalPublicStringProperty?: string;
  protected protectedStringProperty: string;

  constructor(
    public publicConstructorVar: string,
    protected protectedConstructorVar: string,
    public optionalPublicConstructorVar?: string
  ) {
    super();
  }
}
