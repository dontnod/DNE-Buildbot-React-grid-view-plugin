import {
  BaseClass,
  DataCollection,
  DataMultiCollection,
} from "buildbot-data-js";
import { IObservableArray, observable } from "mobx";

export function getRelatedOfFilteredDataMultiCollection<OriginalParentDataType extends BaseClass, ParentDataType extends BaseClass, ChildDataType extends BaseClass>(
  dataMultiCollection: DataMultiCollection<OriginalParentDataType, ParentDataType>,
  filteredIds: IObservableArray<string>,
  callback: (child: ParentDataType) => DataCollection<ChildDataType>) {
  return new DataMultiCollection<ParentDataType, ChildDataType>(
    dataMultiCollection.accessor,
    observable(dataMultiCollection.getAll()),
    null,
    filteredIds, callback
  );
}
