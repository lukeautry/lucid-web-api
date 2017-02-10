import 'mocha';
import { getDefaultOptions } from '../../../fixtures/defaultOptions';
import { MetadataGenerator } from '../../../../src/metadataGeneration/metadataGenerator';
import { SpecGenerator } from '../../../../src/swagger/specGenerator';
import { VerifyPath } from '../../utilities/verifyPath';
import { VerifyPathableParameter } from '../../utilities/verifyParameter';
import * as chai from 'chai';

const expect = chai.expect;

describe('GET route generation', () => {
  const metadata = new MetadataGenerator('./tests/fixtures/controllers/getController.ts').Generate();
  const spec = new SpecGenerator(metadata, getDefaultOptions()).GetSpec();
  const baseRoute = '/GetTest';

  const getValidatedGetOperation = (actionRoute: string) => {
    const path = verifyPath(actionRoute);
    if (!path.get) { throw new Error('No get operation.'); }

    return path.get;
  };

  const getValidatedSuccessResponse = (route: string) => {
    const get = getValidatedGetOperation(route);

    const responses = get.responses;
    if (!responses) { throw new Error('No responses.'); }

    const successResponse = responses['200'];
    if (!successResponse) { throw new Error('No success response.'); }

    return successResponse;
  };

  const getValidatedParameters = (actionRoute: string) => {
    const get = getValidatedGetOperation(actionRoute);
    if (!get.parameters) { throw new Error('No operation parameters.'); }

    return get.parameters as any;
  };

  it('should generate a path for a GET route with no path argument', () => {
    verifyPath(baseRoute);
  });

  it('should generate params for date type parameter', () => {
    const parameters = getValidatedParameters(`${baseRoute}/DateParam`);

    const parameter = parameters[0];
    if (!parameter) { throw new Error('Should have one parameter.'); }

    chai.expect(parameter.type).to.equal('string');
    chai.expect(parameter.format).to.equal('date-time');
  });

  it('should generate tags for tag decorated method', () => {
    const operation = getValidatedGetOperation(`${baseRoute}/GeneratesTags`);
    chai.expect(operation.tags).to.deep.equal(['test', 'test-two']);
  });

  it('should generate a path for a GET route with no controller path argument', () => {
    const pathlessMetadata = new MetadataGenerator('./tests/fixtures/controllers/pathlessGetController.ts').Generate();
    const pathlessSpec = new SpecGenerator(pathlessMetadata, getDefaultOptions()).GetSpec();
    VerifyPath(pathlessSpec, '/Current', path => path.get, false);
  });

  it('should generate a path for a GET route with a path argument', () => {
    const actionRoute = `${baseRoute}/Current`;
    verifyPath(actionRoute);
  });

  it('should generate a parameter for path parameters', () => {
    const actionRoute = `${baseRoute}/{numberPathParam}/{booleanPathParam}/{stringPathParam}`;
    const parameters = getValidatedParameters(actionRoute);

    VerifyPathableParameter(parameters, 'booleanPathParam', 'boolean', 'path');
    VerifyPathableParameter(parameters, 'numberPathParam', 'integer', 'path');
    VerifyPathableParameter(parameters, 'stringPathParam', 'string', 'path');
  });

  it('should generate a parameter for query parameters', () => {
    const actionRoute = `${baseRoute}/{numberPathParam}/{booleanPathParam}/{stringPathParam}`;
    const parameters = getValidatedParameters(actionRoute);

    VerifyPathableParameter(parameters, 'booleanParam', 'boolean', 'query');
    VerifyPathableParameter(parameters, 'numberParam', 'integer', 'query');
    VerifyPathableParameter(parameters, 'stringParam', 'string', 'query');
  });

  it('should set a valid response type for collection responses', () => {
    const actionRoute = `${baseRoute}/Multi`;
    verifyPath(actionRoute, true);
  });

  it('should set a valid response type for union type return type', () => {
    const actionRoute = `${baseRoute}/UnionTypeResponse`;

    const paths = spec.paths;
    if (!paths) { throw new Error('No paths.'); }

    const path = paths[actionRoute];
    if (!path) { throw new Error('No path.'); }

    const getOperation = path.get;
    if (!getOperation) { throw new Error('No get operation.'); }

    const responses = getOperation.responses;
    if (!responses) { throw new Error('No responses.'); }

    const successResponse = responses['200'];
    if (!successResponse) { throw new Error('No success response.'); }

    if (!successResponse.schema) { throw new Error('No response schema.'); }
    if (!successResponse.schema.type) { throw new Error('No response schema type.'); }

    expect(successResponse.schema.type).to.equal('object');
  });

  it('should not generate a parameter for a parameter decorated with @Request', () => {
    const actionRoute = `${baseRoute}/InjectedRequest`;
    const get = getValidatedGetOperation(actionRoute);
    expect(get.parameters).not.to.be.undefined;
    if (get.parameters) {
      expect(get.parameters.length).to.equal(0);
    }
  });

  it('should not generate a parameter for a parameter decorated with @Reject', () => {
    const actionRoute = `${baseRoute}/InjectedValue`;
    const get = getValidatedGetOperation(actionRoute);
    expect(get.parameters).not.to.be.undefined;
    if (get.parameters) {
      expect(get.parameters.length).to.equal(0);
    }
  });

  it('should reject complex types as arguments', () => {
    expect(() => {
      const invalidMetadata = new MetadataGenerator('./tests/fixtures/controllers/invalidGetController.ts').Generate();
      new SpecGenerator(invalidMetadata, getDefaultOptions()).GetSpec();
    }).to.throw('Parameter \'myModel\' can\'t be passed as a query parameter.');
  });

  it('should generate a path description from jsdoc comment', () => {
    const get = getValidatedGetOperation(baseRoute);
    if (!get.description) { throw new Error('No description.'); }

    expect(get.description).to.equal('This is a description of the getModel method\r\nthis is some more text on another line');
  });

  it('should generate optional parameters from default value', () => {
    const actionRoute = `${baseRoute}/{numberPathParam}/{booleanPathParam}/{stringPathParam}`;
    const parameters = getValidatedParameters(actionRoute);

    const parameter = parameters.filter((p: any) => p.name === 'optionalStringParam')[0];
    expect(parameter).to.exist;
    expect(parameter.required).to.be.false;
  });

  it('should generate parameter description from jsdoc comment on path parameter', () => {
    verifyParameterDescription('numberPathParam');
  });

  it('should generate parameter description from jsdoc comment on query parameter', () => {
    verifyParameterDescription('numberParam');
  });

  it('should generate example from example decorator', () => {
    const response = getValidatedSuccessResponse(baseRoute);
    if (!response.examples) { throw new Error('No examples.'); }

    const jsonExample = response.examples['application/json'] as any;
    if (!jsonExample) { throw new Error('No json example.'); }

    expect(jsonExample.id).to.equal(1);
    expect(jsonExample.boolArray).to.deep.equal([true, false]);
    expect(jsonExample.boolValue).to.equal(true);
    expect(jsonExample.modelValue.email).to.equal('test@test.com');
    expect(jsonExample.modelValue.id).to.equal(100);
    expect(jsonExample.modelsArray).to.be.undefined;
    expect(jsonExample.numberArray).to.deep.equal([1, 2, 3]);
    expect(jsonExample.numberValue).to.equal(1);
    expect(jsonExample.optionalString).to.equal('optional string');
    expect(jsonExample.stringArray).to.deep.equal(['string one', 'string two']);
    expect(jsonExample.stringValue).to.equal('a string');
  });

  function verifyParameterDescription(parameterName: string) {
    const actionRoute = `${baseRoute}/{numberPathParam}/{booleanPathParam}/{stringPathParam}`;
    const parameters = getValidatedParameters(actionRoute);

    const parameter = parameters.filter((p: any) => p.name === parameterName)[0];
    expect(parameter).to.exist;
    expect(parameter.description).to.equal(`This is a description for ${parameterName}`);
  }

  function verifyPath(route: string, isCollection?: boolean) {
    return VerifyPath(spec, route, path => path.get, isCollection);
  }
});
