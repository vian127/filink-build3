import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {OperateTypeEnum} from '../../../../../shared-module/enum/page-operate-type.enum';
import {NzI18nService} from 'ng-zorro-antd';
import {FiLinkModalService} from '../../../../../shared-module/service/filink-modal/filink-modal.service';
import {ActivatedRoute, Router} from '@angular/router';
import {RuleUtil} from '../../../../../shared-module/util/rule-util';
import {ScheduleApiService} from '../../../share/service/schedule-api.service';
import { CommonLanguageInterface } from 'src/assets/i18n/common/common.language.interface';
import { ScheduleLanguageInterface } from 'src/assets/i18n/schedule/schedule.language.interface';
import {LanguageEnum} from '../../../../../shared-module/enum/language.enum';
import {FinalValueEnum} from '../../../../../core-module/enum/step-final-value.enum';
import { StepsModel } from 'src/app/core-module/enum/application-system/policy.enum';
import {FormItem} from '../../../../../shared-module/component/form/form-config';
import {FormOperate} from '../../../../../shared-module/component/form/form-operate.service';
import {ResultCodeEnum} from '../../../../../shared-module/enum/result-code.enum';
import {TreeSelectorConfigModel} from '../../../../../shared-module/model/tree-selector-config.model';
import {ResultModel} from '../../../../../shared-module/model/result.model';
import {AreaModel} from '../../../../../core-module/model/facility/area.model';
import {FacilityForCommonService} from '../../../../../core-module/api-service/facility';
import {FacilityForCommonUtil} from '../../../../../core-module/business-util/facility/facility-for-common.util';
import {TeamManageListModel} from '../../../share/model/team-manage-list.model';
import {CommonUtil} from '../../../../../shared-module/util/common-util';
import { ScheduleCalendarComponent } from '../schedule-calendar/schedule-calendar.component';
import { differenceInCalendarDays } from 'date-fns';

@Component({
  selector: 'app-workforce-management-detail',
  templateUrl: './workforce-management-detail.component.html',
  styleUrls: ['./workforce-management-detail.component.scss']
})
export class WorkforceManagementDetailComponent implements OnInit {
  // ??????????????????
  @ViewChild('startDateTpl') startDateTpl: TemplateRef<HTMLDocument>;
  // ??????????????????
  @ViewChild('endDateTpl') endDateTpl: TemplateRef<HTMLDocument>;
  // ??????????????????
  @ViewChild('teamNameSelectorTpl') teamNameSelectorTpl: TemplateRef<HTMLDocument>;
  // ????????????
  @ViewChild('areaSelectorTpl') areaSelectorTpl: TemplateRef<HTMLDocument>;
  // ??????????????????
  @ViewChild('scheduleCalendar') scheduleCalendar: ScheduleCalendarComponent;
  // ????????????
  public pageTitle: string = '';
  // ????????????
  public pageType: string = OperateTypeEnum.add;
  // ???????????????
  public commonLanguage: CommonLanguageInterface;
  // ?????????
  public scheduleLanguage: ScheduleLanguageInterface;
  // ??????????????????
  public isActiveSteps = FinalValueEnum.STEPS_FIRST;
  // ????????????????????????
  public finalValueEnum = FinalValueEnum;
  // ???????????????
  public scheduleStepConfig: StepsModel[] = [];
  // ????????????
  public formColumn: FormItem[] = [];
  // ????????????
  public formInstance: FormOperate;
  // ??????????????????
  public startDate: string;
  // ??????????????????
  public endDate: string;
  // ??????????????????
  public scheduleMemberDataList = [];
  // ????????????????????? ???????????????????????????????????????????????????????????????????????????
  public scheduledDateList = [];
  // ??????????????????????????????
  public shiftNameList = [];
  // ??????????????????????????????
  public isNextStepDisabled: boolean = true;
  // ??????loading
  public isSaveLoading: boolean = false;
  // ??????????????????????????????
  public isConfirmDisabled: boolean = true;
  // ??????????????????
  public saveFirstStepInfo;
  // ???????????? ????????????
  public teamNames: string = '';
  // ?????????????????????????????????
  public isShowTeamSelectorModal: boolean = false;
  // ???????????? ????????????
  public areaNames: string = '';
  // ???????????????????????????
  public isShowAreaSelectorModal: boolean = false;
  // ???????????????????????????
  public areaSelectorConfig: TreeSelectorConfigModel = new TreeSelectorConfigModel();
  // ??????????????????
  private areaNodes: AreaModel[] = [];
  // ???????????????id
  private scheduleId: string = '';
  // ????????????????????????id??????
  private deptIdsForTeam: string[] = [];
  constructor(public $nzI18n: NzI18nService,
              public $message: FiLinkModalService,
              private $router: Router,
              private $active: ActivatedRoute,
              private $ruleUtil: RuleUtil,
              private $facilityForCommonService: FacilityForCommonService,
              private $scheduleService: ScheduleApiService) { }

  ngOnInit() {
    this.scheduleLanguage = this.$nzI18n.getLocaleData(LanguageEnum.schedule);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
    this.scheduleStepConfig = [
      {number: FinalValueEnum.STEPS_FIRST, activeClass: ' active', title: this.scheduleLanguage.basicInformation},
      {number: FinalValueEnum.STEPS_SECOND, activeClass: '', title: this.scheduleLanguage.personSchedule},
      {number: FinalValueEnum.STEPS_THIRD, activeClass: '', title: this.scheduleLanguage.finish}];
    this.initForm();
    this.getPage();
    this.initAreaSelectorConfig();
  }

  /**
   * ??????????????????????????????
   */
  public handleTeamNameOk(members: TeamManageListModel[]) {
    this.formInstance.resetControlData('teamIdList', members.map(item => item.id));
    this.teamNames = members.map(item => item.teamName).join(',');
    this.isShowTeamSelectorModal = false;
    this.deptIdsForTeam = members.map(item => item.deptId);
  }

  /**
   * ???????????????????????????
   */
  public showAreaSelectorModal() {
    // ???????????????????????????????????????
    if (this.formInstance.getData('teamIdList') && this.formInstance.getData('teamIdList').length) {
      this.queryAreaNodeData(this.deptIdsForTeam);
    } else {
      this.$message.info(this.scheduleLanguage.selectTeamNameFirst);
    }
  }

  /**
   * ???????????????????????????
   * param event ???????????????
   */
  public areaSelectChange(event: AreaModel[]): void {
    if (event && event.length) {
      FacilityForCommonUtil.setAreaNodesStatus(this.areaNodes, null, null);
      this.areaNames = event.map(item => item.areaName).join(',');
      this.formInstance.resetControlData('areaIdList', event.map(item => item.areaId));
    } else {
      FacilityForCommonUtil.setAreaNodesStatus(this.areaNodes, null);
      this.areaNames = '';
      this.formInstance.resetControlData('areaIdList', null);
    }
  }

  /**
   * ?????????
   * param val ????????????
   */
  public handPrevSteps(val: number): void {
    this.isActiveSteps = val - 1;
    this.scheduleStepConfig.forEach(item => {
      item.activeClass = item.number === this.isActiveSteps ? 'active' : '';
    });
  }

  /**
   * ?????????
   * param val ????????????
   */
  public handNextSteps(val: number): void {
    if (val === FinalValueEnum.STEPS_FIRST) {
      this.startDate = CommonUtil.dateFmt('yyyy-MM-dd', this.formInstance.getData('startDate'));
      this.endDate = CommonUtil.dateFmt('yyyy-MM-dd', this.formInstance.getData('endDate'));
    }
    if (val === FinalValueEnum.STEPS_SECOND) {
      if (this.scheduleCalendar.scheduleMemberDataList && this.scheduleCalendar.scheduleMemberDataList.length) {
        this.scheduleMemberDataList = this.scheduleCalendar.scheduleMemberDataList;
        this.scheduledDateList = this.scheduleCalendar.scheduledDateList;
      } else {
        this.$message.info(this.scheduleLanguage.schedulePeopleOperateTip);
        return;
      }
    }
    this.isActiveSteps = val + 1;
    this.scheduleStepConfig.forEach(item => {
      item.activeClass = item.number === this.isActiveSteps ? 'active' : '';
    });
  }

  /**
   * ????????????????????????????????????
   */
  public handStepsSubmit(): void {
    const params = this.formInstance.getRealData();
    this.$scheduleService.saveMaintenanceScheduleInfo(params).subscribe(res => {

    });
  }

  /**
   * ????????????
   */
  public handCancelSteps(): void {
    window.history.go(-1);
  }

  /**
   * ??????????????????
   */
  public scheduleFormInstance(event: { instance: FormOperate }): void {
    this.formInstance = event.instance;
    this.formInstance.group.statusChanges.subscribe(() => {
      this.isNextStepDisabled = !(this.formInstance.getRealValid());
    });
  }

  /**
   * ???????????????????????????
   * param current
   */
  public startDateDisabled = (current: Date): boolean => {
    return differenceInCalendarDays(current, new Date()) < 0;
  }

  /**
   * ???????????????????????????
   * param current
   */
  public endDateDisabled = (current: Date): boolean => {
    return differenceInCalendarDays(current, this.formInstance.getData('startDate')) < 0;
  }

  /**
   * ??????id??????????????????
   */
  private queryScheduleInfoById() {
    this.$scheduleService.queryListScheduleById(this.scheduleId).subscribe(res => {
      if (res.code === ResultCodeEnum.success) {
        if (res.data) {
          this.formInstance.group.reset(res.data);
          if (res.data.teamVOList && res.data.teamVOList.length) {
            // ???????????????????????????
            this.formInstance.resetControlData('teamIdList', res.data.teamVOList.map(item => item.id));
            this.teamNames = res.data.teamVOList.map(item => item.teamName).join(',');
            this.deptIdsForTeam = res.data.teamVOList.map(item => item.deptId);
          }
          if (res.data.areaVOList && res.data.areaVOList.length) {
            // ??????????????????
            this.areaNames = res.data.areaVOList.map(item => item.areaName).join(',');
            this.formInstance.resetControlData('areaIdList', res.data.areaVOList.map(item => item.areaId));
          }
        }
      }
    });
  }

  /**
   * ??????????????????????????????id???????????????????????????
   * params deptId ??????id
   */
  private queryAreaNodeData(deptId: string[]) {
    // ?????????????????? todo ????????????schedule???????????????????????????
    // this.$scheduleService.getIntersectionOfRegionsList(deptId).subscribe(res) => {
    this.$facilityForCommonService.queryAreaList().subscribe((res: ResultModel<AreaModel[]>) => {
      this.areaNodes = res.data || [];
      this.areaSelectorConfig.treeNodes = this.areaNodes;
      FacilityForCommonUtil.setAreaNodesStatus(this.areaNodes, null, null);
      // ??????????????? ???????????????
      if (this.formInstance.getData('areaIdList')) {
        this.isCheckData(this.areaNodes, this.formInstance.getData('areaIdList'));
      } else {
        this.handleTreeData(this.areaNodes);
      }
      this.isShowAreaSelectorModal = true;
    });
  }

  /**
   * ???????????? ????????????
   * param data
   * param ids
   */
  private isCheckData(data: AreaModel[], ids: string[]): void {
    ids.forEach( id => {
      data.forEach(item => {
        item.id = item.areaId;
        if ( id === item.areaId ) {
          item.checked = true;
        }
        if (item.children) {
          this.isCheckData(item.children, ids);
        }
      });
    });
  }

  /**
   * ????????????????????????id???value??????????????????????????????????????????
   * param data
   */
  private handleTreeData(data: AreaModel[]): void {
    data.forEach(item => {
      item.id = item.areaId;
      item.value = item.areaId;
      if (item.children) {
        this.handleTreeData(item.children);
      }
    });
  }

  /**
   * ?????????????????????
   */
  private initForm() {
    this.formColumn = [
      {
        // ????????????
        label: this.scheduleLanguage.startDate,
        key: 'startDate',
        type: 'custom',
        width: 300,
        require: true,
        rule: [{required: true}],
        template: this.startDateTpl
      },
      {
        // ????????????
        label: this.scheduleLanguage.endDate,
        key: 'endDate',
        type: 'custom',
        width: 300,
        require: true,
        rule: [{required: true}],
        template: this.endDateTpl
      },
      {
        // ????????????
        label: this.scheduleLanguage.teamName,
        key: 'teamIdList',
        type: 'custom',
        width: 350,
        require: true,
        rule: [{required: true}],
        template: this.teamNameSelectorTpl
      },
      {
        // ????????????
        label: this.scheduleLanguage.workShiftName,
        key: 'shiftId',
        type: 'select',
        col: 24,
        require: true,
        rule: [{required: true}],
        selectInfo: {
          // data: this.shiftNameList,
          data : [{label: 'ces', value: 'ces'}],
          label: 'label', value: 'value'
        }
      },
      {
        // ??????
        label: this.scheduleLanguage.area,
        key: 'areaIdList',
        type: 'custom',
        width: 350,
        require: true,
        rule: [{required: true}],
        template: this.areaSelectorTpl
      },
      {
        // ??????
        label: this.scheduleLanguage.remark,
        key: 'remark',
        type: 'textarea',
        col: 24,
        require: false,
        rule: [],
      },
    ];
  }

  /**
   * ??????????????????????????????
   * param nodes
   */
  private initAreaSelectorConfig(): void {
    this.areaSelectorConfig = {
      title: this.scheduleLanguage.area,
      width: '1000px',
      height: '300px',
      treeNodes: this.areaNodes,
      treeSetting: {
        check: {
          enable: true,
          chkStyle: 'checkbox',
          chkboxType: {'Y': 'ps', 'N': 'ps'}
        },
        data: {
          simpleData: {
            enable: false,
            idKey: 'areaId',
          },
          key: {
            name: 'areaName'
          },
        },
        view: {
          showIcon: false,
          showLine: false,
        },
      },
      onlyLeaves: false,
      selectedColumn: [
        {
          title: this.scheduleLanguage.areaName, key: 'areaName', width: 300,
        }
      ]
    };
  }

  /**
   * ??????????????????
   */
  private getPage(): void {
    // ?????????????????????????????????
    this.pageType = this.$active.snapshot.params.type;
    this.pageTitle = this.pageType === OperateTypeEnum.update ? this.scheduleLanguage.updateScheduling : this.scheduleLanguage.addScheduling;
    if (this.pageType === OperateTypeEnum.update) {
      this.$active.queryParams.subscribe(params => {
        this.scheduleId = params.id;
        // ??????????????????
        this.queryScheduleInfoById();
      });
    }
  }
}
