import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TroubleInterface} from './trouble.interface';
import {Observable} from 'rxjs';
import {
  QUERY_TROUBLE_LIST,
  QUERY_TROUBLE_SHOW_TYPE,
  ADD_TROUBLE,
  DELETE_TROUBLE,
  TROUBLE_REMARK,
  UPDATE_TROUBLE,
  QUERY_TROUBLE_PROCESS,
  QUERY_TROUBLE_PROCESS_HISTORY,
  GET_SUPERIOR_DEPARTMENT,
  GET_FLOWCHART,
  QUERY_DEPART_NAME,
  TROUBLE_ASSIGN,
  QUERY_DEVICE_LIST,
  QUERY_EQUIPMENT_LIST,
  QUERY_PERSON,
  GET_ALARM_PIC,
  QUERY_FACILITY_INFO,
  QUERY_TROUBLE_PROCESS_HISTORY_PAGE,
  TROUBLE_ASSIGN_ALL, EXPORT_TROUBLE_LIST,
} from '../const/trouble-service.const';
import {QueryConditionModel} from '../../../../shared-module/model/query-condition.model';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {TroubleModel} from '../../../../core-module/model/trouble/trouble.model';
import {TroubleDisplayTypeModel} from '../model/trouble-display-type.model';
import {TroubleAddFormModel} from '../model/trouble-add-form.model';
import {RemarkFormModel} from '../model/remark-form.model';
import {NzTreeNode} from 'ng-zorro-antd';
import {DepartModel} from '../model/depart.model';
import {AssignFormModel} from '../model/assign-form.model';
import {DetailPicModel} from '../../../../core-module/model/detail-pic.model';
import {TroublePicInfoModel} from '../model/trouble-pic-info.model';
import {EquipmentModel} from '../../../../core-module/model/equipment.model';
import {UnitParamsModel} from '../../../../core-module/model/unit-params.model';
import {FacilityListModel} from '../../../../core-module/model/facility/facility-list.model';
import {DeviceFormModel} from '../../../../core-module/model/work-order/device-form.model';
import {ExportRequestModel} from '../../../../shared-module/model/export-request.model';


@Injectable()
export class TroubleService implements TroubleInterface {

  constructor(private $http: HttpClient) {
  }
  // ๆ้ๅ่กจ
  queryTroubleList(body: QueryConditionModel): Observable<ResultModel<TroubleModel[]>> {
    return this.$http.post<ResultModel<TroubleModel[]>>(`${QUERY_TROUBLE_LIST}`, body);
  }
  // ๆ้ๅก็
  queryTroubleLevel(id: number): Observable<ResultModel<TroubleDisplayTypeModel[]>> {
    return this.$http.get<ResultModel<TroubleDisplayTypeModel[]>>(`${QUERY_TROUBLE_SHOW_TYPE}/${id}`);
  }
  // ๆฐๅขๆ้
  addTrouble(body: TroubleAddFormModel): Observable<ResultModel<string>> {
    return this.$http.post<ResultModel<string>>(`${ADD_TROUBLE}`, body);
  }
  // ๅ?้คๆ้
  deleteTrouble(body: string[]): Observable<ResultModel<string>> {
    return this.$http.post<ResultModel<string>>(`${DELETE_TROUBLE}`, body);
  }
  // ๆ้ๅคๆณจ
  troubleRemark(body: RemarkFormModel): Observable<ResultModel<string>> {
    return this.$http.post<ResultModel<string>>(`${TROUBLE_REMARK}`, body);
  }
  // ็ผ่พๆ้
  updateTrouble(body: TroubleAddFormModel): Observable<ResultModel<string>> {
    return this.$http.post<ResultModel<string>>(`${UPDATE_TROUBLE}`, body);
  }
  // ๆฅ็ๆ้ๆต็จ
  queryTroubleProcess(id: string): Observable<ResultModel<TroubleModel>> {
    return this.$http.get<ResultModel<TroubleModel>>(`${QUERY_TROUBLE_PROCESS}/${id}`);
  }
  // ๆฅ็ๆ้ๅๅฒๆต็จ
  queryTroubleProcessHistory(id: string): Observable<ResultModel<TroubleModel[]>> {
    return this.$http.get<ResultModel<TroubleModel[]>>(`${QUERY_TROUBLE_PROCESS_HISTORY}/${id}`);
  }
  // ๆฅ็ๆ้ๅๅฒๆต็จๅธฆๅ้กตๅ้กต
  queryTroubleProcesslistHistoryPage(body: QueryConditionModel): Observable<ResultModel<TroubleModel[]>> {
    return this.$http.post<ResultModel<TroubleModel[]>>(`${QUERY_TROUBLE_PROCESS_HISTORY_PAGE}`, body);
  }
  // ่ทๅๅฝๅๅไฝไธ็บงๅไฝ
  getSuperiorDepartment(body: UnitParamsModel): Observable<ResultModel<NzTreeNode[]>> {
    return this.$http.post<ResultModel<NzTreeNode[]>>(`${GET_SUPERIOR_DEPARTMENT}`, body);
  }
  // ่ทๅ้จ้จไธ็ๆๆไบบ
  queryPerson(body: string[]): Observable<ResultModel<NzTreeNode[]>> {
    return this.$http.post<ResultModel<NzTreeNode[]>>(`${QUERY_PERSON}`, body);
  }
  // ่ทๅ้จ้จidๆฅ่ฏข่ดฃไปปไบบ
  queryDepartName(id: string): Observable< ResultModel<DepartModel>> {
    return this.$http.get< ResultModel<DepartModel>>(`${QUERY_DEPART_NAME}/${id}`);
  }
  // ่ทๅๆต็จๅพ
  getFlowChart(id: string): Observable<Blob | ResultModel<string>> {
    return this.$http.get(`${GET_FLOWCHART}/${id}`, {responseType: 'blob'});
  }
  // ๆ้ๆๆดพ
  troubleAssign(body: AssignFormModel): Observable<ResultModel<string>> {
    return this.$http.post<ResultModel<string>>(`${TROUBLE_ASSIGN}`, body);
  }
  // ๆน้ๆ้ๆๆดพ
  troubleAssigns(body: AssignFormModel): Observable<ResultModel<string>> {
    return this.$http.post<ResultModel<string>>(`${TROUBLE_ASSIGN_ALL}`, body);
  }
  // ๆ้่ฎพๆฝ
  queryDevice(body: QueryConditionModel): Observable<ResultModel<FacilityListModel[]>> {
    return this.$http.post<ResultModel<FacilityListModel[]>>(`${QUERY_DEVICE_LIST}`, body);
  }
  // ๆ้่ฎพๅค
  queryEquipment(body: QueryConditionModel): Observable<ResultModel<EquipmentModel[]>> {
    return this.$http.post<ResultModel<EquipmentModel[]>>(`${QUERY_EQUIPMENT_LIST}`, body);
  }
  // ๆ้่ฏฆๆๅพ็
  queryTroublePic(body: DetailPicModel): Observable<ResultModel<TroublePicInfoModel[]>> {
    return this.$http.post<ResultModel<TroublePicInfoModel[]>>(`${GET_ALARM_PIC}`, body);
  }
  // ๆฅ่ฏข่ฎพๆฝไฟกๆฏ
  queryFacilityInfo(body: {deviceId: string}): Observable<ResultModel<DeviceFormModel[]>> {
    return this.$http.post<ResultModel<DeviceFormModel[]>>(`${QUERY_FACILITY_INFO}`, body);
  }
  // ๆ้ๅฏผๅบ
  exportTroubleList(body: ExportRequestModel): Observable<ResultModel<string>> {
    return this.$http.post<ResultModel<string>>(`${EXPORT_TROUBLE_LIST}`, body);
  }
}

