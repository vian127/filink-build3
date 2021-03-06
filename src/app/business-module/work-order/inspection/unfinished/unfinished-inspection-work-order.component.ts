import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {WorkOrderInitTreeUtil} from '../../share/util/work-order-init-tree.util';
import {UnfinishedInspectionTableUtil} from './unfinished-inspection-table.util';
import {NzI18nService, NzModalService, NzTreeNode} from 'ng-zorro-antd';
import {PageModel} from '../../../../shared-module/model/page.model';
import {ActivatedRoute, Router} from '@angular/router';
import {InspectionLanguageInterface} from '../../../../../assets/i18n/inspection-task/inspection.language.interface';
import {TableConfigModel} from '../../../../shared-module/model/table-config.model';
import {FilterCondition, QueryConditionModel} from '../../../../shared-module/model/query-condition.model';
import {InspectionWorkOrderService} from '../../share/service/inspection';
import {TreeSelectorConfigModel} from '../../../../shared-module/model/tree-selector-config.model';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {TableComponent} from '../../../../shared-module/component/table/table.component';
import {IndexMissionService} from '../../../../core-module/mission/index.mission.service';
import {WorkOrderLanguageInterface} from '../../../../../assets/i18n/work-order/work-order.language.interface';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {InspectionWorkOrderModel} from '../../../../core-module/model/work-order/inspection-work-order.model';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {OperatorEnum} from '../../../../shared-module/enum/operator.enum';
import {FilterValueModel} from '../../../../core-module/model/work-order/filter-value.model';
import {ClearBarrierOrInspectEnum, IsSelectAllEnum, LastDayColorEnum, WorkOrderNormalAndAbnormalEnum} from '../../share/enum/clear-barrier-work-order.enum';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {WorkOrderPageTypeEnum} from '../../share/enum/work-order-page-type.enum';
import {DepartmentUnitModel} from '../../../../core-module/model/work-order/department-unit.model';
import {RoleUnitModel} from '../../../../core-module/model/work-order/role-unit.model';
import {InspectionTaskModel} from '../../share/model/inspection-model/inspection-task.model';
import {CommonUtil} from '../../../../shared-module/util/common-util';
import {AreaFormModel} from '../../share/model/area-form.model';
import {AssignDepartmentModel} from '../../share/model/assign-department.model';
import {AreaDeviceParamModel} from '../../../../core-module/model/work-order/area-device-param.model';
import {TransferOrderParamModel} from '../../share/model/clear-barrier-model/transfer-order-param.model';
import {OrderUserModel} from '../../../../core-module/model/work-order/order-user.model';
import {WorkOrderBusinessCommonUtil} from '../../share/util/work-order-business-common.util';
import {WorkOrderCommonServiceUtil} from '../../share/util/work-order-common-service.util';
import {WorkOrderStatusUtil} from '../../../../core-module/business-util/work-order/work-order-for-common.util';
import {FacilityForCommonUtil} from '../../../../core-module/business-util/facility/facility-for-common.util';
import {FacilityForCommonService} from '../../../../core-module/api-service/facility';
import {UserForCommonService} from '../../../../core-module/api-service/user';
import {WorkOrderStatusEnum} from '../../../../core-module/enum/work-order/work-order-status.enum';
import {ExportRequestModel} from '../../../../shared-module/model/export-request.model';
import {RepairOrderStatusCountModel} from '../../share/model/clear-barrier-model/repair-order-status-count.model';
import {SliderCardConfigModel} from '../../share/model/slider-card-config-model';
import {SelectModel} from '../../../../shared-module/model/select.model';
import {WorkOrderClearInspectUtil} from '../../share/util/work-order-clear-inspect.util';
import {ClearBarrierWorkOrderModel} from '../../../../core-module/model/work-order/clear-barrier-work-order.model';
import {WebsocketMessageModel} from '../../../../core-module/model/websocket-message.model';
import {ChannelCode} from '../../../../core-module/enum/channel-code';
import {NativeWebsocketImplService} from '../../../../core-module/websocket/native-websocket-impl.service';
import {UserRoleModel} from '../../../../core-module/model/user/user-role.model';

/**
 * ?????????????????????
 */
@Component({
  selector: 'app-unfinished-inspection-work-order',
  templateUrl: './unfinished-inspection-work-order.component.html',
  styleUrls: ['./unfinished-inspection-work-order.component.scss']
})
export class UnfinishedInspectionWorkOrderComponent implements OnInit, OnDestroy {
  // ????????????
  @ViewChild('scheduleTable') scheduleTable: TableComponent;
  // ????????????
  @ViewChild('statusTemp') statusTemp: TemplateRef<any>;
  // ??????
  @ViewChild('schedule') schedule: TemplateRef<any>;
  // ??????????????????
  @ViewChild('UnitNameSearch') UnitNameSearch: TemplateRef<any>;
  // ????????????????????????
  @ViewChild('footerTemp') footerTemp: TemplateRef<any>;
  // ????????????
  @ViewChild('workTable') workTable: TableComponent;
  // ?????????
  @ViewChild('roleTemp') roleTemp: TemplateRef<any>;
  // ??????modal
  @ViewChild('SingleBackTemp') SingleBackTemp: TemplateRef<any>;
  // ????????????
  @ViewChild('AreaSearch') areaSearch: TemplateRef<any>;
  // ????????????
  @ViewChild('deviceTable') deviceTable: TemplateRef<any>;
  // ????????????
  @ViewChild('deviceTemp') deviceTemp: TemplateRef<any>;
  // ????????????
  @ViewChild('equipTemp') equipTemp: TemplateRef<any>;
  // ????????????
  @ViewChild('userSearchTemp') userSearchTemp: TemplateRef<any>;
  // ????????????????????????
  @ViewChild('refUserSearchTemp') refUserSearchTemp: TemplateRef<any>;
  // ???????????????????????????
  public isVisible: boolean = false;
  // title?????????????????????
  public title: string;
  // ????????????
  public isShowTable: boolean = false;
  // ???????????????????????????
  public tableDataSet: InspectionWorkOrderModel[] = [];
  // ????????????????????????
  public schedule_dataSet: InspectionTaskModel[] = [];
  // ?????????????????????
  public pageBean: PageModel = new PageModel();
  // ??????????????????
  public schedulePageBean: PageModel = new PageModel();
  // ???????????????????????????
  public tableConfig: TableConfigModel;
  // ???????????????????????????
  public scheduleTableConfig: TableConfigModel;
  // ?????????
  public InspectionLanguage: InspectionLanguageInterface;
  // ???????????????
  public isUnitVisible: boolean = false;
  public treeSelectorConfig: TreeSelectorConfigModel;
  // ????????????
  public departFilterValue: FilterCondition = {
    filterField: '',
    operator: '',
    filterValue: '',
    filterName: ''
  };
  // ??????ID
  public returnID: string;
  // ?????????????????????
  public responsibleUnitIsVisible: boolean = false;
  // ????????????
  public selectUnitName: string;
  // ????????????
  public scheduleIsVisible: boolean;
  // ?????????????????????
  public areaSelectorConfig: TreeSelectorConfigModel;
  // ????????????????????????
  public areaSelectVisible: boolean = false;
  // ????????????
  public areaFilterValue: FilterCondition = {
    filterField: '',
    operator: '',
    filterValue: '',
    filterName: ''
  };
  // ??????????????????
  public filterObj: FilterValueModel = {
    areaName: '',
    areaId: '',
  };
  public  workOrderLanguage: WorkOrderLanguageInterface;
  // ?????????
  public searchValue: string = '';
  // ???????????????????????????
  public totalCount: number;
  // ????????????????????????
  public assignVisible: boolean = false;
  // ????????????
  public sliderConfig: SliderCardConfigModel[] = [];
  // ??????????????????
  public isShowTransModal: boolean = false;
  // ????????????
  public transModalData: TransferOrderParamModel;
  // ???????????????
  public assignTreeSelectorConfig: TreeSelectorConfigModel;
  // ??????????????????
  public workOrderList: SelectModel[] = [];
  // ????????????
  public checkUserObject: FilterValueModel = new FilterValueModel();
  public refCheckUserObject: FilterValueModel = new FilterValueModel();
  // ??????????????????
  public selectUserList: UserRoleModel[] = [];
  public selectRefUserList: UserRoleModel[] = [];
  // ??????????????????
  public isShowUserTemp: boolean = false;
  public isShowRefUserTemp: boolean = false;
  // ????????????
  private userFilterValue: FilterCondition;
  private refUserFilterValue: FilterCondition;
  // ????????????
  private isReset: boolean = false;
  // ????????????
  private pagesChange: string;
  // ????????????
  private queryCondition: QueryConditionModel = new QueryConditionModel();
  // ??????????????????
  private finishQueryCondition: QueryConditionModel = new QueryConditionModel();
  // ????????????modal (????????????????????????)
  private singleBackConfirmModal;
  // ????????????????????? ????????????????????????
  private slideShowChangeData;
  // ????????????
  private increaseAddCount: number = 0;
  // ????????????
  private isNoData: boolean = false;
  // ????????????
  private filterValue: FilterCondition;
  // ????????????
  private areaNodes: AreaFormModel[] = [];
  // ?????????????????????
  private roleArray: RoleUnitModel[] = [];
  // ??????ID
  private withdrawID: string;
  // ?????? ?????????????????????????????????????????????
  private exportParams: ExportRequestModel = new ExportRequestModel();
  // ?????????
  private unitTreeNodes: DepartmentUnitModel[] = [];
  // ????????????
  private status: string;
  // ??????ID
  private procId: string;
  // ???????????????ID ?????????????????????????????????????????????
  private completedWorkOrderID: string;
  // ??????????????????
  private assignTreeNode: NzTreeNode[] = [];
  // ????????????
  private webSocketInstance;

  constructor(
    private $nzI18n: NzI18nService,
    private $router: Router,
    public $message: FiLinkModalService,
    private $activatedRoute: ActivatedRoute,
    private $indexMissionService: IndexMissionService,
    private $modal: NzModalService,
    private $userService: UserForCommonService,
    private $workOrderCommonUtil: WorkOrderCommonServiceUtil,
    private $inspectionWorkOrderService: InspectionWorkOrderService,
    private $facilityForCommonService: FacilityForCommonService,
    private $wsService: NativeWebsocketImplService
  ) { }
  public ngOnInit(): void {
    this.workOrderLanguage = this.$nzI18n.getLocaleData(LanguageEnum.workOrder);
    this.InspectionLanguage = this.$nzI18n.getLocaleData(LanguageEnum.inspection);
    // ?????????????????????
    (WorkOrderStatusUtil.getWorkOrderStatusList(this.$nzI18n)).forEach(v => {
      if (v.value !== WorkOrderStatusEnum.completed) {
        this.workOrderList.push(v);
      }
    });
    // ???????????????
    UnfinishedInspectionTableUtil.initUnfinishedTable(this);
    // ?????????
    WorkOrderInitTreeUtil.initTreeSelectorConfig(this);
    // ?????????????????????
    UnfinishedInspectionTableUtil.scheduleInitTableConfig(this);
    this.refreshData();
    // ?????????
    WorkOrderInitTreeUtil.initAreaSelectorConfig(this);
    // ???????????????
    WorkOrderInitTreeUtil.initAssignTreeConfig(this);
    // ??????????????????
    this.getCardStatistics();

    // id??????
    this.$activatedRoute.queryParams.subscribe(res => {
      if (res.id) {
        const arr = this.queryCondition.filterConditions.find(item => {
          return item.filterField === '_id';
        });
        if (!arr) {
          this.queryCondition.filterConditions.push({
            filterField: '_id',
            filterValue: res.id,
            operator: OperatorEnum.eq
          });
        }
        this.scheduleIsVisible = false;
        this.queryCondition.pageCondition.pageNum = 1;
        this.refreshData();
      }
    });
  }

  /**
   * ????????????
   */
  public ngOnDestroy(): void {
    this.scheduleTable = null;
    this.workTable = null;
    if (this.webSocketInstance) {
      this.webSocketInstance.unsubscribe();
    }
  }
  /**
   * ?????????????????????????????????
   */
  public facilityChangeHook(): void {
    const that = this;
    this.webSocketInstance = this.$wsService.subscibeMessage.subscribe(res => {
      if (res && res.data && JSON.parse(res.data)) {
        const data: WebsocketMessageModel = JSON.parse(res.data);
        if (data.channelKey === ChannelCode.workflowBusiness) {
          // ??????????????????
          if (typeof data.msg === 'string' && JSON.parse(data.msg).procType === ClearBarrierOrInspectEnum.inspection) {
            const isHave = this.tableDataSet.filter(_item => _item.procId === JSON.parse(data.msg).procId);
            if (data && isHave.length > 0) {
              that.workTable.handleSearch();
            }
          }
        }
      }
    });
  }

  /**
   * ????????????????????????
   * @param event ??????????????????
   */
  public selectDataChange(event: DepartmentUnitModel[]): void {
    const departmentList = [];
    for (let i = 0; i < event.length; i++) {
      departmentList.push({accountabilityDept: event[i].id});
    }
    this.assignWorkOrder(this.procId, departmentList);
  }

  /**
   * ????????????????????????
   * @param event ????????????????????????
   */
  public departmentSelectDataChange(event: DepartmentUnitModel[]): void {
    this.selectUnitName = '';
    if (event && event.length > 0) {
      this.selectUnitName = event[0].deptName;
      this.filterValue.filterValue = [event[0].deptCode];
      this.departFilterValue.filterName = this.selectUnitName;
      FacilityForCommonUtil.setTreeNodesStatus(this.unitTreeNodes, [event[0].id]);
    }
  }
  /**
   * ??????????????????
   */
  public openUserSelector(filterValue: FilterCondition,  flag?: boolean): void {
    if (flag) {
      this.isShowRefUserTemp = true;
      this.refUserFilterValue = filterValue;
    } else {
      this.isShowUserTemp = true;
      this.userFilterValue = filterValue;
    }
  }

  /**
   * ????????????
   */
  public onSelectUser(event: UserRoleModel[], flag?: boolean): void {
    if (flag) {
      this.selectRefUserList = event;
      this.refCheckUserObject = {
        userIds: event.map(v => v.id) || [],
        userName: event.map(v => v.userName).join(',') || '',
      };
      this.refUserFilterValue.filterValue = this.refCheckUserObject.userIds.length > 0 ? this.refCheckUserObject.userIds : null;
      this.refUserFilterValue.filterName = this.refCheckUserObject.userName;
    } else {
      this.selectUserList = event;
      WorkOrderClearInspectUtil.selectUser(event, this);
    }
  }

  /**
   * ?????????????????????????????????
   */
  public refreshData(): void {
    this.tableConfig.isLoading = true;
    // ??????????????????????????????
    this.queryCondition.filterConditions.forEach(v => {
      if (v.filterField === 'accountabilityDept' || v.filterField === 'assign') {
        v.operator = OperatorEnum.in;
      }
      if (v.filterField === 'equipmentType') {
        v.filterField = 'procRelatedEquipment.equipmentType';
        v.operator = OperatorEnum.all;
      }
      if (v.filterField === 'deviceType') {
        v.operator = OperatorEnum.in;
        v.filterField = 'procRelatedDevices.deviceType';
      }
    });
    this.turnPageParams();
    this.queryCondition.bizCondition = {};
    this.$inspectionWorkOrderService.getUnfinishedList(this.queryCondition).subscribe((result: ResultModel<InspectionWorkOrderModel[]>) => {
      if (result.code === ResultCodeEnum.success) {
        const data = result.data || [];
        this.tableConfig.showEsPagination = data.length > 0;
        this.pageBean.Total = result.totalPage * result.size;
        this.pageBean.pageSize = result.size;
        this.pageBean.pageIndex = result.pageNum;
        data.forEach(item => {
          item.statusClass = WorkOrderStatusUtil.getWorkOrderIconClassName(item.status);
          item.statusName = WorkOrderStatusUtil.getWorkOrderStatus(this.$nzI18n, item.status);
          // ????????????????????????????????????
          if (item.lastDays <= 0) {
            item.rowStyle = {color: LastDayColorEnum.overdueTime};
          } else if (item.lastDays <= 3 && item.lastDays > 0) {
            item.rowStyle = {color: LastDayColorEnum.estimatedTime};
          } else {
            item.lastDaysClass = '';
          }
          this.setIconStatus(item);
          // ???????????????????????????class
          if (item.deviceType) {
            item.deviceTypeName = WorkOrderBusinessCommonUtil.deviceTypeNames(this.$nzI18n, item.deviceType);
            if (item.deviceTypeName) {
              item.deviceClass = CommonUtil.getFacilityIconClassName(item.deviceType);
            } else {
              item.deviceClass = '';
            }
          }
          // ???????????????????????????class
          item.equipmentTypeList = [];
          item.equipmentTypeName = '';
          if (item.equipmentType) {
            const equip = WorkOrderClearInspectUtil.handleMultiEquipment(item.equipmentType, this.$nzI18n);
            item.equipmentTypeList = equip.equipList;
            item.equipmentTypeName = equip.names.join(',');
          }
        });
        this.tableDataSet = result.data;
        this.facilityChangeHook();
      }
      this.tableConfig.isLoading = false;
    }, () => {
      this.tableConfig.isLoading = false;
    });
  }

  /**
   * ??????????????????
   */
  private turnPageParams(): void {
    // ????????????
    if (!this.isReset) {
      // ???????????????????????? ??????id
      const id = this.$activatedRoute.snapshot.queryParams.id;
      if (id) {
        const arr = this.queryCondition.filterConditions.find(item => {
          return item.filterField === '_id';
        });
        if (!arr) {
          this.queryCondition.filterConditions.push({
            filterField: '_id',
            filterValue: id,
            operator: OperatorEnum.eq
          });
        }
      }
      // ?????????????????? ??????id???name
      const deviceId = this.$activatedRoute.snapshot.queryParams.deviceId;
      if (deviceId) {
        const obj = this.queryCondition.filterConditions.find(item => {
          return item.filterField === 'procRelatedDevices.deviceId';
        });
        if (obj) {
          if (obj.filterValue.indexOf(deviceId) === -1) {
            obj.filterValue.push(deviceId);
          }
        } else {
          this.queryCondition.filterConditions.push({
            filterField: 'procRelatedDevices.deviceId',
            filterValue: deviceId,
            operator: OperatorEnum.eq
          });
        }
      }
      // ?????????????????? ??????id???name
      const equipmentId = this.$activatedRoute.snapshot.queryParams.equipmentId;
      if (equipmentId) {
        const obj = this.queryCondition.filterConditions.find(item => {
          return item.filterField === 'procRelatedEquipment.equipmentId';
        });
        if (obj) {
          if (obj.filterValue.indexOf(equipmentId) === -1) {
            obj.filterValue.push(equipmentId);
          }
        } else {
          this.queryCondition.filterConditions.push({
            filterField: 'procRelatedEquipment.equipmentId',
            filterValue: equipmentId,
            operator: OperatorEnum.eq
          });
        }
      }
    }
  }

  /**
   * ???????????????(????????????)
   */
  private setIconStatus(item: InspectionWorkOrderModel): void {
    // ?????????????????????
    item.isShowDeleteIcon = item.status === WorkOrderStatusEnum.assigned;
    // ?????????????????????
    item.isShowEditIcon = item.status !== WorkOrderStatusEnum.singleBack;
    // ??????
    item.isShowTransfer = item.status === WorkOrderStatusEnum.processing;
    // ?????????????????????
    item.isShowRevertIcon = item.status === WorkOrderStatusEnum.pending;
    // ?????????????????????
    item.isShowAssignIcon = item.status === WorkOrderStatusEnum.assigned;
    // ??????????????????????????????   isCheckSingleBack = 0 ?????????  1?????????
    item.isShowTurnBackConfirmIcon = (item.status === WorkOrderStatusEnum.singleBack);
  }

  /**
   * ?????????????????????????????????????????????
   * @param id ??????id
   */
  private refreshCompleteData(): void {
    this.scheduleTableConfig.isLoading = true;
    this.finishQueryCondition.filterConditions = this.setCondition(this.finishQueryCondition.filterConditions);
    this.$inspectionWorkOrderService.getUnfinishedCompleteList(this.finishQueryCondition).subscribe((result: ResultModel<InspectionTaskModel[]>) => {
      if (result.code === ResultCodeEnum.success) {
        this.schedulePageBean.Total = result.totalCount;
        this.schedulePageBean.pageSize = result.size;
        this.schedulePageBean.pageIndex = result.pageNum;
        const list = result.data;
        // ?????????????????????????????????
        for (let i = 0; i < list.length; i++) {
          if (list[i].result === IsSelectAllEnum.deny) {
            list[i].result = this.InspectionLanguage[WorkOrderNormalAndAbnormalEnum.normal];
          } else if (list[i].result === IsSelectAllEnum.right) {
            list[i].result = this.InspectionLanguage[WorkOrderNormalAndAbnormalEnum.abnormal];
          }
        }
        this.schedule_dataSet = list;
      }
      this.scheduleTableConfig.isLoading = false;
    }, () => {
      this.scheduleTableConfig.isLoading = false;
    });
  }

  /**
   * ????????????
   * @param event ????????????
   */
  public pageChange(event: PageModel): void {
    this.queryCondition.pageCondition.pageNum = event.pageIndex;
    this.queryCondition.pageCondition.pageSize = event.pageSize;
    this.refreshData();
  }

  /**
   * ????????????
   *  @param event ????????????
   */
  public schedulePageChange(event: PageModel): void {
    this.pagesChange = IsSelectAllEnum.right;
    this.queryCondition.pageCondition.pageNum = event.pageIndex;
    this.queryCondition.pageCondition.pageSize = event.pageSize;
    this.refreshCompleteData();
  }

  /**
   * ???????????????????????????
   * @param filterValue ????????????
   */
  public showModal(filterValue: FilterCondition): void {
    this.departFilterValue = filterValue;
    if (this.unitTreeNodes.length === 0) {
      this.queryAllDeptList().then((bool) => {
        if (bool) {
          this.filterValue = filterValue;
          if (!this.filterValue.filterValue) {
            this.filterValue.filterValue = null;
          }
          this.treeSelectorConfig.treeNodes = this.unitTreeNodes;
          this.responsibleUnitIsVisible = true;
        }
      });
    } else {
      this.responsibleUnitIsVisible = true;
    }
  }

  /**
   * ??????????????????modal
   * (?????????????????????????????????????????????)
   */
  private openSingleBackConfirmModal(): void {
    this.singleBackConfirmModal = this.$modal.create({
      nzTitle: this.InspectionLanguage.turnBackConfirm,
      nzContent: this.SingleBackTemp,
      nzOkType: 'danger',
      nzClassName: 'custom-create-modal',
      nzMaskClosable: false,
      nzFooter: this.footerTemp,
    });
  }

  /**
   * ????????????
   * param ids
   */
  public singleBackConfirm(): void {
    this.$inspectionWorkOrderService.singleBackToConfirm(this.returnID).subscribe((result: ResultModel<string>) => {
      if (result.code === ResultCodeEnum.success) {
        this.queryCondition.pageCondition.pageNum = 1;
        this.closeSingleBackConfirmModal();
        this.refreshData();
        this.getCardStatistics();
        this.$message.success(this.InspectionLanguage.operateMsg.successful);
      } else {
        this.$message.error(result.msg);
      }
    });
  }

  /**
   * ??????????????????modal
   */
  public closeSingleBackConfirmModal(): void {
    this.singleBackConfirmModal.destroy();
  }

  /**
   * ????????????
   */
  public regenerate(): void {
    this.closeSingleBackConfirmModal();
    this.$router.navigate([`/business/work-order/inspection/unfinished-detail/restUpdate`],
      {queryParams: {procId: this.returnID, type: WorkOrderPageTypeEnum.restUpdate, status: 'assigned'}}).then();
  }

  /**
   * ????????????
   * param ids
   */
  private assignWorkOrder(id: string, modal: DepartmentUnitModel[]): void {
    const data = {
      procId: id,
      departmentList: modal
    };
    this.$inspectionWorkOrderService.assignedUnfinished(data).subscribe((result: ResultModel<string>) => {
      if (result.code === ResultCodeEnum.success) {
        this.$message.success(this.InspectionLanguage.operateMsg.assignSuccess);
        this.refreshData();
      }
    });
  }

  /**
   * ?????????????????????
   * (?????????????????????????????????????????????)
   */
  private withdrawWorkOrder(): void {
    const pid = new ClearBarrierWorkOrderModel();
    delete pid.deviceObject;
    pid.procId = this.withdrawID;
    this.$inspectionWorkOrderService.unfinishedWorkOrderWithdrawal(pid).subscribe((result: ResultModel<string>) => {
      if (result.code === ResultCodeEnum.success) {
        this.queryCondition.pageCondition.pageNum = 1;
        this.refreshData();
        this.getCardStatistics();
        this.$message.success(this.InspectionLanguage.operateMsg.turnBack);
      } else {
        this.$message.error(result.msg);
      }
    });
  }

  /**
   * ??????????????????
   */
  private setCondition(event: FilterCondition[]): FilterCondition[] {
    const param = [];
    param.push({
      filterValue: this.completedWorkOrderID,
      filterField: 'procId',
      operator: OperatorEnum.eq,
    });
    if (event && event.length > 0) {
      event.forEach(v => {
        if (v.filterField === 'resourceMatching') {
          param.push(v);
        } else {
          if (v.filterField === 'assign') {
            v.operator = OperatorEnum.in;
          }
          v.filterField = `procRelatedDevices.${v.filterField}`;
          param.push(v);
        }
      });
    }
    return param;
  }
  /**
   * ????????????
   * @param procId =??????id
   * (?????????????????????????????????????????????)
   */
  private getPicUrlByAlarmIdAndDeviceId(data: InspectionTaskModel): void {
    this.$workOrderCommonUtil.queryImageForView(data.deviceId, data.procId);
  }

  /**
   * ????????????
   */
  public closeModal(): void {
    this.scheduleIsVisible = false;
    // ??????????????????
    this.schedulePageBean = new PageModel();
    this.scheduleTable.handleRest();
    this.schedule_dataSet = [];
    this.scheduleTableConfig.showSearch = false;
    this.selectRefUserList = [];
  }

  /**
   * ?????????????????????
   */
  private queryAllDeptList(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.$userService.queryAllDepartment().subscribe((result: ResultModel<DepartmentUnitModel[]>) => {
        this.unitTreeNodes = result.data || [];
        resolve(true);
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
   * ???????????????????????????
   * @param data ?????????
   */
  public showCompleted(data: InspectionWorkOrderModel): void {
    this.finishQueryCondition = new QueryConditionModel();
    this.completedWorkOrderID = data.procId;
    this.refreshCompleteData();
    this.title = this.InspectionLanguage.completeInspectionInformation;
    this.scheduleIsVisible = true;
  }

  /**
   * ????????????????????????
   * (?????????????????????????????????????????????)
   */
  private getAllUser(): void {
    if (this.roleArray.length > 0) {
      return;
    }
    this.$inspectionWorkOrderService.getDepartUserList().subscribe((result: ResultModel<OrderUserModel[]>) => {
      if (result.code === ResultCodeEnum.success) {
        const list = result.data || [];
        list.forEach(item => {
          this.roleArray.push({'label': item.userName, 'value': item.id});
        });
      }
    });
  }

  /**
   * ??????????????????
   */
  public showArea(filterValue: FilterCondition): void {
    this.areaFilterValue = filterValue;
    // ?????????????????????????????????
    if (this.areaNodes.length > 0) {
      this.areaSelectorConfig.treeNodes = this.areaNodes;
      this.areaSelectVisible = true;
    } else {
      // ??????????????????
      this.$workOrderCommonUtil.getRoleAreaList().then((data: any[]) => {
        this.areaNodes = data;
        this.areaSelectorConfig.treeNodes = this.areaNodes;
        FacilityForCommonUtil.setAreaNodesStatus(this.areaNodes, null);
        this.areaSelectVisible = true;
      });
    }
  }

  /**
   * ??????????????????
   * @param item ???????????????
   */
  public areaSelectChange(item: AreaFormModel): void {
    if (item && item[0]) {
      this.areaFilterValue.filterValue = item[0].areaCode;
      this.areaFilterValue.filterName = item[0].areaName;
      FacilityForCommonUtil.setAreaNodesStatus(this.areaNodes, item[0].areaId, item[0].areaId);
    } else {
      this.areaFilterValue.filterValue = null;
      this.areaFilterValue.filterName = '';
    }
  }

  /**
   * ????????????????????????
   * (?????????????????????????????????????????????)
   */
  private getAssignData(areaCode: string): void {
    const data = new AreaDeviceParamModel();
    data.areaCodes = [areaCode];
    data.userId = WorkOrderBusinessCommonUtil.getUserId();
    this.$facilityForCommonService.listDepartmentByAreaAndUserId(data).subscribe((result: ResultModel<NzTreeNode[]>) => {
      if (result.code === ResultCodeEnum.success && result.data.length > 0) {
        this.assignTreeNode = [];
        this.assignTreeNode = result.data;
        WorkOrderInitTreeUtil.initAssignTreeConfig(this);
        this.showAssignModal();
      } else {
        this.showAssignModal();
      }
    });
  }
  /**
   * ???????????????
   */
  private showAssignModal(): void {
    this.assignTreeSelectorConfig.treeNodes = this.assignTreeNode;
    this.assignVisible = true;
  }

  /**
   * ??????????????????
   */
  public selectAssignDataChange(event: DepartmentUnitModel[]): void {
    FacilityForCommonUtil.setTreeNodesStatus(this.assignTreeNode, []);
    if (event && event.length > 0) {
      const param = new AssignDepartmentModel();
      param.procId = this.procId;  // ??????id
      param.accountabilityDept = event[0].deptCode;  // ????????????
      param.accountabilityDeptName = event[0].deptName;  // ??????????????????
      this.$inspectionWorkOrderService.assignedUnfinished(param).subscribe((result: ResultModel<string>) => {
        if (result.code === ResultCodeEnum.success) {
          this.$message.success(this.InspectionLanguage.operateMsg.assignSuccess);
          this.refreshData();
          this.getCardStatistics();
        } else {
          this.$message.error(result.msg);
        }
      });
    } else {
      this.$message.error(this.InspectionLanguage.pleaseSelectUnit);
    }
  }
  /**
   * ?????????????????????????????????
   * param event
   */
  public sliderChange(event): void {
    if (this.isNoData) {
      return;
    }
    if (event.code) {
      this.isReset = true;
      if (event.code && event.code !== 'all') {
        this.workTable.tableService.resetFilterConditions(this.workTable.queryTerm);
        this.workTable.handleSetControlData('status', [event.code]);
        this.workTable.handleSearch();
      } else if (event.code === 'all') {
        this.queryCondition.bizCondition = {};
        this.queryCondition.filterConditions = [];
        this.workTable.handleSetControlData('status', null);
      }
      this.refreshData();
    }
  }
  /**
   * ????????????
   * param event
   */
  public slideShowChange(event): void {
    this.slideShowChangeData = event;
  }

  /**
   * ??????????????????
   */
  private getCardStatistics(): void {
    this.getIncreaseAddCount().then((bool) => {
      if (bool) {
        this.getInspectProcessingCount();
        this.isNoData = false;
      } else {
        this.isNoData = true;
        WorkOrderClearInspectUtil.initStatisticsList(this, WorkOrderClearInspectUtil.defaultCardList(), 0);
      }
    });
  }

  /**
   * ????????????
   */
  private getIncreaseAddCount(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.$inspectionWorkOrderService.inspectTodayAdd({}).subscribe((result: ResultModel<number>) => {
        if (result.code === ResultCodeEnum.success) {
          this.increaseAddCount = result.data;
          resolve(true);
        } else {
          this.$message.error(result.msg);
          resolve(false);
        }
      }, (error) => {
        WorkOrderClearInspectUtil.initStatisticsList(this, WorkOrderClearInspectUtil.defaultCardList(), 0);
      });
    });
  }

  /**
   * ????????????
   */
  private getInspectProcessingCount(): void {
    this.sliderConfig = [];
    this.$inspectionWorkOrderService.inspectCardStatistic({}).subscribe((result: ResultModel<RepairOrderStatusCountModel[]>) => {
      if (result.code === ResultCodeEnum.success) {
        let dataList = [];
        const isStatus = ['assigned', 'processing', 'pending', 'singleBack', 'turnProcess'];
        if (result.data.length > 0) {
          result.data.forEach(item => {
            if (isStatus.indexOf(item.status) > -1) {
              dataList.push({
                orderCount: item.count,
                status: item.status,
                statusName: this.workOrderLanguage[item.status],
                orderPercent: 0.0
              });
            }
          });
        } else {
          dataList = WorkOrderClearInspectUtil.defaultCardList();
        }
        WorkOrderClearInspectUtil.initStatisticsList(this, dataList, this.increaseAddCount);
      }
    });
  }

  /**
   * ????????????
   * (?????????????????????????????????????????????)
   */
  private showInspectTransForm(params: InspectionWorkOrderModel): void {
    const data = new TransferOrderParamModel();
    data.type = ClearBarrierOrInspectEnum.inspection;
    data.procId = params.procId;
    data.accountabilityDept = params.accountabilityDept;
    this.transModalData = data;
    this.isShowTransModal = true;
  }
  /**
   * ????????????
   */
  public transferInspectOrders(event: TransferOrderParamModel): void {
    if (event) {
      this.$inspectionWorkOrderService.transInspectOrder(event).subscribe((result: ResultModel<string>) => {
        if (result.code === ResultCodeEnum.success) {
          this.$message.success(this.InspectionLanguage.operateMsg.turnProgress);
          this.isShowTransModal = false;
          this.refreshData();
          this.getCardStatistics();
        } else {
          this.$message.error(result.msg);
        }
      });
    } else {
      this.isShowTransModal = false;
    }
  }
}

