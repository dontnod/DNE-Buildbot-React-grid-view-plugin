import {IObservableArray} from "mobx";
import {
  BaseClass,
  BasicDataMultiCollection,
  DataMultiCollection,
  DataCollection,
} from "buildbot-data-js";

export function getRelatedOfFilteredDataMultiCollection<ChildDataType extends BaseClass, ParentDataType extends BaseClass>(
  dataMultiCollection: BasicDataMultiCollection<ParentDataType, DataCollection<ParentDataType>>,
  filteredIds: IObservableArray<string>,
  callback: (child: ParentDataType) => DataCollection<ChildDataType>) {
  return new DataMultiCollection<ParentDataType, ChildDataType>(dataMultiCollection.accessor, null, dataMultiCollection.byParentId, filteredIds, callback);
}
