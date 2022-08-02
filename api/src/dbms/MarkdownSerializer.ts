import { IAbstractSerializerFactory } from './IAbstractSerializerFactory.js';
import { ISerializer } from './ISerializer.js';

export class MarkdownFrontMatterSerializer implements ISerializer {
  readonly defaultFileExtension: string = ".json";

  serialize(data: object): string {
    // use remark to serialize
    const serializedData = "" //JSON.stringify(data);
    return serializedData;
  }
  deserialize(data: string): object {
    const result: object = JSON.parse(data);
    return result;
  }
}

export class MarkdownFrontMatterSerialiserFactory implements IAbstractSerializerFactory {
  GetInstance(): ISerializer {
    return new MarkdownFrontMatterSerializer()
  }
}