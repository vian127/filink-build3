import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import * as _ from 'lodash';
import {StorageLanguageInterface} from '../../../../../assets/i18n/storage/storage.language.interface';
import {CommonLanguageInterface} from '../../../../../assets/i18n/common/common.language.interface';
import {StorageApiService} from '../../share/service/storage-api.service';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {NzI18nService, NzModalService, UploadFile} from 'ng-zorro-antd';
import {Router} from '@angular/router';
import {PageModel} from '../../../../shared-module/model/page.model';
import {TableConfigModel} from '../../../../shared-module/model/table-config.model';
import {FilterCondition, QueryConditionModel, SortCondition} from '../../../../shared-module/model/query-condition.model';
import {DeliveryStatusEnum} from '../../share/enum/material-status.enum';
import {EquipmentTypeEnum} from '../../../../core-module/enum/equipment/equipment.enum';
import {MaterialTypeEnum} from '../../share/enum/material-type.enum';
import {SelectModel} from '../../../../shared-module/model/select.model';
import {FacilityForCommonUtil} from '../../../../core-module/business-util/facility/facility-for-common.util';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {ListExportModel} from '../../../../core-module/model/list-export.model';
import {DeliveryListModel} from '../../share/model/delivery-list.model';
import {StorageUtil} from '../../share/util/storage.util';
import {CommonUtil} from '../../../../shared-module/util/common-util';
import {DeviceTypeEnum} from '../../../../core-module/enum/facility/facility.enum';
import {ListUnitSelector} from '../../../../shared-module/component/business-component/list-unit-selector/list-unit-selector';
import {UserForCommonService} from '../../../../core-module/api-service';
import {ExportRequestModel} from '../../../../shared-module/model/export-request.model';
import {OperatorEnum} from '../../../../shared-module/enum/operator.enum';
import {StorageServiceUrlConst} from '../../share/const/storage-service-url.const';
import {Download} from '../../../../shared-module/util/download';
import {ProductInfoModel} from '../../../../core-module/model/product/product-info.model';
import {FilterValueModel} from '../../../../core-module/model/work-order/filter-value.model';
import {UserRoleModel} from '../../../../core-module/model/user/user-role.model';
import {SupplierDataModel} from '../../../../core-module/model/supplier/supplier-data.model';
import {ModifyDeliveryComponent} from './modify-delivery/modify-delivery.component';
import {DELIVERY_NUM_EMPTY} from '../../share/const/storage.const';
import {StorageSynopsisChartComponent} from '../../share/component/storage-synopsis-chart/storage-synopsis-chart.component';
import {ImportMissionService} from '../../../../core-module/mission/import.mission.service';

/**
 * ??????????????????
 */
@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.scss']
})
export class DeliveryComponent extends ListUnitSelector implements OnInit {
  // ??????????????????
  @ViewChild('materialType') public materialTypeTemplate: TemplateRef<HTMLDocument>;
  // ??????
  @ViewChild('materialStatus') public materialStatusTemplate: TemplateRef<HTMLDocument>;
  // ??????
  @ViewChild('importTemp') private importTemp: TemplateRef<any>;
  // ??????????????????
  @ViewChild('unitPriceTemp') public unitPriceTemp: TemplateRef<any>;
  // ????????????????????????
  @ViewChild('unitNameSearch') unitNameSearch: TemplateRef<any>;
  // ??????????????????
  @ViewChild('departmentTemp') private departmentTemp: TemplateRef<any>;
  // ??????????????????
  @ViewChild('materialModelTemp') public materialModelTemp: TemplateRef<any>;
  // ?????????????????????
  @ViewChild('supplierTemp') supplierTemp: TemplateRef<any>;
  // ????????????????????????
  @ViewChild('userSearchTemp') userSearchTemp: TemplateRef<any>;
  // ??????????????????
  @ViewChild('updateDelivery') updateDelivery: ModifyDeliveryComponent;
  // ?????????????????????
  @ViewChild('storageChart') public storageChart: StorageSynopsisChartComponent;
  // ?????????
  public storageLanguage: StorageLanguageInterface;
  public commonLanguage: CommonLanguageInterface;
  // ????????????
  public dataSet: DeliveryListModel[] = [];
  // ????????????
  public pageBean: PageModel = new PageModel();
  // ????????????
  public tableConfig: TableConfigModel = new TableConfigModel();
  // ??????????????????
  public queryCondition: QueryConditionModel = new QueryConditionModel();
  // ??????????????????
  public deviceTypeEnum = DeviceTypeEnum;
  // ??????????????????
  public equipmentTypeEnum = EquipmentTypeEnum;
  // ???????????????
  public languageEnum = LanguageEnum;
  // ??????????????????
  public materialTypeEnum = MaterialTypeEnum;
  // ??????????????????
  public materialStatusEnum = DeliveryStatusEnum;
  // ?????????????????????
  public isShowCharts: boolean = false;
  // ?????????????????????
  public fileList: UploadFile[] = [];
  // ????????????
  public checkUserObject: FilterValueModel = new FilterValueModel();
  // ??????????????????
  public isShowUserTemp: boolean = false;
  // ??????????????????
  public selectUserList: UserRoleModel[] = [];
  // ???????????????
  public selectSupplierObject: FilterValueModel = new FilterValueModel();
  // ?????????????????????
  public isShowSupplier: boolean = false;
  // ??????????????????????????????
  public selectSupplierList: SupplierDataModel[] = [];
  // ????????????????????????
  public isShowModel: boolean = false;
  // ??????????????????
  public modelFilterCondition: FilterCondition = new FilterCondition();
  // ?????????????????????????????????????????????
  public productTypeDataSource = [];
  // ???????????????id
  public selectModelId: string[] = [];
  // ?????????????????????
  public selectModelObject: FilterValueModel = new FilterValueModel();
  // ??????????????????????????????
  public showUpdateDeliveryModel: boolean = false;
  // ???????????????????????????
  public updateData;
  // ??????????????????
  private userFilterValue: FilterCondition;
  // ????????????????????????
  private modelFilterValue: FilterCondition;
  // ?????????????????????
  private supplierFilterValue: FilterCondition;
  // ?????????????????????
  private fileArray = [];
  // ?????????????????????
  private fileType: string;
  // ???????????????????????????????????????id
  public deliveryId: string;
  constructor(public $nzI18n: NzI18nService,
              public $nzModalService: NzModalService,
              public $userForCommonService: UserForCommonService,
              public $router: Router,
              public $storageApiService: StorageApiService,
              public $message: FiLinkModalService,
              private $refresh: ImportMissionService,
              private $download: Download) {
    super($userForCommonService, $nzI18n, $message);
  }

  /**
   * ?????????
   */
  public ngOnInit(): void {
    // ???????????????
    this.storageLanguage = this.$nzI18n.getLocaleData(LanguageEnum.storage);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    // ?????????????????????
    this.initTableConfig();
    this.queryDeliveryList();
    this.initTreeSelectorConfig();
    // ???????????? ?????????????????? ????????????????????????
    this.$refresh.refreshChangeHook.subscribe(() => {
      this.queryDeliveryList();
    });
  }

  /**
   * ??????
   */
  public pageChange(event: PageModel): void {
    this.queryCondition.pageCondition.pageNum = event.pageIndex;
    this.queryCondition.pageCondition.pageSize = event.pageSize;
    this.queryDeliveryList();
  }

  /**
   * ????????????
   */
  public beforeUpload = (file: UploadFile): boolean => {
    this.fileArray = this.fileArray.concat(file);
    if (this.fileArray.length > 1) {
      this.fileArray.splice(0, 1);
    }
    this.fileList = this.fileArray;
    const fileName = this.fileList[0].name;
    const index = fileName.lastIndexOf('\.');
    this.fileType = fileName.substring(index + 1, fileName.length);
    return false;
  }

  /**
   * ????????????
   */
  public onSelectUser(event: UserRoleModel[]): void {
    this.selectUserList = event;
    StorageUtil.selectUser(event, this);
  }

  /**
   * ??????????????????
   */
  public openUserSelector(filterValue: FilterCondition): void {
    this.isShowUserTemp = true;
    this.userFilterValue = filterValue;
    this.userFilterValue.operator = OperatorEnum.in;
  }

  /**
   * ????????????????????????
   */
  public openSupplierSelector(filterValue: FilterCondition): void {
    this.isShowSupplier = true;
    this.supplierFilterValue = filterValue;
    this.supplierFilterValue.operator = OperatorEnum.in;
  }

  /**
   * ???????????????????????????
   */
  public onSelectSupplier(event: SupplierDataModel[]): void {
    this.selectSupplierList = event;
    StorageUtil.selectSupplier(event, this);
  }

  /**
   * ???????????????????????????
   */

  public openMaterialModel(filterValue: FilterCondition): void {
    this.isShowModel = true;
    this.productTypeDataSource = FacilityForCommonUtil.getRoleFacility(this.$nzI18n).concat(
      FacilityForCommonUtil.getRoleEquipmentType(this.$nzI18n)
    );
    this.modelFilterValue = filterValue;
    this.modelFilterValue.operator = OperatorEnum.in;
  }

  /**
   * ?????????????????????????????????
   */
  public handleModelOk(event: ProductInfoModel[]): void {
    event.forEach(item => {
      this.selectModelId.push(item.productId);
    });
    StorageUtil.selectModel(event, this);
    this.isShowModel = false;
  }

  /**
   * ????????????????????????
   */
  public handleUpdateDelivery(data): void {
    data.deliveryId = this.deliveryId;
    this.$storageApiService.updateDeliveryById(data).subscribe((res: ResultModel<string>) => {
      if (res.code === ResultCodeEnum.success) {
        this.$message.success(this.storageLanguage.updateDeliverySuccess);
        this.showUpdateDeliveryModel = false;
        this.queryDeliveryList();
      } else {
        this.$message.error(res.msg);
      }
    });
  }

  /**
   * ??????????????????
   */
  private queryDeliveryList(): void {
    this.tableConfig.isLoading = true;
    this.$storageApiService.queryDeliveryList(this.queryCondition).subscribe((res: ResultModel<DeliveryListModel[]>) => {
      this.tableConfig.isLoading = false;
      if (res.code === ResultCodeEnum.success) {
        this.dataSet = res.data || [];
        this.pageBean.pageSize = res.size;
        this.pageBean.pageIndex = res.pageNum;
        this.pageBean.Total = res.totalCount;
        // ??????????????????????????????
        if (!_.isEmpty(this.dataSet)) {
          this.dataSet.forEach(item => {
            // ??????????????????????????????????????????????????????????????????????????????
            if (String(item.materialType) === String(MaterialTypeEnum.facility)) {
              item.iconClass = CommonUtil.getFacilityIConClass(item.materialCode);
            } else if (String(item.materialType) === String(MaterialTypeEnum.equipment)) {
              item.equipmentType = item.materialCode;
              item.iconClass = CommonUtil.getEquipmentTypeIcon(item as any);
            } else {
              // ??????????????????????????? ??????????????????
              item.iconClass = '';
            }
            item.statusClass = StorageUtil.getDeliveryStatusIconClass(item.materialStatus);
            // ????????????????????????????????????????????????????????????
            item.canOperate = item.materialStatus === DeliveryStatusEnum.isDelivery ? 'disabled' : 'enable';
            // ?????????????????????0 ????????????????????? --
            item.deliveryNum = item.deliveryNum === DELIVERY_NUM_EMPTY ? '--' : item.deliveryNum;
          });
        }
      } else {
        this.$message.error(res.msg);
      }
    }, () => {
      this.tableConfig.isLoading = false;
    });
  }

  /**
   * ?????????????????????
   */
  private initTableConfig(): void {
    this.tableConfig = {
      isDraggable: true,
      isLoading: false,
      showSizeChanger: true,
      showSearchSwitch: true,
      showPagination: true,
      notShowPrint: false,
      scroll: {x: '1200px', y: '600px'},
      noIndex: true,
      showSearchExport: true,
      primaryKey: '19-3',
      columnConfig: [
        // ??????
        {type: 'select', fixedStyle: {fixedLeft: true, style: {left: '0'}}, width: 60},
        // ??????
        {
          type: 'serial-number',
          width: 60,
          title: this.commonLanguage.serialNumber,
          fixedStyle: {fixedLeft: true, style: {left: '60px'}}
        },
        {
          // ????????????
          title: this.storageLanguage.deliveryCode,
          key: 'deliveryId',
          width: 200,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        {
          // ????????????
          title: this.storageLanguage.materialName,
          key: 'materialName',
          width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        {
          // ????????????
          title: this.storageLanguage.materialSerial,
          key: 'materialNumber',
          width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        {
          // ?????? ????????? ?????????
          title: this.storageLanguage.materialStatus,
          key: 'materialStatus',
          width: 150,
          type: 'render',
          renderTemplate: this.materialStatusTemplate,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {
            type: 'select',
            selectInfo: [
              {label: this.storageLanguage.isDelivery, value: DeliveryStatusEnum.isDelivery},
              {label: this.storageLanguage.noDelivery, value: DeliveryStatusEnum.noDelivery}
            ],
            label: 'label',
            value: 'code'
          }
        },
        {
          // ????????????
          title: this.storageLanguage.materialNum,
          key: 'remainingNum',
          width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        {
          // ????????????
          title: this.storageLanguage.deliveryNum,
          key: 'deliveryNum',
          width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        {
          // ????????????
          title: this.storageLanguage.materialType,
          key: 'materialCode',
          width: 150,
          type: 'render',
          renderTemplate: this.materialTypeTemplate,
          configurable: true,
          isShowSort: true,
          searchable: true,
          searchConfig: {
            type: 'select',
            selectType: 'multiple',
            selectInfo: this.getMaterialTypeSelect(),
            label: 'label',
            value: 'code'
          }
        },
        {
          // ????????????
          title: this.storageLanguage.productModel,
          key: 'materialModelName',
          width: 150,
          isShowSort: true,
          searchable: true,
          sortKey: 'materialModel',
          searchKey: 'materialModel',
          configurable: true,
          searchConfig: {type: 'render', renderTemplate: this.materialModelTemp}
        },
        {
          // ????????????
          title: this.storageLanguage.warehousingCode,
          key: 'warehousingId',
          width: 200,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        {
          // ???????????????
          title: this.storageLanguage.softwareVersion,
          key: 'softwareVersion',
          width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        {
          // ???????????????
          title: this.storageLanguage.hardwareVersion,
          key: 'hardwareVersion',
          width: 150,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        {
          // ????????????
          title: this.storageLanguage.materialUnitPrice,
          key: 'materialUnitPrice',
          width: 150,
          type: 'render',
          renderTemplate: this.unitPriceTemp,
          isShowSort: true,
          searchable: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        {
          // ?????????
          title: this.storageLanguage.supplier,
          key: 'supplierName',
          width: 150,
          isShowSort: true,
          searchable: true,
          sortKey: 'supplierId',
          searchKey: 'supplierId',
          configurable: true,
          searchConfig: {type: 'render', renderTemplate: this.supplierTemp}
        },
        {
          // ????????????
          title: this.storageLanguage.deptName,
          key: 'collectDeptName',
          width: 150,
          isShowSort: true,
          searchable: true,
          searchKey: 'collectDept',
          sortKey: 'collectDept',
          configurable: true,
          hidden: true,
          renderTemplate: this.departmentTemp,
          searchConfig: {type: 'render', renderTemplate: this.unitNameSearch}
        },
        {
          // ????????????
          title: this.storageLanguage.collectUserName,
          key: 'collectUserName',
          width: 150,
          isShowSort: true,
          searchable: true,
          searchKey: 'collectUser',
          sortKey: 'collectUser',
          configurable: true,
          hidden: true,
          searchConfig: {type: 'render', renderTemplate: this.userSearchTemp}
        },
        {
          // ????????????
          title: this.storageLanguage.deliveryReason,
          key: 'deliveryReason',
          width: 150,
          isShowSort: true,
          searchable: true,
          hidden: true,
          configurable: true,
          searchConfig: {type: 'input'}
        },
        {
          // ????????????
          title: this.storageLanguage.deliveryTime,
          key: 'deliveryDate',
          width: 150,
          isShowSort: true,
          pipe: 'date',
          pipeParam: 'yyyy-MM-dd hh:mm:ss',
          hidden: true,
          configurable: true,
          searchable: true,
          searchConfig: {type: 'dateRang'}
        },
        {
          // ?????????
          title: this.storageLanguage.deliveryUserName,
          key: 'deliveryUserName',
          width: 150,
          isShowSort: true,
          searchable: true,
          sortKey: 'deliveryUser',
          searchKey: 'deliveryUser',
          configurable: true,
          hidden: true,
          searchConfig: {type: 'render', renderTemplate: this.userSearchTemp}
        },
        {
          // ??????
          title: this.storageLanguage.remark, key: 'remark', width: 150, isShowSort: true,
          searchable: true, configurable: true,
          hidden: true,
          searchConfig: {type: 'input'}
        },
        {
          // ??????
          title: this.commonLanguage.operate,
          searchable: true,
          searchConfig: {type: 'operate'},
          key: '', width: 100,
          fixedStyle: {fixedRight: true, style: {right: '0px'}}
        }
      ],
      bordered: false,
      showSearch: false,
      operation: [
        {
          // ??????
          text: this.commonLanguage.edit,
          key: 'canOperate',
          className: 'fiLink-edit',
          disabledClassName: 'fiLink-edit disabled-icon',
          handle: (data: DeliveryListModel) => {
            this.deliveryId = data.deliveryId;
            this.showUpdateDeliveryModel = true;
          }
        },
        {
          // ????????????
          text: this.storageLanguage.delivery,
          className: 'fiLink-delivery',
          key: 'canOperate',
          disabledClassName: 'fiLink-delivery disabled-icon',
          handle: (data: DeliveryListModel) => {
            if (data.deliveryNum === '--') {
              this.$message.info(this.storageLanguage.deliveryNumEmpty);
              return;
            }
            this.$router.navigate(['/business/storage/submit-delivery'],
              {queryParams: {deliveryId: [data.deliveryId]}}).then();
          }
        },
        {
          // ????????????
          text: this.commonLanguage.deleteBtn,
          key: 'canOperate',
          className: 'fiLink-delete red-icon',
          btnType: 'danger',
          iconClassName: 'fiLink-delete',
          disabledClassName: 'fiLink-delete disabled-icon',
          canDisabled: true,
          handle: (data: DeliveryListModel) => {
            this.$message.confirm(this.storageLanguage.deleteWareContent, () => {
              this.$message.confirm(this.storageLanguage.deleteWareContent2, () => {
                this.deleteDelivery([data]);
              });
            });
          }
        },
      ],
      rightTopButtons: [
        // ??????
        {
          text: this.commonLanguage.import,
          iconClassName: 'fiLink-import',
          handle: () => {
            const modal = this.$nzModalService.create({
              nzTitle: this.commonLanguage.selectImport,
              nzClassName: 'custom-create-modal',
              nzContent: this.importTemp,
              nzOkType: 'danger',
              nzFooter: [
                {
                  label: this.commonLanguage.confirm,
                  onClick: () => {
                    this.handleImport();
                    modal.destroy();
                  }
                },
                {
                  label: this.commonLanguage.cancel,
                  type: 'danger',
                  onClick: () => {
                    this.fileList = [];
                    this.fileArray = [];
                    this.fileType = null;
                    modal.destroy();
                  }
                },
              ]
            });
          }
        },
        // ??????????????????
        {
          text: this.commonLanguage.downloadTemplate, iconClassName: 'fiLink-download-file',
          handle: () => {
            this.$download.downloadFile(StorageServiceUrlConst.downloadDeliveryTemplate, 'deliveryImportTemplate.xlsx');
          },
        },
        {
          // ?????????
          text: this.storageLanguage.summaryGraph,
          iconClassName: 'fiLink-analysis',
          handle: () => {
            this.isShowCharts = true;
            this.storageChart.handleSearch();
          },
        }
      ],
      topButtons: [
        {
          // ??????
          text: this.commonLanguage.add,
          iconClassName: 'fiLink-add-no-circle',
          handle: () => {
            this.$router.navigate(['/business/storage/delivery/add']).then();
          }
        },
        {
          // ????????????
          text: this.storageLanguage.delivery,
          iconClassName: 'fiLink-delivery',
          handle: (data: DeliveryListModel[]) => {
            // ?????????????????????????????? ??????????????????????????????
            if (data.length > 0) {
              // ??????????????????????????????0 ??????????????????????????????????????? ???????????????????????????
              if (data.some(item =>  item.materialStatus === DeliveryStatusEnum.isDelivery)) {
                this.$message.info(this.storageLanguage.deliveryAgain);
                return;
              }
              // ?????????????????????????????????????????????
              const deliveryNum = data.some(item => item.deliveryNum === '--');
              if (deliveryNum) {
                this.$message.info(this.storageLanguage.deliveryNumEmpty);
                return;
              }
              // ???????????????????????????????????????????????????
              const noDeliveryIds = [];
              data.forEach(item => noDeliveryIds.push(item.deliveryId));
              this.$router.navigate(['/business/storage/submit-delivery'], {queryParams: {deliveryId: noDeliveryIds}}).then();
            } else {
              this.$message.info(this.storageLanguage.pleaseCheckThe);
            }

          }
        },
        {
          // ????????????
          text: this.commonLanguage.deleteBtn,
          btnType: 'danger',
          canDisabled: true,
          className: 'table-top-delete-btn',
          iconClassName: 'fiLink-delete',
          handle: (data: DeliveryListModel[]) => {
            // ??????????????????????????????0 ??????????????????????????????????????? ???????????????????????????
            if (data.some(item => item.materialStatus === DeliveryStatusEnum.isDelivery)) {
              this.$message.info(this.storageLanguage.notDeleteDeliveryTips);
              return;
            } else {
              this.$message.confirm(this.storageLanguage.deleteWareContent, () => {
                this.$message.confirm(this.storageLanguage.deleteWareContent1, () => {
                  this.deleteDelivery(data);
                });
              });
            }
          }
        }
      ],
      // ??????
      sort: (event: SortCondition) => {
        this.queryCondition.sortCondition.sortField = event.sortField;
        this.queryCondition.sortCondition.sortRule = event.sortRule;
        this.queryDeliveryList();
      },
      // ??????
      handleSearch: (event: FilterCondition[]) => {
        this.queryCondition.pageCondition.pageNum = 1;
        this.queryCondition.filterConditions = event;
        // ???????????????????????????????????????????????????????????????????????????????????????
        event.forEach(item => {
          const array = ['materialType', 'materialNum', 'materialUnitPrice', 'materialStatus', 'deliveryNum'];
          if (array.includes(item.filterField)) {
            item.operator = OperatorEnum.eq;
          }
        });
        // ????????????????????????????????????
        if (!event.length) {
          this.selectUnitName = '';
          FacilityForCommonUtil.setTreeNodesStatus(this.treeNodes || [], []);
          this.selectUserList = [];
          this.selectSupplierList = [];
          this.selectModelId = [];
          this.selectSupplierObject = new FilterValueModel();
          this.selectModelObject = new FilterValueModel();
        }
        this.queryDeliveryList();
      },
      // ??????
      handleExport: (event: ListExportModel<DeliveryListModel[]>) => {
        this.handleExportDelivery(event);
      },
    };
  }

  /**
   * ???????????????????????????
   */
  private getMaterialTypeSelect(): SelectModel[] {
    // ??????
    let selectData = FacilityForCommonUtil.getRoleFacility(this.$nzI18n);
    // ??????
    const otherSelect = [{
      label: this.storageLanguage.otherTotal,
      code: MaterialTypeEnum.other
    }];
    selectData = selectData.concat(FacilityForCommonUtil.getRoleEquipmentType(this.$nzI18n), otherSelect) || [];
    return selectData;
  }

  /**
   * ??????
   */
  private handleImport(): void {
    const formData = new FormData();
    this.fileList.forEach((file: any) => {
      formData.append('file', file);
    });
    if (this.fileList.length === 1) {
      if (this.fileType === 'xls' || this.fileType === 'xlsx') {
        this.$storageApiService.importDeliveryList(formData).subscribe((result: ResultModel<string>) => {
          this.fileType = null;
          this.fileList = [];
          if (result.code === ResultCodeEnum.success) {
            this.$message.success(this.commonLanguage.importTask);
            this.fileArray = [];
          } else {
            this.$message.error(result.msg);
          }
        });
      } else {
        this.$message.info(this.commonLanguage.fileTypeTips);
      }
    } else {
      this.$message.info(this.commonLanguage.selectFileTips);
    }
  }

  /**
   * ?????????????????????????????????
   */
  private deleteDelivery(data: DeliveryListModel[]): void {
    const deliveryIds = data.map(item => item.deliveryId);
    this.$storageApiService.deleteDeliveryByIds({ids: deliveryIds}).subscribe((result: ResultModel<string>) => {
      if (result.code === ResultCodeEnum.success) {
        this.queryCondition.pageCondition.pageNum = 1;
        this.queryDeliveryList();
      } else {
        this.$message.error(result.msg);
      }
    });
  }

  /**
   * ????????????????????????
   */
  private handleExportDelivery(event: ListExportModel<DeliveryListModel[]>): void {
    // ????????????
    const exportBody = new ExportRequestModel(event.columnInfoList, event.excelType);
    // ?????????????????????
    if (event && !_.isEmpty(event.selectItem)) {
      const ids = event.selectItem.map(item => item.deliveryId);
      const filter = new FilterCondition('deliveryId', OperatorEnum.in, ids);
      exportBody.queryCondition.filterConditions.push(filter);
    } else {
      // ??????????????????
      exportBody.queryCondition.filterConditions = event.queryTerm;
    }
    this.$storageApiService.exportDeliveryList(exportBody).subscribe((res: ResultModel<string>) => {
      if (res.code === ResultCodeEnum.success) {
        this.$message.success(this.storageLanguage.exportDeliverySuccess);
      } else {
        this.$message.error(res.msg);
      }
    });
  }
}
