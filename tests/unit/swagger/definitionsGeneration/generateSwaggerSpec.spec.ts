import { expect } from 'chai';
import 'mocha';
import { getSwaggerOutputPath, SwaggerConfig } from '../../../../src/module/generate-swagger-spec';

const fakeSwaggerConfig = ({ outputDirectory, yaml, specFileBaseName, ...more }: { outputDirectory: string; yaml?: boolean; specFileBaseName?: string }) => {
  const answer: SwaggerConfig = {
    entryFile: '',
    outputDirectory,
    yaml,
    specFileBaseName,
    ...more,
  };
  return answer;
};

describe('getSwaggerOutputPath()', () => {
  it('should make the output path (base case)', () => {
    const result = getSwaggerOutputPath(
      fakeSwaggerConfig({
        outputDirectory: '.',
      }),
    );
    expect(result).to.equal('./openapi.json');
  });

  it('should make the output path (YAML)', () => {
    const result = getSwaggerOutputPath(
      fakeSwaggerConfig({
        outputDirectory: '.',
        yaml: true,
      }),
    );
    expect(result).to.equal('./openapi.yaml');
  });

  it('should make the output path (YAML, different filename)', () => {
    const result = getSwaggerOutputPath(
      fakeSwaggerConfig({
        outputDirectory: '.',
        yaml: true,
        specFileBaseName: 'api-spec',
      }),
    );
    expect(result).to.equal('./api-spec.yaml');
  });

  it('should make the output path (Different filename, Different directory)', () => {
    const result = getSwaggerOutputPath(
      fakeSwaggerConfig({
        outputDirectory: 'my-routes',
        specFileBaseName: 'private-routes',
      }),
    );
    expect(result).to.equal('my-routes/private-routes.json');
  });
});
