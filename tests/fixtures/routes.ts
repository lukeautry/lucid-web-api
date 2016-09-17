
/**
 * THIS IS GENERATED CODE - DO NOT EDIT
 */
/* tslint:disable */
import { ValidateParam } from '../../src/routeGeneration/templateHelpers';
import { PutTestController } from './controllers/putController';
import { PostTestController } from './controllers/postController';
import { PatchTestController } from './controllers/patchController';
import { GetTestController } from './controllers/getController';
import { DeleteTestController } from './controllers/deleteController';

const models: any = {
  'TestSubModel': {
    'email': { typeName: 'string', required: true },
    'id': { typeName: 'number', required: true },
  },
  'TestModel': {
    'numberValue': { typeName: 'number', required: true },
    'numberArray': { typeName: 'array', required: true, arrayType: 'number' },
    'stringValue': { typeName: 'string', required: true },
    'stringArray': { typeName: 'array', required: true, arrayType: 'string' },
    'boolValue': { typeName: 'boolean', required: true },
    'boolArray': { typeName: 'array', required: true, arrayType: 'boolean' },
    'modelValue': { typeName: 'TestSubModel', required: true },
    'modelsArray': { typeName: 'array', required: true, arrayType: 'TestSubModel' },
    'dateValue': { typeName: 'datetime', required: false },
    'optionalString': { typeName: 'string', required: false },
    'id': { typeName: 'number', required: true },
  },
  'TestClassModel': {
    'publicStringProperty': { typeName: 'string', required: true },
    'optionalPublicStringProperty': { typeName: 'string', required: false },
    'stringProperty': { typeName: 'string', required: true },
    'publicConstructorVar': { typeName: 'string', required: true },
    'optionalPublicConstructorVar': { typeName: 'string', required: false },
    'id': { typeName: 'number', required: true },
  },
  'Result': {
    'value': { typeName: 'object', required: true },
  },
};

export function RegisterRoutes(app: any) {
  app.put('/PutTest', function(req: any, res: any, next: any) {
    const params = {
      'model': { typeName: 'TestModel', required: true },
    };

    let validatedParams: any[] = [];
    try {
      validatedParams = getValidatedParams(params, req, 'model');
    } catch (err) {
      return next(err);
    }

    const controller = new PutTestController();
    promiseHandler(controller.putModel.apply(controller, validatedParams), res, next);
  });
  app.put('/PutTest/Location', function(req: any, res: any, next: any) {
    const params = {
    };

    let validatedParams: any[] = [];
    try {
      validatedParams = getValidatedParams(params, req, '');
    } catch (err) {
      return next(err);
    }

    const controller = new PutTestController();
    promiseHandler(controller.putModelAtLocation.apply(controller, validatedParams), res, next);
  });
  app.put('/PutTest/Multi', function(req: any, res: any, next: any) {
    const params = {
    };

    let validatedParams: any[] = [];
    try {
      validatedParams = getValidatedParams(params, req, '');
    } catch (err) {
      return next(err);
    }

    const controller = new PutTestController();
    promiseHandler(controller.putWithMultiReturn.apply(controller, validatedParams), res, next);
  });
  app.put('/PutTest/WithId/:id', function(req: any, res: any, next: any) {
    const params = {
      'id': { typeName: 'number', required: true },
    };

    let validatedParams: any[] = [];
    try {
      validatedParams = getValidatedParams(params, req, '');
    } catch (err) {
      return next(err);
    }

    const controller = new PutTestController();
    promiseHandler(controller.putWithId.apply(controller, validatedParams), res, next);
  });
  app.post('/PostTest', function(req: any, res: any, next: any) {
    const params = {
      'model': { typeName: 'TestModel', required: true },
    };

    let validatedParams: any[] = [];
    try {
      validatedParams = getValidatedParams(params, req, 'model');
    } catch (err) {
      return next(err);
    }

    const controller = new PostTestController();
    promiseHandler(controller.postModel.apply(controller, validatedParams), res, next);
  });
  app.patch('/PostTest', function(req: any, res: any, next: any) {
    const params = {
      'model': { typeName: 'TestModel', required: true },
    };

    let validatedParams: any[] = [];
    try {
      validatedParams = getValidatedParams(params, req, 'model');
    } catch (err) {
      return next(err);
    }

    const controller = new PostTestController();
    promiseHandler(controller.updateModel.apply(controller, validatedParams), res, next);
  });
  app.post('/PostTest/WithClassModel', function(req: any, res: any, next: any) {
    const params = {
      'model': { typeName: 'TestClassModel', required: true },
    };

    let validatedParams: any[] = [];
    try {
      validatedParams = getValidatedParams(params, req, 'model');
    } catch (err) {
      return next(err);
    }

    const controller = new PostTestController();
    promiseHandler(controller.postClassModel.apply(controller, validatedParams), res, next);
  });
  app.post('/PostTest/Location', function(req: any, res: any, next: any) {
    const params = {
    };

    let validatedParams: any[] = [];
    try {
      validatedParams = getValidatedParams(params, req, '');
    } catch (err) {
      return next(err);
    }

    const controller = new PostTestController();
    promiseHandler(controller.postModelAtLocation.apply(controller, validatedParams), res, next);
  });
  app.post('/PostTest/Multi', function(req: any, res: any, next: any) {
    const params = {
    };

    let validatedParams: any[] = [];
    try {
      validatedParams = getValidatedParams(params, req, '');
    } catch (err) {
      return next(err);
    }

    const controller = new PostTestController();
    promiseHandler(controller.postWithMultiReturn.apply(controller, validatedParams), res, next);
  });
  app.post('/PostTest/WithId/:id', function(req: any, res: any, next: any) {
    const params = {
      'id': { typeName: 'number', required: true },
    };

    let validatedParams: any[] = [];
    try {
      validatedParams = getValidatedParams(params, req, '');
    } catch (err) {
      return next(err);
    }

    const controller = new PostTestController();
    promiseHandler(controller.postWithId.apply(controller, validatedParams), res, next);
  });
  app.post('/PostTest/WithBodyAndQueryParams', function(req: any, res: any, next: any) {
    const params = {
      'model': { typeName: 'TestModel', required: true },
      'query': { typeName: 'string', required: true },
    };

    let validatedParams: any[] = [];
    try {
      validatedParams = getValidatedParams(params, req, 'model');
    } catch (err) {
      return next(err);
    }

    const controller = new PostTestController();
    promiseHandler(controller.postWithBodyAndQueryParams.apply(controller, validatedParams), res, next);
  });
  app.patch('/PatchTest', function(req: any, res: any, next: any) {
    const params = {
      'model': { typeName: 'TestModel', required: true },
    };

    let validatedParams: any[] = [];
    try {
      validatedParams = getValidatedParams(params, req, 'model');
    } catch (err) {
      return next(err);
    }

    const controller = new PatchTestController();
    promiseHandler(controller.patchModel.apply(controller, validatedParams), res, next);
  });
  app.patch('/PatchTest/Location', function(req: any, res: any, next: any) {
    const params = {
    };

    let validatedParams: any[] = [];
    try {
      validatedParams = getValidatedParams(params, req, '');
    } catch (err) {
      return next(err);
    }

    const controller = new PatchTestController();
    promiseHandler(controller.patchModelAtLocation.apply(controller, validatedParams), res, next);
  });
  app.patch('/PatchTest/Multi', function(req: any, res: any, next: any) {
    const params = {
    };

    let validatedParams: any[] = [];
    try {
      validatedParams = getValidatedParams(params, req, '');
    } catch (err) {
      return next(err);
    }

    const controller = new PatchTestController();
    promiseHandler(controller.patchWithMultiReturn.apply(controller, validatedParams), res, next);
  });
  app.patch('/PatchTest/WithId/:id', function(req: any, res: any, next: any) {
    const params = {
      'id': { typeName: 'number', required: true },
    };

    let validatedParams: any[] = [];
    try {
      validatedParams = getValidatedParams(params, req, '');
    } catch (err) {
      return next(err);
    }

    const controller = new PatchTestController();
    promiseHandler(controller.patchWithId.apply(controller, validatedParams), res, next);
  });
  app.get('/GetTest', function(req: any, res: any, next: any) {
    const params = {
    };

    let validatedParams: any[] = [];
    try {
      validatedParams = getValidatedParams(params, req, '');
    } catch (err) {
      return next(err);
    }

    const controller = new GetTestController();
    promiseHandler(controller.getModel.apply(controller, validatedParams), res, next);
  });
  app.get('/GetTest/Current', function(req: any, res: any, next: any) {
    const params = {
    };

    let validatedParams: any[] = [];
    try {
      validatedParams = getValidatedParams(params, req, '');
    } catch (err) {
      return next(err);
    }

    const controller = new GetTestController();
    promiseHandler(controller.getCurrentModel.apply(controller, validatedParams), res, next);
  });
  app.get('/GetTest/ClassModel', function(req: any, res: any, next: any) {
    const params = {
    };

    let validatedParams: any[] = [];
    try {
      validatedParams = getValidatedParams(params, req, '');
    } catch (err) {
      return next(err);
    }

    const controller = new GetTestController();
    promiseHandler(controller.getClassModel.apply(controller, validatedParams), res, next);
  });
  app.get('/GetTest/Multi', function(req: any, res: any, next: any) {
    const params = {
    };

    let validatedParams: any[] = [];
    try {
      validatedParams = getValidatedParams(params, req, '');
    } catch (err) {
      return next(err);
    }

    const controller = new GetTestController();
    promiseHandler(controller.getMultipleModels.apply(controller, validatedParams), res, next);
  });
  app.get('/GetTest/:numberPathParam/:booleanPathParam/:stringPathParam', function(req: any, res: any, next: any) {
    const params = {
      'numberPathParam': { typeName: 'number', required: true },
      'stringPathParam': { typeName: 'string', required: true },
      'booleanPathParam': { typeName: 'boolean', required: true },
      'booleanParam': { typeName: 'boolean', required: true },
      'stringParam': { typeName: 'string', required: true },
      'numberParam': { typeName: 'number', required: true },
      'optionalStringParam': { typeName: 'string', required: false },
    };

    let validatedParams: any[] = [];
    try {
      validatedParams = getValidatedParams(params, req, '');
    } catch (err) {
      return next(err);
    }

    const controller = new GetTestController();
    promiseHandler(controller.getModelByParams.apply(controller, validatedParams), res, next);
  });
  app.get('/GetTest/ResponseWithUnionTypeProperty', function(req: any, res: any, next: any) {
    const params = {
    };

    let validatedParams: any[] = [];
    try {
      validatedParams = getValidatedParams(params, req, '');
    } catch (err) {
      return next(err);
    }

    const controller = new GetTestController();
    promiseHandler(controller.getResponseWithUnionTypeProperty.apply(controller, validatedParams), res, next);
  });
  app.get('/GetTest/UnionTypeResponse', function(req: any, res: any, next: any) {
    const params = {
    };

    let validatedParams: any[] = [];
    try {
      validatedParams = getValidatedParams(params, req, '');
    } catch (err) {
      return next(err);
    }

    const controller = new GetTestController();
    promiseHandler(controller.getUnionTypeResponse.apply(controller, validatedParams), res, next);
  });
  app.delete('/DeleteTest', function(req: any, res: any, next: any) {
    const params = {
    };

    let validatedParams: any[] = [];
    try {
      validatedParams = getValidatedParams(params, req, '');
    } catch (err) {
      return next(err);
    }

    const controller = new DeleteTestController();
    promiseHandler(controller.deleteWithReturnValue.apply(controller, validatedParams), res, next);
  });
  app.delete('/DeleteTest/Current', function(req: any, res: any, next: any) {
    const params = {
    };

    let validatedParams: any[] = [];
    try {
      validatedParams = getValidatedParams(params, req, '');
    } catch (err) {
      return next(err);
    }

    const controller = new DeleteTestController();
    promiseHandler(controller.deleteCurrent.apply(controller, validatedParams), res, next);
  });
  app.delete('/DeleteTest/:numberPathParam/:booleanPathParam/:stringPathParam', function(req: any, res: any, next: any) {
    const params = {
      'numberPathParam': { typeName: 'number', required: true },
      'stringPathParam': { typeName: 'string', required: true },
      'booleanPathParam': { typeName: 'boolean', required: true },
      'booleanParam': { typeName: 'boolean', required: true },
      'stringParam': { typeName: 'string', required: true },
      'numberParam': { typeName: 'number', required: true },
    };

    let validatedParams: any[] = [];
    try {
      validatedParams = getValidatedParams(params, req, '');
    } catch (err) {
      return next(err);
    }

    const controller = new DeleteTestController();
    promiseHandler(controller.getModelByParams.apply(controller, validatedParams), res, next);
  });

  function promiseHandler(promise: any, response: any, next: any) {
    return promise
      .then((data: any) => {
        if (data) {
          response.json(data);
        } else {
          response.status(204);
          response.end();
        }
      })
      .catch((error: any) => next(error));
  }

  function getRequestParams(request: any, bodyParamName?: string) {
    const merged: any = {};
    if (bodyParamName) {
      merged[bodyParamName] = request.body;
    }

    for (let attrname in request.params) { merged[attrname] = request.params[attrname]; }
    for (let attrname in request.query) { merged[attrname] = request.query[attrname]; }
    return merged;
  }

  function getValidatedParams(params: any, request: any, bodyParamName?: string): any[] {
    const requestParams = getRequestParams(request, bodyParamName);

    return Object.keys(params).map(key => {
      return ValidateParam(params[key], requestParams[key], models, key);
    });
  }
}
