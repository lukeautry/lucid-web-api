/* tslint:disable */
{{#if canImportByAlias}}
  import { ValidateParam, FieldErrors, ValidateError } from 'tsoa';
  import { Controller } from 'tsoa';
{{else}}
  import { ValidateParam, FieldErrors, ValidateError } from '../../../src/routeGeneration/templateHelpers';
  import { Controller } from '../../../src/interfaces/controller';
{{/if}}
{{#if iocModule}}
import { iocContainer } from '{{iocModule}}';
{{/if}}
{{#each controllers}}
import { {{name}} } from '{{modulePath}}';
{{/each}}
{{#if authenticationModule}}
import { expressAuthentication } from '{{authenticationModule}}';
{{/if}}

const models: any = {
  {{#each models}}
  "{{name}}": {
      {{#if properties}}
      properties: {
          {{#each properties}}
              "{{@key}}": {{{json this}}},
          {{/each}}
      },
      {{/if}}
      {{#if additionalProperties}}
      additionalProperties: {{{json additionalProperties}}},
      {{/if}}
  },
  {{/each}}
};

export function RegisterRoutes(app: any) {
    {{#each controllers}}
    {{#each actions}}
        app.{{method}}('{{../../basePath}}/{{../path}}{{path}}', 
            {{#if security}} 
            authenticateMiddleware('{{security.name}}'
                {{#if security.scopes.length}} 
                ,{{{json security.scopes}}}
                {{/if}}), 
            {{/if}} 
            function (request: any, response: any, next: any) {
            const args = {
                {{#each parameters}}
                    {{@key}}: {{{json this}}},
                {{/each}}
            };

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request);
            } catch (err) {
                return next(err);
            }

            {{#if ../../iocModule}}
            const controller = iocContainer.get<{{../name}}>({{../name}});
            {{else}}
            const controller = new {{../name}}();
            {{/if}}


            const promise = controller.{{name}}.apply(controller, validatedArgs);
            let statusCode: number | undefined = undefined;
            if (controller instanceof Controller) {
                statusCode = (controller as Controller).getStatus();
            }
            promiseHandler(promise, statusCode, response, next);
        });
    {{/each}}
    {{/each}}

    {{#if useSecurity}}
    function authenticateMiddleware(name: string, scopes: string[] = []) {
        return (request: any, response: any, next: any) => {
            expressAuthentication(request, name, scopes).then((user: any) => {
                request['user'] = user;
                next();
            })
            .catch((error: any) => {
                response.status(401);
                next(error)
            });
        }
    }
    {{/if}}

    function promiseHandler(promise: any, statusCode: any, response: any, next: any) {
        return Promise.resolve(promise)
            .then((data: any) => {
                if (data) {
                    response.json(data);
                    response.status(statusCode || 200);
                } else {
                    response.status(statusCode || 204);
                    response.end();
                }
            })
            .catch((error: any) => next(error));
    }

    function getValidatedArgs(args: any, request: any): any[] {
        const errorFields: FieldErrors = {};
        const values = Object.keys(args).map(function(key) {
            const name = args[key].name;
            switch (args[key].in) {
            case 'request':
                return request;
            case 'query':
                return ValidateParam(args[key], request.query[name], models, name, errorFields);
            case 'path':
                return ValidateParam(args[key], request.params[name], models, name, errorFields);
            case 'header':
                return ValidateParam(args[key], request.header(name), models, name, errorFields);
            case 'body':
                return ValidateParam(args[key], request.body, models, name, errorFields);
            case 'body-prop':
                return ValidateParam(args[key], request.body[name], models, name, errorFields);
            }
        });

        if (Object.keys(errorFields).length > 0) {
            throw new ValidateError(errorFields, '');
        }
        return values;
    }
}
