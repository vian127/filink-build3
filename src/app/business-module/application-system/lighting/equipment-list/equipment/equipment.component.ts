import {Component, OnDestroy, OnInit, Input, ViewChild, TemplateRef, Output, EventEmitter} from '@angular/core';
import {NzI18nService} from 'ng-zorro-antd';
import * as _ from 'lodash';
import {Router} from '@angular/router';
import {FiLinkModalService} from '../../../../../shared-module/service/filink-modal/filink-modal.service';
import {ApplicationService} from '../../../share/service/application.service';
import {LanguageEnum} from '../../../../../shared-module/enum/language.enum';
import {ApplicationFinalConst, RouterJumpConst, SwitchActionConst} from '../../../share/const/application-system.const';
import {LightTableEnum, ReleaseTableEnum, SecurityEnum} from '../../../share/enum/auth.code.enum';
import {PageModel} from '../../../../../shared-module/model/page.model';
import {DistributeModel} from '../../../share/model/distribute.model';
import {FilterCondition, QueryConditionModel, SortCondition} from '../../../../../shared-module/model/query-condition.model';
import {FacilityListModel} from '../../../../../core-module/model/facility/facility-list.model';
import {OperatorEnum} from '../../../../../shared-module/enum/operator.enum';
import {FilterValueConst} from '../../../share/const/filter.const';
import {EquipmentListModel} from '../../../../../core-module/model/equipment/equipment-list.model';
import {EquipmentModel} from '../../../share/model/equipment.model';
import {CommonUtil} from '../../../../../shared-module/util/common-util';
import {ResultModel} from '../../../../../shared-module/model/result.model';
import {ResultCodeEnum} from '../../../../../shared-module/enum/result-code.enum';
import {IrregularData} from '../../../../../core-module/const/common.const';
import {InstructConfig} from '../../../share/config/instruct.config';
import {OnlineLanguageInterface} from '../../../../../../assets/i18n/online/online-language.interface';
import {FacilityLanguageInterface} from '../../../../../../assets/i18n/facility/facility.language.interface';
import {ApplicationInterface} from '../../../../../../assets/i18n/appliction/application.interface';
import {SliderValueConst} from '../../../share/const/slider.const';
import {TableConfigModel} from '../../../../../shared-module/model/table-config.model';
import {BusinessStatusEnum} from '../../../share/enum/camera.enum';
import {PerformDataModel} from '../../../../../core-module/model/group/perform-data.model';
import {FacilityForCommonService} from '../../../../../core-module/api-service/facility';
import {ControlInstructEnum} from '../../../../../core-module/enum/instruct/control-instruct.enum';
import {EquipmentStatusEnum, EquipmentTypeEnum} from '../../../../../core-module/enum/equipment/equipment.enum';
import {FacilityForCommonUtil} from '../../../../../core-module/business-util/facility/facility-for-common.util';
import {SelectFacilityChangeService} from '../../../share/service/select-facility-change.service';
import {SelectTableEquipmentChangeService} from '../../../share/service/select-table-equipment-change.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

/**
 * ????????????-????????????
 */

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.component.html',
  styleUrls: ['./equipment.component.scss']
})
export class EquipmentComponent implements OnInit, OnDestroy {
  @Input() public isSecurity: boolean = false;
  // ????????????????????????
  @Output() selectDataChange = new EventEmitter();
  // ????????????
  @ViewChild('equipmentTypeTemp') equipmentTypeTemp: TemplateRef<HTMLDocument>;
  //  ??????????????????
  @ViewChild('equipmentStatusTemp') equipmentStatusFilterTemp: TemplateRef<HTMLDocument>;
  // ??????????????????
  @ViewChild('facilityTemplate') deviceFilterTemplate: TemplateRef<HTMLDocument>;
  // ????????????
  @ViewChild('equipmentBusinessTemp') equipmentBusinessTemp: TemplateRef<HTMLDocument>;
  // ????????????
  @ViewChild('remarkTable') remarkTable: TemplateRef<HTMLDocument>;
  // ??????????????????
  public equipmentStatusEnum = EquipmentStatusEnum;
  // ??????????????????
  public equipmentTypeEnum = EquipmentTypeEnum;
  // ?????????????????????
  public languageEnum = LanguageEnum;
  // ???????????????
  public language: OnlineLanguageInterface;
  // ???????????????
  public equipmentLanguage: FacilityLanguageInterface;
  // ?????????????????????
  public languageTable: ApplicationInterface;
  // ????????????????????????
  public dataSet: EquipmentListModel[] = [];
  // ?????????????????????
  public selectFacility: FacilityListModel[] = [];
  // ????????????
  public pageBean: PageModel = new PageModel();
  // ??????????????????
  public sliderValue = SliderValueConst;
  // ????????????????????????
  public filterDeviceName: string = '';
  // ?????????????????????
  public facilityVisible: boolean = false;
  // ????????????
  public tableConfig: TableConfigModel;
  // ???????????????????????????
  public dimmingLight: EquipmentListModel[] = [];
  // ??????????????????
  public equipmentTypeList = [];
  // ????????????
  public isBrightness: boolean = false;
  // ????????????
  public filterValue: FilterCondition;
  // ?????????
  public dimmingLightValue: number = 0;
  // ??????????????????
  public queryCondition: QueryConditionModel = new QueryConditionModel();
  // ??????????????????
  public businessStatusEnum = BusinessStatusEnum;
  public equipmentStatusList;
  // ???????????????
  public destroy$ = new Subject<void>();
  // ??????????????????????????????????????????
  private isNeedCheckMode: boolean = false;

  constructor(
    // ???????????????
    private $nzI18n: NzI18nService,
    // ??????
    private $router: Router,
    // ??????
    private $message: FiLinkModalService,
    // ????????????
    private $applicationService: ApplicationService,
    // ????????????
    private $facilityCommonService: FacilityForCommonService,
    private $selectFacilityChangeService: SelectFacilityChangeService,
    private $selectTableEquipmentChangeService: SelectTableEquipmentChangeService,
  ) {
    this.language = $nzI18n.getLocaleData(LanguageEnum.online);
    this.languageTable = $nzI18n.getLocaleData(LanguageEnum.application);
    this.equipmentLanguage = this.$nzI18n.getLocaleData(LanguageEnum.facility);
    this.equipmentStatusList = CommonUtil.codeTranslate(EquipmentStatusEnum, this.$nzI18n, null, this.languageEnum.facility);
    this.equipmentStatusList = this.equipmentStatusList.filter(item => item.code !== EquipmentStatusEnum.dismantled);
  }

  /**
   * ?????????
   */
  public ngOnInit(): void {
    const url = this.$router.url;
    let permission;
    if (url.includes(ApplicationFinalConst.lighting)) {
      // ??????????????????code?????????
      permission = LightTableEnum;
    } else if (url.includes(ApplicationFinalConst.release)) {
      // ?????????????????????code?????????
      permission = ReleaseTableEnum;
    } else {
      // ??????????????????code?????????
      permission = SecurityEnum;
    }
    // ??????????????????????????????
    this.$selectFacilityChangeService.eventEmit.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      if (value.equipmentIds && value.equipmentIds.length) {
        // ??????????????????????????????
        this.queryCondition.filterConditions = [new FilterCondition('equipmentId', OperatorEnum.in, value.equipmentIds)];
      } else {
        this.queryCondition.filterConditions = [new FilterCondition()];
      }
      this.refreshData();
    });
    this.initTableConfig(permission);
    this.refreshData();
  }

  /**
   * ??????
   */
  public ngOnDestroy(): void {
    this.equipmentTypeTemp = null;
    this.equipmentStatusFilterTemp = null;
    this.equipmentStatusFilterTemp = null;
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * ????????????????????????
   * @ param event
   */
  public handleSlider(event: number): void {
    this.dimmingLightValue = event;
  }

  /**
   * ????????????
   * @ param event
   */
  public pageChange(event: PageModel): void {
    this.queryCondition.pageCondition.pageNum = event.pageIndex;
    this.queryCondition.pageCondition.pageSize = event.pageSize;
    this.refreshData();
  }

  /**
   *  ????????????
   */
  public handleCancel(): void {
    this.isBrightness = false;
  }

  /**
   * ????????????
   */
  public handleOk(): void {
    this.dimmingLightValue = this.dimmingLightValue || 0;
    const params: DistributeModel = {
      equipmentIds: this.dimmingLight.map(item => item.equipmentId),
      commandId: ControlInstructEnum.dimming,
      param: {
        lightnessNum: this.dimmingLightValue
      }
    };
    this.isBrightness = false;
    this.instructDistribute(params);
  }

  /**
   * ?????????????????????????????????
   */
  public onShowFacility(value: FilterCondition): void {
    this.filterValue = value;
    if (!this.filterValue.filterValue) {
      this.filterValue.filterValue = [];
    } else {
      const deviceNameArr = this.filterValue.filterName.split(',');
      this.selectFacility = this.filterValue.filterValue.map((item, index) => {
        return {deviceId: item, deviceName: deviceNameArr[index]};
      });
    }
    this.facilityVisible = true;
  }

  /**
   * ??????????????????
   */
  public onFacilityChange(event: FacilityListModel[]): void {
    this.selectFacility = event || [];
    if (!_.isEmpty(event)) {
      this.filterDeviceName = event.map(item => {
        return item.deviceName;
      }).join(',');
    } else {
      this.filterDeviceName = '';
    }
    this.filterValue.filterValue = event.map(item => {
      return item.deviceId;
    }) || [];
    this.filterValue.operator = OperatorEnum.in;
    this.filterValue.filterName = this.filterDeviceName;
  }

  /**
   * ?????????????????????
   */
  public initTableConfig(permission): void {
    const url = this.$router.url;
    // ???????????????????????????????????????????????????
    if (url.includes(ApplicationFinalConst.lighting)) {
      const lightingArr = FacilityForCommonUtil.getRoleEquipmentType(this.$nzI18n).filter(item => FilterValueConst.lightingFilter[0] === item.code);
      const lightingNewArr = FacilityForCommonUtil.getRoleEquipmentType(this.$nzI18n).filter(item => FilterValueConst.lightingFilter[1] === item.code);
      this.equipmentTypeList = lightingArr.concat(lightingNewArr);
      this.isNeedCheckMode = true;
    } else if (url.includes(ApplicationFinalConst.release)) {
      this.equipmentTypeList = FacilityForCommonUtil.getRoleEquipmentType(this.$nzI18n).filter(item => item.code === FilterValueConst.informationFilter[0]);
    } else {
      this.equipmentTypeList = FacilityForCommonUtil.getRoleEquipmentType(this.$nzI18n).filter(item => item.code === FilterValueConst.securityFilter[0]);
    }
    this.tableConfig = {
      outHeight: 108,
      isDraggable: true,
      primaryKey: permission.primaryKey,
      isLoading: true,
      showSearchSwitch: true,
      showSizeChanger: true,
      scroll: {x: '1600px', y: '600px'},
      noIndex: true,
      showSearchExport: false,
      notShowPrint: true,
      columnConfig: [],
      showPagination: true,
      bordered: false,
      showSearch: false,
      topButtons: [
        // ???
        {
          text: this.languageTable.equipmentTable.switch,
          needConfirm: true,
          canDisabled: true,
          permissionCode: permission.primaryOpenKey,
          iconClassName: 'fiLink-open',
          btnType: 'special',
          confirmContent: `${this.languageTable.equipmentTable.confirmOpen}?`,
          handle: (data: EquipmentListModel[]) => {
            this.switchLight(data, SwitchActionConst.open);
          }
        },
        // ???
        {
          text: this.languageTable.equipmentTable.shut,
          needConfirm: true,
          canDisabled: true,
          permissionCode: permission.primaryShutKey,
          iconClassName: 'fiLink-shut-off',
          btnType: 'special',
          confirmContent: `${this.languageTable.equipmentTable.confirmClose}?`,
          handle: (data: EquipmentListModel[]) => {
            this.switchLight(data, SwitchActionConst.close);
          }
        },
      ],
      // ????????????
      moreButtons: [
        // ??????
        {
          text: this.languageTable.equipmentTable.upElectric,
          iconClassName: 'fiLink-up-electric',
          canDisabled: true,
          disabled: true,
          permissionCode: permission.primaryUpKey,
          handle: () => {
          }
        },
        // ??????
        {
          text: this.languageTable.equipmentTable.downElectric,
          iconClassName: 'fiLink-down-electric',
          canDisabled: true,
          disabled: true,
          permissionCode: permission.primaryDownKey,
          handle: () => {
          }
        },
        // ??????
        {
          text: this.languageTable.equipmentTable.light,
          iconClassName: 'fiLink-light',
          canDisabled: true,
          permissionCode: permission.primaryLightKey,
          handle: (data: EquipmentListModel[]) => {
            this.dimmingLight = data;
            // ?????????????????????  ???????????????0
            this.dimmingLightValue = 0;
            this.isBrightness = true;
          }
        },
      ],
      operation: [
        // ??????
        {
          text: this.languageTable.equipmentTable.details,
          className: 'fiLink-view-detail',
          permissionCode: permission.primaryDetailKey,
          handle: (data: EquipmentModel) => {
            this.handEquipmentOperation(data);
          },
        },
        // ??????
        {
          text: this.languageTable.equipmentTable.upElectric,
          className: 'fiLink-up-electric disabled-icon',
          permissionCode: permission.primaryUpKey,
          handle: () => {
          },
        },
        // ??????
        {
          text: this.languageTable.equipmentTable.downElectric,
          className: 'fiLink-down-electric disabled-icon',
          permissionCode: permission.primaryDownKey,
          handle: () => {
          },
        },
        // ???
        {
          text: this.languageTable.equipmentTable.switch,
          className: 'fiLink-open',
          needConfirm: true,
          permissionCode: permission.primaryOpenKey,
          confirmContent: `${this.languageTable.equipmentTable.confirmOpen}?`,
          handle: (currentIndex: EquipmentListModel) => {
            this.switchLight([currentIndex], SwitchActionConst.open);
          }
        },
        // ???
        {
          text: this.languageTable.equipmentTable.shut,
          className: 'fiLink-shut-off',
          needConfirm: true,
          permissionCode: permission.primaryShutKey,
          confirmContent: `${this.languageTable.equipmentTable.confirmClose}?`,
          handle: (currentIndex: EquipmentListModel) => {
            this.switchLight([currentIndex], SwitchActionConst.close);
          }
        },
        // ??????
        {
          text: this.languageTable.equipmentTable.light,
          className: 'fiLink-light',
          permissionCode: permission.primaryLightKey,
          handle: (data: EquipmentListModel) => {
            this.dimmingLight = [data];
            this.queryEquipmentInfo(data);
          },
        }
      ],
      // ??????
      handleSelect: (event: EquipmentListModel[]) => {
        this.getPositionMapByEquipmentIds(event);
      },
      // ??????
      sort: (event: SortCondition) => {
        this.queryCondition.sortCondition.sortField = event.sortField;
        this.queryCondition.sortCondition.sortRule = event.sortRule;
        this.refreshData();
      },
      // ??????
      handleSearch: (event: FilterCondition[]) => {
        this.queryCondition.pageCondition.pageNum = 1;
        this.queryCondition.filterConditions = event;
        this.refreshData();
      }
    };
    this.securityShow();
  }

  /**
   * ????????????????????????????????????
   */
  public getPositionMapByEquipmentIds(event: EquipmentListModel[]): void {
    // ??????????????????
    // ??????????????????????????????
    this.$selectTableEquipmentChangeService.eventEmit.emit({type: 'equipment', equipmentData: event});
    this.selectDataChange.emit(event);
  }

  /**
   * ??????????????????
   */
  public refreshData(): void {
    this.tableConfig.isLoading = true;
    // ??????????????????
    this.defaultQuery();
    this.$applicationService.newEquipmentListByPage(this.queryCondition).subscribe((res: ResultModel<EquipmentListModel[]>) => {
      this.tableConfig.isLoading = false;
      if (res.code === ResultCodeEnum.success) {
        this.tableConfig.isLoading = false;
        const {totalCount, pageNum, size, data} = res;
        this.dataSet = data || [];
        // equipmentFmt(data, this.$nzI18n);
        this.dataSet.forEach(item => {
          // ??????????????????
          const iconStyle = CommonUtil.getEquipmentStatusIconClass(item.equipmentStatus, 'list');
          item.statusIconClass = iconStyle.iconClass;
          item.statusColorClass = iconStyle.colorClass;
          // ???????????????????????????
          item.iconClass = CommonUtil.getEquipmentTypeIcon(item);
          // ?????????????????????????????????????????????????????????
          if (item.installationDate && item.scrapTime) {
            const now = new Date().getTime();
            const tempDate = new Date(Number(item.installationDate));
            tempDate.setFullYear(tempDate.getFullYear() + Number(item.scrapTime));
            item.rowStyle = now > tempDate.getTime() ? IrregularData : {};
          }
        });
        this.pageBean.Total = totalCount;
        this.pageBean.pageIndex = pageNum;
        this.pageBean.pageSize = size;
      } else {
        this.$message.error(res.msg);
      }

    }, () => {
      this.tableConfig.isLoading = false;
    });
  }

  /**
   * ??????????????????
   */
  public defaultQuery(): void {
    InstructConfig.defaultQuery(this.$router, this.queryCondition);
  }

  /**
   * ????????????
   * @ param data ???????????????
   * @ param type ???????????????
   */
  public switchLight(data: EquipmentListModel[], type: string): void {
    const action = type === SwitchActionConst.open ? ControlInstructEnum.turnOn : ControlInstructEnum.turnOff;
    const params: DistributeModel = {
      equipmentIds: data.map(item => item.equipmentId),
      commandId: action,
      param: {}
    };
    this.instructDistribute(params);
  }

  /**
   * ????????????
   * @ param params
   */
  public instructDistribute(params: DistributeModel): void {
    this.$applicationService.instructDistribute(params).subscribe((res: ResultModel<string>) => {
      if (this.isNeedCheckMode) {
        // ?????????????????????
        this.checkEquipmentMode(params.equipmentIds).then(resolve => {
            if (res.code === ResultCodeEnum.success) {
              if (resolve.code === ResultCodeEnum.success) {
                // ??????????????????????????????
                this.$message.success(`${this.languageTable.contentList.distribution}!`);
              } else {
                // ??????????????????????????????????????????????????????????????????
                this.$message.error(resolve.msg);
              }
              this.isBrightness = false;
              this.dimmingLightValue = 0;
              this.refreshData();
            } else {
              this.$message.error(res.msg);
            }
          }
        );
      } else {
        // ???????????????????????????
        if (res.code === ResultCodeEnum.success) {
          this.$message.success(`${this.languageTable.contentList.distribution}!`);
          this.isBrightness = false;
          this.dimmingLightValue = 0;
          this.refreshData();
        } else {
          this.$message.error(res.msg);
        }
      }
    });
  }

  /**
   * ????????????
   */
  public handEquipmentOperation(data: EquipmentModel): void {
    const url = this.$router.url;
    let path;
    if (url.includes(ApplicationFinalConst.lighting)) {
      path = RouterJumpConst.equipmentDetails;
    } else if (url.includes(ApplicationFinalConst.release)) {
      path = RouterJumpConst.releaseDetails;
    } else {
      path = RouterJumpConst.securityDetails;
    }
    this.$router.navigate([path], {
      queryParams: {
        equipmentId: data.equipmentId,
        equipmentType: data.equipmentType,
        equipmentModel: data.equipmentModel,
        equipmentStatus: data.equipmentStatus,
      }
    }).then();
  }

  /**
   * ??????????????????
   * ?????????????????????????????????????????????
   */
  private queryEquipmentInfo(data: EquipmentListModel): void {
    const queryBody = new PerformDataModel();
    queryBody.equipmentId = data.equipmentId;
    queryBody.equipmentType = data.equipmentType;
    this.$facilityCommonService.queryPerformData(queryBody)
      .subscribe((res: ResultModel<any>) => {
        if (res.code === ResultCodeEnum.success) {
          // ?????????????????????????????????????????????
          this.dimmingLightValue = res.data.light || res.data.brightness;
          this.isBrightness = true;
        } else {
          this.$message.error(res.msg);
        }
      });
  }

  /**
   * ???????????????????????????????????????????????????
   */
  private securityShow(): void {
    const url = this.$router.url;
    if (url.includes(ApplicationFinalConst.security)) {
      this.tableConfig.topButtons = [];
      this.tableConfig.moreButtons = [];
      this.tableConfig.operation = [
        // ??????
        {
          text: this.languageTable.equipmentTable.details,
          className: 'fiLink-view-detail',
          permissionCode: SecurityEnum.primaryDetailKey,
          handle: (data: EquipmentModel) => {
            this.handEquipmentOperation(data);
          },
        },
        // ??????
        {
          text: this.languageTable.equipmentTable.upElectric,
          className: 'fiLink-up-electric disabled-icon',
          permissionCode: SecurityEnum.primaryUpKey,
          handle: () => {
          },
        },
        // ??????
        {
          text: this.languageTable.equipmentTable.downElectric,
          className: 'fiLink-down-electric disabled-icon',
          permissionCode: SecurityEnum.primaryDownKey,
          handle: () => {
          },
        },
        // ???
        {
          text: this.languageTable.equipmentTable.switch,
          className: 'fiLink-open disabled-icon',
          permissionCode: SecurityEnum.primaryOpenKey,
          handle: () => {
          },
        },
        // ???
        {
          text: this.languageTable.equipmentTable.shut,
          className: 'fiLink-shut-off disabled-icon',
          permissionCode: SecurityEnum.primaryShutKey,
          handle: () => {
          },
        },
      ];
    } else if (url.includes(ApplicationFinalConst.release)) {
      const play = {
        text: this.languageTable.equipmentTable.play,
        iconClassName: 'fiLink-pic-bofang1',
        canDisabled: true,
        permissionCode: ReleaseTableEnum.primaryPlayKey,
        handle: () => {
        }
      };
      this.tableConfig.moreButtons.push(play);
    }
    this.releaseTable();
  }

  /**
   * ??????????????????????????????
   */
  private releaseTable(): void {
    this.tableConfig.columnConfig = [
      { // ??????
        type: 'select',
        fixedStyle: {fixedLeft: true, style: {left: '0px'}}, width: 62
      },
      { // ??????
        type: 'serial-number',
        width: 62,
        title: this.language.serialNumber,
        fixedStyle: {fixedLeft: true, style: {left: '62px'}}
      },
      { // ??????
        title: this.languageTable.strategyList.alarmDeviceName,
        key: 'equipmentName',
        width: 150,
        configurable: true,
        searchable: true,
        isShowSort: true,
        searchConfig: {type: 'input'},
        fixedStyle: {fixedLeft: true, style: {left: '124px'}}
      },
      { // ????????????
        title: this.equipmentLanguage.deviceCode,
        key: 'equipmentCode',
        width: 150,
        configurable: true,
        isShowSort: true,
        searchable: true,
        searchConfig: {type: 'input'}
      },
      { // ??????
        title: this.equipmentLanguage.type,
        key: 'equipmentType',
        isShowSort: true,
        type: 'render',
        configurable: true,
        width: 160,
        searchable: true,
        renderTemplate: this.equipmentTypeTemp,
        searchConfig: {
          type: 'select', selectType: 'multiple',
          selectInfo: this.equipmentTypeList,
          label: 'label',
          value: 'code'
        }
      },
      { // ??????
        title: this.equipmentLanguage.status,
        key: 'equipmentStatus',
        width: 130,
        type: 'render',
        renderTemplate: this.equipmentStatusFilterTemp,
        configurable: true,
        searchable: true,
        isShowSort: true,
        searchConfig: {
          type: 'select', selectType: 'multiple',
          selectInfo: this.equipmentStatusList,
          label: 'label',
          value: 'code'
        }
      },
      { //  ??????
        title: this.equipmentLanguage.model,
        key: 'equipmentModel',
        width: 124,
        configurable: true,
        isShowSort: true,
        searchable: true,
        searchConfig: {type: 'input'}
      },
      { // ?????????
        title: this.equipmentLanguage.supplierName,
        key: 'supplier',
        width: 125,
        configurable: true,
        searchable: true,
        isShowSort: true,
        searchConfig: {type: 'input'}
      },
      { // ????????????
        title: this.equipmentLanguage.scrapTime,
        key: 'scrapTime',
        width: 100,
        isShowSort: true,
        configurable: true,
        searchable: true,
        searchConfig: {type: 'input'}
      },
      { // ????????????
        title: this.equipmentLanguage.affiliatedDevice,
        key: 'deviceName',
        searchKey: 'deviceId',
        width: 150,
        configurable: true,
        searchable: true,
        isShowSort: true,
        searchConfig: {
          type: 'render',
          renderTemplate: this.deviceFilterTemplate
        },
      },
      { // ????????????
        title: this.equipmentLanguage.mountPosition,
        key: 'mountPosition',
        configurable: true,
        width: 100,
        searchable: true,
        isShowSort: true,
        searchConfig: {type: 'input'}
      },
      { // ??????????????????
        title: this.equipmentLanguage.installationDate,
        width: 200,
        configurable: true,
        isShowSort: true,
        searchable: true,
        pipe: 'date',
        searchConfig: {type: 'dateRang'},
        key: 'installationDate'
      },
      { // ????????????
        title: this.equipmentLanguage.company, key: 'company',
        searchable: true,
        width: 150,
        configurable: true,
        isShowSort: true,
        searchConfig: {type: 'input'}
      },
      { // ????????????
        title: this.equipmentLanguage.businessStatus, key: 'businessStatus',
        configurable: true,
        type: 'render',
        renderTemplate: this.equipmentBusinessTemp,
        width: 150,
        searchable: true,
        isShowSort: true,
        searchConfig: {
          type: 'select',
          selectInfo: CommonUtil.codeTranslate(BusinessStatusEnum, this.$nzI18n, null, LanguageEnum.facility),
          label: 'label',
          value: 'code'
        }
      },
      { // ????????????
        title: this.equipmentLanguage.affiliatedArea, key: 'areaName',
        configurable: true,
        width: 150,
        searchable: true,
        isShowSort: true,
        searchConfig: {type: 'input'},
      },
      { // ????????????
        title: this.equipmentLanguage.address, key: 'address',
        configurable: true,
        width: 150,
        searchable: true,
        isShowSort: true,
        searchConfig: {type: 'input'},
      },
      { // ????????????
        title: this.equipmentLanguage.gatewayName, key: 'gatewayName',
        configurable: true,
        width: 150,
        searchable: true,
        isShowSort: true,
        searchConfig: {type: 'input'}
      },
      { // ??????
        title: this.equipmentLanguage.remarks, key: 'remarks',
        configurable: true,
        width: 200,
        searchable: true,
        isShowSort: true,
        renderTemplate: this.remarkTable,
        searchConfig: {type: 'input'}
      },
      {
        title: this.language.operate,
        searchable: true,
        searchConfig: {type: 'operate'},
        key: '',
        width: 200,
        fixedStyle: {fixedRight: false, style: {right: '0px'}}
      },
    ];
  }

  /**
   * ?????????????????????????????????
   */
  private checkEquipmentMode(data): Promise<ResultModel<any>> {
    return new Promise((resolve, reject) => {
      this.$facilityCommonService.checkEquipmentMode({equipmentIdList: data}).subscribe((res: ResultModel<any>) => {
        resolve(res);
      });
    });
  }
}
