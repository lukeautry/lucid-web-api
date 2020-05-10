import { expect } from 'chai';
import 'mocha';
import { MetadataGenerator } from '../../../../src/metadataGeneration/metadataGenerator';
import { Tsoa } from '../../../../src/metadataGeneration/tsoa';
import { SpecGenerator2 } from '../../../../src/swagger/specGenerator2';
import { getDefaultExtendedOptions } from '../../../fixtures/defaultOptions';

describe('Metadata generation', () => {
  const metadata = new MetadataGenerator('./tests/fixtures/controllers/getController.ts').Generate();

  describe('ControllerGenerator', () => {
    it('should generate one controller', () => {
      expect(metadata.controllers.length).to.equal(1);
      expect(metadata.controllers[0].name).to.equal('GetTestController');
      expect(metadata.controllers[0].path).to.equal('GetTest');
    });
  });

  describe('DynamicControllerGenerator', () => {
    it("should should throw 'globs found 0 controllers.'", () => {
      expect(() => {
        // Non existing controllers folder to get 0 controllers found error
        const NON_CONTROLLER_EXISTS_GLOB = './tests/unit/swagger';
        new MetadataGenerator('./tests/fixtures/express-dynamic-controllers/server.ts', undefined, [], [NON_CONTROLLER_EXISTS_GLOB]).Generate();
      }).to.throw(/globs found 0 controllers./);
    });
  });

  describe('MethodGenerator', () => {
    const parameterMetadata = new MetadataGenerator('./tests/fixtures/controllers/methodController.ts').Generate();
    const controller = parameterMetadata.controllers[0];
    const definedMethods = [
      'getMethod',
      'postMethod',
      'patchMethod',
      'putMethod',
      'deleteMethod',
      'description',
      'tags',
      'multiResponse',
      'decoratorVariousValues',
      'successResponse',
      'oauthOrAPIkeySecurity',
      'apiSecurity',
      'oauthSecurity',
      'deprecatedMethod',
      'summaryMethod',
      'oauthAndAPIkeySecurity',
      'returnAnyType',
      'returnAliasedVoidType',
    ];

    it('should only generate the defined methods', () => {
      expect(controller.methods.filter(m => definedMethods.indexOf(m.name) === -1).length).to.equal(0);
    });

    it('should generate the defined methods', () => {
      expect(definedMethods.filter(methodName => controller.methods.map(m => m.name).indexOf(methodName) === -1).length).to.equal(0);
    });

    it('should generate get method', () => {
      const method = controller.methods.find(m => m.name === 'getMethod');
      if (!method) {
        throw new Error('Method getMethod not defined!');
      }

      expect(method.method).to.equal('get');
      expect(method.path).to.equal('Get');
    });

    it('should generate post method', () => {
      const method = controller.methods.find(m => m.name === 'postMethod');
      if (!method) {
        throw new Error('Method postMethod not defined!');
      }

      expect(method.method).to.equal('post');
      expect(method.path).to.equal('Post');
    });

    it('should generate patch method', () => {
      const method = controller.methods.find(m => m.name === 'patchMethod');
      if (!method) {
        throw new Error('Method patchMethod not defined!');
      }

      expect(method.method).to.equal('patch');
      expect(method.path).to.equal('Patch');
    });

    it('should generate put method', () => {
      const method = controller.methods.find(m => m.name === 'putMethod');
      if (!method) {
        throw new Error('Method putMethod not defined!');
      }

      expect(method.method).to.equal('put');
      expect(method.path).to.equal('Put');
    });

    it('should generate delete method', () => {
      const method = controller.methods.find(m => m.name === 'deleteMethod');
      if (!method) {
        throw new Error('Method deleteMethod not defined!');
      }

      expect(method.method).to.equal('delete');
      expect(method.path).to.equal('Delete');
    });

    it('should generate method description', () => {
      const method = controller.methods.find(m => m.name === 'description');
      if (!method) {
        throw new Error('Method description not defined!');
      }

      expect(method.description).to.equal('method description');
    });

    it('should generate tags', () => {
      const method = controller.methods.find(m => m.name === 'tags');
      if (!method) {
        throw new Error('Method tags not defined!');
      }

      expect(method.tags).to.deep.equal(['Tag1', 'Tag2', 'Tag3']);
    });

    it('should generate multi response', () => {
      const method = controller.methods.find(m => m.name === 'multiResponse');
      if (!method) {
        throw new Error('Method multiResponse not defined!');
      }

      expect(method.responses.length).to.equal(4);

      const badResponse = method.responses[0];
      expect(badResponse.name).to.equal('400');
      expect(badResponse.description).to.equal('Bad Request');

      const unauthResponse = method.responses[1];
      expect(unauthResponse.name).to.equal('401');
      expect(unauthResponse.description).to.equal('Unauthorized');

      const defaultResponse = method.responses[2];
      expect(defaultResponse.name).to.equal('default');
      expect(defaultResponse.description).to.equal('Unexpected error');
      expect(defaultResponse.examples).to.deep.equal({ status: 500, message: 'Something went wrong!' });

      const successResponse = method.responses[3];
      expect(successResponse.name).to.equal('200');
      expect(successResponse.description).to.equal('Ok');
    });

    it('should get decorator values passed by different ways', () => {
      const method = controller.methods.find(m => m.name === 'decoratorVariousValues');
      if (!method) {
        throw new Error('Method decoratorVariousValues not defined!');
      }

      expect(method.responses.length).to.equal(4);

      const valuesFromObject = method.responses[0];
      expect(valuesFromObject.name).to.equal('401');
      expect(valuesFromObject.description).to.equal('Unauthorized');

      const enumNumber = method.responses[1];
      expect(enumNumber.name).to.equal(400);
      expect(enumNumber.description).to.equal('Bad Request');

      const enumString = method.responses[2];
      expect(enumString.name).to.equal('404');
      expect(enumString.description).to.equal('Not Found');

      const success = method.responses[3];
      expect(success.name).to.equal(201);
      expect(success.description).to.equal('Created');

      if (!method.security) {
        throw new Error('Security decorator not defined!');
      }

      const security = method.security[0];
      expect(security).to.haveOwnProperty('JWT2');
      expect(security.JWT2).to.deep.equal(['permission:admin', 'permission:owner']);

      const objSecurity = method.security[1];
      expect(objSecurity).to.deep.equal({
        firstSec: [],
        secondSec: ['permission:admin', 'permission:owner'],
      });

      expect(method.tags).to.deep.equal(['EnumTag1']);
    });

    it('should generate success response', () => {
      const method = controller.methods.find(m => m.name === 'successResponse');
      if (!method) {
        throw new Error('Method successResponse not defined!');
      }

      expect(method.responses.length).to.equal(1);

      const mainResponse = method.responses[0];
      expect(mainResponse.name).to.equal('201');
      expect(mainResponse.description).to.equal('Created');
    });

    it('should generate 204 response on aliased voids', () => {
      const method = controller.methods.find(m => m.name === 'returnAliasedVoidType');
      if (!method) {
        throw new Error('Method returnAliasedVoidType not defined!');
      }

      expect(method.responses.length).to.equal(1);

      const mainResponse = method.responses[0];
      expect(mainResponse.name).to.equal('204');
      expect(mainResponse.description).to.equal('No content');
    });

    it('should generate api security', () => {
      const method = controller.methods.find(m => m.name === 'apiSecurity');
      if (!method) {
        throw new Error('Method apiSecurity not defined!');
      }
      if (!method.security) {
        throw new Error('Security decorator not defined!');
      }
      expect(method.security[0].api_key).to.deep.equal([]);
    });

    it('should generate oauth2 security', () => {
      const method = controller.methods.find(m => m.name === 'oauthSecurity');
      if (!method) {
        throw new Error('Method oauthSecurity not defined!');
      }
      if (!method.security) {
        throw new Error('Security decorator not defined!');
      }
      expect(method.security[0].tsoa_auth).to.deep.equal(['write:pets', 'read:pets']);
    });

    it('should generate oauth2 or api key security', () => {
      const method = controller.methods.find(m => m.name === 'oauthOrAPIkeySecurity');
      if (!method) {
        throw new Error('Method OauthOrAPIkeySecurity not defined!');
      }
      if (!method.security) {
        throw new Error('Security decorator not defined!');
      }
      expect(method.security[0].tsoa_auth).to.deep.equal(['write:pets', 'read:pets']);
      expect(method.security[1].api_key).to.deep.equal([]);
    });

    it('should generate oauth2 and api key security', () => {
      const method = controller.methods.find(m => m.name === 'oauthAndAPIkeySecurity');
      if (!method) {
        throw new Error('Method OauthAndAPIkeySecurity not defined!');
      }
      if (!method.security) {
        throw new Error('Security decorator not defined!');
      }
      expect(method.security[0].tsoa_auth).to.deep.equal(['write:pets', 'read:pets']);
      expect(method.security[0].api_key).to.deep.equal([]);
    });

    it('should generate deprecated method true', () => {
      const method = controller.methods.find(m => m.name === 'deprecatedMethod');
      if (!method) {
        throw new Error('Method deprecatedMethod not defined!');
      }

      expect(method.deprecated).to.equal(true);
    });

    it('should generate deprecated method false', () => {
      const method = controller.methods.find(m => m.name === 'oauthSecurity');
      if (!method) {
        throw new Error('Method oauthSecurity not defined!');
      }

      expect(method.deprecated).to.equal(false);
    });

    it('should generate summary method', () => {
      const method = controller.methods.find(m => m.name === 'summaryMethod');
      if (!method) {
        throw new Error('Method summaryMethod not defined!');
      }

      expect(method.summary).to.equal('simple summary');
    });
  });

  describe('ParameterGenerator', () => {
    const parameterMetadata = new MetadataGenerator('./tests/fixtures/controllers/parameterController.ts').Generate();
    const controller = parameterMetadata.controllers[0];

    it('should generate a query parameter', () => {
      const method = controller.methods.find(m => m.name === 'getQuery');
      if (!method) {
        throw new Error('Method getQuery not defined!');
      }

      expect(method.parameters.length).to.equal(7);

      const firstnameParam = method.parameters[0];
      expect(firstnameParam.in).to.equal('query');
      expect(firstnameParam.name).to.equal('firstname');
      expect(firstnameParam.parameterName).to.equal('firstname');
      expect(firstnameParam.description).to.equal('Firstname description');
      expect(firstnameParam.required).to.be.true;
      expect(firstnameParam.type.dataType).to.equal('string');

      const lastnameParam = method.parameters[1];
      expect(lastnameParam.in).to.equal('query');
      expect(lastnameParam.name).to.equal('last_name');
      expect(lastnameParam.parameterName).to.equal('lastname');
      expect(lastnameParam.description).to.equal('Lastname description');
      expect(lastnameParam.required).to.be.true;
      expect(lastnameParam.type.dataType).to.equal('string');

      const ageParam = method.parameters[2];
      expect(ageParam.in).to.equal('query');
      expect(ageParam.name).to.equal('age');
      expect(ageParam.parameterName).to.equal('age');
      expect(ageParam.description).to.equal('Age description');
      expect(ageParam.required).to.be.true;
      expect(ageParam.type.dataType).to.equal('integer');

      const weightParam = method.parameters[3];
      expect(weightParam.in).to.equal('query');
      expect(weightParam.name).to.equal('weight');
      expect(weightParam.parameterName).to.equal('weight');
      expect(weightParam.description).to.equal('Weight description');
      expect(weightParam.required).to.be.true;
      expect(weightParam.type.dataType).to.equal('float');

      const humanParam = method.parameters[4];
      expect(humanParam.in).to.equal('query');
      expect(humanParam.name).to.equal('human');
      expect(humanParam.parameterName).to.equal('human');
      expect(humanParam.description).to.equal('Human description');
      expect(humanParam.required).to.be.true;
      expect(humanParam.type.dataType).to.equal('boolean');

      const genderParam = method.parameters[5];
      expect(genderParam.in).to.equal('query');
      expect(genderParam.name).to.equal('gender');
      expect(genderParam.parameterName).to.equal('gender');
      expect(genderParam.description).to.equal('Gender description');
      expect(genderParam.required).to.be.true;
      expect(genderParam.type.dataType).to.equal('refEnum');

      const nicknamesParam = method.parameters[6] as Tsoa.ArrayParameter;
      expect(nicknamesParam.in).to.equal('query');
      expect(nicknamesParam.name).to.equal('nicknames');
      expect(nicknamesParam.parameterName).to.equal('nicknames');
      expect(nicknamesParam.description).to.equal('Nicknames description');
      expect(nicknamesParam.required).to.be.true;
      expect(nicknamesParam.type.dataType).to.equal('array');
      expect(nicknamesParam.collectionFormat).to.equal('multi');
      expect(nicknamesParam.type.elementType).to.deep.equal({ dataType: 'string' });
    });

    it('should generate an path parameter', () => {
      const method = controller.methods.find(m => m.name === 'getPath');
      if (!method) {
        throw new Error('Method getPath not defined!');
      }

      expect(method.parameters.length).to.equal(6);

      const firstnameParam = method.parameters[0];
      expect(firstnameParam.in).to.equal('path');
      expect(firstnameParam.name).to.equal('firstname');
      expect(firstnameParam.parameterName).to.equal('firstname');
      expect(firstnameParam.description).to.equal('Firstname description');
      expect(firstnameParam.required).to.be.true;
      expect(firstnameParam.type.dataType).to.equal('string');

      const lastnameParam = method.parameters[1];
      expect(lastnameParam.in).to.equal('path');
      expect(lastnameParam.name).to.equal('last_name');
      expect(lastnameParam.parameterName).to.equal('lastname');
      expect(lastnameParam.description).to.equal('Lastname description');
      expect(lastnameParam.required).to.be.true;
      expect(lastnameParam.type.dataType).to.equal('string');

      const ageParam = method.parameters[2];
      expect(ageParam.in).to.equal('path');
      expect(ageParam.name).to.equal('age');
      expect(ageParam.parameterName).to.equal('age');
      expect(ageParam.description).to.equal('Age description');
      expect(ageParam.required).to.be.true;
      expect(ageParam.type.dataType).to.equal('integer');

      const weightParam = method.parameters[3];
      expect(weightParam.in).to.equal('path');
      expect(weightParam.name).to.equal('weight');
      expect(weightParam.parameterName).to.equal('weight');
      expect(weightParam.description).to.equal('Weight description');
      expect(weightParam.required).to.be.true;
      expect(weightParam.type.dataType).to.equal('float');

      const humanParam = method.parameters[4];
      expect(humanParam.in).to.equal('path');
      expect(humanParam.name).to.equal('human');
      expect(humanParam.parameterName).to.equal('human');
      expect(humanParam.description).to.equal('Human description');
      expect(humanParam.required).to.be.true;
      expect(humanParam.type.dataType).to.equal('boolean');

      const genderParam = method.parameters[5];
      expect(genderParam.in).to.equal('path');
      expect(genderParam.name).to.equal('gender');
      expect(genderParam.parameterName).to.equal('gender');
      expect(genderParam.description).to.equal('Gender description');
      expect(genderParam.required).to.be.true;
      expect(genderParam.type.dataType).to.equal('refEnum');
    });

    it('should generate an path parameter from colon delimiter path params', () => {
      const method = controller.methods.find(m => m.name === 'getPathColonDelimiter');
      if (!method) {
        throw new Error('Method getPathColonDelimiter not defined!');
      }

      expect(method.parameters.length).to.equal(6);

      const firstnameParam = method.parameters[0];
      expect(firstnameParam.in).to.equal('path');
      expect(firstnameParam.name).to.equal('firstname');
      expect(firstnameParam.parameterName).to.equal('firstname');
      expect(firstnameParam.description).to.equal('Firstname description');
      expect(firstnameParam.required).to.be.true;
      expect(firstnameParam.type.dataType).to.equal('string');

      const lastnameParam = method.parameters[1];
      expect(lastnameParam.in).to.equal('path');
      expect(lastnameParam.name).to.equal('last_name');
      expect(lastnameParam.parameterName).to.equal('lastname');
      expect(lastnameParam.description).to.equal('Lastname description');
      expect(lastnameParam.required).to.be.true;
      expect(lastnameParam.type.dataType).to.equal('string');

      const ageParam = method.parameters[2];
      expect(ageParam.in).to.equal('path');
      expect(ageParam.name).to.equal('age');
      expect(ageParam.parameterName).to.equal('age');
      expect(ageParam.description).to.equal('Age description');
      expect(ageParam.required).to.be.true;
      expect(ageParam.type.dataType).to.equal('integer');

      const weightParam = method.parameters[3];
      expect(weightParam.in).to.equal('path');
      expect(weightParam.name).to.equal('weight');
      expect(weightParam.parameterName).to.equal('weight');
      expect(weightParam.description).to.equal('Weight description');
      expect(weightParam.required).to.be.true;
      expect(weightParam.type.dataType).to.equal('float');

      const humanParam = method.parameters[4];
      expect(humanParam.in).to.equal('path');
      expect(humanParam.name).to.equal('human');
      expect(humanParam.parameterName).to.equal('human');
      expect(humanParam.description).to.equal('Human description');
      expect(humanParam.required).to.be.true;
      expect(humanParam.type.dataType).to.equal('boolean');

      const genderParam = method.parameters[5];
      expect(genderParam.in).to.equal('path');
      expect(genderParam.name).to.equal('gender');
      expect(genderParam.parameterName).to.equal('gender');
      expect(genderParam.description).to.equal('Gender description');
      expect(genderParam.required).to.be.true;
      expect(genderParam.type.dataType).to.equal('refEnum');
    });

    it('should generate an header parameter', () => {
      const method = controller.methods.find(m => m.name === 'getHeader');
      if (!method) {
        throw new Error('Method getHeader not defined!');
      }

      expect(method.parameters.length).to.equal(6);

      const firstnameParam = method.parameters[0];
      expect(firstnameParam.in).to.equal('header');
      expect(firstnameParam.name).to.equal('firstname');
      expect(firstnameParam.parameterName).to.equal('firstname');
      expect(firstnameParam.description).to.equal('Firstname description');
      expect(firstnameParam.required).to.be.true;
      expect(firstnameParam.type.dataType).to.equal('string');

      const lastnameParam = method.parameters[1];
      expect(lastnameParam.in).to.equal('header');
      expect(lastnameParam.name).to.equal('last_name');
      expect(lastnameParam.parameterName).to.equal('lastname');
      expect(lastnameParam.description).to.equal('Lastname description');
      expect(lastnameParam.required).to.be.true;
      expect(lastnameParam.type.dataType).to.equal('string');

      const ageParam = method.parameters[2];
      expect(ageParam.in).to.equal('header');
      expect(ageParam.name).to.equal('age');
      expect(ageParam.parameterName).to.equal('age');
      expect(ageParam.description).to.equal('Age description');
      expect(ageParam.required).to.be.true;
      expect(ageParam.type.dataType).to.equal('integer');

      const weightParam = method.parameters[3];
      expect(weightParam.in).to.equal('header');
      expect(weightParam.name).to.equal('weight');
      expect(weightParam.parameterName).to.equal('weight');
      expect(weightParam.description).to.equal('Weight description');
      expect(weightParam.required).to.be.true;
      expect(weightParam.type.dataType).to.equal('float');

      const humanParam = method.parameters[4];
      expect(humanParam.in).to.equal('header');
      expect(humanParam.name).to.equal('human');
      expect(humanParam.parameterName).to.equal('human');
      expect(humanParam.description).to.equal('Human description');
      expect(humanParam.required).to.be.true;
      expect(humanParam.type.dataType).to.equal('boolean');

      const genderParam = method.parameters[5];
      expect(genderParam.in).to.equal('header');
      expect(genderParam.name).to.equal('gender');
      expect(genderParam.parameterName).to.equal('gender');
      expect(genderParam.description).to.equal('Gender description');
      expect(genderParam.required).to.be.true;
      expect(genderParam.type.dataType).to.equal('refEnum');
    });

    it('should generate an request parameter', () => {
      const method = controller.methods.find(m => m.name === 'getRequest');
      if (!method) {
        throw new Error('Method getRequest not defined!');
      }
      const parameter = method.parameters.find(param => param.parameterName === 'request');
      if (!parameter) {
        throw new Error('Parameter request not defined!');
      }

      expect(method.parameters.length).to.equal(1);
      expect(parameter.description).to.equal('Request description');
      expect(parameter.in).to.equal('request');
      expect(parameter.name).to.equal('request');
      expect(parameter.parameterName).to.equal('request');
      expect(parameter.required).to.be.true;
      expect(parameter.type.dataType).to.equal('object');
    });

    it('should generate an body parameter', () => {
      const method = controller.methods.find(m => m.name === 'getBody');
      if (!method) {
        throw new Error('Method getBody not defined!');
      }
      const parameter = method.parameters.find(param => param.parameterName === 'body');
      if (!parameter) {
        throw new Error('Parameter body not defined!');
      }

      expect(method.parameters.length).to.equal(1);
      expect(parameter.description).to.equal('Body description');
      expect(parameter.in).to.equal('body');
      expect(parameter.name).to.equal('body');
      expect(parameter.parameterName).to.equal('body');
      expect(parameter.required).to.be.true;
    });

    it('should generate an body props parameter', () => {
      const method = controller.methods.find(m => m.name === 'getBodyProps');
      if (!method) {
        throw new Error('Method getBodyProps not defined!');
      }
      const parameter = method.parameters.find(param => param.parameterName === 'firstname');
      if (!parameter) {
        throw new Error('Parameter firstname not defined!');
      }

      expect(method.parameters.length).to.equal(6);
      expect(parameter.description).to.equal('firstname description');
      expect(parameter.in).to.equal('body-prop');
      expect(parameter.name).to.equal('firstname');
      expect(parameter.parameterName).to.equal('firstname');
      expect(parameter.required).to.be.true;
    });

    it('Should inline enums for TS Enums in path, query and header when using Swagger', () => {
      const spec = new SpecGenerator2(parameterMetadata, getDefaultExtendedOptions()).GetSpec();
      const method = spec.paths['/ParameterTest/Path/{firstname}/{last_name}/{age}/{weight}/{human}/{gender}'].get;

      if (!method || !method.parameters) {
        throw new Error("Method or it's parameters are not defined!");
      }

      const genderParam = method.parameters.find(p => p.name === 'gender');

      if (!genderParam) {
        throw new Error('genderParam not defined!');
      }

      expect(genderParam.in).to.equal('path');
      expect(genderParam.name).to.equal('gender');
      expect(genderParam.description).to.equal('Gender description');
      expect(genderParam.required).to.be.true;
      expect(genderParam.enum).to.deep.equal(['MALE', 'FEMALE']);
    });
  });

  describe('HiddenMethodGenerator', () => {
    const parameterMetadata = new MetadataGenerator('./tests/fixtures/controllers/hiddenMethodController.ts').Generate();
    const controller = parameterMetadata.controllers[0];

    it('should mark methods as visible by default', () => {
      const method = controller.methods.find(m => m.name === 'normalGetMethod');
      if (!method) {
        throw new Error('Method normalGetMethod not defined!');
      }

      expect(method.method).to.equal('get');
      expect(method.path).to.equal('normalGetMethod');
      expect(method.isHidden).to.equal(false);
    });

    it('should mark methods as hidden', () => {
      const method = controller.methods.find(m => m.name === 'hiddenGetMethod');
      if (!method) {
        throw new Error('Method hiddenGetMethod not defined!');
      }

      expect(method.method).to.equal('get');
      expect(method.path).to.equal('hiddenGetMethod');
      expect(method.isHidden).to.equal(true);
    });
  });

  describe('HiddenControllerGenerator', () => {
    const parameterMetadata = new MetadataGenerator('./tests/fixtures/controllers/hiddenController.ts').Generate();
    const controller = parameterMetadata.controllers[0];

    it('should mark all methods as hidden', () => {
      expect(controller.methods).to.have.lengthOf(2);
      controller.methods.forEach(method => {
        expect(method.isHidden).to.equal(true);
      });
    });
  });

  describe('ControllerWithCommonResponsesGenerator', () => {
    const parameterMetadata = new MetadataGenerator('./tests/fixtures/controllers/controllerWithCommonResponses.ts').Generate();
    const controller = parameterMetadata.controllers[0];

    it('should add common responses to every method', () => {
      expect(controller.methods).to.have.lengthOf(2);
      controller.methods.forEach(method => {
        expect(method.responses.length).to.equal(2);

        let response = method.responses[0];
        expect(response.name).to.equal('401');
        expect(response.description).to.equal('Unauthorized');

        response = method.responses[1];
        expect(response.name).to.equal('200');
        expect(response.description).to.equal('Ok');
      });
    });
  });

  describe('DeprecatedMethodGenerator', () => {
    const parameterMetadata = new MetadataGenerator('./tests/fixtures/controllers/deprecatedController.ts').Generate();
    const controller = parameterMetadata.controllers[0];

    it('should generate normal method', () => {
      const method = controller.methods.find(m => m.name === 'normalGetMethod');
      if (!method) {
        throw new Error('Method normalGetMethod not defined!');
      }

      expect(method.method).to.equal('get');
      expect(method.path).to.equal('normalGetMethod');
      expect(method.deprecated).to.equal(false);
    });

    it('should generate deprecated method', () => {
      const method = controller.methods.find(m => m.name === 'deprecatedGetMethod');
      if (!method) {
        throw new Error('Method deprecatedGetMethod not defined!');
      }

      expect(method.method).to.equal('get');
      expect(method.path).to.equal('deprecatedGetMethod');
      expect(method.deprecated).to.equal(true);
    });
  });
});
