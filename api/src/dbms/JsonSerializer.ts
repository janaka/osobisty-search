import { IAbstractSerializerFactory } from './IAbstractSerializerFactory';
import { ISerializer } from './ISerializer';

export class JsonSerializer implements ISerializer {
  readonly defaultFileExtension: string = ".json";

  serialize(data: object): string {
    const serializedData = JSON.stringify(data);
    return serializedData;
  }
  deserialize(data: string): object {
    const result: object = JSON.parse(data);
    return result;
  }
}

export class JsonSerialiserFactory implements IAbstractSerializerFactory {
  GetInstance(): ISerializer {
    return new JsonSerializer()
  }
}