import {AfterViewInit, Component, OnChanges, OnDestroy, OnInit, SimpleChanges, TemplateRef, ViewChild} from '@angular/core';
import {MapServiceUtil} from '../../../../shared-module/service/map-service/map-service.util';
import {BMapPlusService} from '../../../../shared-module/service/map-service/b-map/b-map-plus.service';
import {GMapPlusService} from '../../../../shared-module/service/map-service/g-map/g-map-plus.service';
import {IndexLanguageInterface} from '../../../../../assets/i18n/index/index.language.interface';
import {NzI18nService, NzModalService} from 'ng-zorro-antd';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {ArrangementNumberEnum} from '../../../../core-module/enum/index/arrangement-number-enum';
import {FormItem} from '../../../../shared-module/component/form/form-config';
import {FormOperate} from '../../../../shared-module/component/form/form-operate.service';
import {num} from '../../../../core-module/const/index/index.const';
import {GMapDrawingService} from '../../../../shared-module/service/map-service/g-map/g-map-drawing.service';
import {BMAP_DRAWING_POLYLINE, BMAP_DRAWING_RECTANGLE} from '../../../../shared-module/component/map-selector/map.config';
import {BMapDrawingService} from '../../../../shared-module/service/map-service/b-map/b-map-drawing.service';
import {MapLinePointUtil} from '../../../../shared-module/util/map-line-point-util';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {DeviceTypeEnum} from '../../../../core-module/enum/facility/facility.enum';
import {CommonUtil} from '../../../../shared-module/util/common-util';
import {StepIndexEnum} from '../../../../core-module/enum/index/index.enum';
import {ActivatedRoute, Router} from '@angular/router';
import {PlanProjectLanguageInterface} from '../../../../../assets/i18n/plan-project/plan-project.language.interface';
import {CommonLanguageInterface} from '../../../../../assets/i18n/common/common.language.interface';
import {OperateTypeEnum} from '../../../../shared-module/enum/page-operate-type.enum';
import {FacilityForCommonService} from '../../../../core-module/api-service/facility';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {AreaModel} from '../../../../core-module/model/facility/area.model';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {ColumnConfig, TableConfigModel} from '../../../../shared-module/model/table-config.model';
import {PageModel} from '../../../../shared-module/model/page.model';
import {PlanningListTableUtil} from '../../share/util/planning-list-table.util';
import {FilterCondition, QueryConditionModel} from '../../../../shared-module/model/query-condition.model';
import {PlanApiService} from '../../share/service/plan-api.service';
import {PointParamsModel} from '../../share/model/point-params.model';
import {TableComponent} from '../../../../shared-module/component/table/table.component';
import {PlanPointRender} from './plan-point-render';
import {PointStatusEnum} from '../../share/enum/point-status.enum';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {RENAME, SKIP, UN_SAVE} from '../../share/const/plan-project.const';
import {PointStatusIconEnum} from '../../share/enum/point-status-icon.enum';
import {OperatorEnum} from '../../../../shared-module/enum/operator.enum';
import {MapConfig as BMapConfig} from '../../../../shared-module/component/map/b-map.config';
import {WisdomPointInfoModel} from '../../share/model/wisdom-point-info.model';

declare const $;

/**
 * ?????????????????????
 */
@Component({
  selector: 'app-plan-point-detail',
  templateUrl: './plan-point-detail.component.html',
  styleUrls: ['./plan-point-detail.component.scss']
})
export class PlanPointDetailComponent extends PlanPointRender implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('areaSelector') areaSelector: TemplateRef<any>;
  @ViewChild('deleteConfirmation') deleteConfirmation: TemplateRef<any>;
  @ViewChild('renameConfirmation') renameConfirmation: TemplateRef<any>;
  @ViewChild('deleteTable') deleteTable: TableComponent;
  // ???????????????
  @ViewChild('pointStatusTemp') pointStatusTemp: TemplateRef<HTMLDocument>;
  // ????????????????????????
  public isCreating: boolean = false;
  // ??????????????????????????????
  public createPlanVisible: boolean = false;

  // ???????????????????????????
  public showCurrentPlan: boolean = false;
  // ??????????????????
  public planQueryCondition = new QueryConditionModel();
  // ????????????????????????
  public planPointQueryCondition = new QueryConditionModel();

  // ????????????
  public stepNum = num;
  // ????????????
  public stepIndex: number = 0;
  // ??????????????????
  public formColumnFirst: FormItem[] = [];
  // ??????????????????
  public formColumnSecond: FormItem[] = [];
  // ?????????????????????
  public formStatusFirst: FormOperate;
  // ?????????????????????
  public formStatusSecond: FormOperate;
  // ?????????????????????
  public isDisabledNext: boolean = false;
  // ??????????????????
  public isDisabledOk: boolean = true;

  // ???????????? ????????????????????????
  public lineParameters: any = {};
  // ??????loading??????
  public isLoading: boolean = false;
  // ???????????????
  public indexLanguage: IndexLanguageInterface;
  // ???????????????
  public language: PlanProjectLanguageInterface;
  // ????????????????????????
  public commonLanguage: CommonLanguageInterface;
  // ???????????????????????????
  public selectAreaName: string;
  // ?????????????????????
  public treeVisible: boolean = false;

  // ???????????????????????????????????????
  public selectWisdomDataSet = [];
  // ?????????????????????????????????
  public selectWisdomTableConfig: TableConfigModel;
  // ???????????????????????????
  public selectWisdomPageBean: PageModel = new PageModel();
  // ?????????????????????????????????
  public queryCondition: QueryConditionModel = new QueryConditionModel();
  // ????????????????????????
  public selectedAllPoint: any[] = [];

  // ???????????????????????????????????????
  public renameWisdomDataSet = [];
  // ?????????????????????????????????
  public renameWisdomTableConfig: TableConfigModel;
  // ???????????????????????????
  public renameWisdomPageBean: PageModel = new PageModel();
  // ????????????????????????
  public renameAllPoint: any[] = [];

  // ?????????????????????????????????
  public currentPlanPointListShow: boolean = false;
  public currentPlanPointListConfig: TableConfigModel;
  public currentPlanPointList: any[] = [];
  public currentPlanPointPageList: any[] = [];
  public currentPlanPointListPageBean: PageModel = new PageModel();
  public currentPlanPointListQueryCondition: QueryConditionModel = new QueryConditionModel();

  // ??????????????????
  public searchOptions: any[] = [];
  // ?????????????????????
  public pointStatusEnum = PointStatusEnum;
  // ???????????????
  public languageEnum = LanguageEnum;
  public treeLoading = false;
  public checkPointStatus = [];
  // ??????????????????????????????
  public pointStatusPanelShow: boolean = false;
  // ???????????????
  mapService: BMapPlusService | GMapPlusService;
  // ???????????????
  mapDrawUtil: GMapDrawingService;
  public currentWindowPointData: any;
  // ????????????
  private drawType: string;
  // ????????????
  private lineOverlays: any;
  // ?????????
  private planPoint: any[] = [];
  // ????????????????????????
  private isEnableEdit: boolean = false;
  // ????????????
  private pageType: OperateTypeEnum = OperateTypeEnum.add;
  // ????????????id
  private planId: string;
  // ???????????????
  private treeInstance: any;
  // ????????????
  private areaNodes: AreaModel[] = [];
  // ???????????????
  private destroy$ = new Subject<any>();

  constructor(private $nzI18n: NzI18nService,
              private $router: Router,
              private $active: ActivatedRoute,
              public $mapLinePointUtil: MapLinePointUtil,
              private $facilityCommonService: FacilityForCommonService,
              public $planApiService: PlanApiService,
              private $modal: NzModalService,
              public $message: FiLinkModalService) {
    super($planApiService);
  }

  ngOnInit() {
    // ??????????????????????????????
    this.indexLanguage = this.$nzI18n.getLocaleData(LanguageEnum.index);
    this.language = this.$nzI18n.getLocaleData(LanguageEnum.planProject);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);

    // ??????????????????checkbook??????
    const arr = CommonUtil.codeTranslate(PointStatusEnum, this.$nzI18n, null, LanguageEnum.planProject) as any[];
    arr.forEach(item => {
      item.value = item.code;
      item.checked = true;
    });
    arr.push({label: this.language.unSave, value: UN_SAVE, checked: true});
    this.checkPointStatus = arr;

    // ????????????????????????
    this.$active.queryParams.pipe((takeUntil(this.destroy$))).subscribe(params => {
      this.pageType = this.$active.snapshot.params.type;
      if (this.pageType !== OperateTypeEnum.add) {
        // ??????????????????
        this.planId = params.id;
        this.queryPlanPointByPlanId(this.planId);
        this.showCurrentPlan = true;
        this.planQueryCondition.filterConditions = [new FilterCondition('planId', OperatorEnum.in, [this.planId])];
        this.planPointQueryCondition.filterConditions.push(new FilterCondition('planId', OperatorEnum.in, [this.planId]));
      } else {
        // ??????????????????
      }
      // ????????????????????????
      this.queryPlanData();
    });

    // ??????????????????
    this.getAreaData();
    // ????????????????????????
    this.selectAllPointModel().then((modelList: any[]) => {
      const pointModelList = modelList.map(item => {
        return {label: item, code: item};
      });
      // ?????????????????????????????????
      this.initColumn(pointModelList);
    });

    // ?????????????????????????????????????????????(????????????????????????)
    this.initSelectWisdomTable();
    // ???????????????????????????????????????
    this.initCurrentPlanPointList();
    // ???????????????
    this.initMap();
    // ??????????????????
    this.addMapEvent();

  }

  ngAfterViewInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * ????????????????????????
   */
  public searchInputChange(value): void {
    // ?????????????????????
    const queryCondition = new QueryConditionModel();
    queryCondition.filterConditions.push(new FilterCondition('pointName', OperatorEnum.like, value));
    this.$planApiService.queryPoleByName(queryCondition).subscribe((result: ResultModel<any>) => {
      if (result.code === ResultCodeEnum.success) {
        this.searchOptions = result.data || [];
      }
    });
  }

  /**
   * ????????????????????????????????????
   * param id
   */
  public searchSelectPoint(data): void {
    console.log(data);
    // @ts-ignore
    this.mapService.setCenterAndZoom(data['longitude'], data['latitude'], BMapConfig.deviceZoom);
    this.highlightedPointId = data.pointId;
    this.triggerZoomEnd(BMapConfig.deviceZoom);
  }

  /**
   * ????????????????????????
   * param event
   */
  public toggleShowPlan(event): void {
    event.stopPropagation();
    event.preventDefault();
    if (this.isCreating) {
      return;
    }
    this.showCurrentPlan = !this.showCurrentPlan;
    if (this.showCurrentPlan) {
      this.planQueryCondition.filterConditions = [new FilterCondition('planId', OperatorEnum.in, [this.planId])];
      this.planPointQueryCondition.filterConditions.push(new FilterCondition('planId', OperatorEnum.in, [this.planId]));
    } else {
      const index = this.planPointQueryCondition.filterConditions.findIndex(item => item.filterField === 'planId');
      if (index > -1) {
        this.planPointQueryCondition.filterConditions.splice(index, 1);
      }
      this.planQueryCondition.filterConditions = [];
    }
    this.queryPlanData(true).then(() => {
      this.triggerZoomEnd();
    });

  }

  /**
   * ?????????????????????????????????
   * param event
   */
  public checkPointStatusChange(event): void {
    const arr: any[] = event.filter(item => item.checked).map(item => item.value);
    this.planPointQueryCondition.filterConditions = [new FilterCondition('pointStatus', OperatorEnum.in, arr.filter(item => item !== UN_SAVE))];
    // ???????????????????????????????????????????????????
    if (this.mapService.getZoom() > BMapConfig.areaZoom) {
      this.queryPlanPointData().then(() => {
        this.handleUnSavePoint(arr);
      });
    } else {
      this.handleUnSavePoint(arr);
    }
  }

  /**
   * ????????????????????????
   */
  public showCreatePlanModal(): void {
    this.createPlanVisible = true;
  }

  /**
   * ??????????????????
   */
  public savePlanPoint(solution: string = ''): void {
    // ??????????????????
    this.clearLineOverlays();
    const request = new PointParamsModel();
    request.planId = this.planId;
    const list = this.planPoint.map(item => {
      item.$detail.xposition = item.$detail.lng;
      item.$detail.yposition = item.$detail.lat;
      return item.$detail;
    });
    request.pointInfoList = list;
    request.pointNameList = list.map(item => item.pointName);
    request.startingNumber = this.lineParameters.startingNumber;
    request.solution = solution;
    this.$planApiService.insertPlanPoint(request).subscribe((result: ResultModel<string[]>) => {
      if (result.code === ResultCodeEnum.success) {
        //  ?????????????????????list
        if (result.data && result.data.length) {
          this.renameAllPoint = result.data.map(item => {
            return {pointName: item};
          });
          this.renameWisdomDataSet = CommonUtil.frontEndQuery(this.renameAllPoint, new QueryConditionModel(), this.renameWisdomPageBean);
          this.createRenameModal();
        } else {
          // ????????????
          this.$message.success(this.language.addPointSuccess);
          this.clearAllTempPoint();
          this.queryPlanData(true);
          this.queryPlanPointData();
          this.queryPlanPointByPlanId(this.planId);
        }
        this.isCreating = false;
      } else {
        this.$message.error(result.msg);
      }
    });
  }

  /**
   * ????????????
   */
  public revoke(): void {
    //  ??????????????????????????????
    this.clearLineOverlays();
    this.isCreating = false;
    this.clearAllTempPoint();
  }

  /**
   * ??????????????????
   */
  public deletePlanPoint(): void {
    this.mapDrawUtil.open();
    this.mapDrawUtil.setDrawingMode(BMAP_DRAWING_RECTANGLE);
  }

  /**
   * ????????????????????????
   */
  public showModify(): void {
    // ???????????????????????????????????????
    if (this.mapDrawUtil.getDrawingMode()) {
      this.mapDrawUtil.close();
      this.mapDrawUtil.setDrawingMode(null);
    }
    this.isEnableEdit = !this.isEnableEdit;
    if (this.isEnableEdit) {
      this.lineOverlays.enableEditing();
    } else {
      // ??????????????????????????????????????????
      this.lineOverlays.disableEditing();
      this.clearAllTempPoint();
      this.drawCoordinateAdjustment(this.lineOverlays);
    }
  }

  /**
   * ???????????????????????????????????????form
   */
  public previousStepHandle(): void {
    this.$router.navigate([`business/plan-project/plan-detail/update`], {preserveQueryParams: true}).then();
  }

  /**
   * ??????
   */
  public dropOut(): void {
    this.$router.navigate(['business/plan-project/plan-list']).then();
  }

  /**
   * ????????????
   */
  public closeModal(): void {
    this.createPlanVisible = false;
    this.treeVisible = false;
    this.treeInstance = null;
    this.selectAreaName = '';
    this.stepIndex = num.zero;
    this.formStatusFirst.resetData({});
    this.formStatusSecond.resetData({});
    this.isDisabledOk = true;
  }

  /**
   * ?????????????????????
   */
  public handleBack(): void {
    // ?????????
    this.stepIndex = StepIndexEnum.back;
  }

  /**
   * ?????????????????????
   */
  public handleNext(): void {
    this.stepIndex = StepIndexEnum.next;
    this.lineParameters = Object.assign(this.lineParameters, this.formStatusFirst.getRealData());
  }

  /**
   * ??????????????????
   * ??????????????????
   */
  public handleOk(): void {
    this.lineParameters = Object.assign(this.lineParameters, this.formStatusSecond.getRealData());
    this.closeModal();
    // ????????????
    this.mapDrawUtil.open();
    this.mapDrawUtil.setDrawingMode(BMAP_DRAWING_POLYLINE);
    this.drawType = BMAP_DRAWING_POLYLINE;
    this.isCreating = true;
  }

  /**
   * ??????????????????
   */
  public formInstance(event: { instance: FormOperate }, step): void {
    if (step === num.one) {
      this.formStatusFirst = event.instance;
      event.instance.group.statusChanges.pipe((takeUntil(this.destroy$))).subscribe(() => {
        this.isDisabledNext = this.formStatusFirst.getValid();
      });
    } else {
      this.formStatusSecond = event.instance;
      event.instance.group.statusChanges.pipe((takeUntil(this.destroy$))).subscribe(() => {
        this.isDisabledOk = this.formStatusSecond.getValid();
      });
    }
  }

  /**
   * ????????????????????????
   */
  public clearLineOverlays(): void {
    this.mapService.removeOverlay(this.lineOverlays);
    this.mapDrawUtil.close();
    this.mapDrawUtil.setDrawingMode(null);
  }

  /**
   * ???????????????
   */
  public clearAllTempPoint() {
    this.planPoint.forEach(item => {
      this.mapService.removeOverlay(item);
    });
  }

  /**
   * ?????????????????????
   */
  public addAllTempPoint() {
    this.planPoint.forEach(item => {
      this.mapService.mapInstance.addOverlay(item);
    });
  }

  /**
   * ???????????????
   */
  public openAreaTree(): void {
    this.treeVisible = !this.treeVisible;
    if (!this.treeInstance) {
      // ????????? zTree
      const treeSetting = {
        check: {
          enable: true,
          chkStyle: 'radio',
          radioType: 'all'
        },
        data: {
          simpleData: {
            enable: true,
            idKey: 'areaId',
          },
          key: {
            name: 'areaName'
          },
        },
        view: {
          showIcon: false,
          showLine: false
        },
        callback: {
          onCheck: (event, treeId, treeNode) => {
            this.selectAreaName = treeNode.areaName;
            this.lineParameters.areaName = treeNode.areaName;
            this.lineParameters.areaCode = treeNode.areaCode;
            this.formStatusFirst.resetControlData('area', this.selectAreaName);
          }
        }
      };
      this.treeInstance = $.fn.zTree.init($('#planPointArea'), treeSetting, this.areaNodes);
    }

  }

  /**
   * ??????????????????
   */
  public getAreaData(): void {
    this.treeLoading = true;
    this.$facilityCommonService.queryAreaList().subscribe((res: ResultModel<AreaModel[]>) => {
      this.treeLoading = false;
      if (res.code === ResultCodeEnum.success) {
        this.areaNodes = res.data || [];
      }
    });
  }

  /**
   * ????????????????????????
   * param event
   */
  public pageChange(event): void {
    this.queryCondition.pageCondition.pageNum = event.pageIndex;
    this.queryCondition.pageCondition.pageSize = event.pageSize;
    this.refreshData();
  }

  /**
   * ???????????????????????????
   * param event
   */
  public renamePageChange(event): void {
    const queryCondition = new QueryConditionModel();
    queryCondition.pageCondition.pageNum = event.pageIndex;
    queryCondition.pageCondition.pageSize = event.pageSize;
    this.renameWisdomDataSet = CommonUtil.frontEndQuery(this.renameAllPoint, queryCondition, this.renameWisdomPageBean);
  }

  /**
   * ????????????????????????
   * param event
   */
  public currentPlanPointListPageChange(event): void {
    this.currentPlanPointListQueryCondition.pageCondition.pageNum = event.pageIndex;
    this.currentPlanPointListQueryCondition.pageCondition.pageSize = event.pageSize;
    this.queryCurrentPlanPointPageList();
  }

  private handleUnSavePoint(arr) {
    // ????????????????????????
    this.clearAllTempPoint();
    this.mapService.removeOverlay(this.lineOverlays);
    // ???????????????unSave ??????????????????????????????
    if (arr.includes(UN_SAVE)) {
      this.addAllTempPoint();
      this.mapService.mapInstance.addOverlay(this.lineOverlays);
    }
  }

  /**
   * ??????????????????
   */
  private drawCoordinateAdjustment(e: any): void {
    // ?????????????????????????????????
    const list = [];
    const linePoints = e.getPath();
    // ?????????????????????
    if (linePoints && linePoints.length) {
      for (let i = 0; i < linePoints.length - 1; i++) {
        list.push({
          length: this.$mapLinePointUtil.getDistance(linePoints[i].lng, linePoints[i].lat, linePoints[i + 1].lng, linePoints[i + 1].lat),
          pointOne: linePoints[i],
          pointTwo: linePoints[i + 1]
        });
      }
    }
    // ????????????20?????????
    if (list.length > 20) {
      this.$message.info(this.indexLanguage.noMoreThanLinesCanBeDrawnPleaseReselectToDraw);
      this.clearLineOverlays();
      return;
    }

    // ???????????????
    let wisdomData = this.generateWisdomData();
    if (this.lineParameters.arrangementType === ArrangementNumberEnum.singleLine) {
      // ???????????????????????????????????????
      wisdomData = this.$mapLinePointUtil.spliceData(this.lineParameters.spacing, list, wisdomData);
      // ??????
      this.$mapLinePointUtil.lineSegmentArrangement(wisdomData, list, this.lineParameters.spacing).forEach((item, index) => {
        // ?????? ?????????????????????
        const linePoint = this.$mapLinePointUtil.autoLinePointSingle(this.lineParameters.spacing,
          item.data, 0, list[index].pointOne, list[index].pointTwo,
          this.mapService);
        // ?????????????????????????????????????????????
        this.planPoint = this.planPoint.concat(linePoint);
      });
    } else {
      // ??????
      // ???????????????????????????????????????
      wisdomData = this.$mapLinePointUtil.spliceData(this.lineParameters.spacing / 2, list, wisdomData, true);
      this.$mapLinePointUtil.doubleLineSegmentArrangement(wisdomData, list, this.lineParameters.spacing).forEach((item, index) => {
        const linePoint = this.$mapLinePointUtil.autoLinePointBoth(this.lineParameters.spacing,
          item.data, this.lineParameters.width, list[index].pointOne, list[index].pointTwo, this.mapService);
        // ?????????????????????????????????????????????
        this.planPoint = this.planPoint.concat(linePoint);
      });
    }
  }

  /**
   * ??????????????????????????????????????????????????????
   */
  private generateWisdomData(): any[] {
    const wisdomData = [];
    for (let i = 0; i < this.lineParameters.count; i++) {
      wisdomData.push({
        pointName: `${this.lineParameters.prefix}_${String(Number(this.lineParameters.startingNumber) + i).padStart(2, '0')}`,
        deviceId: CommonUtil.getUUid(),
        areaName: this.lineParameters.areaName,
        areaCode: this.lineParameters.areaCode,
        pointModel: this.lineParameters.pointModel,
        deviceType: DeviceTypeEnum.wisdom
      });
    }
    return wisdomData;
  }

  /**
   * ??????????????????
   */
  private initColumn(pointModelList: any[]): void {
    this.formColumnFirst = [
      {
        label: this.language.area,
        key: 'area',
        type: 'custom',
        template: this.areaSelector,
        col: 24,
        require: true,
        rule: [
          {required: true},
        ],
        customRules: [],
        asyncRules: []
      },
      {
        label: this.language.count,
        key: 'count',
        type: 'number',
        col: 24,
        require: true,
        rule: [
          {required: true},
        ],
        customRules: [],
        asyncRules: []
      },
      {
        label: this.language.model,
        key: 'pointModel',
        type: 'select',
        selectInfo: {
          data: pointModelList,
          label: 'label',
          value: 'code'
        },
        col: 24,
        require: true,
        rule: [{required: true}],
        customRules: [],
      },
      {
        label: this.language.prefix,
        key: 'prefix',
        type: 'input',
        col: 24,
        require: true,
        rule: [
          {required: true},
        ],
        customRules: [],
        asyncRules: []
      },
      {
        label: this.language.startNumber,
        key: 'startingNumber',
        type: 'input',
        col: 24,
        require: true,
        rule: [
          {required: true},
        ],
        customRules: [],
        asyncRules: []
      }
    ];
    this.formColumnSecond = [
      // ????????????
      {
        label: this.indexLanguage.arrangementType,
        key: 'arrangementType',
        type: 'radio',
        width: 300,
        initialValue: ArrangementNumberEnum.singleLine,
        radioInfo: {
          data: [
            // ??????
            {label: this.indexLanguage.singleLine, value: ArrangementNumberEnum.singleLine},
            // ??????
            {label: this.indexLanguage.doubleLine, value: ArrangementNumberEnum.doubleLine},
          ],
          label: 'label',
          value: 'value'
        },
        require: true,
        rule: [{required: true}],
        customRules: [],
        asyncRules: []
      },
      {
        label: this.indexLanguage.spacing,
        key: 'spacing',
        type: 'number',
        initialValue: 50,
        require: true,
        width: 300,
        rule: [
          {required: true},
        ],
        customRules: [],
        asyncRules: []
      },
      {
        label: this.indexLanguage.wide,
        key: 'width',
        type: 'number',
        initialValue: 15,
        require: true,
        width: 300,
        rule: [
          {required: true},
        ],
        customRules: [],
        asyncRules: []
      }
    ];
  }

  /**
   * ??????????????????????????????table??????
   */
  private initSelectWisdomTable() {
    this.selectWisdomTableConfig = {
      noIndex: true,
      isDraggable: true,
      isLoading: false,
      outHeight: 108,
      notShowPrint: true,
      showSizeChanger: false,
      showSearchSwitch: true,
      showPagination: true,
      scroll: {x: '510px', y: '340px'},
      columnConfig: PlanningListTableUtil.getWisdomColumnConfig(this, this.$nzI18n),
    };
  }

  /**
   * ??????????????????????????????table??????
   */
  private initCurrentPlanPointList() {
    const columnConfig: ColumnConfig[] = [
      { // ??????
        type: 'serial-number',
        width: 62,
        title: this.commonLanguage.serialNumber,
        fixedStyle: {fixedLeft: true, style: {left: '0px'}}
      },
      ...PlanningListTableUtil.getWisdomListColumnConfig(this, this.$nzI18n).filter(item => item.key),
      { // ?????????
        title: this.commonLanguage.operate,
        searchable: true,
        searchConfig: {type: 'operate'},
        key: '', width: 80,
        fixedStyle: {fixedRight: true, style: {right: '0px'}}
      },
    ];
    this.currentPlanPointListConfig = {
      noIndex: true,
      isDraggable: true,
      isLoading: false,
      outHeight: 108,
      notShowPrint: true,
      showSizeChanger: false,
      showSearchSwitch: true,
      showPagination: true,
      simplePage: true,
      simplePageTotalShow: true,
      scroll: {x: '510px', y: '340px'},
      columnConfig: columnConfig,
      operation: [
        {
          text: this.commonLanguage.location, className: 'fiLink-location',
          handle: (currentIndex: WisdomPointInfoModel) => {
            const _lng = parseFloat(currentIndex.xposition);
            const _lat = parseFloat(currentIndex.yposition);
            // @ts-ignore
            this.mapService.setCenterAndZoom(_lng, _lat, BMapConfig.deviceZoom);
            this.highlightedPointId = currentIndex.pointId;
            this.triggerZoomEnd(BMapConfig.deviceZoom);
          }
        },
      ],
    };
  }

  /**
   * ???????????????
   */
  private initMap(): void {
    this.mapService = MapServiceUtil.getPlusMap();
    this.mapService.createPlusMap('createWisdomDataMap');
    this.mapService.addLocationSearchControl('_suggestId', '_searchResultPanel');
    // ???????????????????????????
    this.mapDrawUtil = new BMapDrawingService(this.mapService.mapInstance);
    // ???????????????????????????????????????????????????????????????
    this.mapDrawUtil.addEventListener('overlaycomplete', (e) => {
      const drawType = this.mapDrawUtil.getDrawingMode();
      // ???????????????????????????????????????
      this.mapDrawUtil.close();
      this.mapDrawUtil.setDrawingMode(null);
      switch (drawType) {
        // ????????????
        case BMAP_DRAWING_POLYLINE:
          this.lineOverlays = e.overlay;
          this.drawCoordinateAdjustment(this.lineOverlays);
          break;
        // ????????????
        case BMAP_DRAWING_RECTANGLE:
          // ?????????????????????
          this.selectedAllPoint = this.currentWindowPointData.filter(item => e.overlay.containPoint(item.point)).map(item => item.$detail);
          // ????????????????????????
          this.mapService.removeOverlay(e.overlay);
          // ????????????????????????
          if (!(this.selectedAllPoint && this.selectedAllPoint.length)) {
            this.$message.error(this.language.notSelectedMsg);
            return;
          }
          // ????????????????????????
          // ????????????????????????????????????
          this.refreshData();
          // ?????????????????????????????????
          const modal = this.$modal.create({
            nzTitle: `${this.commonLanguage.deleteBtn}${this.commonLanguage.confirm}`,
            nzContent: this.deleteConfirmation,
            nzOkType: 'danger',
            nzWidth: 800,
            nzClassName: 'custom-create-modal',
            nzMaskClosable: false,
            nzFooter: [
              {
                label: this.commonLanguage.confirm,
                onClick: () => {
                  const ids = this.deleteTable.getDataChecked().map(item => item.pointId);
                  this.handleDeletePlanPoint(ids).then(() => {
                    this.queryPlanPointData();
                    modal.destroy();
                  });
                }
              },
              {
                // ????????????
                label: this.commonLanguage.cancel,
                type: 'danger',
                onClick: () => {
                  modal.destroy();
                }
              },
              {
                label: this.commonLanguage.cleanUp,
                type: 'danger',
                onClick: () => {
                  modal.destroy();
                }
              },
            ]
          });
          break;
        default:
          break;
      }
    });
  }

  /**
   * ??????????????????????????????
   */
  private refreshData(): void {
    this.selectWisdomDataSet = CommonUtil.frontEndQuery(this.selectedAllPoint, this.queryCondition, this.selectWisdomPageBean);
    this.selectWisdomDataSet.forEach(item => {
      item.statusIconClass = PointStatusIconEnum[item.pointStatus];
    });
  }

  /**
   * ????????????????????????
   * param ids
   */
  private handleDeletePlanPoint(ids: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.$planApiService.deletePlanPoint(ids).subscribe((result: ResultModel<string>) => {
        if (result.code === ResultCodeEnum.success) {
          this.$message.success(this.language.deletePlanSuccess);
          // ??????????????????
          this.queryCondition.pageCondition.pageNum = 1;
          resolve();
        } else {
          this.$message.error(result.msg);
          reject();
        }
      }, () => {
        reject();
      });
    });
  }

  /**
   * ?????????????????????????????????
   * param planId
   */
  private queryPlanPointByPlanId(planId: string) {
    this.$planApiService.selectPlanPointByPlanId(planId).subscribe((result: ResultModel<any>) => {
      if (result.code === ResultCodeEnum.success) {
        this.currentPlanPointList = result.data || [];
        this.queryCurrentPlanPointPageList();
      }
    });
  }

  /**
   * ?????????????????????????????????
   */
  private queryCurrentPlanPointPageList(): void {
    this.currentPlanPointPageList = CommonUtil.frontEndQuery(this.currentPlanPointList, this.currentPlanPointListQueryCondition, this.currentPlanPointListPageBean);
  }

  /**
   * ??????????????????????????????
   * param id
   */
  private selectAllPointModel(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.$planApiService.selectAllPointModel().subscribe((result: ResultModel<any>) => {
        if (result.code === ResultCodeEnum.success) {
          resolve(result.data);
        }
      });
    });
  }

  /**
   * ?????????????????????
   */
  private createRenameModal() {
    this.renameWisdomTableConfig = {
      noIndex: true,
      isDraggable: true,
      isLoading: false,
      outHeight: 108,
      notShowPrint: true,
      showSizeChanger: false,
      showSearchSwitch: false,
      simplePage: true,
      simplePageTotalShow: true,
      showPagination: true,
      scroll: {x: '200px', y: '340px'},
      columnConfig: [{ // ??????
        type: 'serial-number',
        width: 62,
        title: this.commonLanguage.serialNumber,
      },
        { // ???????????????
          title: this.language.wisdomName, key: 'pointName', width: 80,
        }]
    };
    const modal = this.$modal.create({
      nzContent: this.renameConfirmation,
      nzOkType: 'danger',
      nzWidth: 500,
      nzClassName: 'custom-duplicate-name-modal custom-create-modal',
      nzMaskClosable: false,
      nzFooter: [
        {
          label: this.language.skip,
          onClick: () => {
            this.savePlanPoint(SKIP);
            modal.destroy();
          }
        },
        {
          label: this.language.rename,
          type: 'danger',
          onClick: () => {
            modal.destroy();
            this.savePlanPoint(RENAME);
          }
        },
      ]
    });
  }
}
