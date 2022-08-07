import { IAbstractSerializerFactory } from './IAbstractSerializerFactory.js';
import { ISerializer } from './ISerializer.js';

export class JsonSerializer implements ISerializer<object> {
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
  GetInstance(): ISerializer<object> {
    return new JsonSerializer()
  }
}