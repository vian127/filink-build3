import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {DateHelperService, NzI18nService} from 'ng-zorro-antd';
import * as _ from 'lodash';
import {FiLinkModalService} from '../../../../../shared-module/service/filink-modal/filink-modal.service';
import {FacilityApiService} from '../../../share/service/facility/facility-api.service';
import {BusinessFacilityService} from '../../../../../shared-module/service/business-facility/business-facility.service';
import {ImageViewService} from '../../../../../shared-module/service/picture-view/image-view.service';
import {FacilityService} from '../../../../../core-module/api-service/facility/facility-manage';
import {FacilityLanguageInterface} from '../../../../../../assets/i18n/facility/facility.language.interface';
import {ResultCodeEnum} from '../../../../../shared-module/enum/result-code.enum';
import {ResultModel} from '../../../../../shared-module/model/result.model';
import {LanguageEnum} from '../../../../../shared-module/enum/language.enum';
import {NO_IMG} from '../../../../../core-module/const/common.const';
import {BusinessStatusEnum} from '../../../../../core-module/enum/equipment/equipment.enum';
import {FilterCondition, QueryConditionModel, SortCondition} from '../../../../../shared-module/model/query-condition.model';
import {OperatorEnum} from '../../../../../shared-module/enum/operator.enum';
import {Project} from '../../../share/model/project';
import {ObjectTypeEnum} from '../../../../../core-module/enum/facility/object-type.enum';
import {PicResourceEnum} from '../../../../../core-module/enum/picture/pic-resource.enum';
import {ThumbnailBaseInfoModel} from '../../../../../core-module/model/equipment/thumbnail-base-info.model';
import {FacilityDetailInfoModel} from '../../../../../core-module/model/facility/facility-detail-info.model';
import {DeployStatusEnum, DeviceStatusEnum, DeviceTypeEnum} from '../../../../../core-module/enum/facility/facility.enum';
import {CommonUtil} from '../../../../../shared-module/util/common-util';
import {FacilityForCommonService} from '../../../../../core-module/api-service/facility';
import {QueryRecentlyPicModel} from '../../../../../core-module/model/picture/query-recently-pic.model';
import {PictureListModel} from '../../../../../core-module/model/picture/picture-list.model';
import {LoopListModel} from '../../../../../core-module/model/loop/loop-list.model';
import {PageModel} from '../../../../../shared-module/model/page.model';
import {TableConfigModel} from '../../../../../shared-module/model/table-config.model';
import {LoopStatusEnum, LoopTypeEnum} from '../../../../../core-module/enum/loop/loop.enum';
import {AssetManagementLanguageInterface} from '../../../../../../assets/i18n/asset-manage/asset-management.language.interface';

declare const MAP_TYPE;

/**
 * ??????????????????????????????
 */
@Component({
  selector: 'app-infrastructure-details',
  templateUrl: './infrastructure-details.component.html',
  styleUrls: ['./infrastructure-details.component.scss']
})
export class InfrastructureDetailsComponent implements OnInit, OnDestroy {
  // ??????id
  @Input()
  public deviceId: string;
  // ????????????
  @Input()
  public deviceType: DeviceTypeEnum;
  // ????????????
  public facilityInfo: FacilityDetailInfoModel = new FacilityDetailInfoModel();
  // ?????????????????????
  public devicePicUrl = NO_IMG;
  // ???????????????
  public language: FacilityLanguageInterface;
  // ???????????????
  public assetLanguage: AssetManagementLanguageInterface;
  // ??????????????????????????????
  public baseInfo: ThumbnailBaseInfoModel;
  // ????????????
  public mapType = MAP_TYPE;
  // ??????????????????
  public businessStatus = BusinessStatusEnum;
  // ??????????????????
  public showGroupInfo = false;
  // ????????????????????????
  public showLoopInfo = false;
  // ?????????????????????????????? ?????????????????????????????? ?????????????????????????????????????????? ????????????????????????
  public hiddenLoopGroupButton: boolean = false;
  // ????????????????????????
  public filterConditions: FilterCondition[];
  // loading
  public loading = false;
  // ????????????
  public deviceTypeEnum = DeviceTypeEnum;
  // ??????????????????
  public deviceStatusEnum = DeviceStatusEnum;
  // ???????????????
  public languageEnum = LanguageEnum;
  // ????????????
  private loopTimer: number;
  // ??????????????????
  private devicePicList: Array<PictureListModel>;
  // ????????????
  public dataSet: LoopListModel[] = [];
  // ??????????????????
  public pageBean: PageModel = new PageModel();
  // ????????????
  public tableConfig: TableConfigModel;
  // ??????????????????
  public queryCondition: QueryConditionModel = new QueryConditionModel();
  xcVisible = false;

  constructor(private $facilityService: FacilityService,
              private $facilityCommonService: FacilityForCommonService,
              private $modalService: FiLinkModalService,
              private $nzI18n: NzI18nService,
              private $dateHelper: DateHelperService,
              private $imageViewService: ImageViewService,
              private $facilityApiService: FacilityApiService,
              private $businessFacilityService: BusinessFacilityService) {
    this.assetLanguage = this.$nzI18n.getLocaleData(LanguageEnum.assets);
  }

  public ngOnInit(): void {
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.facility);
    // ??????????????????????????????????????????
    this.hiddenLoopGroupButton = this.deviceType === DeviceTypeEnum.well
      || this.deviceType === DeviceTypeEnum.opticalBox
      || this.deviceType === DeviceTypeEnum.outdoorCabinet;
    // ??????????????????
    this.getFacilityInfo();
    // ???????????????
    this.getDevicePic();
    // ???????????????????????????????????????
    this.filterConditions = [new FilterCondition('deviceIds', OperatorEnum.in, [this.deviceId])];
    // ??????????????????????????????,??????????????????
    this.$businessFacilityService.eventEmit.subscribe(() => {
      this.getDevicePic();
    });
    this.initTableConfig();
  }

  /**
   * ???????????????????????????
   */
  public ngOnDestroy(): void {
    if (this.loopTimer) {
      window.clearInterval(this.loopTimer);
    }
  }

  /**
   * ??????????????????
   */
  public getProjectList(projectId: string): void {
    this.$facilityApiService.getProjectList().subscribe((result: ResultModel<Array<Project>>) => {
      if (result.code === ResultCodeEnum.success && !_.isEmpty(result.data)) {
        this.facilityInfo.projectName = _.find(result.data, (item: Project) => item.projectId === projectId).projectName;
      } else {
        this.$modalService.error(result.msg);
      }
    });
  }

  /**
   * ??????????????????
   */
  public getFacilityInfo(): void {
    this.loading = true;
    this.$facilityCommonService.queryDeviceById({deviceId: this.deviceId})
      .subscribe((result: ResultModel<FacilityDetailInfoModel[]>) => {
        if (result.code === ResultCodeEnum.success) {
          this.loading = false;
          if (!_.isEmpty(result.data)) {
            this.facilityInfo = result.data.pop();
          }
          // ??????????????????
          this.facilityInfo.updateTime = Date.parse(this.facilityInfo.updateTime as string);
          // ??????????????????????????????
          this.baseInfo = {
            positionBase: this.facilityInfo.positionBase,
            deviceType: this.facilityInfo.deviceType,
            deviceStatus: this.facilityInfo.deviceStatus,
            areaCode: this.facilityInfo.areaInfo.areaCode,
          };
          // ??????????????????
          if (this.facilityInfo.deviceStatus) {
            // ????????????icon??????
            const statusStyle = CommonUtil.getDeviceStatusIconClass(this.facilityInfo.deviceStatus);
            this.facilityInfo.deviceStatusIconClass = statusStyle.iconClass;
            // ????????????????????????
            this.facilityInfo.deviceStatusColorClass = statusStyle.colorClass;
            // -c??????class???????????????color,?????????-bg????????????class??????,???????????????
            this.facilityInfo.deviceStatusColorClass = this.facilityInfo.deviceStatusColorClass
              .replace('-c', '-bg');
          }
          if (this.facilityInfo.deployStatus) {
            this.facilityInfo.deployStatusLabel = CommonUtil.codeTranslate(DeployStatusEnum, this.$nzI18n, this.facilityInfo.deployStatus, LanguageEnum.facility) as string;
            this.facilityInfo.deployStatusIconClass = CommonUtil.getDeployStatusIconClass(this.facilityInfo.deployStatus);
          }
          // ????????????????????????????????????????????????
          if (this.facilityInfo.projectId) {
            this.getProjectList(this.facilityInfo.projectId);
          }
        } else if (result.code === ResultCodeEnum.deviceExceptionCode) {
          this.$modalService.error(result.msg);
          window.history.go(-1);
        }
        // ?????????????????????
        if (!this.loopTimer) {
          this.loopTimer = window.setInterval(() => {
            this.getFacilityInfo();
          }, 60000);
        }
      }, () => {
        this.loading = false;
      });
  }

  /**
   * ????????????
   */
  public clickImage(): void {
    if (this.devicePicList && this.devicePicList.length > 0) {
      this.$imageViewService.showPictureView(this.devicePicList);
    }
  }


  /**
   * ??????????????????
   */
  private getDevicePic(): void {
    const body: QueryRecentlyPicModel = new QueryRecentlyPicModel(this.deviceId, '1', PicResourceEnum.realPic, null, ObjectTypeEnum.facility);
    this.$facilityCommonService.getPicDetailForNew(body).subscribe((result: ResultModel<PictureListModel[]>) => {
      if (result.code === ResultCodeEnum.success && result.data && result.data.length > 0) {
        this.devicePicList = result.data;
        this.devicePicUrl = result.data[0].picUrlBase;
      }
    });
  }

  /**
   * ?????????????????????
   */
  private initTableConfig(): void {
    this.tableConfig = {
      outHeight: 108,
      isDraggable: true,
      noAutoHeight: true,
      showSearchSwitch: true,
      isLoading: true,
      notShowPrint: true,
      showSizeChanger: true,
      scroll: {x: '1804px', y: '400px'},
      showSearchExport: false,
      noIndex: false,
      columnConfig: [
        {type: 'select', fixedStyle: {fixedLeft: true, style: {left: '0px'}}, width: 62},
        { // ????????????
          title: this.language.loopName,
          key: 'loopName',
          configurable: false,
          width: 150,
          searchable: true,
          isShowSort: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.assetLanguage.loopCode,
          key: 'loopCode',
          configurable: false,
          width: 150,
          searchable: true,
          isShowSort: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.assetLanguage.loopType,
          key: 'loopType',
          width: 150,
          searchable: true,
          isShowSort: true,
          searchConfig: {
            type: 'select', selectType: 'multiple',
            selectInfo: CommonUtil.codeTranslate(LoopTypeEnum, this.$nzI18n, null, LanguageEnum.facility),
            label: 'label',
            value: 'code'
          }
        },
        { // ????????????
          title: this.assetLanguage.loopStatus,
          key: 'loopStatus',
          width: 150,
          searchable: true,
          isShowSort: true,
          searchConfig: {
            type: 'select',
            selectInfo: CommonUtil.codeTranslate(LoopStatusEnum, this.$nzI18n, null, LanguageEnum.facility),
            label: 'label',
            value: 'code'
          }
        },
        { // ????????????
          title: this.language.controlledObject,
          key: 'centralizedControlName',
          width: 150,
          configurable: false,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ??????
          title: this.language.remarks,
          key: 'remark',
          width: 150,
          configurable: false,
          searchable: true,
          isShowSort: true,
          searchConfig: {type: 'input'}
        },
      ],
      showPagination: true,
      bordered: false,
      showSearch: false,
      topButtons: [],
      operation: [],
      leftBottomButtons: [],
      rightTopButtons: [],
      // ??????
      sort: (event: SortCondition) => {
        this.queryCondition.sortCondition.sortField = event.sortField;
        this.queryCondition.sortCondition.sortRule = event.sortRule;
        this.queryLoopList();
      },
      // ??????
      handleSearch: (event: FilterCondition[]) => {
        this.queryCondition.pageCondition.pageNum = 1;
        this.queryCondition.filterConditions = event;
        this.queryLoopList();
      },
      // ??????????????????
      handleSelect: (event: LoopListModel[]) => {
      },
    };
  }

  /**
   * ??????????????????
   */
  private queryLoopList(): void {
    this.tableConfig.isLoading = true;
    // ?????????????????????????????????
    if (this.queryCondition.filterConditions[0] !== this.filterConditions[0]) {
      this.queryCondition.filterConditions = this.queryCondition.filterConditions.concat(this.filterConditions);
    }
    let request;
    if (!_.isEmpty(this.filterConditions)) {
      request = this.$facilityCommonService.loopListByPageByDeviceIds(this.queryCondition);
    } else {
      request = this.$facilityCommonService.queryLoopList(this.queryCondition);
    }
    request.subscribe((result: ResultModel<LoopListModel[]>) => {
      if (result.code === ResultCodeEnum.success) {
        this.tableConfig.isLoading = false;
        this.pageBean.Total = result.totalCount;
        this.pageBean.pageIndex = result.pageNum;
        this.pageBean.pageSize = result.size;
        this.dataSet = result.data || [];
      } else {
        this.$modalService.error(result.msg);
      }
    }, () => {
      this.tableConfig.isLoading = false;
    });

  }

  /**
   * ????????????
   */
  public pageChange(event: PageModel): void {
    this.queryCondition.pageCondition.pageSize = event.pageSize;
    this.queryCondition.pageCondition.pageNum = event.pageIndex;
    this.queryLoopList();
  }

  /**
   * ??????????????????????????????
   */
  public showLoopInfoTable(): void {
    this.queryLoopList();
    this.xcVisible = true;
  }

  /**
   *
   */
  public handleOk(): void {
    this.xcVisible = false;
  }
}

