import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {TableConfigModel} from '../../../../shared-module/model/table-config.model';
import {PageModel} from '../../../../shared-module/model/page.model';
import {AddClearBarrierOrderUtil} from './detail-ref-alarm-table.util';
import {ActivatedRoute, Router} from '@angular/router';
import {FormItem} from '../../../../shared-module/component/form/form-config';
import {FormOperate} from '../../../../shared-module/component/form/form-operate.service';
import {NzI18nService, NzModalService, NzTreeNode} from 'ng-zorro-antd';
import {AbstractControl} from '@angular/forms';
import {ClearBarrierWorkOrderService} from '../../share/service/clear-barrier';
import {RuleUtil} from '../../../../shared-module/util/rule-util';
import {FormLanguageInterface} from '../../../../../assets/i18n/form/form.language.interface';
import {FilterCondition, QueryConditionModel} from '../../../../shared-module/model/query-condition.model';
import {AlarmLanguageInterface} from '../../../../../assets/i18n/alarm/alarm-language.interface';
import {AlarmForCommonService} from '../../../../core-module/api-service/alarm';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {CommonUtil} from '../../../../shared-module/util/common-util';
import {differenceInCalendarDays} from 'date-fns';
import {TreeSelectorConfigModel} from '../../../../shared-module/model/tree-selector-config.model';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {ClearBarrierWorkOrderModel} from '../../../../core-module/model/work-order/clear-barrier-work-order.model';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {ClearBarrierOrInspectEnum, IsSelectAllEnum, ResourceTypeEnum} from '../../share/enum/clear-barrier-work-order.enum';
import {WorkOrderPageTypeEnum} from '../../share/enum/work-order-page-type.enum';
import {DeviceTypeModel} from '../../share/model/device-type.model';
import {SelectAlarmModel} from '../../share/model/select-alarm.model';
import {FilterValueModel} from '../../../../core-module/model/work-order/filter-value.model';
import {DepartmentUnitModel} from '../../../../core-module/model/work-order/department-unit.model';
import {InspectionLanguageInterface} from '../../../../../assets/i18n/inspection-task/inspection.language.interface';
import {WorkOrderAlarmLevelColor} from '../../../../core-module/enum/trouble/trouble-common.enum';
import {SelectModel} from '../../../../shared-module/model/select.model';
import {AlarmSelectorConfigModel} from '../../../../shared-module/model/alarm-selector-config.model';
import {AreaDeviceParamModel} from '../../../../core-module/model/work-order/area-device-param.model';
import {InspectionWorkOrderService} from '../../share/service/inspection';
import {OperatorEnum} from '../../../../shared-module/enum/operator.enum';
import {WorkOrderBusinessCommonUtil} from '../../share/util/work-order-business-common.util';
import {AlarmStoreService} from '../../../../core-module/store/alarm.store.service';
import {EquipmentListModel} from '../../../../core-module/model/equipment/equipment-list.model';
import {AlarmCleansStatusEnum, AlarmConfirmStatusNumberEnum, RefAlarmFaultEnum} from '../../share/enum/refAlarm-faultt.enum';
import {RoleUnitModel} from '../../../../core-module/model/work-order/role-unit.model';
import {ClearWorkOrderEquipmentModel} from '../../share/model/clear-barrier-model/clear-work-order-equipment.model';
import {FacilityForCommonUtil} from '../../../../core-module/business-util/facility/facility-for-common.util';
import {FacilityForCommonService} from '../../../../core-module/api-service/facility';
import {WorkOrderLanguageInterface} from '../../../../../assets/i18n/work-order/work-order.language.interface';
import {UserForCommonService} from '../../../../core-module/api-service/user';
import {AlarmForCommonUtil} from '../../../../core-module/business-util/alarm/alarm-for-common.util';
import {SelectEquipmentModel} from '../../../../core-module/model/equipment/select-equipment.model';
import {WorkOrderStatusEnum} from '../../../../core-module/enum/work-order/work-order-status.enum';
import {AlarmWorkOrderModel} from '../../share/model/clear-barrier-model/alarm-work-order.model';
import {WorkOrderNumber} from '../../share/const/work-order-chart-color';

/**
 * ???????????????????????????
 */
@Component({
  selector: 'app-clear-barrier-work-order-detail',
  templateUrl: './clear-barrier-work-order-detail.component.html',
  styleUrls: ['./clear-barrier-work-order-detail.component.scss']
})
export class ClearBarrierWorkOrderDetailComponent implements OnInit {
  // ????????????
  @ViewChild('accountabilityUnit') public accountabilityUnit: TemplateRef<any>;
  // ????????????
  @ViewChild('alarmTemp') public alarmTemp: TemplateRef<any>;
  // ????????????
  @ViewChild('alarmSelectorModalTemp') public alarmSelectorModalTemp: TemplateRef<any>;
  // ????????????????????????
  @ViewChild('isCleanTemp') public isCleanTemp: TemplateRef<any>;
  // ????????????????????????
  @ViewChild('isConfirmTemp') public isConfirmTemp: TemplateRef<any>;
  // ??????
  @ViewChild('radioTemp') public radioTemp: TemplateRef<any>;
  // ????????????????????????
  @ViewChild('ecTimeTemp') public ecTimeTemp: TemplateRef<any>;
  // ????????????????????????
  @ViewChild('startTime') public startTime: TemplateRef<any>;
  // ????????????
  @ViewChild('statusTemp') public statusTemp: TemplateRef<any>;
  // ????????????
  @ViewChild('unitNameSearch') public unitNameSearch: TemplateRef<any>;
  // ????????????
  @ViewChild('deviceTemp') public deviceTemp: TemplateRef<any>;
  // ????????????
  @ViewChild('equipTemp') public equipTemp: TemplateRef<any>;
  // ????????????
  @ViewChild('alarmLevelTemp') public alarmLevelTemp: TemplateRef<any>;
  // ????????????
  @ViewChild('deviceNameTemp') public deviceNameTemp: TemplateRef<any>;
  // ????????????(????????????)
  @ViewChild('alarmEquipmentTemp') public alarmEquipmentTemp: TemplateRef<any>;
  // ????????????
  @ViewChild('autoDispatch') public autoDispatch: TemplateRef<any>;
  // ?????????????????????
  public equipmentVisible: boolean = false;
  // ?????????????????????
  public equipmentFilterValue: FilterCondition;
  // ???????????????
  public checkEquipmentObject: ClearWorkOrderEquipmentModel = new ClearWorkOrderEquipmentModel();
  // ??????????????????
  public selectEquipments: EquipmentListModel[] = [];
  // ?????????
  public formLanguage: FormLanguageInterface;
  // ????????????
  public alarmLanguage: AlarmLanguageInterface;
  // ???????????????
  public workOrderLanguage: WorkOrderLanguageInterface;
  // ????????????
  public InspectionLanguage: InspectionLanguageInterface;
  // ?????????????????????
  public language: AlarmLanguageInterface;
  // ????????????
  public unitDisabled: boolean;
  // ?????????
  public isLoading: boolean = false;
  // ??????
  public accountabilityUnitList = [];
  // ??????????????????
  public alarmObjectConfig: AlarmSelectorConfigModel;
  // ????????????
  public _dataSet: AlarmWorkOrderModel[] = [];
  // ??????
  public pageBean: PageModel = new PageModel();
  // ????????????
  public tableConfig: TableConfigModel;
  // ?????????
  public formColumn: FormItem[] = [];
  // ??????
  public formStatus: FormOperate;
  // ????????????
  public isFormDisabled: boolean;
  // ????????????
  public pageTitle: string;
  // ????????????
  public checkAlarmObject: SelectEquipmentModel = new SelectEquipmentModel();
  // ??????????????????
  public alarmTypeList: SelectModel[] = [];
  // ????????????
  public selectDepartName: string = '';
  // ??????
  public alarmName: string = '';
  // ???????????????
  public selectedAlarm: SelectAlarmModel;
  // ?????????????????????
  public _selectedAlarm: SelectAlarmModel;
  // ????????????id
  public selectedAlarmId: string = null;
  // ????????????
  public isShowBtn: boolean;
  // ????????????
  public selectData: RoleUnitModel = {
    checked: false,
    label: '',
    value: ''
  };
  // ??????????????????
  public unitTreeSelectorConfig: TreeSelectorConfigModel;
  // ?????????
  public unitsTreeNode: DepartmentUnitModel[] = [];
  // ????????????
  public isVisible: boolean = false;
  // ????????????
  public filterObj: FilterValueModel = new FilterValueModel();
  // ?????????
  public treeUnitSelectorConfig: TreeSelectorConfigModel;
  // ????????????
  public procType: string;
  // ??????????????????
  public isUnitsVisible: boolean = false;
  // ????????????
  public dispatchEnum = IsSelectAllEnum;
  public dispatchValue: string = IsSelectAllEnum.deny;
  public isDispatch: boolean = false;
  // ??????????????????
  private isCheckTime: boolean = true;
  // ????????????
  private alarmDisabled: boolean;
  // ??????
  private isAllChecked: boolean = false;
  // ????????????
  private selectedAccountabilityUnitIdList: string[] = [];
  // ????????????
  private alarmUnitNode: NzTreeNode[] = [];
  // ????????????
  private pageType: string = '';
  // ???????????????
  private isFault: boolean = false;
  // ??????
  private alarmLevelList: DeviceTypeModel[] = [];
  // ??????id
  private workOrderId: string;
  // ????????????  ???????????????    1??????????????? 2???????????? 0???????????????
  private updateStatus: number;
  // ????????????
  private filterValue: FilterValueModel;
  // ??????code
  private selectDeptCode: string = '';
  // ????????????????????????
  private selectEquipName: string;
  // ????????????
  private queryCondition: QueryConditionModel = new QueryConditionModel();

  constructor(
    private $nzI18n: NzI18nService,
    private $activatedRoute: ActivatedRoute,
    private $router: Router,
    private $tempModal: NzModalService,
    private $clearBarrierWorkOrderService: ClearBarrierWorkOrderService,
    private $alarmService: AlarmForCommonService,
    private $message: FiLinkModalService,
    private $ruleUtil: RuleUtil,
    private $userService: UserForCommonService,
    private $inspectionWorkOrderService: InspectionWorkOrderService,
    private $alarmStoreService: AlarmStoreService,
    private $facilityForCommonService: FacilityForCommonService,
  ) {}

  /**
   * ????????????
   */
  public ngOnInit(): void {
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.alarm);
    this.formLanguage = this.$nzI18n.getLocaleData(LanguageEnum.form);
    this.alarmLanguage = this.$nzI18n.getLocaleData(LanguageEnum.alarm);
    this.InspectionLanguage = this.$nzI18n.getLocaleData(LanguageEnum.inspection);
    this.workOrderLanguage = this.$nzI18n.getLocaleData(LanguageEnum.workOrder);
    this.loadPage();
    // ??????????????????
    AlarmForCommonUtil.getAlarmTypeList(this.$alarmService).then((data: SelectModel[]) => {
      this.alarmTypeList = data;
      AddClearBarrierOrderUtil.initAlarmTableConfig(this);
    }, error => {
      AddClearBarrierOrderUtil.initAlarmTableConfig(this);
    });
    // ????????????
    this.initAlarmObjectConfig();
    this.initColumn();
    AddClearBarrierOrderUtil.initUnitTreeConfig(this);
    AddClearBarrierOrderUtil.initUnitTreeSelectConfig(this);
    for (const k in WorkOrderAlarmLevelColor) {
      if (WorkOrderAlarmLevelColor[k]) {
        this.alarmLevelList.push({
          label: this.alarmLanguage[k],
          code: WorkOrderAlarmLevelColor[k]
        });
      }
    }
  }

  /**
   * ???????????????
   */
  public formInstance(event: {instance: FormOperate}): void {
    this.formStatus = event.instance;
    this.formStatus.group.statusChanges.subscribe(() => {
      this.isFormDisabled = this.formStatus.getValid();
    });
  }

  /**
   * ??????????????????
   */
  public initAlarmObjectConfig(): void {
    this.alarmObjectConfig = {
      clear: !this.checkAlarmObject.ids.length,
      handledCheckedFun: (event) => {
        this.checkAlarmObject = event;
      }
    };
  }

  /**
   * ????????????
   * param type
   * returns {string}
   */
  private getPageTitle(type: string): string {
    let title;
    switch (type) {
      case WorkOrderPageTypeEnum.add:
        title = this.workOrderLanguage.addClearBarrierWorkOrder;
        break;
      case WorkOrderPageTypeEnum.update:
        title = this.workOrderLanguage.modifyClearBarrierWorkOrder;
        break;
      case WorkOrderPageTypeEnum.view:
        title = this.workOrderLanguage.viewClearBarrierWorkOrder;
        this.isShowBtn = false;
        break;
      case WorkOrderPageTypeEnum.rebuild:
        title = this.workOrderLanguage.rebuildOrder;
        break;
    }
    return title;
  }

  /**
   * ??????
   */
  public goBack(): void {
    window.history.back();
  }

  /**
   * ????????????
   */
  public pageChange(event: PageModel): void {
    this.queryCondition.pageCondition.pageNum = event.pageIndex;
    this.queryCondition.pageCondition.pageSize = event.pageSize;
    this.refreshData();
  }

  /**
   * ??????????????????modal
   */
  public showSelectorModal(): void {
    if (this.unitDisabled) {
      return;
    }
    if (!this.isFault && !this.selectedAlarmId) { // ????????????
      this.$message.error(this.workOrderLanguage.alarmSelectedError);
      return;
    }
    AddClearBarrierOrderUtil.initUnitTreeConfig(this);
    this.treeUnitSelectorConfig.treeNodes = this.alarmUnitNode;
    this.isUnitsVisible = true;
  }

  /**
   * ????????????modal
   */
  public showAlarmSelectorModal(): void {
    if (this.unitDisabled) {
      return;
    }
    const modal = this.$tempModal.create({
      nzTitle: this.workOrderLanguage.refAlarm,
      nzContent: this.alarmSelectorModalTemp,
      nzOkType: 'danger',
      nzClassName: 'custom-create-modal',
      nzMaskClosable: false,
      nzWidth: 1000,
      nzFooter: [
        {
          label: this.InspectionLanguage.handleOk,
          onClick: () => {
            this.selectAlarm(modal);
          }
        },
        {
          label: this.InspectionLanguage.handleCancel,
          type: 'danger',
          onClick: () => {
            this._dataSet = [];
            modal.destroy();
          }
        },
      ],
    });
    modal.afterOpen.subscribe(() => {
      this.refreshData();
    });
  }

  /**
   * ????????????
   * param event
   * param data
   */
  public selectedAlarmChange(event: boolean, data: SelectAlarmModel): void {
    this._selectedAlarm = data;
  }

  /**
   * ??????????????????
   */
  public selectDispatch(event): void {
    this.formStatus.resetControlData('autoDispatch', event);
  }

  /**
   * ????????????     ???????????????
   * param modal
   */
  private selectAlarm(modal): void {
    if (this._selectedAlarm) {
      this.selectedAlarm = CommonUtil.deepClone(this._selectedAlarm);
      this.selectedAlarmId = this.selectedAlarm.id;
      this.selectDepartName = null;
      this.selectedAccountabilityUnitIdList = [];
      this.accountabilityUnitList = [];
      this.isAllChecked = false;
      this.alarmName = this.selectedAlarm.alarmName;
      this.formStatus.resetControlData('refAlarm', this.alarmName);
      this.formStatus.resetControlData('equipmentName', this.selectedAlarm.alarmObject);
      this.formStatus.resetControlData('deviceName', this.selectedAlarm.alarmDeviceName);
      this.getUnitDataList(this.selectedAlarm.areaCode);
      this.selectDepartName = '';
      this.selectDeptCode = '';
      modal.destroy();
    } else {
      this.$message.warning(this.workOrderLanguage.alarmSelectedError);
    }
  }

  /**
   * ??????????????????
   */
  public getWorkOrderDetail(): void {
    this.$clearBarrierWorkOrderService.getWorkOrderDetail(this.workOrderId).subscribe((result: ResultModel<ClearBarrierWorkOrderModel>) => {
      if (result.code === ResultCodeEnum.success) {
        if (result.data.status === WorkOrderStatusEnum.assigned) {
          this.updateStatus = WorkOrderNumber.two;
        } else if (result.data.status === WorkOrderStatusEnum.singleBack) {
          this.updateStatus = WorkOrderNumber.one;
        } else {
          this.updateStatus = WorkOrderNumber.three;
          this.unitDisabled = true;
          this.alarmDisabled = true;
          this.isCheckTime = false;
          this.isDispatch = true;
          this.formStatus.group.controls['title'].disable();
          this.formStatus.group.controls['expectedCompletedTime'].disable();
          this.formStatus.group.controls['supplies'].disable();
        }
        this.setWorkOrderData(result.data);
      }
    });
  }

  /**
   * ??????????????????
   */
  public handleFilter(filters: FilterCondition[]): FilterCondition[] {
    const filterEvent = [];
    filters.forEach(item => {
      switch (item.filterField) {
        case 'alarmHappenCount':
          // ??????
          filterEvent.push({
            filterField: 'alarmHappenCount',
            filterValue: Number(item.filterValue) ? Number(item.filterValue) : 0,
            operator: 'lte',
          });
          break;
        case 'alarmSource':
          // ????????????
          if (this.checkEquipmentObject.name) {
            filterEvent.push({
              filterField: 'alarmSource',
              filterValue: this.checkEquipmentObject.ids,
              operator: OperatorEnum.in,
            });
          }
          break;
        case 'alarmDeviceName':
          // ????????????
          if (this.checkAlarmObject.name) {
            filterEvent.push({
              filterField: 'alarmDeviceId',
              filterValue: this.checkAlarmObject.ids,
              operator: OperatorEnum.in,
            });
          }
          break;
        default:
          filterEvent.push(item);
      }
    });
    return filterEvent;
  }

  /**
   * ??????????????????
   */
  public refreshData(): void {
    this.tableConfig.isLoading = true;
    this.$clearBarrierWorkOrderService.getRefAlarmInfo(this.queryCondition).subscribe((res: ResultModel<AlarmWorkOrderModel[]>) => {
      this._dataSet = [];
      if (res.data && res.data.length > 0) {
        this.pageBean.Total = res.totalCount;
        this.pageBean.pageSize = res.size;
        this.pageBean.pageIndex = res.pageNum;
        res.data.forEach(item => {
          item.alarmClassificationName = AlarmForCommonUtil.showAlarmTypeInfo(this.alarmTypeList, item.alarmClassification);
          if (item.alarmDeviceTypeId) {
            item.deviceTypeName = WorkOrderBusinessCommonUtil.deviceTypeNames(this.$nzI18n, item.alarmDeviceTypeId);
            if (item.deviceTypeName) {
              item.deviceClass = CommonUtil.getFacilityIconClassName(item.alarmDeviceTypeId);
            }
          }
          if (item.alarmFixedLevel) {
            item.levelName = this.turnAlarmLevel(item.alarmFixedLevel);
            item.levelStyle = this.$alarmStoreService.getAlarmColorByLevel(item.alarmFixedLevel).backgroundColor;
          }
          if (item.alarmSourceTypeId) {
            item.equipmentTypeName = WorkOrderBusinessCommonUtil.equipTypeNames(this.$nzI18n, item.alarmSourceTypeId);
            if (item.equipmentTypeName) {
              item.equipClass = CommonUtil.getEquipmentIconClassName(item.alarmSourceTypeId);
            }
          }
          if (item.alarmConfirmStatus && item.alarmConfirmStatus === AlarmConfirmStatusNumberEnum.isConfirm) {
            item.alarmConfirmStatusName = this.language.isConfirm;
          } else if (item.alarmConfirmStatus && item.alarmConfirmStatus === AlarmConfirmStatusNumberEnum.noConfirm) {
            item.alarmConfirmStatusName = this.language.noConfirm;
          }
          if (item.alarmCleanStatus) {
            switch (item.alarmCleanStatus) {
              case AlarmCleansStatusEnum.isClean:
                item.alarmCleanStatusName = this.language.isClean;
                break;
              case AlarmCleansStatusEnum.deviceClean:
                item.alarmCleanStatusName = this.language.deviceClean;
                break;
              case AlarmCleansStatusEnum.noClean:
                item.alarmCleanStatusName = this.language.noClean;
                break;
              default:
                item.alarmCleanStatusName = '';
                break;
            }
          }
        });
        this._dataSet = res.data;
      }
      this.tableConfig.isLoading = false;
    }, () => {
      this.tableConfig.isLoading = false;
    });
  }

  /**
   * ??????????????????
   */
  public openEquipmentSelector(filterValue: FilterCondition): void {
    this.equipmentVisible = true;
    this.equipmentFilterValue = filterValue;
  }

  /**
   * ????????????
   */
  private loadPage(): void {
    this.$activatedRoute.queryParams.subscribe(params => {
      this.procType = ClearBarrierOrInspectEnum.clearBarrier;
      this.pageType = params.status;
      this.pageTitle = this.getPageTitle(this.pageType);
      this.isShowBtn = true;
      if (params.type === RefAlarmFaultEnum.alarm) {
        this.isFault = false;
      } else if (params.type === RefAlarmFaultEnum.fault) {
        this.isFault = true;
      }
      if (this.pageType === WorkOrderPageTypeEnum.update || this.pageType === WorkOrderPageTypeEnum.rebuild) {
        this.workOrderId = params.id;
        this.getWorkOrderDetail();
      } else {
        this.isFault = false;
      }
    });
  }
  /**
   * ??????
   */
  public submitClearData(): void {
    const data = this.setSubmitData();
    const etime = this.formStatus.group.controls.expectedCompletedTime.value.getTime();
    if (this.isCheckTime && etime < new Date().getTime()) {
      this.$message.error(this.InspectionLanguage.expectedCompletionTimeMustBeGreaterThanCurrentTime);
      return;
    }
    this.isLoading = true;
    if (this.pageType === WorkOrderPageTypeEnum.rebuild) {
      // ????????????
      data.regenerateId = data.procId;
      this.$clearBarrierWorkOrderService.refundGeneratedAgain(data).subscribe((result: ResultModel<string>) => {
        if (result.code === ResultCodeEnum.success) {
          window.history.back();
          this.$message.success(this.workOrderLanguage.regeneratedSuccessful);
        } else {
          this.isLoading = false;
          this.$message.error(result.msg);
        }
      }, () => {
        this.isLoading = false;
      });
    } else {
      const methodName = this.pageType === WorkOrderPageTypeEnum.add ? 'addWorkOrder' : 'updateWorkOrder';
      this.$clearBarrierWorkOrderService[methodName](data).subscribe((result: ResultModel<string>) => {
        if (result.code === ResultCodeEnum.success) {
          this.$router.navigate(['/business/work-order/clear-barrier/unfinished-list']).then();
          this.$message.success(this.InspectionLanguage.operateMsg.successful);
        } else {
          this.isLoading = false;
          this.$message.error(result.msg);
        }
      }, () => {
        this.isLoading = false;
      });
    }
  }

  /**
   * ??????????????????
   */
  private setSubmitData(): ClearBarrierWorkOrderModel {
    const formData = this.formStatus.group.getRawValue();
    const clearBarrierWorkOrderModel = new ClearBarrierWorkOrderModel();
    clearBarrierWorkOrderModel.title = CommonUtil.trim(formData.title);
    clearBarrierWorkOrderModel.materiel = [];
    clearBarrierWorkOrderModel.autoDispatch = formData.autoDispatch;
    clearBarrierWorkOrderModel.deviceId = this.selectedAlarm.alarmDeviceId;
    clearBarrierWorkOrderModel.deviceName = this.selectedAlarm.alarmDeviceName;
    clearBarrierWorkOrderModel.deviceType = this.selectedAlarm.alarmDeviceTypeId;
    clearBarrierWorkOrderModel.deviceAreaId = this.selectedAlarm.areaId;
    clearBarrierWorkOrderModel.deviceAreaName = this.selectedAlarm.areaName;
    clearBarrierWorkOrderModel.remark = CommonUtil.trim(formData.remark);
    clearBarrierWorkOrderModel.accountabilityDept = this.selectDeptCode;
    clearBarrierWorkOrderModel.accountabilityDeptName = this.selectDepartName;
    clearBarrierWorkOrderModel.equipment = [{
      deviceId: this.selectedAlarm.alarmDeviceId,
      equipmentId: this.selectedAlarm.alarmSource,
      equipmentName: this.selectedAlarm.alarmObject,
      equipmentType: this.selectedAlarm.alarmSourceTypeId,
    }];
    clearBarrierWorkOrderModel.procResourceType = ResourceTypeEnum.manuallyAdd;
    clearBarrierWorkOrderModel.deviceAreaCode = this.selectedAlarm.areaCode;
    if (CommonUtil.trim(formData.supplies)) {
      clearBarrierWorkOrderModel.materiel = [
        { materielId: '',
          materielName: CommonUtil.trim(formData.supplies),
          materielCode: ''
        }
      ];
    }
    if (formData.expectedCompletedTime) {
      clearBarrierWorkOrderModel.expectedCompletedTime = CommonUtil.sendBackEndTime(new Date(formData.expectedCompletedTime).getTime());
    }
    if (this.pageType !== WorkOrderPageTypeEnum.add) {
      clearBarrierWorkOrderModel.procId = this.workOrderId;
    }
    // ??????
    if (this.isFault) {
      clearBarrierWorkOrderModel.troubleId = this.selectedAlarm.troubleId;
      clearBarrierWorkOrderModel.troubleName = this.selectedAlarm.troubleName;
      clearBarrierWorkOrderModel.troubleCode = this.selectedAlarm.troubleCode;
    } else {
      clearBarrierWorkOrderModel.refAlarm = this.selectedAlarmId;
      clearBarrierWorkOrderModel.refAlarmName = this.alarmName;
      clearBarrierWorkOrderModel.refAlarmCode = this.selectedAlarm.alarmCode;
    }
    return clearBarrierWorkOrderModel;
  }

  /**
   * form??????
   */
  private initColumn(): void {
    this.formColumn = [
      {  // ????????????
        label: this.workOrderLanguage.name,
        key: 'title', type: 'input', require: true,
        rule: [
          {required: true},
          RuleUtil.getNameMinLengthRule(),
          RuleUtil.getNameMaxLengthRule(),
          RuleUtil.getAlarmNamePatternRule(this.InspectionLanguage.nameCodeMsg)
        ],
        customRules: [this.$ruleUtil.getNameCustomRule()],
        asyncRules: [
          this.$ruleUtil.getNameAsyncRule(value => this.$clearBarrierWorkOrderService.checkClearName(CommonUtil.trim(value), this.workOrderId),
            res => res.code === ResultCodeEnum.success)
        ]
      },
      { // ????????????
        label: this.workOrderLanguage.type, key: 'procType', type: 'input',
        disabled: true,
        initialValue: this.workOrderLanguage.clearBarrier, rule: []
      },
      {  // ????????????
        label: this.workOrderLanguage.relevancyAlarm, key: 'refAlarm', type: 'custom',
        require: true, template: this.alarmTemp,
        rule: [{required: true}], asyncRules: []
      },
      {  // ????????????
        label: this.workOrderLanguage.relevancyFault, key: 'troubleName', type: 'input',
        require: true, disabled: true,
        rule: [{required: true}], asyncRules: []
      },
      {  // ??????
        label: this.workOrderLanguage.deviceName,
        key: 'deviceName', type: 'input',
        disabled: true, rule: []
      },
      {  // ??????
        label: this.workOrderLanguage.equipmentName,
        key: 'equipmentName', type: 'input',
        disabled: true, rule: []
      },
      {  // ??????
        label: this.workOrderLanguage.supplies,
        key: 'supplies', type: 'input',
        rule: [this.$ruleUtil.getRemarkMaxLengthRule(), this.$ruleUtil.getNameRule()],
        customRules: [this.$ruleUtil.getNameCustomRule()],
      },
      { // ??????????????????
        label: this.InspectionLanguage.autoDispatch,
        key: 'autoDispatch', type: 'custom',
        require: true, rule: [{required: true}],
        template: this.autoDispatch,
        initialValue: IsSelectAllEnum.deny
      },
      { // ????????????
        label: this.workOrderLanguage.accountabilityUnitName, key: 'accountabilityDept', type: 'custom',
        template: this.accountabilityUnit,
        rule: [], asyncRules: []
      },
      { // ??????????????????
        label: this.workOrderLanguage.expectedCompleteTime,
        key: 'expectedCompletedTime', type: 'custom',
        template: this.ecTimeTemp, require: true,
        rule: [{required: true}],
        customRules: [{
          code: 'isTime', msg: null, validator: (control: AbstractControl): { [key: string]: boolean } => {
            if (control.value && CommonUtil.sendBackEndTime(new Date(control.value).getTime()) < new Date().getTime()) {
              if (this.formStatus.group.controls['expectedCompletedTime'].dirty) {
                this.$message.info(this.InspectionLanguage.expectedCompletionTimeMustBeGreaterThanCurrentTime);
                return {isTime: true};
              }
            } else {
              return null;
            }
          }
        }]
      },
      {  // ??????
        label: this.workOrderLanguage.remark,
        key: 'remark', type: 'textarea',
        rule: [this.$ruleUtil.getRemarkMaxLengthRule(), this.$ruleUtil.getNameRule()],
        customRules: [this.$ruleUtil.getNameCustomRule()],
      },
    ];
    this.hiddenColumn();
  }

  /**
   * ????????????????????????
   */
  private turnAlarmLevel(code: string): string {
    let name = '';
    for (const k in WorkOrderAlarmLevelColor) {
      if (WorkOrderAlarmLevelColor[k] === code) {
        name = this.alarmLanguage[k];
        break;
      }
    }
    return name;
  }
  /**
   * ????????????
   */
  disabledEndDate = (current: Date): boolean => {
    const nowTime = new Date();
    return differenceInCalendarDays(current, nowTime) < 0 || CommonUtil.checkTimeOver(current);
  }

  /**
   * ????????????
   * param data
   */
  private setWorkOrderData(data: ClearBarrierWorkOrderModel): void {
    if (this.isFault) {
      this.selectedAlarmId = null;
      this.alarmName = null;
    } else {
      this.selectedAlarmId = data.refAlarm;
      this.alarmName = data.refAlarmName;
    }
    if (data.procRelatedDepartments) {
      this.selectedAccountabilityUnitIdList = data.procRelatedDepartments.map(item => item.accountabilityDept);
    }
    this.selectDeptCode = data.accountabilityDept;
    this.selectDepartName = data.accountabilityDeptName;
    this.formStatus.resetControlData('title', data.title);
    if (this.isFault) {
      this.formStatus.resetControlData('troubleName', data.troubleName);
    } else {
      this.formStatus.resetControlData('refAlarm', data.refAlarmName);
    }
    this.formStatus.resetControlData('remark', data.remark);
    this.formStatus.resetControlData('deviceName', data.deviceName);
    this.formStatus.resetControlData('equipmentName', data.equipmentName);
    this.formStatus.resetControlData('supplies', ((data.materiel && data.materiel[0]) ? data.materiel[0].materielName : ''));
    if (data.expectedCompletedTime) {
      this.formStatus.resetControlData('expectedCompletedTime', new Date(CommonUtil.convertTime(data.expectedCompletedTime)));
    }
    if (data.refAlarmName || data.troubleName) {
      this.getUnitDataList(data.deviceAreaCode);
    }
    this.dispatchValue = data.autoDispatch ? data.autoDispatch : IsSelectAllEnum.deny;
    this.formStatus.resetControlData('autoDispatch', this.dispatchValue);
    this.selectedAlarm = {
      alarmName: data.refAlarmName,
      // ??????id
      alarmDeviceId: data.deviceId,
      // ????????????
      alarmDeviceName: data.deviceName,
      // ????????????
      alarmDeviceTypeId: data.deviceType,
      // ??????id
      alarmSource: data.equipmentId,
      // ????????????
      alarmSourceTypeId: data.equipmentType,
      // ????????????
      alarmObject: data.equipmentName,
      // ??????id
      areaId: data.deviceAreaId,
      // ????????????
      areaName: data.deviceAreaName,
      id: data.refAlarm,
      // ????????????
      alarmCode: data.refAlarmCode,
      procId: data.procId,
      // ??????code
      areaCode: data.deviceAreaCode,
      // ????????????
      troubleName: data.troubleName,
      // ??????id
      troubleId: data.troubleId,
      // ??????code
      troubleCode: data.troubleCode,
      // ????????????
      autoDispatch: data.autoDispatch ? data.autoDispatch : IsSelectAllEnum.deny,
    };
  }

  /**
   * ???????????????????????????
   */
  public showModal(filterValue: FilterValueModel): void {
    if (this.unitTreeSelectorConfig.treeNodes.length === 0) {
      this.queryDepartList().then((bool) => {
        if (bool) {
          this.filterValue = filterValue;
          if (!this.filterValue['filterValue']) {
            this.filterValue['filterValue'] = [];
          }
          this.unitTreeSelectorConfig.treeNodes = this.unitsTreeNode;
          this.isVisible = true;
        }
      });
    } else {
      this.isVisible = true;
    }
  }

  /**
   * ????????????
   */
  private queryDepartList(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.$userService.queryAllDepartment().subscribe((result: ResultModel<DepartmentUnitModel[]>) => {
        this.unitsTreeNode = result.data || [];
        resolve(true);
      }, (error) => {
        reject(error);
      });
    });
  }
  /**
   * ????????????????????????
   * param event
   */
  public selectDataChange(event: DepartmentUnitModel[]): void {
    let arr = [];
    this.selectDepartName = '';
    const name = [];
    if (event.length > 0) {
      arr = event.map(item => {
        name.push(item.deptName);
        return item.id;
      });
    }
    this.selectDepartName = name.join(',');
    if (arr.length === 0) {
      this.filterValue.filterValue = null;
    } else {
      this.filterValue.filterValue = arr;
    }
    FacilityForCommonUtil.setTreeNodesStatus(this.unitsTreeNode, arr);
  }

  /**
   * ?????????
   */
  private hiddenColumn(): void {
    let type = '';
    if (this.isFault) {
      type = 'refAlarm';
    } else {
      type = 'troubleName';
    }
    this.formColumn.forEach((item, i) => {
      if (item.key === type) {
        item.hidden = true;
        this.formColumn.splice(i, 1);
      }
    });
  }

  /**
   * ????????????????????????
   * param event
   */
  public selectUnitDataChange(event: DepartmentUnitModel[]): void {
    if (event && event.length > 0) {
      this.selectDepartName = event[0].deptName;
      this.selectDeptCode = event[0].deptCode;
      FacilityForCommonUtil.setTreeNodesStatus(this.alarmUnitNode, [event[0].id]);
      this.formStatus.resetControlData('accountabilityDept', event[0].deptCode);
      this.isUnitsVisible = false;
    } else {
      this.$message.error(this.InspectionLanguage.selectDept);
    }
  }

  /**
   * ??????????????????
   */
  public getAlarmCleanStatusName(cleanId: string): string {
    return <string>WorkOrderBusinessCommonUtil.getAlarmCleanStatusName(this.$nzI18n, cleanId);
  }

  /**
   * ??????????????????
   */
  public getAlarmConfirmStatusName(confirmId: string): string {
    return this.workOrderLanguage[WorkOrderBusinessCommonUtil.getAlarmConfirmStatus(confirmId)];
  }

  /**
   * ????????????
   */
  public onSelectEquipment(event: EquipmentListModel[]): void {
    this.selectEquipments = event;
    this.selectEquipName = '';
    this.checkEquipmentObject = {
      ids: event.map(v => v.equipmentId) || [],
      name: event.map(v => v.equipmentName).join(',') || '',
      type: ''
    };
    this.equipmentFilterValue.filterValue = this.checkEquipmentObject.ids;
  }

  /**
   * ??????????????????
   */
  private getUnitDataList(areaCode: string): void {
    const params = new AreaDeviceParamModel();
    params.areaCodes = [areaCode];
    params.userId = WorkOrderBusinessCommonUtil.getUserId();
    this.alarmUnitNode = [];
    this.$facilityForCommonService.listDepartmentByAreaAndUserId(params).subscribe((result: ResultModel<NzTreeNode[]>) => {
      if (result.code === ResultCodeEnum.success) {
        this.alarmUnitNode = result.data || [];
      }
    });
  }
}
