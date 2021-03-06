import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {NzI18nService} from 'ng-zorro-antd';
import * as _ from 'lodash';
import {PageModel} from '../../../../../shared-module/model/page.model';
import {CommonLanguageInterface} from '../../../../../../assets/i18n/common/common.language.interface';
import {TableConfigModel} from '../../../../../shared-module/model/table-config.model';
import {FilterCondition, QueryConditionModel, SortCondition} from '../../../../../shared-module/model/query-condition.model';
import {LanguageEnum} from '../../../../../shared-module/enum/language.enum';
import {ProductLanguageInterface} from '../../../../../../assets/i18n/product/product.language.interface';
import {FacilityForCommonUtil} from '../../../../../core-module/business-util/facility/facility-for-common.util';
import {EquipmentTypeEnum} from '../../../../../core-module/enum/equipment/equipment.enum';
import {ProductTypeEnum, ProductUnitEnum} from '../../../../../core-module/enum/product/product.enum';
import {CommonUtil} from '../../../../../shared-module/util/common-util';
import {OperatorEnum} from '../../../../../shared-module/enum/operator.enum';
import {ResultModel} from '../../../../../shared-module/model/result.model';
import {ProductInfoModel} from '../../../../../core-module/model/product/product-info.model';
import {ResultCodeEnum} from '../../../../../shared-module/enum/result-code.enum';
import {DeviceTypeEnum} from '../../../../../core-module/enum/facility/facility.enum';
import {ProductForCommonService} from '../../../../../core-module/api-service/product/product-for-common.service';
import {UserForCommonService} from '../../../../../core-module/api-service/user';
import {FiLinkModalService} from '../../../../../shared-module/service/filink-modal/filink-modal.service';
import {MaterialTypeEnum} from '../../enum/material-type.enum';
import { TableComponent } from 'src/app/shared-module/component/table/table.component';
import { StorageLanguageInterface } from 'src/assets/i18n/storage/storage.language.interface';

/**
 * ???????????? ????????????????????????
 */
@Component({
  selector: 'app-material-model',
  templateUrl: './material-model.component.html',
  styleUrls: ['./material-model.component.scss']
})
export class MaterialModelComponent implements OnInit, OnDestroy {
  // ??????????????????????????????
  @Input() isVisible: boolean = false;
  // ????????????????????????????????????
  @Input() productTypeDataSource;
  // ?????????????????????id???????????????
  @Input() selectIds: string[] = [];
  // ????????????????????????????????????????????????????????????
  @Input() isRadio: boolean = false;
  // ?????????????????????????????????  ????????????????????????
  @Input() isNeedLimitNum: boolean = false;
  // ??????????????????????????????????????????
  @Input() set filterConditionSource(value: FilterCondition) {
    this.materialFilterCondition = value;
    this.queryMaterialModelList();
  }

  get filterConditionSource() {
    return this.materialFilterCondition;
  }
  // ?????????????????????????????????
  @Output() handleOkEvent: EventEmitter<ProductInfoModel[]> = new EventEmitter<ProductInfoModel[]>();
  // ????????????????????????
  @Output() isVisibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  //  ??????????????????
  @ViewChild('productTypeTemplate') public productTypeTemplate: TemplateRef<HTMLDocument>;
  // ????????????????????????
  @ViewChild('unitTemplate') public unitTemplate: TemplateRef<HTMLDocument>;
  // ??????????????????
  @ViewChild('radioTemp') private radioTemp: TemplateRef<HTMLDocument>;
  // ????????????
  @ViewChild('tableTpl') private tableTpl: TableComponent;
  // ????????????????????????id
  public radioSelectId: string = '';
  // ???????????????
  public commonLanguage: CommonLanguageInterface;
  // ?????????????????????
  public productLanguage: ProductLanguageInterface;
  // ?????????????????????
  public storageLanguage: StorageLanguageInterface;
  // ????????????
  public pageBean: PageModel = new PageModel();
  // ????????????????????????
  public tableConfig: TableConfigModel = new TableConfigModel();
  // ??????????????????
  public queryCondition: QueryConditionModel = new QueryConditionModel();
  // ????????????????????????
  public modelDataSet: ProductInfoModel[] = [];
  // ??????????????????
  public equipmentTypeEnum = EquipmentTypeEnum;
  // ??????????????????
  public productTypeEnum = ProductTypeEnum;
  // ????????????????????????
  public productUnitEnum = ProductUnitEnum;
  // ???????????????
  public languageEnum = LanguageEnum;
  // ??????????????????
  public deviceTypeEnum = DeviceTypeEnum;
  // ???????????????????????????
  public selectModelList: ProductInfoModel[] = [];
  // ???????????????????????????
  private materialFilterCondition: FilterCondition;

  constructor(private $nzI18n: NzI18nService,
              private $productCommonService: ProductForCommonService,
              public $message: FiLinkModalService) { }

  ngOnInit() {
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    this.productLanguage = this.$nzI18n.getLocaleData(LanguageEnum.product);
    this.storageLanguage = this.$nzI18n.getLocaleData(LanguageEnum.storage);
    // ???????????????
    this.initTableConfig();
  }

  ngOnDestroy(): void {
    this.tableTpl = null;
  }

  /**
   * ???????????????????????????????????????
   */
  handleOk() {
    const selectData = this.isRadio ? this.modelDataSet.filter(item => item.productId === this.selectIds[0]) : this.tableTpl.getDataChecked();
    if (this.isNeedLimitNum && selectData.length >= 15) {
      this.$message.info(this.storageLanguage.selectMaterialModelTip);
    } else {
      this.handleOkEvent.emit(selectData);
    }
  }

  /**
   * ???????????????????????????????????????
   */
  cleanUpModel() {
    this.selectIds = [];
    if (!this.isRadio) {
      this.selectModelList = [];
      this.tableTpl.keepSelectedData.clear();
      this.tableTpl.updateSelectedData();
      this.tableTpl.checkStatus();
    }
  }

  /**
   * ???????????????????????????
   * param event PageModel
   */
  public modelPageChange(event: PageModel): void {
    this.queryCondition.pageCondition.pageNum = event.pageIndex;
    this.queryCondition.pageCondition.pageSize = event.pageSize;
    this.queryMaterialModelList();
  }

  /**
   * ??????????????????????????????????????????
   */
  private queryMaterialModelList() {
    this.tableConfig.isLoading = true;
    // TODO ????????????????????????????????????????????????
    // ????????????????????????????????????
    if (this.materialFilterCondition) {
      this.queryCondition.filterConditions = this.queryCondition.filterConditions.filter(item => !['typeFlag', 'typeCode'].includes(item.filterField));
      this.queryCondition.filterConditions.push(this.materialFilterCondition);
    }
    this.$productCommonService.queryProductList(this.queryCondition).subscribe((res) => {
      this.tableConfig.isLoading = false;
      if (res.code === ResultCodeEnum.success) {
        this.modelDataSet = res.data || [];
        this.pageBean.pageIndex = res.pageNum;
        this.pageBean.Total = res.totalCount;
        this.pageBean.pageSize = res.size;
        // ??????????????????????????????
        if (!_.isEmpty(this.modelDataSet)) {
          this.modelDataSet.forEach(item => {
            if (String(item.typeFlag) === String(ProductTypeEnum.facility)) {
              item.iconClass = CommonUtil.getFacilityIConClass(item.typeCode);
            } else {
              item.iconClass = CommonUtil.getEquipmentTypeIcon(item as any);
            }
          });
          if (this.selectIds && this.selectIds.length) {
            this.selectModelList = this.modelDataSet.filter(item => this.selectIds.includes(item.productId));
          }
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
      isLoading: true,
      scroll: {x: '1200px', y: '600px'},
      noIndex: true,
      notShowPrint: true,
      showSizeChanger: true,
      showSearchSwitch: true,
      showPagination: true,
      keepSelected: true,
      selectedIdKey: 'productId',
      columnConfig: [
        // ??????
        this.isRadio ?
          {
            type: 'render', key: 'productId', fixedStyle: {fixedLeft: true, style: {left: '0px'}}, width: 60,
            renderTemplate: this.radioTemp} :
          {type: 'select', fixedStyle: {fixedLeft: true, style: {left: '0px'}}, width: 60},
        { // ??????
          type: 'serial-number',
          width: 62,
          title: this.productLanguage.serialNum,
          fixedStyle: {fixedLeft: true, style: {left: '60px'}}
        },
        { // ????????????
          title: this.productLanguage.productModel, key: 'productModel', width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ??????
          title: this.productLanguage.productType, key: 'typeCode', width: 150,
          type: 'render',
          renderTemplate: this.productTypeTemplate,
          isShowSort: true,
          searchable: true,
          searchConfig: {
            type: 'select',
            selectType: 'multiple',
            selectInfo:  this.productTypeDataSource,
            label: 'label',
            value: 'code'
          }
        },
        { // ?????????
          title: this.productLanguage.supplier, key: 'supplierName', width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.productLanguage.productFeatures, key: 'description', width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.productLanguage.quantity, key: 'productFunction', width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.productLanguage.unit, key: 'unit', width: 100,
          isShowSort: true,
          searchable: true,
          type: 'render',
          renderTemplate: this.unitTemplate,
          searchConfig: {
            type: 'select',
            selectInfo: CommonUtil.codeTranslate(ProductUnitEnum, this.$nzI18n, null, LanguageEnum.product),
            label: 'label',
            value: 'code'
          }
        },
        { // ????????????
          title: this.productLanguage.scrapTime, key: 'scrapTime', width: 100,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.productLanguage.softVersion, key: 'softwareVersion', width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.productLanguage.hardWareVersion, key: 'hardwareVersion', width: 150,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ??????
          title: this.commonLanguage.operate, searchable: true,
          searchConfig: {type: 'operate'}, key: '', width: 150,
          fixedStyle: {fixedRight: false, style: {right: '0px'}}
        }
      ],
      sort: (event: SortCondition) => {
        this.queryCondition.sortCondition = event;
        this.queryMaterialModelList();
      },
      handleSearch: (event: FilterCondition[]) => {
        this.queryCondition.pageCondition.pageNum = 1;
        this.queryCondition.filterConditions = event;
        // ????????????????????????????????????????????????eq
        this.queryCondition.filterConditions.forEach(item => {
          if (['price', 'scrapTime'].includes(item.filterField)) {
            item.operator = OperatorEnum.eq;
          }
        });
        this.queryMaterialModelList();
      }
    };
  }
}
