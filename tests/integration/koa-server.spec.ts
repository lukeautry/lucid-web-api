import 'mocha';
import { server } from '../fixtures/koa/server';
import { TestModel, TestClassModel, Model, ParameterTestModel } from '../fixtures/testModel';
import * as chai from 'chai';
import * as request from 'supertest';

const expect = chai.expect;
const basePath = '/v1';

describe('Koa Server', () => {
  it('can handle get request with no path argument', () => {
    return verifyGetRequest(basePath + '/GetTest', (err, res) => {
      const model = res.body as TestModel;
      expect(model.id).to.equal(1);
    });
  });

  it('can handle get request with path argument', () => {
    return verifyGetRequest(basePath + '/GetTest/Current', (err, res) => {
      const model = res.body as TestModel;
      expect(model.id).to.equal(1);
    });
  });

  it('can handle get request with collection return value', () => {
    return verifyGetRequest(basePath + '/GetTest/Multi', (err, res) => {
      const models = res.body as TestModel[];
      expect(models.length).to.equal(3);
      models.forEach(m => {
        expect(m.id).to.equal(1);
      });
    });
  });

  it('can handle get request with path and query parameters', () => {
    return verifyGetRequest(basePath + `/GetTest/${1}/${true}/test?booleanParam=true&stringParam=test1234&numberParam=1234`, (err, res) => {
      const model = res.body as TestModel;
      expect(model.id).to.equal(1);
    });
  });

  it('returns error if missing required query parameter', () => {
    return verifyGetRequest(basePath + `/GetTest/${1}/${true}/test?booleanParam=true&stringParam=test1234`, (err: any, res: any) => {
      expect(JSON.parse(err.text).message).to.equal('numberParam is a required parameter.');
    }, 400);
  });

  it('parsed body parameters', () => {
    const data = getFakeModel();

    return verifyPostRequest(basePath + '/PostTest', data, (err: any, res: any) => {
      const model = res.body as TestModel;
      expect(model).to.deep.equal(model);
    });
  });

  it('parses class model as body parameter', () => {
    const data = getFakeClassModel();

    return verifyPostRequest(basePath + '/PostTest/WithClassModel', data, (err: any, res: any) => {
      const model = res.body as TestClassModel;
      expect(model.id).to.equal(700); // this gets changed on the server
    });
  });

  it('should reject invalid strings', () => {
    const invalidValues = [null, 1, undefined, {}];

    return Promise.all(invalidValues.map((value: any) => {
      const data = getFakeModel();
      data.stringValue = value;

      return verifyPostRequest(basePath + '/PostTest', data, (err: any, res: any) => null, 400);
    }));
  });

  it('should parse valid date', () => {
    const data = getFakeModel();
    data.dateValue = '2016-01-01T00:00:00Z' as any;

    return verifyPostRequest(basePath + '/PostTest', data, (err: any, res: any) => {
      expect(res.body.dateValue).to.equal('2016-01-01T00:00:00.000Z');
    }, 200);
  });

  it('should parse valid date as query param', () => {
    return verifyGetRequest(basePath + '/GetTest/DateParam?date=2016-01-01T00:00:00Z', (err: any, res: any) => {
      expect(res.body.dateValue).to.equal('2016-01-01T00:00:00.000Z');
    }, 200);
  });

  it('should reject invalid dates', () => {
    const invalidValues = [1, {}];

    return Promise.all(invalidValues.map((value: any) => {
      const data = getFakeModel();
      data.dateValue = value;

      return verifyPostRequest(basePath + '/PostTest', data, (err: any, res: any) => null, 400);
    }));
  });

  it('should reject invalid numbers', () => {
    const invalidValues = ['test', null, undefined, {}];

    return Promise.all(invalidValues.map((value: any) => {
      const data = getFakeModel();
      data.numberValue = value;

      return verifyPostRequest(basePath + '/PostTest', data, (err: any, res: any) => null, 400);
    }));
  });

  it('returns error if missing required path parameter', () => {
    return verifyGetRequest(basePath + `/GetTest/${1}/${true}?booleanParam=true&stringParam=test1234`, (err: any, res: any) => {
      expect(err.text).to.equal('Not Found');
    }, 404);
  });

  it('returns error if invalid request', () => {
    const data = getFakeModel();
    data.dateValue = 1 as any;

    return verifyPostRequest(basePath + '/PostTest', data, (err: any, res: any) => {
      expect(JSON.parse(err.text).message).to.equal('dateValue should be a valid ISO 8601 date, i.e. YYYY-MM-DDTHH:mm:ss');
    }, 400);
  });

  it('returns error if thrown in controller', () => {
    return verifyGetRequest(basePath + '/GetTest/ThrowsError', (err: any, res: any) => {
      expect(JSON.parse(err.text).message).to.equal('error thrown');
    }, 400);
  });


  describe('Security', () => {
    it('can handle get request with access_token user id == 1', () => {
      return verifyGetRequest(basePath + '/SecurityTest/Koa?access_token=abc123456', (err, res) => {
        const model = res.body as Model;
        expect(model.id).to.equal(1);
      });
    });

    it('can handle get request with access_token user id == 2', () => {
      return verifyGetRequest(basePath + '/SecurityTest/Koa?access_token=xyz123456', (err, res) => {
        const model = res.body as Model;
        expect(model.id).to.equal(2);
      });
    });
  });

  describe('Parameter data', () => {
    it('parses query parameters', () => {
      return verifyGetRequest(basePath + '/ParameterTest/Query?firstname=Tony&last_name=Stark&age=45&human=true', (err, res) => {
        const model = res.body as ParameterTestModel;
        expect(model.firstname).to.equal('Tony');
        expect(model.lastname).to.equal('Stark');
        expect(model.age).to.equal(45);
        expect(model.human).to.equal(true);
      });
    });

    it('parses path parameters', () => {
      return verifyGetRequest(basePath + '/ParameterTest/Path/Tony/Stark/45/true', (err, res) => {
        const model = res.body as ParameterTestModel;
        expect(model.firstname).to.equal('Tony');
        expect(model.lastname).to.equal('Stark');
        expect(model.age).to.equal(45);
        expect(model.human).to.equal(true);
      });
    });

    it('parses header parameters', () => {
      return verifyRequest((err, res) => {
        const model = res.body as ParameterTestModel;
        expect(model.firstname).to.equal('Tony');
        expect(model.lastname).to.equal('Stark');
        expect(model.age).to.equal(45);
        expect(model.human).to.equal(true);
      }, (request) => {
        return request
          .get(basePath + '/ParameterTest/Header')
          .set({
            'age': 45,
            'firstname': 'Tony',
            'human': true,
            'last_name': 'Stark',
          });
      }, 200);
    });

    it('parses request parameters', () => {
      return verifyGetRequest(basePath + '/ParameterTest/Request?firstname=Tony&lastname=Stark&age=45&human=true', (err, res) => {
        const model = res.body as ParameterTestModel;
        expect(model.firstname).to.equal('Tony');
        expect(model.lastname).to.equal('Stark');
        expect(model.age).to.equal(45);
        expect(model.human).to.equal(true);
      });
    });

    it('parses body parameters', () => {
      const data: ParameterTestModel = {
        age: 45,
        firstname: 'Tony',
        human: true,
        lastname: 'Stark'
      };
      return verifyPostRequest(basePath + '/ParameterTest/Body', data, (err, res) => {
        const model = res.body as ParameterTestModel;
        expect(model.firstname).to.equal('Tony');
        expect(model.lastname).to.equal('Stark');
        expect(model.age).to.equal(45);
        expect(model.human).to.equal(true);
      });
    });
  });


  it('shutdown server', () => server.close());

  function verifyGetRequest(path: string, verifyResponse: (err: any, res: request.Response) => any, expectedStatus?: number) {
    return verifyRequest(verifyResponse, request => request.get(path), expectedStatus);
  }

  function verifyPostRequest(path: string, data: any, verifyResponse: (err: any, res: request.Response) => any, expectedStatus?: number) {
    return verifyRequest(verifyResponse, request => request.post(path).send(data), expectedStatus);
  }

  function verifyRequest(
    verifyResponse: (err: any, res: request.Response) => any,
    methodOperation: (request: request.SuperTest<any>) => request.Test,
    expectedStatus = 200
  ) {
    return new Promise((resolve, reject) => {
      methodOperation(request(server))
        .expect(expectedStatus)
        .end((err: any, res: any) => {
          let parsedError: any;
          try {
            parsedError = JSON.parse((res.error as any));
          } catch (err) {
            parsedError = (res.error as any);
          }

          if (err) {
            reject({
              error: err,
              response: parsedError
            });
            return;
          }

          verifyResponse(parsedError, res);
          resolve();
        });
    });
  }

  function getFakeModel(): TestModel {
    return {
      boolArray: [true, false],
      boolValue: false,
      id: 1,
      modelValue: { email: 'test@test.com', id: 2 },
      modelsArray: [{ email: 'test@test.com', id: 1 }],
      numberArray: [1, 2],
      numberValue: 5,
      optionalString: 'test1234',
      strLiteralArr: ['Foo', 'Bar'],
      strLiteralVal: 'Foo',
      stringArray: ['test', 'testtwo'],
      stringValue: 'test1234'
    };
  }

  function getFakeClassModel() {
    const model = new TestClassModel('test', 'test', 'test');
    model.id = 100;
    model.publicStringProperty = 'test';
    model.stringProperty = 'test';

    return model;
  }
});
