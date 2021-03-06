import {Component, OnInit, ViewChild, OnDestroy, TemplateRef} from '@angular/core';
import {WorkOrderInitTreeUtil} from '../../share/util/work-order-init-tree.util';
import {InspectionDetailUtil} from './inspection-work-order-detail.util';
import {FormOperate} from '../../../../shared-module/component/form/form-operate.service';
import {NzI18nService, NzModalService, NzTreeNode} from 'ng-zorro-antd';
import {FormItem} from '../../../../shared-module/component/form/form-config';
import {ActivatedRoute, Router} from '@angular/router';
import {InspectionLanguageInterface} from '../../../../../assets/i18n/inspection-task/inspection.language.interface';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {TreeSelectorConfigModel} from '../../../../shared-module/model/tree-selector-config.model';
import {InspectionWorkOrderService} from '../../share/service/inspection';
import {MapSelectorConfigModel} from '../../../../shared-module/model/map-selector-config.model';
import {MapSelectorInspectionComponent} from '../../../../shared-module/component/map-selector/map-selector-inspection/map-selector-inspection.component';
import {RuleUtil} from '../../../../shared-module/util/rule-util';
import {differenceInCalendarDays} from 'date-fns';
import {CommonUtil} from '../../../../shared-module/util/common-util';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {IsSelectAllEnum, IsSelectAllItemEnum} from '../../share/enum/clear-barrier-work-order.enum';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {TemplateModalModel} from '../../share/model/template/template-modal.model';
import {WorkOrderPageTypeEnum} from '../../share/enum/work-order-page-type.enum';
import {SelectTemplateModel} from '../../share/model/template/select-template.model';
import {DeviceFormModel} from '../../../../core-module/model/work-order/device-form.model';
import {DepartmentUnitModel} from '../../../../core-module/model/work-order/department-unit.model';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {InspectionWorkOrderDetailModel} from '../../share/model/inspection-model/inspection-work-order-detail.model';
import {EquipmentFormModel} from '../../../../core-module/model/work-order/equipment-form.model';
import {AreaDeviceParamModel} from '../../../../core-module/model/work-order/area-device-param.model';
import {WorkOrderBusinessCommonUtil} from '../../share/util/work-order-business-common.util';
import {WorkOrderCommonServiceUtil} from '../../share/util/work-order-common-service.util';
import {FacilityForCommonUtil} from '../../../../core-module/business-util/facility/facility-for-common.util';
import {FacilityForCommonService} from '../../../../core-module/api-service/facility';
import {WorkOrderMapTypeEnum} from '../../share/enum/work-order-map-type.enum';
import {WorkOrderStatusEnum} from '../../../../core-module/enum/work-order/work-order-status.enum';
import {AreaModel} from '../../../../core-module/model/facility/area.model';

/**
 * ???????????????????????????????????????
 */
@Component({
  selector: 'app-inspection-work-order-detail',
  templateUrl: './inspection-work-order-detail.component.html',
  styleUrls: ['./inspection-work-order-detail.component.scss']
})
export class InspectionWorkOrderDetailComponent implements OnInit, OnDestroy {
  // ????????????????????????
  @ViewChild('inspectionStartDate') public inspectionStartDate: TemplateRef<any>;
  // ????????????????????????
  @ViewChild('inspectionEndDate') public inspectionEndDate: TemplateRef<any>;
  // ??????????????????
  @ViewChild('areaSelector') public areaSelector: TemplateRef<any>;
  // ??????????????????
  @ViewChild('departmentSelector') public departmentSelector: TemplateRef<any>;
  // ????????????
  @ViewChild('inspectionFacilitiesSelector') public inspectionFacilitiesSelector: TemplateRef<any>;
  // ??????????????????
  @ViewChild('mapSelectorInspection') public mapSelectorInspection: MapSelectorInspectionComponent;
  // ????????????
  @ViewChild('inspectionTemplate') public inspectionTemplate: TemplateRef<any>;
  // ??????????????????
  @ViewChild('selectInspectionTemp') public selectInspectionTemp: TemplateRef<any>;
  // ??????????????????
  @ViewChild('inspectionEquipmentSelector') public inspectionEquipmentSelector: TemplateRef<any>;
  // ????????????
  @ViewChild('equipmentListTemp') public equipmentListTemp: TemplateRef<any>;
  // ????????????
  @ViewChild('autoDispatch') public autoDispatch: TemplateRef<any>;
  // ?????????????????????
  public remarkDisabled: boolean;
  // form????????????
  public formColumn: FormItem[] = [];
  public formStatus: FormOperate;
  // ?????????
  public InspectionLanguage: InspectionLanguageInterface;
  // ???????????????
  public areaSelectorConfig: any = new TreeSelectorConfigModel();
  // ?????????
  public treeSelectorConfig: TreeSelectorConfigModel;
  // ??????????????????
  public isUnitVisible: boolean = false;
  // ???????????????title???
  public departmentSelectorName: string = '';
  // ????????????title???
  public inspectionFacilitiesSelectorName: string = '';
  // ?????????????????????button????????????
  public departmentSelectorDisabled: boolean = false;
  // ??????????????????button????????????
  public inspectionFacilitiesSelectorDisabled = true;
  // ????????????
  public pageTitle: string;
  // ????????????
  public deviceType: string = '';
  // ????????????????????????
  public isLoading: boolean = false;
  // ????????????
  public areaName: string = '';
  // ??????ID
  public areaId: string = null;
  // ??????id??????
  public inspectAreaId: string;
  // ??????id???????????????????????????
  public inspectAreaIdDevice: string;
  // ????????????
  public deptList: DepartmentUnitModel[] = [];
  // ????????????
  public deviceList: DeviceFormModel[] = [];
  // ????????????
  public equipList: EquipmentFormModel[] = [];
  // ??????????????????
  public mapSelectorConfig: MapSelectorConfigModel;
  // ??????map??????
  public equipmentMapSelectorConfig: MapSelectorConfigModel;
  // ??????????????????
  public mapVisible: boolean = false;
  // ????????????
  public mapEquipmentVisible: boolean = false;
  // ?????????????????????
  public areaSelectVisible: boolean = false;
  // ???????????????????????????
  public disabledIf: boolean;
  // ????????????????????????
  public equipDisabled: boolean = true;
  // ??????????????????
  public isSelectAll: string;
  // ????????????
  public isFormDisabled: boolean;
  // ????????????????????????????????????
  public facilityData;
  // ????????????
  public areaInfo: AreaModel;
  // ???????????????
  public areaDisabled: boolean;
  // ??????????????????
  public deviceSet: string[] = [];
  // ??????????????????
  public inspectDeviceType: string[] = [];
  // ????????????
  public tempName: string = '';
  // ????????????
  public tempNameDisabled: boolean;
  // ??????????????????
  public inspectEquipmentName: string = '';
  // ????????????
  public inspectEquipmentDisabled: boolean = false;
  // ??????
  public modalData: TemplateModalModel;
  // ????????????
  public tempSelectVisible: boolean = false;
  // ??????????????????
  public equipmentSelectList: {label: string; code: any }[] = [];
  public equipmentListValue: string[] = [];
  // ????????????????????????????????????
  public selectMapType: string = '';
  // ???????????????????????????
  public selectorType: string;
  // ??????id??????
  public deviceIdList: string[] = [];
  // ????????????
  public equipmentTypes: string[] = [];
  // ???????????????
  public hasSelectData: string[] = [];
  // ??????code
  public deviceAreaCode: string;
  // ????????????
  public dispatchEnum = IsSelectAllEnum;
  public dispatchValue: string = IsSelectAllEnum.deny;
  public isDispatch: boolean = false;
  // ??????????????????????????? (?????????????????????????????????)
  private isChooseAll: boolean = false;
  // ??????????????????
  private isChooseDevice: boolean = false;
  // ????????????
  private pageRoute: string = '';
  // ???????????????????????????
  private updateDeptList: DepartmentUnitModel[] = [];
  // ???????????????????????????
  private updateDeviceList: DeviceFormModel[] = [];
  // ??????????????????
  private today = new Date();
  // ??????id
  private deptId: string;
  // ????????????????????????
  private selectEquipmentName: string = '';
  // ????????????
  private pageType: string;
  // ?????????
  private unitTreeNodes: NzTreeNode[] = [];
  // ???????????? (?????????????????????????????????)
  private InquireDeviceTypes = [];
  // ??????ID
  private procId: string = '';
  // ????????????
  private status: string;
  // ??????????????????Value???
  private dateStart: number;
  // ??????????????????Value??? (?????????????????????????????????)
  private dateEnd: number;
  // ????????????ID
  private inspectionAreaId: string;
  // ????????????????????????
  private deviceDisabled: boolean = false;
  // ???????????????????????????
  private disabledSelect: boolean = true;
  // ????????????????????????
  private selectArr: string[] = [];
  // ??????????????????
  private areaNodes: AreaModel[] = [];
  // ????????????
  private selectUnitName: string = '';
  // ??????????????????
  private inspectDeviceName: string;
  // ???????????? (?????????????????????????????????)
  private lastDays: number;
  // ???????????? (?????????????????????????????????)
  private inspectionName: string;
  // ?????????????????????
  private selectTemplateData: SelectTemplateModel;
  // ??????????????????
  private changeDevice: string;
  // ???????????? (?????????????????????????????????)
  private equipmentName: string = '';
  // ????????????
  private selectEquipList: EquipmentFormModel[] = [];

  constructor(private $activatedRoute: ActivatedRoute,
              private $nzI18n: NzI18nService,
              private $modelService: NzModalService,
              private $modalService: FiLinkModalService,
              private $ruleUtil: RuleUtil,
              private $workOrderCommonUtil: WorkOrderCommonServiceUtil,
              private $router: Router,
              private $inspectionWorkOrderService: InspectionWorkOrderService,
              private $facilityForCommonService: FacilityForCommonService,
              ) {
  }

  public ngOnInit(): void {
    this.selectorType = WorkOrderMapTypeEnum.inspection;
    this.InspectionLanguage = this.$nzI18n.getLocaleData(LanguageEnum.inspection);
    // this.equipmentSelectList = FacilityForCommonUtil.getRoleEquipmentType(this.$nzI18n);
    this.judgePageJump();
    // ??????????????????
    WorkOrderInitTreeUtil.initTreeSelectorConfig(this);
    // ???????????????????????????
    WorkOrderInitTreeUtil.initMapSelectorConfig(this);
    // ???????????????????????????
    WorkOrderInitTreeUtil.initEquipmentMapSelectorConfig(this);
  }

  public ngOnDestroy(): void {
    this.mapSelectorInspection = null;
  }

  // ????????????
  public onChangeLevel(): void {
    setTimeout( () => {
      if (this.equipmentListValue.length > 0) {
        this.queryEquipmentList();
      } else {
        this.equipList = [];
        this.inspectEquipmentName = '';
        this.formStatus.resetControlData('equipmentType', []);
      }
    }, 10);
  }
  public changeEquips(): void {
    this.formStatus.resetControlData('equipmentType', this.equipmentListValue.map(item => {
      return {'value': item };
    }));
  }
  /**
   * ??????????????????
   */
  public selectDispatch(event): void {
    this.formStatus.resetControlData('autoDispatch', event);
  }
  /**
   * ????????????  ??????/????????????
   */
  private pageSwitching(): void {
    // ???????????????????????????
    this.$inspectionWorkOrderService.getUpdateWorkUnfinished(this.procId).subscribe((result: ResultModel<InspectionWorkOrderDetailModel>) => {
      if (result.code === ResultCodeEnum.success) {
        result.data.procResourceType = this.InspectionLanguage.workOrderTypeIsNotAvailableByDefault;
        // ??????????????????
        this.isSelectAll = result.data.selectAll;
        result.data.isSelectAll = this.isSelectAll;
        this.departmentSelectorName = result.data.accountabilityDeptName;
        // ????????????
        const deviceListData = result.data.procRelatedDevices;
        const devNames = [];
        this.deviceSet = [];
        for (let i = 0; i < deviceListData.length; i++) {
          devNames.push(deviceListData[i].deviceName);
          if (this.isSelectAll === IsSelectAllEnum.deny) {
            this.deviceSet.push(deviceListData[i].deviceId);
          }
          this.deviceIdList.push(deviceListData[i].deviceId);
        }
        this.updateDeviceList = deviceListData;
        this.deviceList = deviceListData;
        result.data.deviceList = deviceListData;
        // ??????????????????
        if (result.data.procRelatedDepartments) {
          this.updateDeptList = [{
            accountabilityDept: result.data.procRelatedDepartments[0].accountabilityDept,
            deptCode: result.data.accountabilityDept,
            accountabilityDeptName: result.data.accountabilityDeptName
          }];
        }
        this.deptList = [{
          accountabilityDept: result.data.accountabilityDept,
          deptCode: result.data.accountabilityDept,
          accountabilityDeptName: result.data.accountabilityDeptName
        }];
        // ????????????
        result.data.autoDispatch = result.data.autoDispatch ? result.data.autoDispatch : '0';
        this.dispatchValue = result.data.autoDispatch;
        // ??????
        this.areaName = result.data.deviceAreaName;
        this.formStatus.resetControlData('inspectionAreaName', this.areaName);
        this.inspectionAreaId = result.data.deviceAreaId;
        this.deviceAreaCode = result.data.deviceAreaCode;
        this.inspectAreaId = result.data.deviceAreaId;
        this.inspectAreaIdDevice = result.data.deviceAreaId;
        // ?????????????????????????????????
        if (!this.deviceDisabled) {
          if (this.areaName && this.deviceAreaCode) {
            this.formStatus.group.controls['deviceType'].enable();
          }
        }
        this.queryDeptList(this.deviceAreaCode).then();
        this.deviceType = result.data.deviceType;
        // ??????????????????
        result.data.inspectionStartTime = new Date(CommonUtil.convertTime(new Date(result.data.inspectionStartTime).getTime()));
        result.data.inspectionEndTime = new Date(CommonUtil.convertTime(new Date(result.data.expectedCompletedTime).getTime()));
        this.formStatus.resetData(result.data);
        // ????????????????????????????????????????????????????????????????????????
        this.formStatus.resetControlData('inspectionStartTime', this.pageType === WorkOrderPageTypeEnum.restUpdate ? '' : new Date(CommonUtil.convertTime(result.data.inspectionStartTime)));
        this.formStatus.resetControlData('inspectionEndTime', this.pageType === WorkOrderPageTypeEnum.restUpdate ? '' : new Date(CommonUtil.convertTime(result.data.inspectionEndTime)));
        // ??????
        if (result.data.materiel && result.data.materiel.length > 0) {
          this.formStatus.resetControlData('materiel', result.data.materiel[0].materielName);
        } else {
          this.formStatus.resetControlData('materiel', '');
        }
        // ????????????
        if (result.data.equipmentType) {
          this.equipmentListValue = result.data.equipmentType.split(',');
        } else {
          this.equipmentListValue = [];
        }
        this.formStatus.resetControlData('equipmentType', this.equipmentListValue);
        // ??????
        this.hasSelectData = [];
        if (result.data.procRelatedEquipment && result.data.procRelatedEquipment.length > 0) {
          const names = [];
          result.data.procRelatedEquipment.forEach(v => {
            names.push(v.equipmentName);
            if (this.isSelectAll === IsSelectAllEnum.deny) {
              this.hasSelectData.push(v.equipmentId);
            }
          });
          this.inspectEquipmentName = names.join(',');
          this.selectEquipmentName = this.inspectEquipmentName;
          this.formStatus.resetControlData('inspectionEquipment', this.inspectEquipmentName);
        }
        this.equipList = result.data.procRelatedEquipment;
        // ????????????
        if (result.data.template && result.data.template.inspectionItemList.length > 0) {
          this.selectTemplateData = result.data.template;
          this.tempName = result.data.template.templateName;
          this.formStatus.resetControlData('inspectionTemplate', this.tempName);
        }
        // ???????????????????????????????????????
        this.deptId = result.data.accountabilityDept;
        this.$workOrderCommonUtil.getRoleAreaList().then((areaData: AreaModel[]) => {
          this.areaNodes = areaData;
          FacilityForCommonUtil.setAreaNodesStatus(this.areaNodes, result.data.deviceAreaId);
          WorkOrderInitTreeUtil.initAreaSelectorConfig(this, areaData);
        });
        this.inspectDeviceName = devNames.join(',');
        this.inspectionFacilitiesSelectorName = this.inspectDeviceName;
        this.formStatus.resetControlData('deviceList', this.inspectDeviceName);
      }
    });
  }

  /**
   * ??????title??????
   */
  private getPageTitle(type: string): string {
    let title;
    switch (type) {
      case WorkOrderPageTypeEnum.add:
        title = `${this.InspectionLanguage.addArea}${this.InspectionLanguage.patrolInspectionSheet}`;
        break;
      case WorkOrderPageTypeEnum.update:
        title = `${this.InspectionLanguage.edit}${this.InspectionLanguage.patrolInspectionSheet}`;
        break;
      case WorkOrderPageTypeEnum.restUpdate:
        title = `${this.InspectionLanguage.regenerate}${this.InspectionLanguage.patrolInspectionSheet}`;
        break;
    }
    return title;
  }

  /**
   * ???????????????????????????????????????
   * param event
   */
  public formInstance(event: {instance: FormOperate}): void {
    this.formStatus = event.instance;
    this.formStatus.group.valueChanges.subscribe((param) => {
      this.isFormDisabled = this.confirmButtonIsGray(param);
    });
  }

  /**
   * ????????????????????????
   */
  public confirmButtonIsGray(param: InspectionWorkOrderDetailModel): boolean {
    const remark = CommonUtil.trim(param.remark);
    // ????????????????????????????????????????????????????????????????????????
    if (this.pageType === WorkOrderPageTypeEnum.update && this.status !== WorkOrderStatusEnum.assigned) {
      if (remark && remark.length > 255) {
        return false;
      } else {
        return true;
      }
    } else {
      // ????????????????????????????????????????????????
      if (param.inspectionEndTime && param.inspectionStartTime && param.title && this.areaName && param.deviceType && (!remark || remark.length < 256) &&
        new Date(param.inspectionStartTime) < new Date(param.inspectionEndTime) && this.inspectionFacilitiesSelectorName && this.tempName) {
        return true;
      } else {
        return false;
      }
    }
  }

  /**
   * ??????
   */
  public goBack(): void {
    window.history.back();
  }

  /**
   * ??????/??????/??????????????????
   */
  public saveInspectionData(): void {
    const data = this.formStatus.group.getRawValue();
    // ????????????/??????
    if (this.pageType === WorkOrderPageTypeEnum.restUpdate || this.status === WorkOrderStatusEnum.assigned) {
      const now = (new Date()).getTime();
      const end = (new Date(data.inspectionEndTime)).getTime();
      if (now > end) {
        this.$modalService.error(this.InspectionLanguage.endTimeIsGreaterThanCurrentTime);
        return;
      }
    }
    if (CommonUtil.trim(data.remark) && CommonUtil.trim(data.remark).length > 255) {
      return;
    }
    InspectionDetailUtil.saveInspectionData(this, data);
  }
  /**
   * ?????????????????????
   */
  private queryInspectionDeviceByArea(areaCode: string): void {
    const isAll = this.formStatus.getData().isSelectAll;
    const param = new  AreaDeviceParamModel();
    param.areaCode = areaCode;
    param.deviceTypes = [this.changeDevice];
    this.deviceList = [];
    this.inspectionFacilitiesSelectorName = '';
    this.equipList = [];
    this.inspectEquipmentName = '';
    // ??????????????????????????????
    this.hasSelectData = [];
    this.deviceSet = [];
    // ??????????????????
    if (isAll === '0') {
      return;
    }
    this.$facilityForCommonService.queryDeviceDataList(param).subscribe((result: ResultModel<DeviceFormModel[]>) => {
      if (result.code === ResultCodeEnum.success) {
        const facilityData = result.data || [];
        this.facilityData = facilityData;
        // ??????????????????
        const deviceId = [];
        const name = [];
        this.deviceList = facilityData;
        for (let i = 0; i < facilityData.length; i++) {
          name.push(facilityData[i].deviceName);
          deviceId.push(facilityData[i].deviceId);
        }
        this.inspectionFacilitiesSelectorName = name.join(',');
        if (deviceId.length > 0) {
          this.deviceIdList = deviceId;
          this.queryEquipmentList();
        }
        this.formStatus.resetControlData('deviceList', this.inspectionFacilitiesSelectorName);
      }
    });
  }
  /**
   * ?????????????????????
   */
  public showAreaSelectorModal(): void {
    if (!this.disabledIf) {
      this.areaSelectorConfig.treeNodes = this.areaNodes;
      this.areaSelectVisible = true;
    }
  }

  /**
   * ??????????????????
   * param event
   */
  public areaSelectChange(event: AreaModel[]): void {
    this.inspectionFacilitiesSelectorName = '';
    this.deviceList = [];
    if (event && event[0]) {
      this.areaName = event[0].areaName;
      this.inspectionAreaId = event[0].areaId;
      this.areaId = event[0].areaId;
      this.disabledSelect = false;
      this.deviceAreaCode = event[0].areaCode;
      this.queryDeptList(event[0].areaCode).then();
      this.inspectEquipmentDisabled = true;
      this.formStatus.group.controls['deviceType'].enable();
      if (this.changeDevice) {
        this.queryInspectionDeviceByArea(event[0].areaCode);
      }
      FacilityForCommonUtil.setAreaNodesStatus(this.areaNodes, event[0].areaId, event[0].areaId);
      this.formStatus.resetControlData('inspectionAreaName', this.areaName);
    } else {
      FacilityForCommonUtil.setAreaNodesStatus(this.areaNodes, null, null);
      this.areaName = '';
    }
  }

  /**
   * ????????????????????????
   * param event
   */
  public selectDataChange(event: DepartmentUnitModel[]): void {
    this.selectUnitName = '';
    const names = [];
    event.forEach(item => {
      names.push(item.deptName);
    });
    // ??????????????????
    if (event.length > 0) {
      for (let i = 0; i < event.length; i++) {
        this.deptList = [{
          accountabilityDept: event[i].id,
          accountabilityDeptName: event[i].deptName,
          deptCode: event[i].deptCode,
        }];
        this.updateDeptList.push({
          accountabilityDept: event[i].id,
          accountabilityDeptName: event[i].deptName,
          deptCode: event[i].deptCode,
        });
        this.selectArr.push(event[i].id);
      }
      this.deptId = event[0].id;
      // ???????????????
      FacilityForCommonUtil.setTreeNodesStatus(this.unitTreeNodes, [event[0].id]);
    } else {
      this.updateDeptList = [];
      this.deptList = [];
      FacilityForCommonUtil.setTreeNodesStatus(this.unitTreeNodes, this.selectArr);
    }
    // ???????????????
    this.selectUnitName = names.join(',');
    this.departmentSelectorName = this.selectUnitName;
    this.formStatus.resetControlData('deptList', this.selectArr);
  }

  /**
   * ???????????????????????????
   */
   public showDepartmentSelectorModal(): void {
    if (this.areaName === '') {
      this.$modalService.error(this.InspectionLanguage.pleaseSelectTheAreaInformationFirstTip);
      return;
    }
    if (!this.disabledIf) {
      this.treeSelectorConfig.treeNodes = this.unitTreeNodes;
      FacilityForCommonUtil.setTreeNodesStatus(this.unitTreeNodes, [this.deptId]);
    }
    this.isUnitVisible = true;
  }

  /**
   * ??????????????????
   */
  private queryDeptList(code: string): Promise<NzTreeNode[]> {
    return new Promise((resolve, reject) => {
      const param = new AreaDeviceParamModel();
      param.areaCodes = [code];
      param.userId = WorkOrderBusinessCommonUtil.getUserId();
      this.$facilityForCommonService.listDepartmentByAreaAndUserId(param).subscribe((result: ResultModel<NzTreeNode[]>) => {
        if (result.code === ResultCodeEnum.success) {
          const deptData = result.data || [];
          this.unitTreeNodes = deptData;
          resolve(deptData);
        }
      });
    });
  }

  /**
   * ???????????????????????????
   */
  public showInspectionFacilitiesSelectorModal(): void {
    this.isSelectAll = this.formStatus.getData().isSelectAll;
    this.selectMapType = WorkOrderMapTypeEnum.device;
    if (this.areaName === '') {
      this.$modalService.info(this.InspectionLanguage.pleaseSelectTheAreaInformationFirstTip);
    } else {
      const type = this.formStatus.getData('deviceType');
      if (type) {
        if (!this.disabledIf) {
          this.isChooseDevice = true;
          this.inspectDeviceType = [type];
          this.mapVisible = true;
        } else {
          this.$modalService.info(this.InspectionLanguage.pleaseSelectTheAreaInformationFirstTip);
        }
      } else {
        this.$modalService.info(this.InspectionLanguage.pleaseSelectTheTypeOfInspectionFacilityFirst);
      }
    }
  }

  /**
   * ????????????????????????
   * param event
   */
  public mapSelectDataChange(event: DeviceFormModel[]): void {
    this.inspectionFacilitiesSelectorName = '';
    this.deviceList = [];
    const deviceId = [];
    if (event.length > 0) {
      const name = [];
      for (let i = 0; i < event.length; i++) {
        name.push(event[i].deviceName);
        // ???????????????????????????
        this.deviceList.push({
          deviceId: event[i].deviceId,
          deviceName: event[i].deviceName,
          deviceType: event[i].deviceType,
          deviceAreaId: this.inspectionAreaId,
          deviceAreaName: this.areaName
        });
        deviceId.push(event[i].deviceId);
      }
      this.inspectionFacilitiesSelectorName = name.join(',');
      if (deviceId.length > 0) {
        this.deviceIdList = deviceId;
        this.queryEquipmentList();
      }
    } else {
      this.$modalService.info(this.InspectionLanguage.selectDeviceTip);
      this.deviceSet = [];
      this.inspectionFacilitiesSelectorName = '';
    }
    this.deviceSet = deviceId;
    this.formStatus.resetControlData('deviceList', this.inspectionFacilitiesSelectorName);
  }

  /**
   * ??????????????????????????????
   */
  private mapSelectDataChanges(event: DeviceFormModel[]): void {
    if (!event) {
      return;
    }
    this.deviceList = [];
    const data = event;
    if (this.isSelectAll === IsSelectAllItemEnum.isSelectAll) {
      this.inspectionFacilitiesSelectorName = '';
      this.inspectDeviceName = '';
      const names = [];
      for (let i = 0; i < data.length; i++) {
        names.push(data[i].deviceName);
      }
      this.inspectionFacilitiesSelectorName = names.join(',');
      this.deviceList = event;
    } else {
      this.inspectionFacilitiesSelectorName = '';
      this.inspectEquipmentName = '';
    }
  }

  /**
   * ????????????????????????
   */
  public showInspectEquipmentSelectorModal(): void {
    this.isSelectAll = this.formStatus.getData().isSelectAll;
    this.selectMapType = WorkOrderMapTypeEnum.equipment;
    if (this.areaName === '') {
      this.$modalService.info(this.InspectionLanguage.pleaseSelectTheAreaInformationFirstTip);
      return;
    }
    if (this.deviceSet.length === 0) {
      this.$modalService.info(this.InspectionLanguage.pleaseSelectTheInspectionFacilityFirst);
      return;
    }
    if (!this.disabledIf) {
      this.equipmentTypes = this.equipmentListValue;
      this.mapEquipmentVisible = true;
    }
  }

  /**
   * ????????????????????????
   */
  public mapEquipmentSelectDataChange(event: EquipmentFormModel[]): void {
    this.equipList = [];
    const names = [];
    this.hasSelectData = [];
    if (event && event.length > 0) {
      // ?????????????????????????????????
      event.forEach(v => {
        this.equipList.push({
          equipmentId: v.equipmentId,
          deviceId: v.deviceId,
          equipmentType: v.equipmentType,
          equipmentName: v.equipmentName
        });
        names.push(v.equipmentName);
        this.hasSelectData.push(v.equipmentId);
      });
      this.selectEquipList = this.equipList;
    }
    // ????????????
    this.inspectEquipmentName = names.join(',');
    this.selectEquipmentName = this.inspectEquipmentName;
    this.mapEquipmentVisible = false;
    this.formStatus.resetControlData('inspectionEquipment', this.equipList);
  }

  /**
   * ??????????????????????????????
   */
  private queryEquipmentList(code?: string): void {
    const isAll = this.formStatus.getData().isSelectAll;
    const data = new AreaDeviceParamModel();
    data.areaCode = this.deviceAreaCode;
    data.deviceIds = this.deviceIdList;
    data.equipmentTypes = [];
    this.equipmentListValue.forEach(v => {
      data.equipmentTypes.push(v);
    });
    // ????????????????????????
    this.hasSelectData = [];
    this.inspectEquipmentName = '';
    // ???????????????????????????
    if (code === '1') {
      const names = [];
      this.selectEquipList.forEach(item => {
        if (data.equipmentTypes.includes(item.equipmentType)) {
          names.push(item.equipmentName);
          this.hasSelectData.push(item.equipmentId);
        }
      });
      this.inspectEquipmentName = names.join(',');
      this.selectEquipmentName = this.inspectEquipmentName;
      this.formStatus.resetControlData('inspectionEquipment', this.inspectEquipmentName);
    }
    // ????????????
    this.equipList = [];
    // ??????????????????????????????????????????
    if (this.equipmentListValue.length === 0) {
      return;
    }
    // ????????????????????????
    if (isAll === '0') {
      return;
    }
    this.$facilityForCommonService.listEquipmentBaseInfoByAreaCode(data).subscribe((result: ResultModel<EquipmentFormModel[]>) => {
      if (result.code === ResultCodeEnum.success) {
        const equipData = result.data || [];
        const name = [];
        // ???????????????????????????
        equipData.forEach(v => {
          this.equipList.push({
            equipmentId: v.equipmentId,
            deviceId: v.deviceId,
            equipmentType: v.equipmentType,
            equipmentName: v.equipmentName
          });
          name.push(v.equipmentName);
          this.hasSelectData.push(v.equipmentId);
        });
        this.inspectEquipmentName = name.join(',');
        this.selectEquipmentName = this.inspectEquipmentName;
        this.formStatus.resetControlData('inspectionEquipment', this.inspectEquipmentName);
      }
    });
  }

  /**
   * ??????????????????????????????????????????
   * ???????????????????????????????????????????????????
   */
  private changeInspectionFacilities(event: string): void {
    if (event === IsSelectAllEnum.deny && (this.disabledIf === false || this.disabledIf === undefined)) {
      this.inspectionFacilitiesSelectorDisabled = false;
    } else if (event === IsSelectAllEnum.right) {
      this.inspectionFacilitiesSelectorDisabled = true;
    }
    // ????????????ID????????????
    this.mapSelectDataChanges(this.facilityData);
  }

  /**
   * ??????????????????
   */
  private judgePageJump(): void {
    this.$activatedRoute.queryParams.subscribe(params => {
      this.pageType = params.type;
      this.pageRoute = params.route;
      this.pageTitle = this.getPageTitle(this.pageType);
      // ???????????????
      if (this.pageType === WorkOrderPageTypeEnum.add) {
        this.isChooseDevice = true;
        this.isSelectAll = IsSelectAllItemEnum.isSelectAll;
        /*this.equipmentListValue = this.equipmentSelectList.map(v => {
          return v.code;
        });*/
        this.$workOrderCommonUtil.getRoleAreaList().then((areaData: AreaModel[]) => {
          this.areaNodes = areaData;
          WorkOrderInitTreeUtil.initAreaSelectorConfig(this, this.areaNodes);
          FacilityForCommonUtil.setAreaNodesStatus(this.areaNodes, null);
        });
      } else {
        // ???????????????????????????
        this.procId = params.procId;
        this.status = params.status;
        if ((this.status === WorkOrderStatusEnum.pending || this.status === WorkOrderStatusEnum.singleBack || this.status === WorkOrderStatusEnum.turnProcess ||
          this.status === WorkOrderStatusEnum.processing) && this.pageType === WorkOrderPageTypeEnum.update) {
          this.disabledIf = true;
          this.equipDisabled = true;
          this.deviceDisabled = true;
          this.remarkDisabled = false;
          this.areaDisabled = true;
          this.tempNameDisabled = true;
          this.isDispatch = true;
          this.departmentSelectorDisabled = true;
        } else {
          this.disabledIf = false;
        }
        this.pageSwitching();
      }
      InspectionDetailUtil.initInspectionForm(this);
    });
  }

  /**
   *  ??????????????????????????????????????????
   */
  public disabledDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, this.today) < 0 || CommonUtil.checkTimeOver(current);
  }
  /**
   *  ????????????????????????????????????????????????
   */
  public disabledEndDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, this.dateStart) < 0 || CommonUtil.checkTimeOver(current);
  }

  /**
   * ????????????????????????
   */
  public showTemplate(): void {
    if (this.tempNameDisabled) {
      return;
    }
    this.modalData = {
      pageType: this.pageType,
      selectTemplateData: this.selectTemplateData
    };
    this.tempSelectVisible = true;
  }

  /**
   * ????????????
   */
  public selectTemplate(event: SelectTemplateModel): void {
    this.tempName = event.templateName;
    this.formStatus.resetControlData('inspectionTemplate', this.tempName);
    this.selectTemplateData = event;
    this.tempSelectVisible = false;
  }
}
