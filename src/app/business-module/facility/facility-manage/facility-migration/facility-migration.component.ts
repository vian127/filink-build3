import {Component, OnInit, TemplateRef, ViewChild, OnDestroy} from '@angular/core';
import {FacilityLanguageInterface} from '../../../../../assets/i18n/facility/facility.language.interface';
import {LanguageEnum} from '../../../../shared-module/enum/language.enum';
import {NzI18nService} from 'ng-zorro-antd';
import {ActivatedRoute, Router} from '@angular/router';
import {DeviceStatusEnum, DeviceTypeEnum, FacilityListTypeEnum} from '../../../../core-module/enum/facility/facility.enum';
import {FacilityListModel} from '../../../../core-module/model/facility/facility-list.model';
import {PageModel} from '../../../../shared-module/model/page.model';
import {TableConfigModel} from '../../../../shared-module/model/table-config.model';
import {FilterCondition, QueryConditionModel, SortCondition} from '../../../../shared-module/model/query-condition.model';
import {IndexLanguageInterface} from '../../../../../assets/i18n/index/index.language.interface';
import {StepIndexEnum} from '../../../index/shared/enum/index-enum';
import {CommonUtil} from '../../../../shared-module/util/common-util';
import {SelectModel} from '../../../../shared-module/model/select.model';
import {FacilityForCommonService, FacilityService} from '../../../../core-module/api-service/facility';
import {ResultModel} from '../../../../shared-module/model/result.model';
import {ResultCodeEnum} from '../../../../shared-module/enum/result-code.enum';
import {TableComponent} from '../../../../shared-module/component/table/table.component';
import {FormItem} from '../../../../shared-module/component/form/form-config';
import {RuleUtil} from '../../../../shared-module/util/rule-util';
import {FacilityForCommonUtil} from '../../../../core-module/business-util/facility/facility-for-common.util';
import {TreeSelectorConfigModel} from '../../../../shared-module/model/tree-selector-config.model';
import {DepartmentUnitModel} from '../../../../core-module/model/work-order/department-unit.model';
import {UserForCommonService} from '../../../../core-module/api-service/user';
import {FormOperate} from '../../../../shared-module/component/form/form-operate.service';
import {AreaModel} from '../../../../core-module/model/facility/area.model';
import {EquipmentStatusEnum, EquipmentTypeEnum} from '../../../../core-module/enum/equipment/equipment.enum';
import {UserForCommonUtil} from '../../../../core-module/business-util/user/user-for-common.util';
import {EquipmentListModel} from '../../../../core-module/model/equipment/equipment-list.model';
import {MigrationModel} from '../../share/model/migration.model';
import {FacilityApiService} from '../../share/service/facility/facility-api.service';
import {FiLinkModalService} from '../../../../shared-module/service/filink-modal/filink-modal.service';
import {AreaApiService} from '../../share/service/area/area-api.service';
import {SessionUtil} from '../../../../shared-module/util/session-util';

declare var $: any;

@Component({
  selector: 'app-facility-migration',
  templateUrl: './facility-migration.component.html',
  styleUrls: ['./facility-migration.component.scss']
})
export class FacilityMigrationComponent implements OnInit, OnDestroy {
  @ViewChild('deviceTypeTemp') deviceTypeTemp: TemplateRef<HTMLDocument>;
  @ViewChild('deviceStatusTemp') private deviceStatusTemp: TemplateRef<HTMLDocument>;
  @ViewChild('department') private department: TemplateRef<HTMLDocument>;
  @ViewChild('areaSelector') private areaSelector: TemplateRef<HTMLDocument>;
  @ViewChild('equipmentStatusTemplate') private equipmentStatusTemplate: TemplateRef<HTMLDocument>;
  @ViewChild('equipmentTypeTemplate') private equipmentTypeTemplate: TemplateRef<HTMLDocument>;
  @ViewChild('facilityTemp') public facilityTemp: TableComponent;
  @ViewChild('areaSelect') public areaSelect: TableComponent;
// ??????????????????
  public equipmentStatusEnum = EquipmentStatusEnum;
  // ??????????????????
  public equipmentTypeEnum = EquipmentTypeEnum;
  public areaName = '';
  // ???????????? true ??????
  public migrationType: boolean;
  // ??????????????????????????????idList
  private deviceList;
  // ??????
  public stepIndex = StepIndexEnum.back;
  // ???????????????
  public facilityLanguage: FacilityLanguageInterface;
  // ???????????????
  public indexLanguage: IndexLanguageInterface;
  // ????????????
  public pageLoading = true;
  // ????????????
  public migrationDataSet = [];
  // ??????????????????
  public migrationPageBean: PageModel = new PageModel();
  public migrationTableConfig: TableConfigModel;
  // ??????????????????
  public migrationQueryCondition: QueryConditionModel = new QueryConditionModel();
// ???????????????????????????/??????????????????
  public showContent: boolean = false;
// ??????????????????
  public deviceStatusEnum = DeviceStatusEnum;
  // ??????????????????
  public deviceTypeEnum = DeviceTypeEnum;
// ??????????????????
  public selectUnitName: string = '';
  // ????????????
  public formColumn: FormItem[] = [];
  // ????????????
  public formStatus: FormOperate;
// ?????????????????????
  public unitSelectorConfig = new TreeSelectorConfigModel();
  // ?????????????????????
  public unitSelectVisible: boolean = false;
  public areaSelectVisible: boolean = false;
  // ?????????
  public treeNodes: any = [];
  public areaNodes: any = [];
  public newAreaNodes: any = [];
  public areaModalNodes: any = [];
  public radioInfo = [
    {key: 1, value: '????????????', disabled: false},
    {key: 2, value: '????????????', disabled: !SessionUtil.checkHasRole('03-2-2')}
  ];
  public radioValue = 1;
  public selectInfo = {
    data: [],
    label: 'label',
    value: 'code'
  };
  public treeId: string;
  public searchValue;
  areaSelectorConfig: any = new TreeSelectorConfigModel();
  areaSelectorModalConfig: any = new TreeSelectorConfigModel();
  // tree??????
  public treeInstance: any;
  public isDisabled: boolean;
  public showModal = false;
  public ztreeAreaId;
  // ????????????????????????
  public nextIsDisable: boolean = false;
  // ??????????????????????????????????????????
  private deviceOrEquipmentRoleTypes: SelectModel[];

  constructor(private $nzI18n: NzI18nService, private $active: ActivatedRoute,
              private $facilityCommonService: FacilityForCommonService,
              private $router: Router, private $ruleUtil: RuleUtil,
              private $userForCommonService: UserForCommonService,
              private $facilityService: FacilityApiService,
              private $message: FiLinkModalService,
              private $areaApiService: AreaApiService
  ) {
    this.facilityLanguage = this.$nzI18n.getLocaleData(LanguageEnum.facility);
    this.indexLanguage = this.$nzI18n.getLocaleData(LanguageEnum.index);
  }

  public ngOnInit(): void {
    this.treeId = CommonUtil.getUUid();
    this.deviceList = JSON.parse(sessionStorage.getItem('facility_migration'));
    this.getPageType();
    this.initTableConfig();
    this.initFormColumn();
    this.initAreaSelectorConfig(this.areaNodes);
    this.$userForCommonService.queryAllDepartment().subscribe((result: ResultModel<DepartmentUnitModel[]>) => {
      this.treeNodes = result.data || [];
    }, (error) => {
    });
    this.treeInstance = $.fn.zTree.init($(`#${this.treeId}`), this.areaSelectorConfig.treeSetting, this.newAreaNodes);
    this.areaSelectorModalConfig = FacilityForCommonUtil
      .getAreaSelectorConfig(`${this.facilityLanguage.select}${this.facilityLanguage.area}`, this.areaModalNodes);
    this.initTreeSelectorConfig(this.treeNodes);
    this.refreshData().then(value => {
      this.deviceList.forEach(item => {
        item.checked = true;
        this.facilityTemp.keepSelectedData.set(this.migrationType ? item.deviceId : item.equipmentId, item);
      });
    });
  }

  ngOnDestroy(): void {
    this.facilityTemp = null;
    this.migrationQueryCondition = null;
  }

  /**
   * ?????????????????????
   */
  public showAreaSelectorModal(): void {
    this.areaSelectorModalConfig.treeNodes = this.areaNodes;
    this.areaSelectVisible = true;
  }

  /**
   * ??????????????????  ????????????????????????
   */
  public getPageType(): void {
    this.$active.queryParams.subscribe(params => {
      this.migrationType = params.type === FacilityListTypeEnum.facilitiesList;
      // ?????????????????????
      this.deviceOrEquipmentRoleTypes = this.migrationType ? FacilityForCommonUtil.getRoleFacility(this.$nzI18n) : FacilityForCommonUtil.getRoleEquipmentType(this.$nzI18n);
      this.pageLoading = false;
    });
  }

  /**
   * ?????????????????????
   */
  public showDeptSelectorModal(): void {
    this.unitSelectorConfig.treeNodes = this.treeNodes;
    this.unitSelectVisible = true;
  }

  /**
   * ????????????
   * @param event PageModel
   */
  public migrationPageChange(event: PageModel): void {
    this.migrationQueryCondition.pageCondition.pageNum = event.pageIndex;
    this.migrationQueryCondition.pageCondition.pageSize = event.pageSize;
    this.refreshData();
  }

  /**
   * ??????????????????
   */
  private refreshData() {
    return new Promise((resolve, reject) => {
      this.migrationTableConfig.isLoading = true;
      // const hasDeviceId = this.queryCondition.filterConditions.some(item => item.filterField === 'deviceId' || item.filterField === 'equipmentId');
      if (this.migrationType) {
        this.migrationQueryCondition.filterConditions.push({
          filterField: 'deviceId',
          filterValue: this.deviceList.map(item => item.deviceId),
          operator: 'in'
        });
        this.migrationQueryCondition.bizCondition = {
          'isDepartmentName': true
        };
        this.$facilityCommonService.deviceListByPage(this.migrationQueryCondition).subscribe((result: ResultModel<FacilityListModel[]>) => {
          this.migrationTableConfig.isLoading = false;
          if (result.code === ResultCodeEnum.success) {
            this.migrationPageBean.Total = result.totalCount;
            this.migrationPageBean.pageIndex = result.pageNum;
            this.migrationPageBean.pageSize = result.size;
            this.migrationDataSet = result.data || [];
            this.migrationDataSet.forEach(item => {
              item.iconClass = CommonUtil.getFacilityIConClass(item.deviceType);
              // ??????????????????icon??????
              const statusStyle = CommonUtil.getDeviceStatusIconClass(item.deviceStatus);
              item.deviceStatusIconClass = statusStyle.iconClass;
              item.deviceStatusColorClass = statusStyle.colorClass;
            });
            resolve();
          }
        });
      } else {
        this.migrationQueryCondition.filterConditions.push({
          filterField: 'equipmentId',
          filterValue: this.deviceList.map(item => item.equipmentId),
          operator: 'in'
        });
        this.migrationQueryCondition.bizCondition = {
          'isDepartmentName': true
        };
        this.$facilityCommonService.equipmentListByPage(this.migrationQueryCondition).subscribe((result: ResultModel<EquipmentListModel[]>) => {
          this.migrationTableConfig.isLoading = false;
          if (result.code === ResultCodeEnum.success) {
            this.migrationPageBean.Total = result.totalCount;
            this.migrationPageBean.pageIndex = result.pageNum;
            this.migrationPageBean.pageSize = result.size;
            this.migrationDataSet = result.data || [];
            this.migrationDataSet.forEach(item => {
              const iconStyle = CommonUtil.getEquipmentStatusIconClass(item.equipmentStatus, 'list');
              item.statusIconClass = iconStyle.iconClass;
              item.statusColorClass = iconStyle.colorClass;
              // ???????????????????????????
              item.iconClass = CommonUtil.getEquipmentTypeIcon(item);
            });
            resolve();
          }
        });
      }
      this.migrationTableConfig.isLoading = false;
    });
  }

  /**
   * ???????????????
   */
  private initTableConfig(): void {
    this.migrationTableConfig = {
      isDraggable: true,
      isLoading: true,
      outHeight: 100,
      showSizeChanger: true,
      showSearchSwitch: true,
      notShowPrint: true,
      noAutoHeight: true,
      showSearch: false,
      keepSelected: true,
      selectedIdKey: this.migrationType ? 'deviceId' : 'equipmentId',
      scroll: {x: '1000px', y: 'calc(100% - 200px)'},
      noIndex: true,
      columnConfig: [
        {type: 'select', fixedStyle: {fixedLeft: true, style: {left: '0px'}}, width: 62},
        {
          type: 'serial-number', width: 62, title: this.facilityLanguage.serialNumber,
          fixedStyle: {fixedLeft: true, style: {left: '62px'}}
        },
        { // ??????
          title: this.facilityLanguage.deviceName, key: this.migrationType ? 'deviceName' : 'equipmentName', width: 100,
          isShowSort: true,
          searchable: true,
          searchConfig: {type: 'input'}
        },
        { // ??????
          title: this.facilityLanguage.deviceType, key: this.migrationType ? 'deviceType' : 'equipmentType', width: 100,
          type: 'render',
          renderTemplate: this.migrationType ? this.deviceTypeTemp : this.equipmentTypeTemplate,
          minWidth: 150,
          searchable: true,
          isShowSort: true,
          searchConfig: {
            type: 'select',
            selectType: 'multiple',
            selectInfo: this.deviceOrEquipmentRoleTypes,
            label: 'label',
            value: 'code'
          }
        },
        { // ??????
          title: this.facilityLanguage.deviceStatus, key: this.migrationType ? 'deviceStatus' : 'equipmentStatus', width: 100,
          type: 'render',
          renderTemplate: this.migrationType ? this.deviceStatusTemp : this.equipmentStatusTemplate,
          isShowSort: true,
          searchable: true,
          minWidth: 90,
          searchConfig: {
            type: 'select',
            selectType: 'multiple',
            selectInfo: CommonUtil.codeTranslate(DeviceStatusEnum, this.$nzI18n, null),
            label: 'label',
            value: 'code'
          }
        },
        { // ????????????
          title: this.facilityLanguage.deviceCode, key: this.migrationType ? 'deviceCode' : 'equipmentCode', width: 150,
          searchable: true,
          isShowSort: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.facilityLanguage.responsibleUnit, key: 'departmentName', width: 150,
          searchable: false,
          searchConfig: {type: 'input'}
        },
        { // ??????
          title: this.facilityLanguage.affiliatedArea, key: 'areaName',
          searchable: true,
          width: 150,
          isShowSort: true,
          searchConfig: {type: 'input'}
        },
        { // ????????????
          title: this.facilityLanguage.company, key: 'company',
          searchable: true,
          width: 150,
          isShowSort: true,
          searchConfig: {type: 'input'}
        },
        {
          title: this.facilityLanguage.operate, searchable: true,
          searchConfig: {type: 'operate'}, key: '', width: 100, fixedStyle: {fixedRight: true, style: {right: '0px'}}
        },
      ],
      showPagination: true,
      bordered: false,
      sort: (event: SortCondition) => {
        this.migrationQueryCondition.sortCondition.sortField = event.sortField;
        this.migrationQueryCondition.sortCondition.sortRule = event.sortRule;
        this.refreshData();
      },
      handleSelect: (event) => {
        if (event && event.length > 0) {
          this.nextIsDisable = false;
        } else {
          this.nextIsDisable = true;
        }
      },
      handleSearch: (event: FilterCondition[]) => {
        this.migrationQueryCondition.pageCondition.pageNum = 1;
        this.migrationQueryCondition.filterConditions = event;
        this.refreshData();
      },
    };
  }

  /**
   * ??????
   */
  public goBack(): void {
    if (this.migrationType) {
      this.migrationQueryCondition.filterConditions = [];
      this.$router.navigate(['business/facility/facility-list']).then();
      // this.$router.navigateByUrl(`business/facility/facility-list`).then();
    } else {
      this.$router.navigateByUrl(`business/facility/equipment-list`).then();
    }
  }

  /**
   * ?????????
   */
  public nextStep(): void {
    console.log(this.facilityTemp.getDataChecked());
    if (this.facilityTemp.getDataChecked().length > 0) {
      this.stepIndex = StepIndexEnum.next;
      this.showContent = true;
      this.areaSelectorConfig.treeNodes = this.areaNodes;
    }
  }

  public lastStep(): void {
    this.stepIndex = StepIndexEnum.back;
    this.showContent = false;
  }

  public save(): void {
    const formData = this.formStatus.group.getRawValue();
    const reqUrl = new MigrationModel();
    reqUrl.company = formData.company;
    reqUrl.migrationReason = formData.migrationReason;
    let reqPost;
    if (this.radioValue === 1) {
      reqUrl.areaId = formData.areaId.areaId;
      reqUrl.areaCode = formData.areaId.code;
      if (this.migrationType) {
        reqUrl.deviceIds = this.facilityTemp.getDataChecked().map(item => item.deviceId);
        reqPost = this.$facilityService.deviceMigration(reqUrl);
      } else {
        reqUrl.equipmentIds = this.facilityTemp.getDataChecked().map(item => item.equipmentId);
        reqPost = this.$facilityService.equipmentMigration(reqUrl);
      }
    } else {
      reqUrl.areaName = formData.areaName;
      reqUrl.parentId = formData.parentId;
      if (this.migrationType) {
        reqUrl.deviceIds = this.facilityTemp.getDataChecked().map(item => item.deviceId);
        reqUrl.accountabilityUnit = formData.unitName;
        reqPost = this.$facilityService.deviceMigrationWithNewArea(reqUrl);
      } else {
        reqUrl.equipmentIds = this.facilityTemp.getDataChecked().map(item => item.equipmentId);
        reqUrl.accountabilityUnit = formData.unitName;
        reqPost = this.$facilityService.equipmentMigrationWithNewArea(reqUrl);
      }
    }
    reqPost.subscribe((result: ResultModel<any>) => {
      if (result.code === ResultCodeEnum.success) {
        if (this.migrationType) {
          this.$message.success(this.facilityLanguage.deviceMigration);
        } else {
          this.$message.success(this.facilityLanguage.equipmentMigration);
        }
        this.goBack();
      } else {
        this.$message.error(result.msg);
      }
    });
  }

  /**
   * ??????????????????
   */
  public formInstance(event: { instance: FormOperate }): void {
    this.formStatus = event.instance;
    // this.formStatus.group.controls['trustee'].disable();
    // this.formStatus.group.statusChanges.subscribe(() => {
    //   this.isDisabled = (!this.formStatus.getValid()) || (!this.selectUnitName);
    // });
    //
    this.formStatus.group.statusChanges.subscribe(() => {
      this.isDisabled = this.formStatus.getRealValid();
    });
  }

  /**
   * ????????????
   */
  private initFormColumn(): void {
    this.formColumn = [
      { // ??????????????????
        label: '?????????????????????',
        key: 'unitName',
        type: 'custom',
        require: true,
        template: this.department,
        rule: [
          {required: true},
        ],
        customRules: [],
        asyncRules: [],
      },
      { // ??????
        label: '?????????????????????', key: 'areaId', type: 'custom',
        template: this.areaSelect,
        require: true,
        rule: [{required: true}], asyncRules: [],
      },
      { // ????????????
        label: '????????????', key: 'areaName', type: 'input',
        // template: this.areaSelect,
        require: true,
        hidden: true,
        rule: [{required: true}, {maxLength: 32},
          this.$ruleUtil.getNameRule()],
        customRules: [this.$ruleUtil.getNameCustomRule()],
        asyncRules: [
          this.$ruleUtil.getNameAsyncRule(value => this.$areaApiService.queryAreaNameIsExist(
            {areaId: '', areaName: value}),
            res => res.code === ResultCodeEnum.success)
        ],
      },
      { // ????????????
        label: '????????????', key: 'parentId', type: 'custom',
        template: this.areaSelector,
        hidden: true,
        rule: [],
        asyncRules: [],
      },
      { // ??????
        label: '?????????????????????',
        key: 'company',
        type: 'input',
        rule: [RuleUtil.getNameMaxLengthRule(20), RuleUtil.getNameMinLengthRule(), RuleUtil.getNamePatternRule()],
      },
      { // ?????????
        label: '????????????',
        key: 'migrationReason',
        type: 'textarea',
        rule: [
          this.$ruleUtil.getRemarkMaxLengthRule()
        ],
        customRules: [this.$ruleUtil.getNameCustomRule()],
      },
    ];
  }

  /**
   * ??????????????????
   * param event
   */
  public unitSelectChange(event: DepartmentUnitModel[]): void {
    console.log(this.radioValue);
    if (this.radioValue === 1) {
      this.formStatus.resetControlData('areaId', null);
    } else {
      this.formStatus.resetControlData('areaId', 'addArea');
    }
    if (event && event.length) {
      const name = event.map(item => item.deptName).join();
      this.formStatus.resetControlData('unitName', event.map(item => item.id));
      this.selectUnitName = name;
      FacilityForCommonUtil.setTreeNodesStatus(this.treeNodes, event.map(item => item.id));
      this.$facilityCommonService.queryAreaList().subscribe((result: ResultModel<any>) => {
        this.areaNodes = result.data;
        this.areaModalNodes = result.data;
        this.treeInstance = $.fn.zTree.init($(`#${this.treeId}`), this.areaSelectorConfig.treeSetting, this.newAreaNodes);
      });
      const body = {
        deptId: event[0].id,
        objectIds: this.migrationType ? this.deviceList.map(item => item.deviceId) : this.deviceList.map(item => item.equipmentId),
        objectType: this.migrationType ? 'device' : 'equipment'
      };
      this.$facilityCommonService.queryMigrationAreaBaseInfoList(body).subscribe((result: ResultModel<any>) => {
        this.recursionAreaDisabled(result.data);
        this.newAreaNodes = result.data;
        this.treeInstance = $.fn.zTree.init($(`#${this.treeId}`), this.areaSelectorConfig.treeSetting, this.newAreaNodes);
      });
    } else {
      UserForCommonUtil.setAreaNodesStatus(this.treeNodes, null);
      this.formStatus.resetControlData('unitName', '');
      this.areaNodes = [];
      this.areaModalNodes = [];
      this.selectUnitName = '';
      this.treeInstance = $.fn.zTree.init($(`#${this.treeId}`), this.areaSelectorConfig.treeSetting, []);
    }
  }

  /**
   * ???????????????????????????????????????
   * param data
   */
  recursionAreaDisabled(data) {
    data.forEach(item => {
      if (item.isGrayDisplay) {
        item.chkDisabled = true;
      }
      if (item.children.length) {
        this.recursionAreaDisabled(item.children);
      }
    });
  }

  /**
   * ???????????????
   * param nodes
   */
  private initTreeSelectorConfig(nodes?) {
    const treeSetting = {
      check: {
        enable: true,
        chkStyle: 'checkbox',
      },
      data: {
        simpleData: {
          idKey: 'id',
          pIdKey: 'deptFatherId',
          enable: true,
          rootPid: null
        },
        key: {
          children: 'childDepartmentList',
          name: 'deptName'
        },
      },
      view: {
        showIcon: false,
        showLine: false
      }
    };
    this.unitSelectorConfig = {
      title: `${this.facilityLanguage.responsibleUnit}`,
      height: '300px',
      width: '1000px',
      treeSetting: treeSetting,
      treeNodes: this.treeNodes,
      onlyLeaves: false,
      selectedColumn: [
        {
          title: `${this.facilityLanguage.deptName}`, key: 'deptName', width: 100,
        },
        {
          title: `${this.facilityLanguage.deptLevel}`, key: 'deptLevel', width: 100,
        },
        {
          title: `${this.facilityLanguage.parentDept}`, key: 'parentDepartmentName', width: 100,
        }
      ]
    };
    // this.unitSelectorConfig = {
    //   title: this.facilityLanguage.responsibleUnit,
    //   width: '400px',
    //   height: '300px',
    //   treeNodes: nodes ? nodes : [],
    //   treeSetting: {
    //     check: {
    //       enable: true,
    //       chkboxType: {'Y': '', 'N': ''},
    //       chkStyle: 'checkbox',
    //     },
    //     data: {
    //       simpleData: {
    //         idKey: 'id',
    //         pIdKey: 'deptFatherId',
    //         enable: true,
    //         rootPid: null
    //       },
    //       key: {
    //         children: 'childDepartmentList',
    //         name: 'deptName'
    //       },
    //     },
    //     view: {
    //       showIcon: false,
    //       showLine: false
    //     }
    //   },
    //   onlyLeaves: false,
    //   selectedColumn: []
    // };
  }

  /**
   * ????????????????????????
   * param e
   */
  public modelChange(e) {
    console.log(e);
    if (e === 2) {
      this.formStatus.resetControlData('areaId', 'addArea');
      this.setColumnHidden('areaName', false);
      this.setColumnHidden('parentId', false);
    } else {
      this.formStatus.resetControlData('areaId', null);
      this.setColumnHidden('areaName', true);
      this.setColumnHidden('parentId', true);
    }
    this.isDisabled = this.formStatus.getRealValid();
    if (e === 1 && this.ztreeAreaId) {
      this.isDisabled = true;
    } else {
      this.isDisabled = false;
    }
  }

  /**
   * ???????????????????????????
   * param key ??????key
   * param value ????????????
   */
  private setColumnHidden(key: string, value: boolean): void {
    const formColumn = this.formColumn.find(item => item.key === key);
    if (formColumn) {
      formColumn.hidden = value;
    }
  }

  /**
   * ???????????????????????????
   * param event id
   */
  public modelSelectChange(event: any): void {
    const node = this.treeInstance.getNodeByParam(this.areaSelectorConfig.treeSetting.data.simpleData.idKey, event, null);
    this.treeInstance.selectNode(node);
  }

  /**
   * ?????????input?????????
   * param event
   */
  public inputChange(event: string): void {
    this.searchValue = event;
    if (event) {
      const node = this.treeInstance.getNodesByParamFuzzy(this.areaSelectorConfig.treeSetting.data.key.name || 'name',
        event, null);
      this.selectInfo = {
        data: node,
        label: this.areaSelectorConfig.treeSetting.data.key.name || 'name',
        value: this.areaSelectorConfig.treeSetting.data.simpleData.idKey || 'id'
      };
    } else {
      this.selectInfo = {
        data: [],
        label: this.areaSelectorConfig.treeSetting.data.key.name || 'name',
        value: this.areaSelectorConfig.treeSetting.data.simpleData.idKey || 'id'
      };
    }
  }

  /**
   * ??????????????????????????????
   * param nodes ???????????????
   */
  public initAreaSelectorConfig(nodes?) {
    this.areaSelectorConfig = {
      width: '400px',
      height: '300px',
      title: `${this.facilityLanguage.select}${this.facilityLanguage.area}`,
      treeSetting: {
        check: {enable: true, chkStyle: 'radio', radioType: 'all'},
        data: {
          simpleData: {enable: true, idKey: 'areaId'},
          key: {name: 'areaName'},
        },
        view: {showIcon: false, showLine: false},
        callback: {
          beforeCheck: (treeId, treeNode) => {
            console.log(treeNode.checked);
            if (!treeNode.checked) {
              this.formStatus.resetControlData('areaId', {areaId: treeNode.areaId, code: treeNode.areaCode});
              this.ztreeAreaId = treeNode.areaId;
            } else {
              this.formStatus.resetControlData('areaId', '');
              this.ztreeAreaId = null;
            }
          }
        }
      },
      treeNodes: nodes ? nodes : this.areaNodes
    };
  }

  /**
   * ??????????????????
   * param event
   */
  public areaSelectChange(event: AreaModel[]): void {
    if (event[0]) {
      FacilityForCommonUtil.setAreaNodesStatus(this.areaModalNodes, event[0].areaId);
      this.areaName = event[0].areaName;
      // ????????????id
      this.formStatus.resetControlData('parentId', event[0].areaId);
    } else {
      FacilityForCommonUtil.setAreaNodesStatus(this.areaModalNodes, null);
      this.areaName = '';
      this.formStatus.resetControlData('parentId', null);
    }
  }

  public ok(e) {
    console.log(e);
    this.close();
  }

  public close() {
    this.showModal = false;
  }
}
