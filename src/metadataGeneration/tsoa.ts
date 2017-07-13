export namespace Tsoa {
  export interface Metadata {
    Controllers: Controller[];
    ReferenceTypes: { [typeName: string]: ReferenceType };
  }

  export interface Controller {
    location: string;
    methods: Method[];
    name: string;
    path: string;
  }

  export interface Method {
    deprecated?: boolean;
    description?: string;
    method: 'get' | 'post' | 'put' | 'delete' | 'options' | 'head' | 'patch';
    name: string;
    parameters: Parameter[];
    path: string;
    type: Type;
    tags: string[];
    responses: Response[];
    security?: Security;
    summary?: string;
  }

  export interface Parameter {
    parameterName: string;
    description?: string;
    in: 'query' | 'header' | 'path' | 'formData' | 'body' | 'body-prop' | 'request';
    name: string;
    required?: boolean;
    type: Type;
    validators: Validators;
  }

  export interface Validators {
    [key: string]: { value: any, errorMsg?: string };
  }

  export interface Security {
    name: string;
    scopes?: string[];
  }

  export interface Response {
    description: string;
    name: string;
    schema?: Type;
    examples?: any;
  }

  export interface Property {
    description?: string;
    name: string;
    type: Type;
    required: boolean;
    validators: Validators;
  }

  export interface Type {
    typeName: 'string' | 'double' | 'float' | 'integer' | 'long' | 'enum' | 'array' | 'datetime' | 'date' | 'buffer' | 'void' | 'object';
  }

  export interface EnumerateType extends Type {
    typeName: 'enum';
    members: string[];
  }

  export interface ReferenceType extends Type {
    description?: string;
    properties: Property[];
    additionalProperties?: Type;
  }

  export interface ArrayType extends Type {
    typeName: 'array';
    elementType: Type;
  }
}
