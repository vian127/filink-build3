import {Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {WorkOrderStatusEnum} from '../../../../core-module/enum/work-order/work-order-status.enum';
import {FacilityForCommonUtil} from '../../../../core-module/business-util/facility/facility-for-common.util';
import {WorkOrderPageTypeEnum} from '../../share/enum/work-order-page-type.enum';
import {FilterCondition, QueryConditionModel, SortCondition} from '../../../../shared-module/model/query-condition.model';
import {WorkOrderStatusUtil} from '../../../../core-module/business-util/work-order/work-order-for-common.util';
import {WorkOrderBusinessCommonUtil} from '../../share/util/work-order-business-common.util';
import {CommonUtil} from '../../../../shared-module/util/common-util';
import {WorkOrderClearInspectUtil} from '../../share/util/work-order-clear-inspect.util';
import {Operation, TableConfigModel} from '../../../../shared-module/model/table-config.model';
import {PageModel} from '../../../../shared-module/model/page.model';
import {TreeSelectorConfigModel} from '../../../../shared-module/model/tree-selector-config.model';
import {DepartmentUnitModel} from '../../../../core-module/model/work-order/department-unit.model';
import {WorkOrderLanguageInterface} from '../../../../../assets/i18n/work-order/work-order.language.interface';
import {InspectionLanguageInterface} from '../../../../../assets/i18n/inspection-task/inspection.language.interface';
import {NzI18nService, NzTreeNode} from 'ng-zorro-antd';
import {Router} from '@angular/router';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {WorkOrderCommonServiceUtil} from '../../share/util/work-order-common-service.util';
import {UserRoleModel} from '../../../../core-module/model/user/user-role.model';
import {FilterValueModel} from '../../../../core-module/model/work-order/filter-value.model';
import {WorkOrderInitTreeUtil} from '../../share/util/work-order-init-tree.util';
import {AreaFormModel} from '../../share/model/area-form.model';
import {AreaDeviceParamModel} from '../../../../core-module/model/work-order/area-device-param.model';
import {TableComponent} from '../../../../shared-module/component/table/table.component';
import {TransferOrderParamModel} from '../../share/model/clear-barrier-model/transfer-order-param.model';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {FacilityForCommonService} from '../../../../core-module/api-service/facility';
import {AssignDepartmentModel} from '../../share/model/assign-department.model';
import {AlarmSelectorConfigModel} from '../../../../shared-module/model/alarm-selector-config.model';
import {EquipmentListModel} from '../../../../core-module/model/equipment/equipment-list.model';
import {SelectOrderEquipmentModel} from '../../share/model/select-order-equipment.model';
import {InstallWorkOrderService} from '../../share/service/installation';
import {InstallWorkOrderModel} from '../../share/model/install-work-order/install-work-order.model';
import {ClearBarrierOrInspectEnum, LastDayColorEnum} from '../../share/enum/clear-barrier-work-order.enum';
import {ExportRequestModel} from '../../../../shared-module/model/export-request.model';
import {ListExportModel} from '../../../../core-module/model/list-export.model';
import {DeviceTypeModel} from '../../share/model/device-type.model';
import {OperatorEnum} from '../../../../shared-module/enum/operator.enum';

/***
 * ????????????????????????
 */
@Component({
  selector: 'app-installation-table',
  templateUrl: './installation-table.component.html',
  styleUrls: ['./installation-table.component.scss']
})
export class InstallationTableComponent implements OnInit {

  // ???????????????/????????????
  @Input() orderTableType: string = WorkOrderPageTypeEnum.unfinished;
  @Output() refreshCard = new EventEmitter<any>();
  // ????????????
  @ViewChild('workOrderTable') workTableTemp: TableComponent;
  // ????????????
  @ViewChild('statusTemp') public statusTemp: TemplateRef<any>;
  // ????????????
  @ViewChild('equipTemp') public equipTemp: TemplateRef<any>;
  // ????????????
  @ViewChild('deviceTemp') public deviceTemp: TemplateRef<any>;
  // ??????????????????
  @ViewChild('unitNameSearch') unitNameSearch: TemplateRef<any>;
  // ????????????
  @ViewChild('userSearchTemp') userSearchTemp: TemplateRef<any>;
  // ????????????
  @ViewChild('areaSearch') areaSearch: TemplateRef<any>;
  // ??????????????????
  @ViewChild('deviceNameSearch') public deviceNameSearch: TemplateRef<any>;
  // ????????????
  @ViewChild('equipmentSearch') public equipmentSearch: TemplateRef<any>;
  // ?????????
  public workOrderLanguage: WorkOrderLanguageInterface;
  public inspectionLanguage: InspectionLanguageInterface;
  // ????????????
  public installTableData: InstallWorkOrderModel[] = [];
  // ????????????
  public tableConfig: TableConfigModel;
  // ??????
  public pageBean: PageModel = new PageModel();
  // ???????????????
  public isShowDept: boolean = false;
  public treeSelectorConfig: TreeSelectorConfigModel;
  // ????????????
  public departFilterValue: FilterCondition = {
    filterField: '',
    operator: '',
    filterValue: '',
    filterName: ''
  };
  // ??????????????????
  public isShowUserTemp: boolean = false;
  // ??????????????????
  public selectUserList: UserRoleModel[] = [];
  // ????????????
  public checkUserObject: FilterValueModel = new FilterValueModel();
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
  public queryCondition: QueryConditionModel = new QueryConditionModel();
  // ??????
  private exportParams: ExportRequestModel = new ExportRequestModel();
  // ??????????????????
  public isChargeback: boolean = false;
  // ??????????????????
  public isShowTransModal: boolean = false;
  // ????????????
  public transModalData: TransferOrderParamModel;
  // ????????????????????????
  public assignVisible: boolean = false;
  // ???????????????
  public assignTreeSelectorConfig: TreeSelectorConfigModel;
  // ?????????????????????
  public equipmentVisible: boolean = false;
  // ???????????????
  public checkEquipmentObject: SelectOrderEquipmentModel = new SelectOrderEquipmentModel();
  // ??????????????????
  public selectEquipments: EquipmentListModel[] = [];
  // ?????????????????????
  public deviceObjectConfig: AlarmSelectorConfigModel;
  // ?????????????????????
  private checkDeviceObject: FilterValueModel = new FilterValueModel();
  // ?????????????????????
  private equipmentFilterValue: FilterCondition;
  // ?????????
  private unitTreeNodes: DepartmentUnitModel[] = [];
  // ????????????
  private userFilterValue: FilterCondition;
  // ??????
  private installDeduplication: boolean = false;
  // ????????????
  private areaNodes: AreaFormModel[] = [];
  // ??????id
  private currentProcId: string;
  // ??????????????????
  private assignTreeNode: NzTreeNode[] = [];

  constructor(
    public $nzI18n: NzI18nService,
    private $router: Router,
    public $message: FiLinkModalService,
    private $workOrderCommonUtil: WorkOrderCommonServiceUtil,
    private $facilityForCommonService: FacilityForCommonService,
    private $installService: InstallWorkOrderService,
  ) { }

  public ngOnInit(): void {
    this.workOrderLanguage = this.$nzI18n.getLocaleData(LanguageEnum.workOrder);
    this.inspectionLanguage = this.$nzI18n.getLocaleData(LanguageEnum.inspection);
    // ?????????
    WorkOrderInitTreeUtil.initTreeSelectorConfig(this);
    // ?????????
    WorkOrderInitTreeUtil.initAreaSelectorConfig(this);
    // ???????????????
    WorkOrderInitTreeUtil.initAssignTreeConfig(this);
    this.setStatusAndBtn();
    this.refreshData();
    this.initDeviceObjectConfig();
  }

  /**
   * ???????????????????????????
   * @param filterValue ????????????
   */
  public showModal(filterValue: FilterCondition): void {
    this.departFilterValue = filterValue;
    if (this.unitTreeNodes.length === 0) {
      this.$workOrderCommonUtil.queryAllDeptList().then((data: DepartmentUnitModel[]) => {
        if (data.length) {
          this.unitTreeNodes = data;
          this.treeSelectorConfig.treeNodes = data;
          this.isShowDept = true;
        }
      });
    } else {
      this.isShowDept = true;
    }
  }
  /**
   * ????????????????????????
   * @param event ????????????????????????
   */
  public departmentSelectDataChange(event: DepartmentUnitModel[]): void {
    if (event && event.length > 0) {
      this.departFilterValue.filterValue = event[0].deptCode;
      this.departFilterValue.filterName = event[0].deptName;
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
      // ??????????????????
      this.installDeduplication = true;
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
      this.installDeduplication = false;
    } else {
      this.areaFilterValue.filterValue = null;
      this.areaFilterValue.filterName = '';
    }
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
   * ???????????? event = true
   * ???????????? event = false
   */
  public chargebackOrder(event): void {
    if (event) {
      this.confirmationOfChargeback();
    } else {
      this.$router.navigate([`/business/work-order/installation/unfinished-install/rebuild`],
        {queryParams: {type: WorkOrderPageTypeEnum.rebuild, procId: this.currentProcId, operateFrom: WorkOrderPageTypeEnum.unfinished}}).then();
    }
  }
  /**
   * ????????????
   */
  public transferOrders(event: TransferOrderParamModel): void {
    if (event) {
      this.workOrderTransfer(event);
    } else {
      this.isShowTransModal = false;
    }
  }
  /**
   * ????????????????????????
   */
  public getAssignData(areaCode: string): void {
    const data = new AreaDeviceParamModel();
    data.areaCodes = [areaCode];
    data.userId = WorkOrderBusinessCommonUtil.getUserId();
    this.$facilityForCommonService.listDepartmentByAreaAndUserId(data).subscribe((result: ResultModel<NzTreeNode[]>) => {
      if (result.code === ResultCodeEnum.success && result.data.length > 0) {
        this.assignTreeNode = [];
        this.assignTreeNode = result.data;
        this.assignTreeSelectorConfig.treeNodes = this.assignTreeNode;
      } else {
        this.assignTreeSelectorConfig.treeNodes = [];
      }
      this.assignVisible = true;
    });
  }
  /**
   * ??????????????????
   */
  public selectAssignDataChange(event: DepartmentUnitModel[]): void {
    FacilityForCommonUtil.setTreeNodesStatus(this.assignTreeNode, []);
    if (event && event.length > 0) {
      const param = new AssignDepartmentModel();
      param.id = this.currentProcId;  // ??????id
      param.accountabilityDeptCode = event[0].deptCode;  // ????????????
      param.accountabilityDeptName = event[0].deptName;  // ??????????????????
      this.workOrderAssignment(param);
    } else {
      this.$message.error(this.inspectionLanguage.pleaseSelectUnit);
    }
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
    this.installDeduplication = true;
    this.equipmentFilterValue.filterValue = this.checkEquipmentObject.ids.length === 0 ? null : this.checkEquipmentObject.ids;
    this.equipmentFilterValue.filterName = this.checkEquipmentObject.name;
  }
  /**
   * ??????????????????
   */
  public pageChange(event: PageModel): void {
    this.queryCondition.pageCondition.pageNum = event.pageIndex;
    this.queryCondition.pageCondition.pageSize = event.pageSize;
    this.refreshData();
  }
  /**
   * ????????????
   */
  public refreshData(): void {
    this.tableConfig.isLoading = true;
    this.queryCondition.filterConditions.forEach(v => {
      if (v.filterField === 'deviceId' || v.filterField === 'equipmentId') {
        v.operator = OperatorEnum.in;
      }
    });
    if (this.orderTableType === WorkOrderPageTypeEnum.unfinished) {
      this.$installService.unfinishedOrderList(this.queryCondition).subscribe((res: ResultModel<InstallWorkOrderModel[]>) => {
        if (res.code === ResultCodeEnum.success && res.data) {
          this.tableConfig.showEsPagination = res.data && res.data.length > 0;
          res.data.forEach(item => {
            // ????????????????????????????????????
            if (item.lastDays <= 0) {
              item.rowStyle = {color: LastDayColorEnum.overdueTime};
            } else if (item.lastDays <= 3 && item.lastDays > 0) {
              item.rowStyle = {color: LastDayColorEnum.estimatedTime};
            }
          });
          this.handleData(res);
        }
        this.tableConfig.isLoading = false;
      }, () => this.tableConfig.isLoading = false);
    } else {
      this.$installService.historyInstallList(this.queryCondition).subscribe((result: ResultModel<InstallWorkOrderModel[]>) => {
        if (result.code === ResultCodeEnum.success && result.data) {
          this.handleData(result);
        }
        this.tableConfig.isLoading = false;
      }, () => this.tableConfig.isLoading = false);
    }
  }
  /**
   * ????????????
   */
  private handleData(res: ResultModel<InstallWorkOrderModel[]>): void {
    this.pageBean.Total = res.size * res.totalPage;
    this.pageBean.pageSize = res.size;
    this.pageBean.pageIndex = res.pageNum;
    const list = res.data || [];
    list.forEach(item => {
      item.procId = item.id;
      item.statusClass = WorkOrderStatusUtil.getWorkOrderIconClassName(item.status);
      item.statusName = WorkOrderStatusUtil.getWorkOrderStatus(this.$nzI18n, item.status);
      // ???????????????????????????class
      if (item.deviceType) {
        item.deviceTypeName = WorkOrderBusinessCommonUtil.deviceTypeNames(this.$nzI18n, item.deviceType);
        if (item.deviceTypeName) {
          item.deviceClass = CommonUtil.getFacilityIconClassName(item.deviceType);
        } else {
          item.deviceClass = '';
        }
      }
      this.setIconStatus(item);
      // ???????????????????????????class
      if (item.equipmentType) {
        item.equipmentTypeName = WorkOrderBusinessCommonUtil.equipTypeNames(this.$nzI18n, item.equipmentType);
        if (item.equipmentTypeName) {
          item.equipmentTypeClass = CommonUtil.getEquipmentIconClassName(item.equipmentType);
        }
      }
    });
    this.installTableData = list;
  }

  /**
   * ????????????
   */
  private initInstallTable(workOrderStatusList: DeviceTypeModel[], topButtons: Operation[], operateButtons: Operation[]): void {
    this.tableConfig = {
      isDraggable: true,
      isLoading: false,
      primaryKey: (this.orderTableType === WorkOrderPageTypeEnum.unfinished) ? '06-4-1' : '06-4-2',
      showSearchSwitch: true,
      showRowSelection: false,
      showSizeChanger: true,
      showSearchExport: true,
      scroll: {x: '1200px', y: '600px'},
      columnConfig: [
        {type: 'select', fixedStyle: {fixedLeft: true, style: {left: '0px'}}, width: 62},
        { // ????????????
          title: this.inspectionLanguage.workOrderName, key: 'title', width: 150,
          fixedStyle: {fixedLeft: true, style: {left: '124px'}},
          configurable: false, isShowSort: true,
          searchable: true, searchConfig: {type: 'input'}
        },
        {  // ????????????
          title: this.inspectionLanguage.workOrderStatus, key: 'status', width: 150,
          configurable: true, isShowSort: true,
          searchable: true, searchKey: 'status',
          searchConfig: {
            type: 'select', selectType: 'multiple',
            selectInfo: workOrderStatusList,
            label: 'label', value: 'value'
          },
          type: 'render',
          renderTemplate: this.statusTemp,
        },
        {  // ????????????
          title: this.inspectionLanguage.taskDesc, key: 'describe', width: 180,
          configurable: true,
          isShowSort: true, searchable: true,
          searchKey: 'describe',
          searchConfig: {type: 'input'}
        },
        {// ????????????
          title: this.inspectionLanguage.facilityType, key: 'deviceType', width: 130,
          isShowSort: true, configurable: true,
          searchable: true, searchKey: 'deviceType',
          searchConfig: {
            type: 'select', selectType: 'multiple',
            selectInfo: FacilityForCommonUtil.getRoleFacility(this.$nzI18n),
            label: 'label', value: 'code'
          },
          type: 'render',
          renderTemplate: this.deviceTemp,
        },
        {  // ????????????
          title: this.inspectionLanguage.deviceModel, key: 'deviceModel', width: 150,
          configurable: true, isShowSort: true,
          searchable: true, searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.inspectionLanguage.devicesName, key: 'deviceName', width: 150,
          configurable: true, isShowSort: true,
          searchable: true, searchKey: 'deviceId',
          searchConfig: {type: 'render', renderTemplate: this.deviceNameSearch}
        },
        {// ????????????
          title: this.inspectionLanguage.equipmentType, key: 'equipmentType', width: 150,
          configurable: true,
          searchable: true, isShowSort: true,
          searchKey: 'equipmentType',
          searchConfig: {
            type: 'select', selectType: 'multiple',
            selectInfo: FacilityForCommonUtil.getRoleEquipmentType(this.$nzI18n),
            label: 'label', value: 'code'
          },
          type: 'render',
          renderTemplate: this.equipTemp,
        },
        {  // ????????????
          title: this.inspectionLanguage.equipmentModel, key: 'equipmentModel', width: 150,
          configurable: true, isShowSort: true,
          searchable: true, searchConfig: {type: 'input'}
        },
        {  // ????????????
          title: this.inspectionLanguage.equipmentName, key: 'equipmentName', width: 150,
          configurable: true, isShowSort: true,
          searchable: true, searchKey: 'equipmentId',
          searchConfig: {type: 'render', renderTemplate: this.equipmentSearch}
        },
        {// ????????????
          title: this.inspectionLanguage.inspectionArea, key: 'deviceAreaName', width: 150,
          configurable: true, isShowSort: true,
          searchable: true, searchKey: 'deviceAreaCode',
          searchConfig: {type: 'render', renderTemplate: this.areaSearch},
        },
        {// ?????????????????? - ??????????????????
          title: (this.orderTableType === WorkOrderPageTypeEnum.unfinished) ? this.inspectionLanguage.inspectionEndTime : this.inspectionLanguage.actualTime,
          key: (this.orderTableType === WorkOrderPageTypeEnum.unfinished) ? 'planCompletedTime' : 'realityCompletedTime',
          width: 200, pipe: 'date',
          searchConfig: {type: 'dateRang'},
          searchable: true, configurable: true, isShowSort: true,
        },
        {// ????????????
          title: this.inspectionLanguage.responsibleUnit, key: 'accountabilityDeptName', width: 150,
          configurable: true, searchKey: 'accountabilityDeptCode',
          searchable: true, isShowSort: true,
          searchConfig: {type: 'render', renderTemplate: this.unitNameSearch}
        },
        {// ?????????
          title: this.inspectionLanguage.responsible, key: 'assignName', width: 140,
          configurable: true, searchKey: 'assign',
          searchable: true, isShowSort: true,
          searchConfig: {type: 'render', renderTemplate: this.userSearchTemp},
        },
        {// ??????
          title: this.inspectionLanguage.operate, key: '', width: 130,
          configurable: false, searchable: true,
          searchConfig: {type: 'operate'},
          fixedStyle: {fixedRight: true, style: {right: '0px'}}
        }
      ],
      showPagination: false,
      showEsPagination: false,
      bordered: false,
      showSearch: false,
      topButtons: topButtons,
      operation: operateButtons,
      sort: (event: SortCondition) => {
        this.queryCondition.sortCondition = event;
        this.refreshData();
      },
      handleSearch: (event: FilterCondition[]) => {
        if (event.length === 0) {
          // ??????
          this.checkDeviceObject.ids = [];
          this.checkDeviceObject.name = '';
          this.initDeviceObjectConfig();
          // ??????
          this.selectEquipments = [];
          this.checkEquipmentObject = new SelectOrderEquipmentModel();
          // ?????????
          this.selectUserList = [];
          // ??????
          this.departFilterValue = new FilterCondition();
          FacilityForCommonUtil.setTreeNodesStatus(this.unitTreeNodes, []);
          // ??????
          this.areaFilterValue = new FilterCondition();
          FacilityForCommonUtil.setAreaNodesStatus(this.areaNodes, null);
        }
        this.queryCondition.pageCondition.pageNum = 1;
        this.queryCondition.filterConditions = event;
        this.refreshData();
      },
      handleExport: (event: ListExportModel<any[]>) => {
        this.exportParams.columnInfoList = event.columnInfoList;
        const params = ['status', 'planCompletedTime', 'realityCompletedTime', 'equipmentType', 'deviceType'];
        this.exportParams.columnInfoList.forEach(item => {
          if (params.indexOf(item.propertyName) > -1) {
            item.isTranslation = 1;
          }
        });
        this.exportParams.queryCondition = this.queryCondition;
        this.exportParams.excelType = event.excelType;
        let request = this.$installService.unfinishedExport(this.exportParams);
        if (this.orderTableType === WorkOrderPageTypeEnum.finished) {
          request = this.$installService.finishedExport(this.exportParams);
        }
        request.subscribe((result: ResultModel<string>) => {
          if (result.code === ResultCodeEnum.success) {
            this.$message.success(this.inspectionLanguage.operateMsg.exportSuccess);
          } else {
            this.$message.error(result.msg);
          }
        });
      }
    };
  }

  /**
   * ?????????????????????????????????
   */
  private setStatusAndBtn(): void {
    // ????????????????????????
    let workOrderStatusList = [
      {label: this.workOrderLanguage.completed, value: WorkOrderStatusEnum.completed},
      {label: this.workOrderLanguage.singleBack, value: WorkOrderStatusEnum.singleBack},
    ];
    // ??????????????????, ??????????????????????????????3?????????
    let operateButtons: Operation[] = [
      { // ????????????
        text: this.inspectionLanguage.regenerate,
        key: 'isShowTurnBackConfirmIcon',
        className: 'fiLink-rebuild-order',
        handle: (data) => {
          this.$router.navigate([`/business/work-order/installation/finished-install/rebuild`],
            {queryParams: {type: WorkOrderPageTypeEnum.rebuild, procId: data.procId, operateFrom: WorkOrderPageTypeEnum.finished}}).then();
        }
      },
      {  // ??????
        text: this.inspectionLanguage.relatedPictures,
        className: 'fiLink-view-photo',
        handle: (data) => {
          this.$workOrderCommonUtil.queryImageForView(data.deviceId, data.procId);
        }
      },
      {
        // ??????
        text: this.workOrderLanguage.orderDetail,
        className: 'fiLink-view-detail',
        handle: (data) => {
          this.$router.navigate([`/business/work-order/installation/finished-detail/view`],
            {queryParams: {type: WorkOrderPageTypeEnum.finished, procId: data.procId, deviceType: data.deviceType}}).then();
        }
      },
    ];
    // ??????????????????
    let topButtons: Operation[] = [];
    /**
     * ????????????????????????????????????
     *  1???????????????????????????
     *  2????????????????????????????????????
     *  3?????????????????????????????????
     */
    if (this.orderTableType === WorkOrderPageTypeEnum.unfinished) {
      // ????????????
      workOrderStatusList = [];
      (WorkOrderStatusUtil.getWorkOrderStatusList(this.$nzI18n)).forEach(v => {
        if (v.value !== WorkOrderStatusEnum.completed) {
          workOrderStatusList.push(v);
        }
      });
      // ??????????????????
      topButtons = [
        {  // ??????
          text: this.inspectionLanguage.addArea,
          iconClassName: 'fiLink-add-no-circle',
          handle: () => {
            this.$router.navigate([`/business/work-order/installation/installed-detail/add`],
              {queryParams: {type: WorkOrderPageTypeEnum.add, status: WorkOrderStatusEnum.assigned}}).then();
          }
        },
        {   // ????????????
          text: this.inspectionLanguage.delete,
          btnType: 'danger',
          canDisabled: true,
          needConfirm: true,
          className: 'table-top-delete-btn',
          iconClassName: 'fiLink-delete',
          handle: (data: InstallWorkOrderModel[]) => {
            this.deleteOrder(data);
          }
        },
      ];
      // ????????????????????????
      operateButtons = [];
      operateButtons = [
        {
          // ????????????
          text: this.inspectionLanguage.turnBackConfirm,
          key: 'isShowTurnBackConfirmIcon',
          className: 'fiLink-turn-back-confirm',
          handle: (data: InstallWorkOrderModel) => {
            this.currentProcId = data.procId;
            this.isChargeback = true;
          }
        },
        {
          // ??????
          text: this.inspectionLanguage.edit,
          key: 'isShowEditIcon',
          className: 'fiLink-edit',
          disabledClassName: 'fiLink-edit disabled-icon',
          handle: (data: InstallWorkOrderModel) => {
            this.$router.navigate([`/business/work-order/installation/installed-detail/update`],
              {queryParams: {type: WorkOrderPageTypeEnum.update, procId: data.procId, status: data.status}}).then();
          }
        },
        {
          // ??????
          text: this.inspectionLanguage.withdraw,
          key: 'isShowRevertIcon',
          className: 'fiLink-revert',
          needConfirm: true,
          confirmContent: this.inspectionLanguage.isRevertWorkOrder,
          disabledClassName: 'fiLink-revert disabled-icon',
          handle: (data: InstallWorkOrderModel) => {
            this.currentProcId = data.procId;
            this.ticketWithdrawal();
          }
        },
        {
          // ?????????
          text: this.inspectionLanguage.assign,
          key: 'isShowAssignIcon',
          className: 'fiLink-assigned',
          disabledClassName: 'fiLink-assigned disabled-icon',
          handle: (data: InstallWorkOrderModel) => {
            this.currentProcId = data.procId;
            this.getAssignData(data.deviceAreaCode);
          }
        },
        { // ????????????
          text: this.inspectionLanguage.inspectionDetail,
          className: 'fiLink-view-detail',
          handle: (data: InstallWorkOrderModel) => {
            this.$router.navigate([`/business/work-order/installation/unfinished-detail/view`],
              {queryParams: {type: WorkOrderPageTypeEnum.unfinished, procId: data.procId, deviceType: data.deviceType}}).then();
          }
        },
        {
          // ??????
          text: this.workOrderLanguage.transferOrder,
          key: 'isShowTransfer',
          className: 'fiLink-turnProcess-icon',
          handle: (data: InstallWorkOrderModel) => {
            this.currentProcId = data.procId;
            const params = new TransferOrderParamModel();
            params.type = ClearBarrierOrInspectEnum.installation;
            params.procId = data.procId;
            this.transModalData = params;
            this.isShowTransModal = true;
          }
        },
        {  // ??????
          text: this.inspectionLanguage.delete,
          key: 'isShowDeleteIcon',
          canDisabled: true,
          needConfirm: true,
          className: 'fiLink-delete red-icon',
          disabledClassName: 'fiLink-delete disabled-red-icon',
          handle: (data: InstallWorkOrderModel) => {
            this.deleteOrder([data]);
          }
        },
      ];
    }
    this.initInstallTable(workOrderStatusList, topButtons, operateButtons);
  }

  /**
   * ???????????????(????????????)
   */
  private setIconStatus(item): void {
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
   * ???????????????
   */
  private initDeviceObjectConfig(): void {
    this.deviceObjectConfig = {
      clear: !this.checkDeviceObject.ids.length,
      handledCheckedFun: (event) => {
        this.checkDeviceObject = event;
      }
    };
  }

  /**
   *  ????????????
   */
  private deleteOrder(list: InstallWorkOrderModel[]): void {
    if (!list || list.length === 0) {
      return;
    }
    const ids = list.map(v => v.procId);
    this.$installService.deleteInstallWorkOrder(ids).subscribe((res: ResultModel<string>) => {
      if (res.code === ResultCodeEnum.success) {
        this.refreshCard.emit();
        this.refreshData();
        this.$message.success(this.inspectionLanguage.operateMsg.deleteSuccess);
      } else {
        this.$message.error(res.msg);
      }
    });
  }

  /**
   * ????????????
   */
  private ticketWithdrawal(): void {
    this.$installService.installOrderBack(this.currentProcId).subscribe((result: ResultModel<string>) => {
      if (result.code === ResultCodeEnum.success) {
        this.refreshData();
        this.refreshCard.emit();
        this.$message.success(this.inspectionLanguage.operateMsg.turnBack);
      } else {
        this.$message.error(result.msg);
      }
    });
  }

  /**
   * ????????????
   */
  private workOrderTransfer(data: TransferOrderParamModel): void {
    delete data.procId;
    data.id = this.currentProcId;
    this.$installService.installOrderTurn(data).subscribe((result: ResultModel<string>) => {
      if (result.code === ResultCodeEnum.success) {
        this.refreshData();
        this.refreshCard.emit();
        this.isShowTransModal = false;
        this.$message.success(this.inspectionLanguage.operateMsg.turnProgress);
      } else {
        this.$message.error(result.msg);
      }
    });
  }

  /**
   * ????????????
   */
  private workOrderAssignment(param: AssignDepartmentModel): void {
    this.$installService.installOrderAssign(param).subscribe((result: ResultModel<string>) => {
      if (result.code === ResultCodeEnum.success) {
        this.refreshData();
        this.refreshCard.emit();
        this.$message.success(this.inspectionLanguage.operateMsg.assignSuccess);
      } else {
        this.$message.error(result.msg);
      }
    });
  }

  /**
   * ????????????
   */
  private confirmationOfChargeback(): void {
    this.$installService.confirmChargeback(this.currentProcId).subscribe((result: ResultModel<string>) => {
      if (result.code === ResultCodeEnum.success) {
        this.refreshData();
        this.refreshCard.emit();
        this.isChargeback = false;
      } else {
        this.$message.error(result.msg);
      }
    });
  }
}
