import { Route } from '../../../src/decorators/route';
import { Post, Patch } from '../../../src/decorators/methods';
import { TestModel, TestClassModel } from '../testModel';
import { ModelService } from '../services/modelService';

@Route('PostTest')
export class PostTestController {
  @Post()
  public async postModel(model: TestModel): Promise<TestModel> {
    return model;
  }

  @Patch()
  public async updateModel(model: TestModel): Promise<TestModel> {
    return await new ModelService().getModel();
  }

  @Post('WithClassModel')
  public async postClassModel(model: TestClassModel): Promise<TestClassModel> {
    const augmentedModel = new TestClassModel('test', 'test2', 'test3');
    augmentedModel.id = 700;

    return augmentedModel;
  }

  @Post('Location')
  public async postModelAtLocation(): Promise<TestModel> {
    return new ModelService().getModel();
  }

  @Post('Multi')
  public async postWithMultiReturn(): Promise<TestModel[]> {
    const model = new ModelService().getModel();

    return [
      model,
      model
    ];
  }

  @Post('WithId/{id}')
  public async postWithId(id: number): Promise<TestModel> {
    return new ModelService().getModel();
  }

  @Post('WithBodyAndQueryParams')
  public async postWithBodyAndQueryParams(model: TestModel, query: string): Promise<TestModel> {
    return new ModelService().getModel();
  }
}
