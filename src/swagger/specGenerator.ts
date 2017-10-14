import { Tsoa } from '../metadataGeneration/tsoa';
import { SwaggerConfig } from './../config';
import { Swagger } from './swagger';

export class SpecGenerator {
  constructor(private readonly metadata: Tsoa.Metadata, private readonly config: SwaggerConfig) { }

  public GetSpec(isInternalDoc: boolean = false) {
    let spec: Swagger.Spec = {
      basePath: this.config.basePath,
      consumes: ['application/json'],
      definitions: this.buildDefinitions(),
      info: {
        title: '',
      },
      paths: this.buildPaths(isInternalDoc),
      produces: ['application/json'],
      swagger: '2.0',
    };

    spec.securityDefinitions = this.config.securityDefinitions
      ? this.config.securityDefinitions
      : {};

    if (this.config.name) { spec.info.title = this.config.name; }
    if (this.config.version) { spec.info.version = this.config.version; }
    if (this.config.host) { spec.host = this.config.host; }
    if (this.config.description) { spec.info.description = this.config.description; }
    if (this.config.license) { spec.info.license = { name: this.config.license }; }
    if (this.config.spec) {
      this.config.specMerging = this.config.specMerging || 'immediate';
      const mergeFuncs: { [key: string]: any } = {
        immediate: Object.assign,
        recursive: require('merge').recursive,
      };

      spec = mergeFuncs[this.config.specMerging](spec, this.config.spec);
    }

    if (isInternalDoc && this.config.internal) {
      if (this.config.internal.name) {
        spec.info.title = this.config.internal.name;
      }
      if (this.config.internal.description) {
        spec.info.description = this.config.internal.description;
      }
    }

    return spec;
  }

  private buildDefinitions() {
    const definitions: { [definitionsName: string]: Swagger.Schema } = {};
    Object.keys(this.metadata.referenceTypeMap).map(typeName => {
      const referenceType = this.metadata.referenceTypeMap[typeName];

      // Object definition
      if (referenceType.properties) {
        const required = referenceType.properties.filter(p => p.required).map(p => p.name);
        definitions[referenceType.refName] = {
          description: referenceType.description,
          properties: this.buildProperties(referenceType.properties),
          required: required && required.length > 0 ? Array.from(new Set(required)) : undefined,
          type: 'object',
        };

        if (referenceType.additionalProperties) {
          definitions[referenceType.refName].additionalProperties = this.buildAdditionalProperties(referenceType.additionalProperties);
        }
      }

      // Enum definition
      if (referenceType.enums) {
        definitions[referenceType.refName] = {
          description: referenceType.description,
          enum: referenceType.enums,
          type: 'string',
        };
      }
    });

    return definitions;
  }

  private buildPaths(isInternalDoc: boolean) {
    const paths: { [pathName: string]: Swagger.Path } = {};

    this.metadata.controllers.filter(c => {
      if (isInternalDoc && c.isInternal || !isInternalDoc && !c.isInternal) {
        return true;
      } else if (isInternalDoc && !c.isInternal) {
        // if controller has internal method or has method with internal parameters
        return c.methods.find(m =>
          m.isInternal || !!m.parameters.find(p => !!p.isInternal),
        );
      }
      return false;
    }).forEach(controller => {
      // construct documentation using all methods except @Hidden
      controller.methods
        .filter(method => !method.isHidden)
        .filter(m => {
          if (isInternalDoc && (controller.isInternal || m.isInternal || m.parameters.find(p => !!p.isInternal)) ||
              !isInternalDoc && !controller.isInternal && !m.isInternal) {
            return true;
          }
          return false;
        })
        .forEach(method => {
          const path = `${controller.path ? `/${controller.path}` : ''}${method.path}`;
          paths[path] = paths[path] || {};
          this.buildMethod(controller.name, method, paths[path], isInternalDoc);
        });
    });
    return paths;
  }

  private buildMethod(controllerName: string, method: Tsoa.Method, pathObject: any, isInternalDoc: boolean) {
    const pathMethod: Swagger.Operation = pathObject[method.method] = this.buildOperation(controllerName, method);
    pathMethod.description = method.description;
    pathMethod.summary = method.summary;
    pathMethod.tags = method.tags;

    if (method.deprecated) {
      pathMethod.deprecated = method.deprecated;
    }
    if (method.security) {

      const methodSecurity: any[] = [];
      for (const thisSecurity of method.security) {
        const security: any = {};
        security[thisSecurity.name] = thisSecurity.scopes ? thisSecurity.scopes : [];
        methodSecurity.push(security);
      }

      pathMethod.security = methodSecurity;
    }

    pathMethod.parameters = method.parameters
      .filter(p => {
        // if internal query/header parameter and we are generating non private documentation
        if (!isInternalDoc && p.isInternal && ['query', 'header'].indexOf(p.in) > -1) {
          return false;
        }
        return !(p.in === 'request' || p.in === 'body-prop');
      })
      .map(p => this.buildParameter(p));

    const bodyPropParameter = this.buildBodyPropParameter(controllerName, method);
    if (bodyPropParameter) {
      pathMethod.parameters.push(bodyPropParameter);
    }
    if (pathMethod.parameters.filter((p: Swagger.BaseParameter) => p.in === 'body').length > 1) {
      throw new Error('Only one body parameter allowed per controller method.');
    }
  }

  private buildBodyPropParameter(controllerName: string, method: Tsoa.Method) {
    const properties = {} as { [name: string]: Swagger.Schema };
    const required: string[] = [];

    method.parameters
      .filter(p => p.in === 'body-prop')
      .forEach(p => {
        properties[p.name] = this.getSwaggerType(p.type);
        properties[p.name].default = p.default;
        properties[p.name].description = p.description;

        // if (!properties[p.name].$ref) {
        // }
        if (p.required) {
          required.push(p.name);
        }
      });

    if (!Object.keys(properties).length) { return; }

    const parameter = {
      in: 'body',
      name: 'body',
      schema: {
        properties,
        title: `${this.getOperationId(controllerName, method.name)}Body`,
        type: 'object',
      },
    } as Swagger.Parameter;
    if (required.length) {
      parameter.schema.required = required;
    }
    return parameter;
  }

  private buildParameter(source: Tsoa.Parameter): Swagger.Parameter {
    let parameter = {
      default: source.default,
      description: source.description,
      in: source.in,
      name: source.name,
      required: source.required,
    } as Swagger.Parameter;

    const parameterType = this.getSwaggerType(source.type);
    parameter.format = parameterType.format || undefined;

    if (parameter.in === 'query' && parameter.type === 'array') {
      (parameter as Swagger.QueryParameter).collectionFormat = 'multi';
    }

    if (parameterType.$ref) {
      parameter.schema = parameterType as Swagger.Schema;
      return parameter;
    }

    const validatorObjs = {};
    Object.keys(source.validators)
      .filter(key => {
        return !key.startsWith('is') && key !== 'minDate' && key !== 'maxDate';
      })
      .forEach((key: string) => {
        validatorObjs[key] = source.validators[key].value;
      });

    if (source.in === 'body' && source.type.dataType === 'array') {
      parameter.schema = {
        items: parameterType.items,
        type: 'array',
      };
    } else {
      if (source.type.dataType === 'any') {
        if (source.in === 'body') {
          parameter.schema = { type: 'object' };
        } else {
          parameter.type = 'string';
        }
      } else {
        parameter.type = parameterType.type;
        parameter.items = parameterType.items;
        parameter.enum = parameterType.enum;
      }
    }

    if (parameter.schema) {
      parameter.schema = Object.assign({}, parameter.schema, validatorObjs);
    } else {
      parameter = Object.assign({}, parameter, validatorObjs);
    }

    return parameter;
  }

  private buildProperties(source: Tsoa.Property[]) {
    const properties: { [propertyName: string]: Swagger.Schema } = {};

    source.forEach(property => {
      const swaggerType = this.getSwaggerType(property.type);
      swaggerType.description = property.description;
      if (!swaggerType.$ref) {
        swaggerType.default = property.default;

        Object.keys(property.validators)
          .filter(key => {
            return !key.startsWith('is') && key !== 'minDate' && key !== 'maxDate';
          })
          .forEach(key => {
            swaggerType[key] = property.validators[key].value;
          });
      }
      properties[property.name] = swaggerType as Swagger.Schema;
    });

    return properties;
  }

  private buildAdditionalProperties(type: Tsoa.Type) {
    return this.getSwaggerType(type);
  }

  private buildOperation(controllerName: string, method: Tsoa.Method): Swagger.Operation {
    const swaggerResponses: any = {};

    method.responses.forEach((res: Tsoa.Response) => {
      swaggerResponses[res.name] = {
        description: res.description,
      };
      if (res.schema && res.schema.dataType !== 'void') {
        swaggerResponses[res.name].schema = this.getSwaggerType(res.schema);
      }
      if (res.examples) {
        swaggerResponses[res.name].examples = { 'application/json': res.examples };
      }
    });

    return {
      operationId: this.getOperationId(controllerName, method.name),
      produces: ['application/json'],
      responses: swaggerResponses,
    };
  }

  private getOperationId(controllerName: string, methodName: string) {
    const controllerNameWithoutSuffix = controllerName.replace(new RegExp('Controller$'), '');
    return `${controllerNameWithoutSuffix}${methodName.charAt(0).toUpperCase() + methodName.substr(1)}`;
  }

  private getSwaggerType(type: Tsoa.Type): Swagger.Schema {
    const swaggerType = this.getSwaggerTypeForPrimitiveType(type);
    if (swaggerType) {
      return swaggerType;
    }

    if (type.dataType === 'array') {
      return this.getSwaggerTypeForArrayType(type as Tsoa.ArrayType);
    }

    if (type.dataType === 'enum') {
      return this.getSwaggerTypeForEnumType(type as Tsoa.EnumerateType);
    }

    return this.getSwaggerTypeForReferenceType(type as Tsoa.ReferenceType) as Swagger.Schema;
  }

  private getSwaggerTypeForPrimitiveType(type: Tsoa.Type): Swagger.Schema | undefined {
    const map = {
      any: { type: 'object' },
      binary: { type: 'string', format: 'binary' },
      boolean: { type: 'boolean' },
      buffer: { type: 'string', format: 'byte' },
      byte: { type: 'string', format: 'byte' },
      date: { type: 'string', format: 'date' },
      datetime: { type: 'string', format: 'date-time' },
      double: { type: 'number', format: 'double' },
      float: { type: 'number', format: 'float' },
      integer: { type: 'integer', format: 'int32' },
      long: { type: 'integer', format: 'int64' },
      object: { type: 'object' },
      string: { type: 'string' },
    } as { [name: string]: Swagger.Schema };

    return map[type.dataType];
  }

  private getSwaggerTypeForArrayType(arrayType: Tsoa.ArrayType): Swagger.Schema {
    return { type: 'array', items: this.getSwaggerType(arrayType.elementType) };
  }

  private getSwaggerTypeForEnumType(enumType: Tsoa.EnumerateType): Swagger.Schema {
    return { type: 'string', enum: enumType.enums.map(member => String(member)) };
  }

  private getSwaggerTypeForReferenceType(referenceType: Tsoa.ReferenceType): Swagger.BaseSchema {
    return { $ref: `#/definitions/${referenceType.refName}` };
  }
}
