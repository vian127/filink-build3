import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {MapService} from '../../../../../core-module/api-service/index/map';
import {FiLinkModalService} from '../../../../../shared-module/service/filink-modal/filink-modal.service';
import {NzI18nService} from 'ng-zorro-antd';
import {CommonUtil} from '../../../../../shared-module/util/common-util';
import {iconSize} from '../../../../../shared-module/component/map-selector/map.config';
import {MapSelectorConfigModel} from '../../../../../shared-module/model/map-selector-config.model';
import {BMapPlusService} from '../../../../../shared-module/service/map-service/b-map/b-map-plus.service';
import {GMapPlusService} from '../../../../../shared-module/service/map-service/g-map/g-map-plus.service';
import {TableConfigModel} from '../../../../../shared-module/model/table-config.model';
import {InspectionWorkOrderService} from '../../service/inspection';
import {ResultModel} from '../../../../../shared-module/model/result.model';
import {LanguageEnum} from '../../../../../shared-module/enum/language.enum';
import {QueryConditionModel, SortCondition} from '../../../../../shared-module/model/query-condition.model';
import {ResultCodeEnum} from '../../../../../shared-module/enum/result-code.enum';
import {InspectionObjectListModel} from '../../../../../core-module/model/work-order/inspection-object-list.model';
import {InspectionFromDeviceInfoModel} from '../../model/inspection-model/inspection-from-device-info.model';
import {WorkOrderDeviceModel} from '../../../../../core-module/model/work-order/work-order-device.model';
import {InspectionLanguageInterface} from '../../../../../../assets/i18n/inspection-task/inspection.language.interface';
import {SearchConditionEnum} from '../../enum/refAlarm-faultt.enum';
import {IndexLanguageInterface} from '../../../../../../assets/i18n/index/index.language.interface';
import {CommonLanguageInterface} from '../../../../../../assets/i18n/common/common.language.interface';
import {InspectionObjectInfoModel} from '../../../../../core-module/model/work-order/inspection-object-info.model';
import {FacilityForCommonUtil} from '../../../../../core-module/business-util/facility/facility-for-common.util';
import {WorkOrderBusinessCommonUtil} from '../../util/work-order-business-common.util';
import {InspectionDeviceListModel} from '../../model/inspection-model/inspection-device-list.model';

declare const MAP_TYPE;
declare const BMap;

/**
 * ???????????????????????????
 */
@Component({
  selector: 'app-inspection-object',
  templateUrl: './inspection-object.component.html',
  styleUrls: ['./inspection-object.component.scss']
})
export class InspectionObjectComponent implements OnInit, OnChanges, AfterViewInit {
    // _xcVisible???get??????
  get xcVisible() {
    return this._xcVisible;
  }
  // _xcVisible???set??????
  @Input()
  set xcVisible(params) {
    this._xcVisible = params;
    this.xcVisibleChange.emit(this._xcVisible);
  }
  // ?????????????????????
  @Input() dataSet: InspectionFromDeviceInfoModel[] = [];
  // ???????????????????????????
  @Input() inspectObjectId: string;
  // ???????????????
  @Input() mapSelectorConfig: MapSelectorConfigModel;
  // ??????????????????
  @Output() xcVisibleChange = new EventEmitter<boolean>();
  // ????????????
  @ViewChild('deviceIcon') deviceIcon: TemplateRef<any>;
  // ????????????
  public selectorConfig: TableConfigModel;
  // ????????????????????????
  public IndexObj = {
    facilityNameIndex: 1,
    bMapLocationSearch: -1,
    gMapLocationSearch: -1,
  };
  // ????????????
  public searchTypeName: string;
  // ?????????????????????
  public isShowProgressBar: boolean;
  // ?????????
  public inspectionLanguage: InspectionLanguageInterface;
  public indexLanguage: IndexLanguageInterface;
  public language: CommonLanguageInterface;
  // ?????????
  public inputValue: string;
  // ????????????
  public tableData: InspectionFromDeviceInfoModel[] = [];
  // ???????????????
  public options: InspectionFromDeviceInfoModel[];
  // ????????????
  private deviceList: string[];
  // ????????????
  private equipmentList: string[];
  // ???????????????
  private searchKey: string;
  // ?????????
  public percent: number;
  // ?????????????????????
  public _xcVisible: boolean = false;
  // ????????????
  private mapService;
  // ????????????
  private searchType: SearchConditionEnum = SearchConditionEnum.deviceType;
  // ????????????
  private queryCondition: QueryConditionModel = new QueryConditionModel();
  // ??????????????????
  private inspectionObjectListModel: InspectionObjectListModel = new InspectionObjectListModel();
  // ??????????????????????????????
  private mapType: string;
  // ????????????
  private mapInstance;

  constructor(private $mapService: MapService,
              private $modalService: FiLinkModalService,
              private $inspectionWorkOrderService: InspectionWorkOrderService,
              private $i18n: NzI18nService) {
  }

  /**
   * ???????????????
   */
  public ngOnInit(): void {
    this.mapType = MAP_TYPE;
    this.language = this.$i18n.getLocaleData(LanguageEnum.common);
    this.inspectionLanguage = this.$i18n.getLocaleData(LanguageEnum.inspection);
    this.indexLanguage = this.$i18n.getLocaleData(LanguageEnum.index);
    this.searchTypeName = this.indexLanguage.searchDeviceName;
    this.initSelectorConfig();
  }

  /**
   * View???????????????
   */
  public ngAfterViewInit(): void {
  }

  /**
   * ????????????????????????????????????
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.xcVisible.currentValue) {
      if (!this.mapInstance) {
        this.initMap();
      }
      this.getInspectionDeviceListData();
    }
  }

  /**
   * ??????????????????????????????
   */
  private getInspectionDeviceListData(): void {
    this.$inspectionWorkOrderService.getInspectionDeviceList(this.inspectObjectId).subscribe((result: ResultModel<InspectionDeviceListModel>) => {
      if (result.code === ResultCodeEnum.success) {
        if (result.data && result.data.deviceIdList.length > 0) {
          this.deviceList = result.data.deviceIdList;
          this.equipmentList = result.data.equipmentTypeList;
          this.getInspectionObjectInfo();
        } else {
          this.locateToUserCity();
        }
      }
    }, error => {
      this.locateToUserCity();
    });
  }

  /**
   * ????????????????????????
   */
  private getInspectionObjectInfo(): void {
    this.selectorConfig.isLoading = true;
    this.$inspectionWorkOrderService.queryInspectionObjectList(this.getSortCondition()).subscribe((result: ResultModel<InspectionObjectListModel>) => {
      if (result.code === ResultCodeEnum.success) {
        this.loadTableData(result);
        this.selectorConfig.isLoading = false;
      }
    }, err => {
      this.selectorConfig.isLoading = false;
    });
  }

  private loadTableData(result) {
    // ???????????????????????????
    for (const device in result.data.deviceList) {
      if (result.data.deviceList[device] && this.equipmentList.length > 0) {
        result.data.deviceList[device].equipmentList = result.data.equipmentList.filter(equipmen => {
          return equipmen.deviceId === result.data.deviceList[device].deviceId;
        });
      } else {
        result.data.deviceList[device].equipmentList = [];
      }
    }
    // ??????table???????????????
    result.data.deviceList.forEach(entity => {
      const inspectionFromDeviceInfoModel = new InspectionFromDeviceInfoModel();
      inspectionFromDeviceInfoModel.name = entity.deviceName;
      inspectionFromDeviceInfoModel.code = entity.deviceCode;
      inspectionFromDeviceInfoModel.type = entity.deviceType;
      inspectionFromDeviceInfoModel.area = entity.areaInfo.areaName;
      inspectionFromDeviceInfoModel.deviceId = entity.deviceId;
      inspectionFromDeviceInfoModel.positionBase = entity.positionBase;
      inspectionFromDeviceInfoModel.iconName = this.getDeviceObject(entity.deviceType).name;
      inspectionFromDeviceInfoModel.picture = this.getDeviceObject(entity.deviceType).picture;
      if (entity.equipmentList && entity.equipmentList.length > 0) {
        // ????????????
        entity.equipmentList.forEach(equipment => {
          if (this.equipmentList.indexOf(equipment.equipmentType) > -1) {
            const inspectionFromEquipmentInfoModel = new InspectionFromDeviceInfoModel();
            inspectionFromEquipmentInfoModel.name = equipment.equipmentName;
            inspectionFromEquipmentInfoModel.type = equipment.equipmentType;
            inspectionFromEquipmentInfoModel.code = equipment.equipmentCode;
            inspectionFromEquipmentInfoModel.area = entity.areaInfo.areaName;
            inspectionFromEquipmentInfoModel.iconName = this.getEquipmentObject(equipment.equipmentType).name;
            inspectionFromEquipmentInfoModel.picture = this.getEquipmentObject(equipment.equipmentType).picture;
            inspectionFromEquipmentInfoModel.positionBase = equipment.positionBase;
            inspectionFromDeviceInfoModel.children.push(inspectionFromEquipmentInfoModel);
          }
        });
      } else {
        inspectionFromDeviceInfoModel.children = [];
      }
      this.dataSet.push(inspectionFromDeviceInfoModel);
    });
    this.inspectionObjectListModel.deviceList = result.data.deviceList;
    // ????????????
    this.tableData = this.dataSet.filter(item => this.filterCallBack(null, item));
    // ????????????????????????
    this.addMarkers(this.dataSet);
  }
  /**
   * ????????????table??????
   */
  private getSortCondition(): InspectionObjectInfoModel {
    this.dataSet = [];
    const inspectionObjectInfoModel = new InspectionObjectInfoModel();
    inspectionObjectInfoModel.deviceIdList = this.deviceList;
    inspectionObjectInfoModel.sortCondition = {
      sortField: this.queryCondition.sortCondition.sortField,
      sortRule: this.queryCondition.sortCondition.sortRule,
    };
    return inspectionObjectInfoModel;
  }

  /**
   * ???????????????
   */
  private initMap(): void {
    // ????????????????????????
    if (this.mapType === 'baidu') {
      this.mapService = new BMapPlusService();
      this.mapService.createPlusMap('_mapContainer');
      this.mapService.addLocationSearchControl('_suggestId', '_searchResultPanel');
    } else {
      this.mapService = new GMapPlusService();
      this.mapService.createPlusMap('_mapContainer');
    }
    this.mapInstance = this.mapService.mapInstance;
  }

  /**
   * ?????????????????????
   * param {any[]} facilityData
   */
  private addMarkers(facilityData: InspectionFromDeviceInfoModel[]): void {
    const arr = [];
    facilityData.forEach(item => {
      const status = item.checked ? '0' : '1';
      const iconUrl = CommonUtil.getFacilityIconUrl('18-24', item.type, status);
      let position = [];
      // ?????????????????????????????????????????????
      if (item.positionBase && item.positionBase.length > 0) {
        position =  item.positionBase.split(',');
      } else {
        position = ['', ''];
      }
      item.lng = parseFloat(position[0]);
      item.lat = parseFloat(position[1]);
      // ????????????
      const icon = this.mapService.toggleIcon(iconUrl);
      const point = this.mapService.createPoint(item.lng, item.lat);
      const func = [
        {
          eventName: 'click',
          eventHandler: (event, __event) => {
            this.highlightDevice(event.target.customData.id);
          }
        },
        // ?????????????????????????????????????????????
        {
          eventName: 'mouseout',
          eventHandler: () => {
          }
        }
      ];
      const marker = this.mapService.createNewMarker(point, icon, func);
      marker.customData = {id: item.deviceId};
      arr.push(marker);
      this.mapService.setMarkerMap(item.deviceId, {marker: marker, data: item});
    });
    this.mapService.addMarkerClusterer(arr);
    this.mapService.setCenterPoint();
  }

  /**
   * ?????????????????????
   */
  private initSelectorConfig(): void  {
    this.selectorConfig = {
      noIndex: true,
      isDraggable: false,
      isLoading: false,
      showSearchSwitch: true,
      searchTemplate: null,
      showSearchExport: false,
      notShowPrint: true,
      noAutoHeight: true,
      scroll: {x: '100px', y: '320px'},
      operation: [],
      columnConfig: [
        {
          type: 'expend', width: 20, expendDataKey: 'children'
        },
        {
          key: 'serialNumber', width: 50, title: this.language.serialNumber
        },
        {key: 'name', width: 80, title: this.inspectionLanguage.deviceName, searchable: true, searchConfig: {type: 'input'}, isShowSort: true},
        {key: 'code', width: 80, title: this.inspectionLanguage.deviceCode, searchable: true, searchConfig: {type: 'input'}, isShowSort: true},
        {key: 'type', width: 130, title: this.indexLanguage.deviceAndEquipmentType,
          searchable: true,
          type: 'render',
          renderTemplate: this.deviceIcon,
          searchConfig: { type: 'select', selectType: 'multiple', selectInfo: FacilityForCommonUtil.getRoleFacility(this.$i18n), label: 'label', value: 'code'},
          isShowSort: true
        },
        {key: 'area', width: 110, title: this.inspectionLanguage.parentId, searchable: true, searchConfig: {type: 'input'}, isShowSort: true},
        {title: this.language.operate,
          searchable: true,
          searchConfig: {type: 'operate'},
          hidden: true,
          key: '',
          width: 50,
          fixedStyle: {fixedRight: true, style: {right: '0px'}}
        },
      ],
      bordered: false,
      showSearch: false,
      showPagination: true,
      showSizeChanger: false,
      simplePage: true,
      hideOnSinglePage: true,
      searchReturnType: 'object',
      rowClick: (data) => {
        if (data.father) {
          this.highlightDevice(data.father.deviceId);
          this.mapService.setCenterAndZoom(data.father.lng, data.father.lat, 15);
        } else {
          this.highlightDevice(data.deviceId);
          this.mapService.setCenterAndZoom(data.lng, data.lat, 15);
        }
      },
      // ????????????sortField???key
      sort: (event: SortCondition) => {
        switch (event.sortField) {
          case 'name':
            event.sortField = 'deviceName';
            break;
          case 'code':
            event.sortField = 'deviceCode';
            break;
          case 'type':
            event.sortField = 'deviceType';
            break;
          case 'area':
            event.sortField = 'areaName';
            break;
        }
        this.queryCondition.sortCondition.sortField = event.sortField;
        this.queryCondition.sortCondition.sortRule = event.sortRule;
        this.getInspectionObjectInfo();
      },
      handleSearch: (event) => {
        this.tableData = this.dataSet.filter(item => this.filterCallBack(event, item)) || [];
      }
    };
  }

  public test(): void {
    this.selectorConfig.isLoading = false;
  }

  /**
   * ??????
   */
  public location(): void {
    const key = this.searchKey.trimLeft().trimRight();
    if (!key) {
      return;
    }
    this.mapService.searchLocation(key, (results, status) => {
      if (status === 'OK') {
        this.mapInstance.setCenter(results[0].geometry.location);
      }
    });
  }

  /**
   * ????????????
   */
  public zoomIn(): void {
    this.mapService.zoomOut();
  }

  /**
   * ????????????
   */
  public zoomOut(): void {
    this.mapService.zoomIn();
  }

  /**
   * ??????
   */
  public handleCancel(): void {
    this.inputValue = '';
    this.searchFacilityName();
    this.dataSet = [];
    this.options = [];
    this.tableData = [];
    this.mapInstance = null;
    this.xcVisible = false;
    this.selectorConfig.showSearch = false;
    this.initSelectorConfig();
  }

  /**
   * ????????????
   */
  public searchFacilityName(): void {
    if (this.searchType === SearchConditionEnum.deviceType) {
      return;
    }
    this.options = [];
    this.inputValue = '';
    this.searchType = SearchConditionEnum.deviceType;
    this.searchTypeName = this.indexLanguage.searchDeviceName;
    // ?????????????????????
    if (this.mapType === 'baidu') {
      this.IndexObj = {
        facilityNameIndex: 1,
        bMapLocationSearch: -1,
        gMapLocationSearch: -1,
      };
    } else if (this.mapType === 'google') {
      this.IndexObj = {
        facilityNameIndex: -1,
        bMapLocationSearch: -1,
        gMapLocationSearch: 1,
      };
    }
  }

  /**
   * ????????????
   */
  public searchAddress(): void {
    if (this.searchType === SearchConditionEnum.addressType) {
      return;
    }
    // ???????????????????????????
    this.options = [];
    this.inputValue = '';
    this.searchType = SearchConditionEnum.addressType;
    this.searchTypeName = this.indexLanguage.searchAddress;
    // ?????????????????????
    if (this.mapType === 'baidu') {
      this.IndexObj = {
        facilityNameIndex: -1,
        bMapLocationSearch: 1,
        gMapLocationSearch: -1,
      };
    } else if (this.mapType === 'google') {
      this.IndexObj = {
        facilityNameIndex: -1,
        bMapLocationSearch: -1,
        gMapLocationSearch: 1,
      };
    }
  }

  /**
   * Input?????????????????????????????????
   */
  public onInput(): void {
    const _value = CommonUtil.trim(this.inputValue);
    this.options = this.dataSet.filter(item => {
      return  item.name.includes(_value);
    });
  }

  /**
   * Input??????Enter????????????
   */
  public keyDownEvent(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.selectMarker(this.inputValue);
    }
  }

  /**
   * Input??????Change????????????
   */
  public optionChange(event: KeyboardEventInit, option: InspectionFromDeviceInfoModel): void {
    this.inputValue = option.name;
    this.selectMarker(option.deviceId);
  }

  /**
   * ??????????????????????????????
   */
  private selectMarker(id: string): void {
    const marker = this.mapService.getMarkerById(id);
    if (!marker) {
      return;
    }
    this.highlightDevice(id);
    const data = this.mapService.getMarkerDataById(id);
    this.mapService.setCenterAndZoom(data.lng, data.lat, 15);
  }

  /**
   * ????????????
   * param deviceId
   */
  private highlightDevice(deviceId: string): void {
    this.dataSet.forEach(item => {
      let imgUrl;
      if (item.deviceId === deviceId) {
        item.rowActive = true;
        imgUrl = CommonUtil.getFacilityIconUrl(iconSize, item.type, '0');
      } else {
        item.rowActive = false;
        imgUrl = CommonUtil.getFacilityIconUrl(iconSize, item.type, '1');
      }
      const icon = this.mapService.toggleIcon(imgUrl);
      this.mapService.getMarkerById(item.deviceId).setIcon(icon);
    });
  }

  /**
   * ????????????
   */
  private filterCallBack(filter: InspectionFromDeviceInfoModel, item: InspectionFromDeviceInfoModel): boolean {
    if (!filter) {
      return true;
    }
    if (filter.name && !(item.name.includes(filter.name))) {
      return false;
    }
    if (filter.code && !(item.code.includes(filter.code))) {
      return false;
    }
    if (filter.type && !(filter.type.includes(item.type))) {
      return false;
    }
    if (filter.area && !(item.area.includes(filter.area))) {
      return false;
    }
    return true;
  }

  /**
   * ??????????????????
   */
  private getEquipmentObject(code: string): WorkOrderDeviceModel {
    const equipmentModel = new WorkOrderDeviceModel();
    equipmentModel.name = WorkOrderBusinessCommonUtil.equipTypeNames(this.$i18n, code);
    equipmentModel.picture = CommonUtil.getEquipmentIconClassName(code);
    return equipmentModel;
  }

  /**
   * ??????????????????
   */
  private getDeviceObject(code: string): WorkOrderDeviceModel {
    const deviceModel = new WorkOrderDeviceModel();
    deviceModel.name = WorkOrderBusinessCommonUtil.deviceTypeNames(this.$i18n, code);
    deviceModel.picture = CommonUtil.getFacilityIconClassName(code);
    return deviceModel;
  }

  /**
   * ?????????????????????
   */
  private locateToUserCity(): void {
    const myFun = (result) => {
      const cityName = result.name;
      this.mapInstance.centerAndZoom(cityName);
    };
    const myCity = new BMap.LocalCity();
    myCity.get(myFun);
  }
}
