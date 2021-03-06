import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild} from '@angular/core';
import {MapSelectorComponent} from '../map-selector.component';
import {FiLinkModalService} from '../../../service/filink-modal/filink-modal.service';
import {NzI18nService} from 'ng-zorro-antd';
import {MapService} from '../../../../core-module/api-service/index/map';
import {Result} from '../../../entity/result';
import {CommonUtil} from '../../../util/common-util';
import {iconSize} from '../map.config';
import {IndexLanguageInterface} from '../../../../../assets/i18n/index/index.language.interface';
import {PageModel} from '../../../model/page.model';
import {InspectionLanguageInterface} from '../../../../../assets/i18n/inspection-task/inspection.language.interface';
import {ICON_SIZE} from '../../../service/map-service/map.config';
import {ResultCodeEnum} from '../../../enum/result-code.enum';
import {AreaDeviceParamModel} from '../../../../core-module/model/work-order/area-device-param.model';
import {FacilityForCommonService} from '../../../../core-module/api-service/facility';
import {FacilityForCommonUtil} from '../../../../core-module/business-util/facility/facility-for-common.util';
import {LanguageEnum} from '../../../enum/language.enum';
import {SessionUtil} from '../../../util/session-util';
import {ResultModel} from '../../../model/result.model';
import {MapConfig as BMapConfig} from '../../map/b-map.config';
import {AreaFacilityDataModel, AreaFacilityModel} from '../../../../business-module/index/shared/model/area-facility-model';
import {DeviceTypeEnum} from '../../../../core-module/enum/facility/facility.enum';
import * as lodash from 'lodash';
import {log} from 'util';
import {TableConfigModel} from '../../../model/table-config.model';
import {FacilitiesDetailsModel} from '../../../../core-module/model/index/facilities-details.model';
import {EquipmentTypeEnum} from '../../../../core-module/enum/equipment/equipment.enum';
import {MapStoreService} from '../../../../core-module/store/map.store.service';

declare const MAP_TYPE;

/**
 * ???????????????????????????
 */
@Component({
  selector: 'xc-map-selector-inspection',
  templateUrl: './map-selector-inspection.component.html',
  styleUrls: ['./map-selector-inspection.component.scss']
})
export class MapSelectorInspectionComponent extends MapSelectorComponent implements OnInit, OnChanges, AfterViewInit {
  // ?????????????????????
  @Input() deviceSet: any[];
  // ??????????????? inspection ?????? setDevice ??????????????????????????????
  @Input() selectorType: string;
  // ??????????????????
  @Input() isSelectAll;
  // ?????????????????????????????????
  @Input() noEdit: boolean;
  // ??????id
  @Input() areaId;
  // ????????????
  @Input() deviceType: string | string[];
  // ?????????????????????
  @Input() isHiddenButton = false;
  // ??????????????????????????????
  @Input() switchHiddenButton = true;
  // ?????????????????????
  @Input() selectHiddenButton = false;
  // ????????????????????????
  @Input() mapBoxSelect = false;
  // ??????????????????
  @Input() selectMapType: string;
  // ??????id??????
  @Input() deviceIdList: string[];
  // ??????????????????
  @Input() equipmentTypes: string[];
  // ???????????????
  @Input() hasSelectData: string[] = [];
  // ????????????
  @ViewChild('deviceTypeTemp') deviceTypeTemp: TemplateRef<any>;
  // ????????????
  @ViewChild('equipTemp') equipTemp: TemplateRef<any>;
  // ???????????????
  public selectPageBean: PageModel = new PageModel(10, 1, 0);
  // ????????????
  public typeLg: string;
  public InspectionLanguage: InspectionLanguageInterface; // ?????????
  // ??????
  public orderSearchTypeName: string;
  // ???????????????
  public deviceOrEquipName: string;
  // ?????????
  public indexLanguage: IndexLanguageInterface;
  private markerClusterer: any;
  private markersArr: any[] = [];


  // ?????????????????????????????????
  public isShowTableWindow: boolean = false;
  // ??????????????????
  public setData = [];
  // ????????????
  public equipmentTableConfig: TableConfigModel;
  // ??????????????????????????????
  public queryConditions = [];
  // ??????????????????????????????
  public equipmentListData: Array<FacilitiesDetailsModel> = [];
  // ????????????????????????????????????
  public targetMarker;
  // ??????????????????
  public equipmentTypeList = [];
  // ???????????????
  public languageEnum = LanguageEnum;
  // ?????????
  public commonUtil = CommonUtil;
  // ??????????????????
  public indexEquipmentTypeEnum = EquipmentTypeEnum;
  // ????????????????????????
  public equipmentRadioValue: string;
  // ????????????????????????
  public equipmentSaveData = [];
  // ????????????
  public selectEquipmentShow: boolean = false;

  constructor(public $mapService: MapService,
              public $mapStoreService: MapStoreService,
              public $modalService: FiLinkModalService,
              public $i18n: NzI18nService,
              private $facilityForCommonService: FacilityForCommonService,
  ) {
    super($mapService, $mapStoreService, $facilityForCommonService, $modalService, $i18n);
  }


  ngOnInit() {
    this.mapType = MAP_TYPE;
    this.language = this.$i18n.getLocaleData(LanguageEnum.common);
    this.indexLanguage = this.$i18n.getLocaleData(LanguageEnum.index);
    this.InspectionLanguage = this.$i18n.getLocaleData(LanguageEnum.inspection);
    this.setSelectMapConfig();
    // ????????????
    this.typeLg = JSON.parse(localStorage.getItem('localLanguage'));
    if (this.selectMapType === 'device') {
      this.deviceOrEquipName = this.indexLanguage.searchDeviceName;
      this.orderSearchTypeName = this.indexLanguage.searchDeviceName;
    } else if (this.selectMapType === 'equipment') {
      this.deviceOrEquipName = this.InspectionLanguage.equipmentName;
      this.orderSearchTypeName = this.InspectionLanguage.equipmentName;
    }
  }

  /**
   * ????????????????????????????????????
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (this.xcVisible) {
      if (this.selectMapType === 'device') {
        this.queryDeviceByArea();
      } else if (this.selectMapType === 'equipment') {
        if (!this.equipmentRadioValue) {
          this.equipmentRadioValue = this.equipmentTypes[0];
        }
        this.getEquipmentInfo();
        this.getEquipmentTypes();
      }
    }
    if ((this.selectorType === 'inspection' || this.selectorType === 'inspectionTask') && this.facilityData.length > 0) {
      this.restSelectData();
    }
  }

  /**
   * ???????????????
   */
  ngAfterViewInit(): void {
    this.initMap();
  }

  /**
   * ????????????????????????
   */
  public getEquipmentTypes() {
    if (this.equipmentTypes && this.equipmentTypes.length) {
      this.equipmentTypes.forEach(item => {
        this.equipmentTypeList.push({value: item, code: item});
      });
    }
  }

  /**
   * ????????????change??????
   */
  public equipmentCheckChange(event) {
    this.equipmentRadioValue = event;
    this.equipmentSaveData = this.selectData;
    this.getEquipmentInfo();
  }

  /**
   * ????????????
   */
  public selectEquipmentType() {
    this.selectEquipmentShow = !this.selectEquipmentShow;
  }


  /**
   * ??????
   */
  public handleOk(): void {
    if (this.selectorType === 'inspection' || this.selectorType === 'inspectionTask') {
      // this.selectDataChange.emit(this.selectData);
      // ???????????????????????????????????????????????????
      this.selectDataChange.emit(this.selectData);
      this.handleCancel();
    }
  }

  /**
   * ??????
   * param currentItem
   */
  public handleDelete(currentItem): boolean {
    if (currentItem) {
      if (this.isSelectAll === '1' || this.noEdit) {
        return false;
      }
      // ????????????????????????
      let index = -1;
      if (this.selectMapType === 'device') {
        index = this.selectData.findIndex(item => item.deviceId === currentItem.deviceId);
        this.selectData.splice(index, 1);
        this.childCmp.checkStatus();
        // ???????????????????????????
        this.refreshSelectPageData();
        const imgUrl = CommonUtil.getFacilityIconUrl(iconSize, currentItem.deviceType, '1');
        const icon = this.mapService.toggleIcon(imgUrl);
        this.mapService.getMarkerById(currentItem.deviceId).setIcon(icon);
      } else if (this.selectMapType === 'equipment') {
        index = this.selectData.findIndex(item => item.equipmentId === currentItem.equipmentId);
        this.selectData.splice(index, 1);
        this.childCmp.checkStatus();
        // ???????????????????????????
        this.refreshSelectPageData();
        if (currentItem.positionId) {
          const imgUrls = CommonUtil.getEquipmentTypeIconUrl(iconSize, currentItem.equipmentType, '1');
          const icons = this.mapService.toggleIcon(imgUrls);
          this.mapService.getMarkerById(currentItem.positionId).setIcon(icons);
        }
      }
    }
  }

  /**
   * ???????????????
   * param item
   */
  public pushToTable(item): void {
    let index = -1;
    if (this.selectMapType === 'device') {
      index = this.selectData.findIndex(_item => item.deviceId === _item.deviceId);
    } else if (this.selectMapType === 'equipment') {
      index = this.selectData.findIndex(_item => item.equipmentId === _item.equipmentId);
    }
    if (index === -1) {
      item.checked = true;
      if (item.areaId && item.areaId !== this.areaId) {
        // item.remarks = `??????????????????${item.areaName}???`;
        // item.rowActive = true;
      }
      this.selectData = this.selectData.concat([item]);
    }
  }

  /**
   * ?????????????????????
   * param {any[]} facilityData
   */
  public addMarkers(facilityData: any[]): void {
    const arr = [];
    facilityData.forEach(item => {
      let iconUrl = '';
      const status = item.checked ? '0' : '1';
      const urlSize = item.checked ? '36-48' : '18-24';
      if (this.selectMapType === 'device') {
        iconUrl = CommonUtil.getFacilityIconUrl(urlSize, item.deviceType, status);
      } else {
        iconUrl = CommonUtil.getEquipmentTypeIconUrl(urlSize, item.equipmentType, status);
      }
      const position = item.positionBase.split(',');
      item.lng = parseFloat(position[0]);
      item.lat = parseFloat(position[1]);
      this.mapService.iconSize = ICON_SIZE;
      const icon = this.mapService.toggleIcon(iconUrl, urlSize);
      const point = this.mapService.createPoint(item.lng, item.lat);
      const func = [
        {
          eventName: 'click',
          eventHandler: (event, __event) => {
            const targetIcon = event.target.getIcon();
            const data = this.mapService.getMarkerDataById(event.target.customData.id);
            if (data.equipmentList && data.equipmentList.length > 1) {
              // ??????????????????????????????????????????
              this.targetMarker = event;
              this.equipmentTableWindow(data);
            }
            let _icon;
            let imgUrl = '';
            if (this.selectMapType === 'device') {
              imgUrl = CommonUtil.getFacilityIconUrl(iconSize, data.deviceType, '1');
            } else {
              imgUrl = CommonUtil.getEquipmentTypeIconUrl(iconSize, data.equipmentType, '1');
            }
            if (targetIcon.imageUrl === imgUrl || targetIcon.url === imgUrl) {
              let _imgUrl = CommonUtil.getFacilityIconUrl('36-48', data.deviceType);
              if (this.selectMapType === 'equipment') {
                _imgUrl = CommonUtil.getEquipmentTypeIconUrl('36-48', data.equipmentType);
              }
              _icon = this.mapService.toggleIcon(_imgUrl, '36-48');
              if (!data.equipmentList || (data.equipmentList && data.equipmentList.length < 2)) {
                this.pushToTable(data);
                this.refreshSelectPageData();
              }
            }
            event.target.setIcon(_icon);
          }
        },
        // ?????????????????????????????????????????????
        {
          eventName: 'mouseover',
          eventHandler: (event, __event) => {
          }
        },
        {
          eventName: 'mouseout',
          eventHandler: () => {
            this.isShowInfoWindow = false;
          }
        }
      ];
      const marker = this.mapService.createNewMarker(point, icon, func);
      if (this.selectMapType === 'device') {
        marker.customData = {id: item.deviceId};
        arr.push(marker);
        this.mapService.setMarkerMap(item.deviceId, {marker: marker, data: item});
      } else if (this.selectMapType === 'equipment') {
        if (item.equipmentList && item.equipmentList.length > 1) {
          // ???????????????????????????
          marker.setLabel(this.mapService.getEPointNumber(item.equipmentList.length));
        }
        marker.customData = {id: item.equipmentId};
        arr.push(marker);
        this.mapService.setMarkerMap(item.equipmentId, {marker: marker, data: item});
      }
    });
    this.markerClusterer = this.mapService.addMarkerClusterer(arr);
  }


  /**
   * ??????
   */
  public restMapTable(): void {
    if (this.selectMapType === 'device') {
      this.queryDeviceByArea();
    } else if (this.selectMapType === 'equipment') {
      this.getEquipmentInfo();
    }
  }

  /***
   * ??????
   */
  public handleCancel(): void {
    this.xcVisible = false;
  }

  public searchFacilityName(): void {
    if (this.selectMapType === 'device') {
      this.orderSearchTypeName = this.indexLanguage.searchDeviceName;
    } else if (this.selectMapType === 'equipment') {
      this.orderSearchTypeName = this.InspectionLanguage.equipmentName;
    }
    this.IndexObj = {
      facilityNameIndex: 1,
      bMapLocationSearch: -1,
      gMapLocationSearch: -1,
    };
  }

  /**
   * ????????????
   */
  public searchAddress(): void {
    this.orderSearchTypeName = this.indexLanguage.searchAddress;
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
   * ??????????????????
   */
  public onInput(value: string): void {
    const _value = value.trim();
    this.options = [];
    this.facilityData.forEach(item => {
      if (this.selectMapType === 'device') {
        item.selectName = item.deviceName;
        item.selectId = item.deviceId;
        if (item.selectName.indexOf(_value) > -1) {
          this.options.push(item);
        }
      } else if (this.selectMapType === 'equipment') {
        item.selectName = item.equipmentName;
        item.selectId = item.equipmentId;
        if (item.selectName.indexOf(_value) > -1) {
          this.options.push(item);
        }
      }
    });
  }

  public optionChange(event, item): void {
    this.inputValue = item.selectName;
    this.selectMarker(item.selectId);
  }

  /**
   * ??????????????????
   * param event
   */
  public keyDownEvent(event): void {
    if (event.key === 'Enter') {
      this.selectMarker(this.inputValue);
    }
  }

  /**
   * ???????????????
   */
  private setSelectMapConfig(): void {
    this.mapSelectorConfig.selectedColumn = [];
    this.mapSelectorConfig.showSearchSwitch = true;
    if (this.selectMapType === 'device') {
      // ??????????????????????????????????????? TODO
      /*const arr = FacilityForCommonUtil.getRoleFacility(this.$i18n);
      const device = [];
      if (this.deviceType.length > 0) {
        arr.forEach(item => {
          if (this.deviceType.includes(<string>item.code)) {
            device.push(item);
          }
        });
      }*/
      this.mapSelectorConfig.selectedColumn = [
        {
          title: this.InspectionLanguage.deviceName,
          key: 'deviceName', width: 80,
          searchable: true, searchConfig: {type: 'input'}, isShowSort: true
        },
        {
          title: this.InspectionLanguage.deviceCode,
          key: 'deviceCode', width: 60,
          searchable: true, searchConfig: {type: 'input'}, isShowSort: true
        },
        {
          title: this.InspectionLanguage.facilityType, key: 'deviceTypeName', width: 90,
          type: 'render', renderTemplate: this.deviceTypeTemp, isShowSort: true,
          searchKey: 'deviceType', searchable: true,
          searchConfig: {
            type: 'select', selectType: 'multiple',
            selectInfo: FacilityForCommonUtil.getRoleFacility(this.$i18n),
            label: 'label', value: 'code'
          }
        },
        {
          title: this.InspectionLanguage.parentId,
          key: 'address', width: 80,
          searchable: true, searchConfig: {type: 'input'}, isShowSort: true
        }
      ];
    } else {
      this.mapSelectorConfig.selectedColumn = [
        {
          title: this.InspectionLanguage.equipmentName,
          key: 'equipmentName', width: 80,
          searchable: true, searchConfig: {type: 'input'}, isShowSort: true
        },
        {
          title: this.InspectionLanguage.deviceCode,
          key: 'equipmentCode', width: 80,
          searchable: true, searchConfig: {type: 'input'}, isShowSort: true
        },
        {
          title: this.InspectionLanguage.equipmentType, key: 'equipmentType', width: 90,
          type: 'render', renderTemplate: this.equipTemp, isShowSort: true, searchable: true,
          searchConfig: {
            type: 'select',
            selectType: 'multiple',
            selectInfo: FacilityForCommonUtil.getRoleEquipmentType(this.$i18n),
            label: 'label',
            value: 'code'
          }
        },
        {
          title: this.InspectionLanguage.parentId,
          key: 'address', width: 80,
          searchable: true, searchConfig: {type: 'input'}, isShowSort: true
        }
      ];
    }
    this.initSelectorConfig();
    this.selectorConfig.isDraggable = true;
  }

  /**
   * ????????????????????????
   */
  private queryDeviceByArea(): void {
    const data = new AreaDeviceParamModel();
    data.areaCode = this.areaId;
    if (this.deviceType && Array.isArray(this.deviceType) && this.deviceType.length > 0) {
      data.deviceTypes = this.deviceType;
    } else {
      data.deviceType = this.deviceType.toString();
    }
    this.showProgressBar();
    this.$facilityForCommonService.queryDeviceDataList(data).subscribe((result: Result) => {
      if (result.code === ResultCodeEnum.success) {
        this.hideProgressBar();
        this.$modalService.remove();
        // ?????????????????????????????????????????????
        this.initMap();
        this.selectData = [];
        this.clearAll();
        this.facilityData = result.data || [];
        this.treeNodeSum = this.facilityData.length;
        this.firstData = [];
        // ??????????????????????????????
        this.areaNotHasDevice = true;
        this.facilityData.forEach(item => {
          if (item.deviceType) {
            item.iconType = item.deviceType;
            item.deviceTypeName = FacilityForCommonUtil.translateDeviceType(this.$i18n, item.deviceType);
            item.deviceIcon = CommonUtil.getFacilityIconClassName(item.deviceType);
          }
          item.address = item.areaInfo.areaName;
          this.areaNotHasDevice = false;
          // ????????????
          if (this.isSelectAll === '1') {
            this.firstData.push(item);
            this.pushToTable(item);
          }
          // ??????????????????
          if (this.deviceSet.length > 0) {
            if (this.deviceSet.includes(item.deviceId)) {
              item.checked = true;
              this.firstData.push(item);
              this.pushToTable(item);
            }
          } else {
            item.checked = false;
          }
          /*if (this.isSelectAll === '0' && !this.deviceSet.length) {
            item.checked = true;
            this.firstData.push(item);
            this.pushToTable(item);
          } else {
            // ?????????????????????????????????????????????????????????
            if (this.deviceSet.includes(item.deviceId)) {
              item.checked = true;
              this.firstData.push(item);
              this.pushToTable(item);
            }
          }*/
        });
        this.refreshSelectPageData();
        // ????????????????????????
        if (this.mapType === 'baidu' && this.markerClusterer) {
          this.markerClusterer.clearMarkers(this.markersArr);
        }
        this.addMarkers(this.facilityData);
        this.areaCenterAndZoom();
        // ??????????????????????????????????????????????????????
        // if (this.areaNotHasDevice) {
        //   this.mapService.locateToUserCity();
        // }
      }
    }, () => {
      this.hideProgressBar();
      this.$modalService.remove();
    });
  }

  /**
   * ??????????????????????????????
   */
  private getEquipmentInfo(): void {
    const data = new AreaDeviceParamModel();
    data.areaCode = this.areaId;
    data.deviceIds = this.deviceIdList;
    data.equipmentTypes = this.equipmentTypes;
    // data.equipmentTypes = [this.equipmentRadioValue];
    this.$facilityForCommonService.listEquipmentBaseInfoByAreaCode(data).subscribe((result: Result) => {
      if (result.code === ResultCodeEnum.success) {
        this.hideProgressBar();
        this.$modalService.remove();
        // ?????????????????????????????????????????????
        this.initMap();
        this.selectData = [];
        this.clearAll();
        this.facilityData = result.data || [];
        this.treeNodeSum = this.facilityData.length;
        this.firstData = [];
        // ??????????????????????????????
        this.areaNotHasDevice = true;
        /*if (this.treeNodeSum > 0) {
          this.areaId = this.facilityData[0].areaId;
        }*/
        if (this.equipmentSaveData.length) {
          this.selectData = this.equipmentSaveData;
        } else {
          this.facilityData.forEach(item => {
            item.iconType = item.equipmentType;
            if (item.equipmentType) {
              item.equipmentTypeName = FacilityForCommonUtil.translateEquipmentType(this.$i18n, item.equipmentType);
              item.equipIcon = CommonUtil.getEquipmentIconClassName(item.equipmentType);
            }
            this.areaNotHasDevice = false;
            item.positionBase = item.deviceInfo.positionBase;
            item.deviceStatus = item.deviceInfo.deviceStatus;
            if (this.isSelectAll === '1') {
              this.firstData.push(item);
              this.pushToTable(item);
            }
            item.address = item.areaInfo.areaName;
            // ?????????????????????
            if (this.hasSelectData.length > 0) {
              if (this.hasSelectData.includes(item.equipmentId)) {
                // ?????????????????????
                item.checked = true;
                this.firstData.push(item);
                this.pushToTable(item);
              }
            } else {
              item.checked = false;
            }
            item.equipmentList = [];
          });
        }
        this.refreshSelectPageData();
        // ????????????????????????
        if (this.mapType === 'baidu' && this.markerClusterer) {
          this.markerClusterer.clearMarkers(this.markersArr);
        }
        this.mapEquipmentData(this.facilityData);
        // ??????????????????????????????????????????????????????
        // if (this.areaNotHasDevice) {
        //   this.mapService.locateToUserCity();
        // }
      }
    }, error => {
      this.hideProgressBar();
      this.$modalService.remove();
    });
  }

  /**
   * ????????????????????????
   */
  public mapEquipmentData(data) {
    // ?????????????????????????????????
    const deepData = CommonUtil.deepClone(data);
    // ?????????????????????push?????????????????????????????????????????????????????????????????????
    const map = new Map();
    const arr = [];
    deepData.forEach(item => {
      if (map.has(item.positionBase)) {
        item.positionId = map.get(item.positionBase).equipmentId;
        map.get(item.positionBase).equipmentList.push(item);
      } else {
        item.positionId = item.equipmentId;
        item.equipmentList = [item];
        map.set(item.positionBase, item);
      }
    });
    map.forEach((value, key) => {
      arr.push(value);
    });
    // ??????????????????
    this.addMarkers(arr);
    this.areaCenterAndZoom();
  }


  // todo ??????????????????????????????  ////////////////////////////////////////////////////////////

  /**
   * ????????????????????????
   */
  public areaCenterAndZoom() {
    let requestHeader;
    const areaFacilityModel = new AreaFacilityModel;
    areaFacilityModel.filterConditions.area = [];
    areaFacilityModel.filterConditions.group = [];
    areaFacilityModel.polymerizationType = '1';
    areaFacilityModel.codeList = [this.areaId];
    if (this.selectMapType === 'device') {
      // ?????????????????????????????????
      areaFacilityModel.filterConditions.device = this.deviceType;
      requestHeader = this.$mapService.queryDevicePolymerizationsPointCenter(areaFacilityModel);
    } else {
      // ?????????????????????????????????
      // this.equipmentTypes;
      areaFacilityModel.filterConditions.equipment = [this.equipmentRadioValue];
      requestHeader = this.$mapService.queryEquipmentPolymerizationsPointCenter(areaFacilityModel);
    }
    // ???????????????????????????
    requestHeader.subscribe((result: ResultModel<any>) => {
      if (result.code === ResultCodeEnum.success && result.data && result.data.positionCenter) {
        // ?????????????????????
        const centerPoint = result.data.positionCenter.split(',');
        this.mapService.setCenterAndZoom(centerPoint[0], centerPoint[1], BMapConfig.areaZoom);
      }
    });
  }

  /**
   * ??????????????????(??????????????????????????????????????????????????????????????????????????????????????????????????????)
   */
  public addEventListenerToMap(): void {
    this.mapService.mapEventHook().subscribe(data => {
      const type = data.type;
      console.log(type);
      // ?????????
      if (type === 'zoomend') {

      } else if (type === 'dragend') {

      } else if (type === 'click') {
        // ??????????????????????????????????????????
        this.isShowTableWindow = false;
        this.setData = [];
        this.equipmentListData = [];
      }
    });
  }


  /**
   * ?????????????????????
   */
  public equipmentTableWindow(data): void {
    // ???????????????????????????
    if (data.equipmentList.length > 1) {
      this.equipmentListData = data.equipmentList.map(item => {
        return item;
      });
      this.setData = this.equipmentListData;
      this.isShowTableWindow = true;
      // ???????????????
      this.mapService.panTo(data.lng, data.lat);
      // ???????????????????????????
      this.initEquipmentTableConfig();
    }
  }

  /**
   * ??????????????????????????????
   */
  public initEquipmentTableConfig(): void {
    this.equipmentTableConfig = {
      isDraggable: true,
      isLoading: false,
      scroll: {x: '160px', y: '85px'},
      outHeight: 250,
      noAutoHeight: true,
      topButtons: [],
      noIndex: true,
      columnConfig: [
        {
          title: this.indexLanguage.equipmentName, key: 'equipmentName', width: 100,
          isShowSort: false,
          searchable: true,
          searchConfig: {type: 'input'},
          fixedStyle: {fixedRight: true, style: {left: '0px'}}
        },
        {
          title: '', searchable: true,
          searchConfig: {type: 'operate'}, key: '', width: 60, fixedStyle: {fixedRight: true, style: {right: '0px'}}
        },
      ],
      showPagination: false,
      bordered: false,
      showSearch: true,
      operation: [
        {
          // ??????
          text: this.language.addTo,
          className: 'fiLink-add',
          handle: (currentIndex) => {
            this.pushToTable(currentIndex);
            this.refreshSelectPageData();
          }
        },
      ],
      handleSearch: (event) => {
        this.queryConditions = event;
        this.filterData();
      }
    };
  }

  /**
   * ????????????
   */
  public filterData() {
    this.setData = this.equipmentListData.filter(item => {
      return this.checkFacility(item);
    });
  }

  /**
   * ????????????
   * param item
   * returns {boolean}
   */
  public checkFacility(item) {
    let bol = true;
    this.queryConditions.forEach(q => {
      if (q.filterValue && q.operator === 'eq' && item[q.filterField] !== q.filterValue) {
        bol = false;
      } else if (q.filterValue && q.operator === 'like' && !item[q.filterField].includes(q.filterValue)) {
        bol = false;
      } else if (q.filterValue && q.operator === 'in' && (q.filterValue.indexOf(item[q.filterField]) < 0)) {
        bol = false;
      }
    });
    return bol;
  }


}
