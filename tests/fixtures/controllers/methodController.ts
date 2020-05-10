import { Controller, Delete, Get, Patch, Post, Put, Response, Route, Security, SuccessResponse, Tags } from '../../../src';
import { ModelService } from '../services/modelService';
import { ErrorResponseModel, TestModel } from '../testModel';

const TEST_OBJECT_CONST = {
  unAuthCode: '401',
  unAuthText: 'Unauthorized',
  success: 'Created',
};

enum TEST_ENUM_CODES {
  BAD = 400,
  NOT_FOUND = '404',
  SUCCESS = 201,
}
enum TEST_ENUM {
  BAD = 'Bad Request',
  NOT_FOUND = 'Not Found',
  SECURITY = 'JWT2',
  ADMIN = 'permission:admin',
  OWNER = 'permission:owner',
  TAG = 'EnumTag1',
}

const TEST_SEC = {
  firstSec: [],
  secondSec: [TEST_ENUM.ADMIN, TEST_ENUM.OWNER],
};

@Route('MethodTest')
export class MethodController extends Controller {
  @Get('Get')
  public async getMethod(): Promise<TestModel> {
    return new ModelService().getModel();
  }

  @Post('Post')
  public async postMethod(): Promise<TestModel> {
    return new ModelService().getModel();
  }

  @Patch('Patch')
  public async patchMethod(): Promise<TestModel> {
    return new ModelService().getModel();
  }

  @Put('Put')
  public async putMethod(): Promise<TestModel> {
    return new ModelService().getModel();
  }

  @Delete('Delete')
  public async deleteMethod(): Promise<TestModel> {
    return new ModelService().getModel();
  }

  /**
   * method description
   */
  @Get('Description')
  public async description(): Promise<TestModel> {
    return new ModelService().getModel();
  }

  @Tags('Tag1', 'Tag2', 'Tag3')
  @Get('Tags')
  public async tags(): Promise<TestModel> {
    return new ModelService().getModel();
  }

  @Response<ErrorResponseModel>('400', 'Bad Request')
  @Response<ErrorResponseModel>('401', 'Unauthorized')
  @Response<ErrorResponseModel>('default', 'Unexpected error', { status: 500, message: 'Something went wrong!' })
  @Get('MultiResponse')
  public async multiResponse(): Promise<TestModel> {
    return new ModelService().getModel();
  }

  @Tags(TEST_ENUM.TAG)
  @Security(TEST_ENUM.SECURITY, [TEST_ENUM.ADMIN, TEST_ENUM.OWNER])
  @Security(TEST_SEC)
  @Response<ErrorResponseModel>(TEST_OBJECT_CONST.unAuthCode, TEST_OBJECT_CONST.unAuthText)
  @Response<ErrorResponseModel>(TEST_ENUM_CODES.BAD, TEST_ENUM.BAD)
  @Response<ErrorResponseModel>(TEST_ENUM_CODES.NOT_FOUND, TEST_ENUM.NOT_FOUND)
  @SuccessResponse(TEST_ENUM_CODES.SUCCESS, TEST_OBJECT_CONST.success)
  @Get('DecoratorVariousValues')
  public async decoratorVariousValues(): Promise<TestModel> {
    return new ModelService().getModel();
  }

  @SuccessResponse('201', 'Created')
  @Get('SuccessResponse')
  public async successResponse(): Promise<void> {
    this.setStatus(201);
    return Promise.resolve();
  }

  @Security('api_key')
  @Get('ApiSecurity')
  public async apiSecurity(): Promise<TestModel> {
    return new ModelService().getModel();
  }

  @Security('tsoa_auth', ['write:pets', 'read:pets'])
  @Get('OauthSecurity')
  public async oauthSecurity(): Promise<TestModel> {
    return new ModelService().getModel();
  }

  @Security('tsoa_auth', ['write:pets', 'read:pets'])
  @Security('api_key')
  @Get('OauthOrAPIkeySecurity')
  public async oauthOrAPIkeySecurity(): Promise<TestModel> {
    return new ModelService().getModel();
  }

  @Security({
    api_key: [],
    tsoa_auth: ['write:pets', 'read:pets'],
  })
  @Get('OauthAndAPIkeySecurity')
  public async oauthAndAPIkeySecurity(): Promise<TestModel> {
    return new ModelService().getModel();
  }

  /**
   * @deprecated
   */
  @Get('DeprecatedMethod')
  public async deprecatedMethod(): Promise<TestModel> {
    return new ModelService().getModel();
  }

  /**
   * @summary simple summary
   */
  @Get('SummaryMethod')
  public async summaryMethod(): Promise<TestModel> {
    return new ModelService().getModel();
  }

  @Get('returnAnyType')
  public async returnAnyType(): Promise<any> {
    return 'Hello Word';
  }

  @Get('returnAliasedVoidType')
  public async returnAliasedVoidType(): Promise<VoidAlias1> {
    return;
  }
}

type VoidAlias1 = VoidAlias2;
type VoidAlias2 = void;
