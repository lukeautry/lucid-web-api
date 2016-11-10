import { expressTemplate } from './templates/express';
import { InjectType, Metadata, Type, ArrayType, ReferenceType, Parameter, Property } from '../metadataGeneration/metadataGenerator';
import { RoutesConfig } from './../config';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as path from 'path';
import * as tsfmt from 'typescript-formatter';

const appRoot: string = require('app-root-path').path;

export class RouteGenerator {
  constructor(private readonly metadata: Metadata, private readonly options: RoutesConfig) { }

  public GenerateRoutes(middlewareTemplate: string) {
    const fileName = `${this.options.routesDir}/routes.ts`;
    const content = this.buildContent(middlewareTemplate);

    return new Promise<void>((resolve, reject) => {
      tsfmt.processString(fileName, content, {} as any)
        .then(result => {
          fs.writeFile(fileName, result.dest, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }
        );
    });
  }

  public GenerateExpressRoutes() {
    return this.GenerateRoutes(expressTemplate);
  }

  private buildContent(middlewareTemplate: string) {
    let canImportByAlias: boolean;
    try {
      require('tsoa');
      canImportByAlias = true;
    } catch (err) {
      canImportByAlias = false;
    }

    const routesTemplate = handlebars.compile(`
            /**
             * THIS IS GENERATED CODE - DO NOT EDIT
             */
            /* tslint:disable */
            import {ValidateParam} from '${canImportByAlias ? 'tsoa' : '../../src/routeGeneration/templateHelpers'}';
            {{#each controllers}}
            import { {{name}} } from '{{modulePath}}';
            {{/each}}

            const models: any = {
                {{#each models}}
                '{{name}}': {
                    {{#each properties}}
                        '{{name}}': { typeName: '{{typeName}}', required: {{required}} {{#if arrayType}}, arrayType: '{{arrayType}}' {{/if}} },
                    {{/each}}
                },
                {{/each}}
            };
        `.concat(middlewareTemplate));

    return routesTemplate({
      basePath: this.options.basePath === '/' ? '' : this.options.basePath,
      controllers: this.metadata.Controllers.map(controller => {
        return {
          actions: controller.methods.map(method => {
            const bodyParameter = method.parameters.find(parameter => parameter.in === 'body');
            return {
              bodyParamName: bodyParameter ? bodyParameter.name : undefined,
              method: method.method.toLowerCase(),
              name: method.name,
              parameters: method.parameters.map(parameter => this.getTemplateProperty(parameter)),
              path: this.getExpressPath(method.path)
            };
          }),
          jwtUserProperty: controller.jwtUserProperty,
          modulePath: this.getRelativeImportPath(controller.location),
          name: controller.name,
          path: controller.path
        };
      }),
      models: this.getModels()
    });
  }

  private getModels(): TemplateModel[] {
    return Object.keys(this.metadata.ReferenceTypes).map(key => {
      const referenceType = this.metadata.ReferenceTypes[key];

      return {
        name: key,
        properties: referenceType.properties.map(property => this.getTemplateProperty(property))
      };
    });
  }

  private getStringRepresentationOfType(type: Type): string {
    if (typeof type === 'string' || type instanceof String) {
      return type as string;
    }

    const arrayType = type as ArrayType;
    if (arrayType.elementType) {
      return 'array';
    }

    return (type as ReferenceType).name;
  }

  private getRelativeImportPath(controllerLocation: string) {
    controllerLocation = controllerLocation.replace('.ts', '');
    return `./${path.relative(path.join(appRoot, this.options.routesDir), controllerLocation).replace(/\\/g, '/')}`;
  }

  private getTemplateProperty(source: Parameter | Property) {
    const templateProperty: TemplateProperty = {
      name: source.name,
      required: source.required,
      typeName: this.getStringRepresentationOfType(source.type)
    };
    const parameter = source as Parameter;
    if (parameter.injected) {
      templateProperty.injected = parameter.injected;
    }

    const arrayType = source.type as ArrayType;
    if (arrayType.elementType) {
      templateProperty.arrayType = this.getStringRepresentationOfType(arrayType.elementType);
    }

    return templateProperty;
  }

  private getExpressPath(path: string) {
    return path.replace(/{/g, ':').replace(/}/g, '');
  }
}

interface TemplateModel {
  name: string;
  properties: TemplateProperty[];
}

interface TemplateProperty {
  name: String;
  typeName: string;
  required: boolean;
  arrayType?: string;
  injected?: InjectType;
}
