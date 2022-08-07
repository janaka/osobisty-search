import { ISerializer } from './ISerializer';

export interface IAbstractSerializerFactory {
  GetInstance(): ISerializer<any>;
}
