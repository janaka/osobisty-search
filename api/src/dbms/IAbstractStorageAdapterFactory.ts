import { IStorageAdapter } from './IStorageAdapter';
import { ISerializer } from "./ISerializer";



export interface IAbstractStorageAdapterFactory {
  //GetInstance(): IStorageAdaptor;
  GetInstance(serializer: ISerializer<any>): IStorageAdapter;
}
