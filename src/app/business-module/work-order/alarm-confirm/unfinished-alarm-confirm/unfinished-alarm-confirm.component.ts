import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FilterCondition, QueryConditionModel} from '../../../../shared-module/model/query-condition.model';
import {PageModel} from '../../../../shared-module/model/page.model';
import {InspectionLanguageInterface} from '../../../../../assets/i18n/inspection-task/inspection.language.interface';
import {TableConfigModel} from '../../../../shared-module/model/table-config.model';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {NzI18nService, NzTreeNode} from 'ng-zorro-antd';
import {WorkOrderLanguageInterface} from '../../../../../assets/i18n/work-order/work-order.language.interface';
import {SliderCardConfigModel} from '../../share/model/slider-card-config-model';
import {UnfinishedAlarmConfirmTable} from './unfinished-alarm-confirm-table';
import {WorkOrderStatusUtil} from '../../../../core-module/business-util/work-order/work-order-for-common.util';
import {WorkOrderBusinessCommonUtil} from '../../share/util/work-order-business-common.util';
import {CommonUtil} from '../../../../shared-module/util/common-util';
import {WorkOrderClearInspectUtil} from '../../share/util/work-order-clear-inspect.util';
import {WorkOrderStatusEnum} from '../../../../core-module/enum/work-order/work-order-status.enum';
import {TableComponent} from '../../../../shared-module/component/table/table.component';
import {SelectModel} from '../../../../shared-module/model/select.model';
import {AlarmSelectorConfigModel, AlarmSelectorInitialValueModel} from '../../../../shared-module/model/alarm-selector-config.model';
import {FilterValueModel} from '../../../../core-module/model/work-order/filter-value.model';
import {SelectOrderEquipmentModel} from '../../share/model/select-order-equipment.model';
import {EquipmentListModel} from '../../../../core-module/model/equipment/equipment-list.model';
import {Router} from '@angular/router';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {AlarmConfirmWorkOrderService} from '../../share/service/alarm-confirm';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {AlarmConfirmWorkOrderModel} from '../../share/model/alarm-confirm/alarm-confirm.model';
import {TreeSelectorConfigModel} from '../../../../shared-module/model/tree-selector-config.model';
import {WorkOrderInitTreeUtil} from '../../share/util/work-order-init-tree.util';
import {DepartmentUnitModel} from '../../../../core-module/model/work-order/department-unit.model';
import {WorkOrderCommonServiceUtil} from '../../share/util/work-order-common-service.util';
import {FacilityForCommonUtil} from '../../../../core-module/business-util/facility/facility-for-common.util';
import {AreaFormModel} from '../../share/model/area-form.model';
import {AlarmSelectorConfigTypeEnum} from '../../../../shared-module/enum/alarm-selector-config-type.enum';
import {OperatorEnum} from '../../../../shared-module/enum/operator.enum';
import {AssignDepartmentModel} from '../../share/model/assign-department.model';
import {AreaDeviceParamModel} from '../../../../core-module/model/work-order/area-device-param.model';
import {FacilityForCommonService} from '../../../../core-module/api-service/facility';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {TransferOrderParamModel} from '../../share/model/clear-barrier-model/transfer-order-param.model';
import {ClearBarrierOrInspectEnum, LastDayColorEnum} from '../../share/enum/clear-barrier-work-order.enum';
import {WorkOrderPageTypeEnum} from '../../share/enum/work-order-page-type.enum';
import {AlarmListModel} from '../../../../core-module/model/alarm/alarm-list.model';
import {AlarmForCommonService} from '../../../../core-module/api-service/alarm';
import {AlarmLanguageInterface} from '../../../../../assets/i18n/alarm/alarm-language.interface';
import {ExportRequestModel} from '../../../../shared-module/model/export-request.model';
import {UserRoleModel} from '../../../../core-module/model/user/user-role.model';

/**
 * ???????????????????????????
 */
@Component({
  selector: 'app-unfinished-alarm-confirm',
  templateUrl: './unfinished-alarm-confirm.component.html',
  styleUrls: ['./unfinished-alarm-confirm.component.scss']
})
export class UnfinishedAlarmConfirmComponent implements OnInit {
  // ??????????????????
  @ViewChild('statusTemp') public statusTemp: TemplateRef<any>;
  // ????????????
  @ViewChild('deviceTemp') deviceTemp: TemplateRef<any>;
  // ????????????
  @ViewChild('equipTemp') equipTemp: TemplateRef<any>;
  // ?????????????????????????????????
  @ViewChild('unfinishedAlarm') unfinishedAlarm: TableComponent;
  // ??????????????????
  @ViewChild('DeviceNameSearch') public deviceNameSearch: TemplateRef<any>;
  // ????????????
  @ViewChild('equipmentSearch') public equipmentSearch: TemplateRef<any>;
  // ??????????????????
  @ViewChild('unitNameSearch') unitNameSearch: TemplateRef<any>;
  // ????????????
  @ViewChild('areaSearch') areaSearch: TemplateRef<any>;
  // ????????????
  @ViewChild('alarmWarmingTemp') alarmWarmingTemp: TemplateRef<any>;
  // ????????????
  @ViewChild('refAlarmTemp') public refAlarmTemp: TemplateRef<any>;
  // ????????????
  @ViewChild('userSearchTemp') userSearchTemp: TemplateRef<any>;
  // ?????????
  public inspectionLanguage: InspectionLanguageInterface;
  public workOrderLanguage: WorkOrderLanguageInterface;
  // ????????????
  public alarmLanguage: AlarmLanguageInterface;
  // ????????????
  public pageBean: PageModel = new PageModel();
  // ??????????????????
  public alarmTableConfig: TableConfigModel;
  // ????????????
  public sliderConfig: SliderCardConfigModel[] = [];
  // ?????????????????????
  public deviceObjectConfig: AlarmSelectorConfigModel;
  // ????????????
  public filterObj: FilterValueModel = new FilterValueModel();
  // ?????????????????????
  private checkDeviceObject: FilterValueModel = new FilterValueModel();
  // ?????????????????????
  public equipmentVisible: boolean = false;
  // ???????????????
  public checkEquipmentObject: SelectOrderEquipmentModel = new SelectOrderEquipmentModel();
  // ??????????????????
  public selectEquipments: EquipmentListModel[] = [];
  // ???????????????????????????
  public tableDataSet: AlarmConfirmWorkOrderModel[] = [];
  // ??????????????????
  public workOrderList: SelectModel[] = [];
  // ???????????????
  public treeSelectorConfig: TreeSelectorConfigModel;
  // ?????????????????????
  public areaSelectorConfig: TreeSelectorConfigModel;
  // ??????????????????
  public alarmNameSelectConfig: AlarmSelectorConfigModel;
  // ????????????
  public departFilterValue: FilterCondition = {
    filterField: '',
    operator: '',
    filterValue: '',
    filterName: ''
  };
  // ?????????????????????
  public responsibleUnitIsVisible: boolean = false;
  // ????????????????????????
  public areaSelectVisible: boolean = false;
  // ????????????
  public areaFilterValue: FilterCondition = {
    filterField: '',
    operator: '',
    filterValue: '',
    filterName: ''
  };
  // ????????????????????????
  public assignVisible: boolean = false;
  // ???????????????
  public assignTreeSelectorConfig: TreeSelectorConfigModel;
  // ??????????????????
  public isShowTransModal: boolean = false;
  // ????????????
  public transModalData: TransferOrderParamModel;
  // ??????????????????
  public isChargeback: boolean = false;
  // ??????????????????
  public isShowRefAlarm: boolean = false;
  // ????????????
  public alarmData: AlarmListModel;
  // ??????????????????
  public isShowUserTemp: boolean = false;
  // ??????????????????
  public selectUserList: UserRoleModel[] = [];
  // ????????????
  public checkUserObject: FilterValueModel = new FilterValueModel();
  // ????????????
  private userFilterValue: FilterCondition;
  // ??????????????????
  private assignTreeNode: NzTreeNode[] = [];
  // ????????????????????? ??????????????????????????????
  private slideShowChangeData;
  // ?????????????????????
  private equipmentFilterValue: FilterCondition;
  // ????????????
  private queryCondition: QueryConditionModel = new QueryConditionModel();
  // ?????? ?????????????????????????????????????????????
  private exportParams: ExportRequestModel = new ExportRequestModel();
  // ??????
  private alarmConfirmDeduplication: boolean = false;
  // ?????????
  private unitTreeNodes: DepartmentUnitModel[] = [];
  // ????????????
  private areaNodes: AreaFormModel[] = [];
  // ?????????????????????
  private selectAlarmData: AlarmSelectorInitialValueModel = new AlarmSelectorInitialValueModel();
  // ????????????id
  private currentProcId: string;

  constructor(
    private $nzI18n: NzI18nService,
    private $router: Router,
    public $message: FiLinkModalService,
    private $alarmWorkOrderService: AlarmConfirmWorkOrderService,
    private $alarmForCommonService: AlarmForCommonService,
    private $workOrderCommonUtil: WorkOrderCommonServiceUtil,
    private $facilityForCommonService: FacilityForCommonService,
    ) {}

  public ngOnInit(): void {
    this.workOrderLanguage = this.$nzI18n.getLocaleData(LanguageEnum.workOrder);
    this.inspectionLanguage = this.$nzI18n.getLocaleData(LanguageEnum.inspection);
    this.alarmLanguage = this.$nzI18n.getLocaleData(LanguageEnum.alarm);
    // ?????????????????????
    (WorkOrderStatusUtil.getWorkOrderStatusList(this.$nzI18n)).forEach(v => {
      if (v.value !== WorkOrderStatusEnum.completed) {
        this.workOrderList.push(v);
      }
    });
    // ???????????????
    UnfinishedAlarmConfirmTable.initUnfinishedAlarmConfig(this);
    // ?????????
    WorkOrderInitTreeUtil.initTreeSelectorConfig(this);
    // ?????????
    WorkOrderInitTreeUtil.initAreaSelectorConfig(this);
    // ???????????????
    WorkOrderInitTreeUtil.initAssignTreeConfig(this);
    // ????????????
    this.refreshData();
    // ????????????
    this.getCardList();
    // ????????????
    this.initDeviceObjectConfig();
    // ????????????
    this.initAlarmWarningName();
  }

  /**
   * ???????????????????????????
   * @param filterValue ????????????
   */
  public showDeptModal(filterValue: FilterCondition): void {
    this.departFilterValue = filterValue;
    if (this.unitTreeNodes.length === 0) {
      this.$workOrderCommonUtil.queryAllDeptList().then((data: DepartmentUnitModel[]) => {
        if (data.length) {
          this.alarmConfirmDeduplication = true;
          this.unitTreeNodes = data;
          this.treeSelectorConfig.treeNodes = data;
          this.responsibleUnitIsVisible = true;
        }
      });
    } else {
      this.responsibleUnitIsVisible = true;
    }
  }
  /**
   * ????????????????????????
   * @param event ????????????????????????
   */
  public departmentSelectDataChange(event: DepartmentUnitModel[]): void {
    if (event && event.length > 0) {
      this.departFilterValue.filterName = event[0].deptName;
      this.departFilterValue.filterValue = event[0].deptCode;
      FacilityForCommonUtil.setTreeNodesStatus(this.unitTreeNodes, [event[0].id]);
    }
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
      this.alarmConfirmDeduplication = true;
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
      this.alarmConfirmDeduplication = false;
    } else {
      this.areaFilterValue.filterValue = null;
      this.areaFilterValue.filterName = '';
    }
  }
  /**
   * ??????????????????
   */
  public refreshData(): void {
    this.alarmTableConfig.isLoading = true;
    const params = ['deviceId', 'refAlarmId', 'equipment.equipmentId', 'assign'];
    this.queryCondition.filterConditions.forEach(v => {
      if (params.includes(v.filterField)) {
        v.operator = OperatorEnum.in;
      }
    });
    this.$alarmWorkOrderService.getUnfinishedAlarmConfirmList(this.queryCondition).subscribe((result: ResultModel<AlarmConfirmWorkOrderModel[]>) => {
      if (result.code === ResultCodeEnum.success) {
        this.pageBean.Total = result.totalPage * result.size;
        this.pageBean.pageSize = result.size;
        this.pageBean.pageIndex = result.pageNum;
        const list = result.data || [];
        this.alarmTableConfig.showEsPagination = list.length > 0;
        list.forEach(item => {
          // ????????????
          if (item.status) {
            item.statusClass = WorkOrderStatusUtil.getWorkOrderIconClassName(item.status);
            item.statusName = WorkOrderStatusUtil.getWorkOrderStatus(this.$nzI18n, item.status);
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
          // ????????????????????????????????????
          if (item.lastDays <= 0) {
            item.rowStyle = {color: LastDayColorEnum.overdueTime};
          } else if (item.lastDays <= 3 && item.lastDays > 0) {
            item.rowStyle = {color: LastDayColorEnum.estimatedTime};
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
        this.tableDataSet = list;
      }
      this.alarmTableConfig.isLoading = false;
    }, () => {
      this.alarmTableConfig.isLoading = false;
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
   * ?????????????????????????????????
   * param event
   */
  public sliderChange(event): void {
    if (event.code) {
      if (event.code && event.code !== 'all') {
        this.unfinishedAlarm.tableService.resetFilterConditions(this.unfinishedAlarm.queryTerm);
        this.unfinishedAlarm.handleSetControlData('status', [event.code]);
        this.unfinishedAlarm.handleSearch();
        this.alarmConfirmDeduplication = true;
      } else if (event.code === 'all') {
        this.queryCondition.bizCondition = {};
        this.queryCondition.filterConditions = [];
        this.unfinishedAlarm.handleSetControlData('status', null);
      }
      this.refreshData();
    }
  }
  /**
   * ????????????
   * param event
   */
  public slideShowChange(event: boolean): void {
    this.slideShowChangeData = event;
  }
  /**
   * ??????????????????
   */
  public openEquipmentSelector(filterValue: FilterCondition): void {
    this.equipmentVisible = true;
    this.equipmentFilterValue = filterValue;
  }
  /**
   * ??????????????????
   */
  public onSelectEquipment(event: EquipmentListModel[]): void {
    this.selectEquipments = event;
    this.checkEquipmentObject = {
      ids: event.map(v => v.equipmentId) || [],
      name: event.map(v => v.equipmentName).join(',') || '',
      type: ''
    };
    this.alarmConfirmDeduplication = false;
    this.equipmentFilterValue.filterValue = this.checkEquipmentObject.ids.length === 0 ? null : this.checkEquipmentObject.ids;
    this.equipmentFilterValue.filterName = this.checkEquipmentObject.name;
  }
  /**
   * ??????????????????
   */
  public selectAssignDataChange(event: DepartmentUnitModel[]): void {
    FacilityForCommonUtil.setTreeNodesStatus(this.assignTreeNode, []);
    if (event && event.length > 0) {
      const param = new AssignDepartmentModel();
      param.procId = this.currentProcId;  // ??????id
      param.accountabilityDept = event[0].deptCode;  // ????????????
      param.accountabilityDeptName = event[0].deptName;  // ??????????????????
      this.$alarmWorkOrderService.assignAlarmOrder(param).subscribe((result: ResultModel<string>) => {
        if (result.code === ResultCodeEnum.success) {
          this.$message.success(this.inspectionLanguage.operateMsg.assignSuccess);
          this.refreshData();
          this.getCardList();
        } else {
          this.$message.error(result.msg);
        }
      });
    } else {
      this.$message.error(this.inspectionLanguage.pleaseSelectUnit);
    }
  }
  /**
   * ????????????
   */
  public transferInspectOrders(event: TransferOrderParamModel): void {
    if (event) {
      console.log(event);
      this.$alarmWorkOrderService.transAlarmOrder(event).subscribe((result: ResultModel<string>) => {
        if (result.code === ResultCodeEnum.success) {
          this.refreshData();
          this.getCardList();
          this.isShowTransModal = false;
          this.$message.success(this.inspectionLanguage.operateMsg.turnProgress);
        } else {
          this.$message.error(result.msg);
        }
      });
    } else {
      this.isShowTransModal = false;
    }
  }

  /**
   * ???????????? event = true
   * ???????????? event = false
   */
  public chargebackOrder(event): void {
    if (event) {
      this.$alarmWorkOrderService.chargebackOrder(this.currentProcId).subscribe((res: ResultModel<string>) => {
        if (res.code === ResultCodeEnum.success) {
          this.isChargeback = false;
          this.$message.success(this.inspectionLanguage.operateMsg.successful);
          this.refreshData();
          this.getCardList();
        } else {
          this.$message.error(res.msg);
        }
      });
    } else {
      this.$router.navigate([`/business/work-order/alarm-confirm/unfinished-list/rebuild`],
        {queryParams: {type: WorkOrderPageTypeEnum.rebuild, procId: this.currentProcId, operateFrom: WorkOrderPageTypeEnum.unfinished}}).then();
    }
  }

  /**
   * ????????????????????????
   */
  public showRefAlarmModal(data: AlarmConfirmWorkOrderModel) {
    // 0data.refAlarmId = '6011483618879a3980f6375a';
    // ????????????
    this.$alarmForCommonService.queryCurrentAlarmInfoById(data.refAlarmId).subscribe((result: ResultModel<AlarmListModel>) => {
      if (result.code === 0 && result.data) {
        this.alarmData = result.data;
        // ??????????????????
        this.alarmData.alarmContinousTime = CommonUtil.setAlarmContinousTime(this.alarmData.alarmBeginTime, this.alarmData.alarmCleanTime,
          {month: this.alarmLanguage.month, day: this.alarmLanguage.day, hour: this.alarmLanguage.hour});
        this.isShowRefAlarm = true;
      } else {
        // ????????????
        this.$alarmForCommonService.queryAlarmHistoryInfo(data.refAlarmId).subscribe((res: ResultModel<AlarmListModel>) => {
          if (res.code === 0 && res.data) {
            this.alarmData = res.data;
            if (this.alarmData.alarmContinousTime) {
              this.alarmConfirmDeduplication = false;
              this.alarmData.alarmContinousTime = `${this.alarmData.alarmContinousTime}${this.alarmLanguage.hour}`;
            } else {
              this.alarmData.alarmContinousTime = '';
            }
            this.isShowRefAlarm = true;
          } else {
            this.$message.error(this.inspectionLanguage.noData);
          }
        });
      }
    });
  }
  /**
   * ??????????????????
   */
  public closeRefAlarm(): void {
    this.isShowRefAlarm = false;
    this.alarmData = null;
  }
  /**
   * ??????????????????
   */
  public openUserSelector(filterValue: FilterCondition,  flag?: boolean): void {
    this.isShowUserTemp = true;
    this.userFilterValue = filterValue;
  }
  /**
   * ????????????
   */
  public onSelectUser(event: UserRoleModel[]): void {
    this.selectUserList = event;
    WorkOrderClearInspectUtil.selectUser(event, this);
  }
  /**
   * ???????????????(????????????)
   */
  private setIconStatus(item: AlarmConfirmWorkOrderModel): void {
    // ?????????????????????
    item.isShowDeleteIcon = item.status === WorkOrderStatusEnum.assigned;
    // ?????????????????????
    item.isShowEditIcon = item.status !== WorkOrderStatusEnum.singleBack;
    // ??????
    item.isShowTransfer = item.status === WorkOrderStatusEnum.processing;
    this.alarmConfirmDeduplication = true;
    // ?????????????????????
    item.isShowRevertIcon = item.status === WorkOrderStatusEnum.pending;
    // ?????????????????????
    item.isShowAssignIcon = item.status === WorkOrderStatusEnum.assigned;
    // ??????????????????????????????   isCheckSingleBack = 0 ?????????  1?????????
    item.isShowTurnBackConfirmIcon = (item.status === WorkOrderStatusEnum.singleBack);
  }
  /**
   * ????????????
   */
  private getCardList(): void {
    // ???????????????????????????
    let toDayTotal = 0;
    const that = this;
    this.$alarmWorkOrderService.alarmCardTodayAdd().subscribe((res: ResultModel<any>) => {
      if (res.code === ResultCodeEnum.success) {
        toDayTotal = res.data;
        that.$alarmWorkOrderService.alarmStatisticCard().subscribe((result: ResultModel<any>) => {
          if (res.code === ResultCodeEnum.success) {
            const list = result.data || [];
            const dataList = [];
            const isStatus = ['assigned', 'processing', 'pending', 'singleBack', 'turnProcess'];
            list.forEach(item => {
              if (isStatus.indexOf(item.status) > -1) {
                dataList.push({
                  orderCount: item.count,
                  status: item.status,
                  statusName: that.workOrderLanguage[item.status],
                  orderPercent: 0.0
                });
              }
            });
            WorkOrderClearInspectUtil.initStatisticsList(that, dataList, toDayTotal);
          } else {
            that.defaultCardList();
          }
        }, () => {
          that.defaultCardList();
        });
      } else {
        that.defaultCardList();
      }
    }, error => {
      that.defaultCardList();
    });
  }

  /**
   * ????????????
   */
  private defaultCardList(): void {
    WorkOrderClearInspectUtil.initStatisticsList(this, WorkOrderClearInspectUtil.defaultCardList(), 0);
  }
  /**
   * ???????????????
   */
  private initDeviceObjectConfig(): void {
    this.deviceObjectConfig = {
      clear: !this.filterObj.deviceIds.length,
      handledCheckedFun: (event) => {
        this.checkDeviceObject = event;
        this.filterObj.deviceIds = event.ids;
        this.filterObj.deviceName = event.name;
      }
    };
  }
  /**
   * ??????????????????
   */
  private initAlarmWarningName(): void {
    this.alarmNameSelectConfig = {
      type: AlarmSelectorConfigTypeEnum.table,
      clear: !this.selectAlarmData.ids.length,
      handledCheckedFun: (event: AlarmSelectorInitialValueModel) => {
        this.selectAlarmData = event;
      }
    };
  }
  /**
   * ????????????????????????
   * (????????????????????????????????????????????????)
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
        this.assignTreeSelectorConfig.treeNodes = this.assignTreeNode;
      } else {
        this.assignTreeSelectorConfig.treeNodes = [];
      }
      this.assignVisible = true;
    });
  }

  /**
   * ????????????
   * (????????????????????????????????????????????????)
   */
  private deleteProc(list: AlarmConfirmWorkOrderModel[]): void {
    const param = {procIdList: [], procType: ClearBarrierOrInspectEnum.alarmConfirmOrder};
    list.forEach(v => {
      param.procIdList.push(v.procId);
    });
    this.$alarmWorkOrderService.deleteAlarmConfirm(param).subscribe((res: ResultModel<string>) => {
      if (res.code === ResultCodeEnum.success) {
        this.$message.success(this.inspectionLanguage.operateMsg.deleteSuccess);
        this.refreshData();
        this.getCardList();
      } else {
        this.$message.error(res.msg);
      }
    });
  }
  /**
   *  ????????????
   *  (????????????????????????????????????????????????)
   */
  public backAlarmOrder(): void {
    this.$alarmWorkOrderService.workOrderWithdrawal({procId: this.currentProcId}).subscribe((res: ResultModel<string>) => {
      if (res.code === ResultCodeEnum.success) {
        this.refreshData();
        this.getCardList();
        this.$message.success(this.inspectionLanguage.operateMsg.turnBack);
      } else {
        this.$message.success(res.msg);
      }
    });
  }

  /**
   * ??????????????????
   * (????????????????????????????????????????????????)
   */
  private workOrderTransfer(params: AlarmConfirmWorkOrderModel): void {
    const data = new TransferOrderParamModel();
    data.type = ClearBarrierOrInspectEnum.alarmConfirmOrder;
    data.procId = params.procId;
    data.accountabilityDept = params.accountabilityDept;
    // data.accountabilityDept = '063';
    this.transModalData = data;
    this.isShowTransModal = true;
  }

}
