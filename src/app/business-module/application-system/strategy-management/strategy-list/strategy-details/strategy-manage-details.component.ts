import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ClassStatusConst, RouterJumpConst} from '../../../share/const/application-system.const';
import {ApplicationService} from '../../../share/service/application.service';
import {detailsFmt} from '../../../share/util/tool.util';
import {NzI18nService, NzModalService} from 'ng-zorro-antd';
import {ResultCodeEnum} from '../../../../../shared-module/enum/result-code.enum';
import {ResultModel} from '../../../../../shared-module/model/result.model';
import {FiLinkModalService} from '../../../../../shared-module/service/filink-modal/filink-modal.service';
import {ApplicationInterface} from '../../../../../../assets/i18n/appliction/application.interface';
import {
  EnableOrDisableModel,
  ProgramListModel,
  StrategyListModel,
  StrategyPlayPeriodRefListModel
} from '../../../share/model/policy.control.model';
import {LanguageEnum} from '../../../../../shared-module/enum/language.enum';
import {StrategyStatusEnum} from '../../../share/enum/policy.enum';
import {OperationButtonEnum} from '../../../share/enum/operation-button.enum';
import {PolicyTypeEnum} from '../../../../../core-module/enum/equipment/policy.enum';
import {SortCondition} from '../../../../../shared-module/model/query-condition.model';
import {TableConfigModel} from '../../../../../shared-module/model/table-config.model';
import {InstructUtil} from '../../../share/util/instruct-util';
import {CommonLanguageInterface} from '../../../../../../assets/i18n/common/common.language.interface';
import {CommonUtil} from '../../../../../shared-module/util/common-util';
import {CurrencyEnum} from '../../../../../core-module/enum/operator-enable-disable.enum';
import {getStrategyStatus} from '../../../share/util/application.util';
import {FacilityLanguageInterface} from '../../../../../../assets/i18n/facility/facility.language.interface';
import {TableSortConfig} from '../../../../../shared-module/enum/table-style-config.enum';
import * as _ from 'lodash';
import {LinkagePolicyEnum} from '../../../share/enum/auth.code.enum';
import { Observable } from 'rxjs';

/**
 * ?????????????????????????????????
 * ???????????????????????????
 */
@Component({
  selector: 'app-strategy-manage-details',
  templateUrl: './strategy-manage-details.component.html',
  styleUrls: ['./strategy-manage-details.component.scss']
})
export class StrategyManageDetailsComponent implements OnInit {
  // ????????????????????????
  @Input() isOperation: boolean = true;
  // ??????????????????
  @Input() middleData: StrategyListModel = new StrategyListModel();
  // ????????????
  public programName: string = '';
  // ????????????
  public classStatus = ClassStatusConst;
  // ??????????????????
  public programTable: TableConfigModel;
  // ??????id
  public strategyId: string;
  // ?????????????????????
  public languageTable: ApplicationInterface;
  // ?????????????????????
  public facilityLanguage: FacilityLanguageInterface;
  // ??????????????????
  public lightingData: StrategyListModel = new StrategyListModel();
  // ????????????
  public strategyType: string;
  policyTypeEnum = PolicyTypeEnum;
  public strategyTableConfig: TableConfigModel;
  public isLoading = false;
  /** ???????????????????????????*/
  public playProgramList: ProgramListModel[] = [];
  private commonLanguage: CommonLanguageInterface;
  // ??????????????????????????????
  public linkagePolicyEnum = LinkagePolicyEnum;
  constructor(
    // ???????????????
    public $nzI18n: NzI18nService,
    private $modalService: NzModalService,
    // ????????????
    private $message: FiLinkModalService,
    // ????????????
    public $applicationService: ApplicationService,
    // ????????????
    private $activatedRoute: ActivatedRoute,
    // ??????
    public $router: Router
  ) {
    // ?????????????????????
    this.languageTable = this.$nzI18n.getLocaleData(LanguageEnum.application);
    this.facilityLanguage = this.$nzI18n.getLocaleData(LanguageEnum.facility);
    this.commonLanguage = this.$nzI18n.getLocaleData(LanguageEnum.common);
  }

  /**
   * ?????????
   */
  public ngOnInit(): void {
    // ????????????????????????
    if (this.isOperation) {
      this.initDetails();
    } else {
      this.strategyType = this.middleData.strategyType;
      // ???????????????????????????
      this.handNextSteps(this.middleData);
    }
    if (this.strategyType === this.policyTypeEnum.lighting) {
      this.initTableConfig();
    } else if (this.strategyType === this.policyTypeEnum.information) {
      this.initProgram();
    }
  }

  /**
   * ?????????????????????????????????????????????????????????
   * @ param data
   */
  public handNextSteps(data: StrategyListModel): void {
    this.lightingData = detailsFmt(data, this.$nzI18n);
    // if (this.lightingData.instructLightList && this.lightingData.instructLightList.length) {
      // // ??????????????????????????????
      // this.lightingData.instructLightList = this.lightingData.instructLightList.sort((a, b) => {
      //   const aTime = a.startTime || a.endTime;
      //   const bTime = b.startTime || b.endTime;
      //   return aTime - bTime;
      // });
    // }
  }

  /**
   * ??????????????????
   */
  public initDetails(): void {
    this.$activatedRoute.queryParams.subscribe(params => {
      let httpRequest: Observable<ResultModel<StrategyListModel>>;
      if (params.strategyType === StrategyStatusEnum.linkage) {
        httpRequest = this.$applicationService.getLinkageDetails(params.id);
      } else if (params.strategyType === StrategyStatusEnum.lighting) {
        httpRequest = this.$applicationService.getLightingPolicyDetails(params.id);
      } else if (params.strategyType === StrategyStatusEnum.information) {
        httpRequest = this.$applicationService.getReleasePolicyDetails(params.id);
      }
      this.isLoading = true;
      this.strategyType = params.strategyType;
      httpRequest.subscribe((result: ResultModel<StrategyListModel>) => {
        this.isLoading = false;
        if (result.code === ResultCodeEnum.success) {
          // this.lightingData = result.data;
          this.strategyId = params.id;
          // ???????????????????????????????????????
          if (result.data.linkageStrategyInfo && result.data.linkageStrategyInfo.instructInfoBase) {
            const {programId} = result.data.linkageStrategyInfo.instructInfoBase;
            this.linkageStrategyProgramIds([programId]);
          }
          if (result.data.strategyProgRelationList && result.data.strategyProgRelationList.length) {
            // ????????????id????????????????????????
            const programIds = result.data.strategyProgRelationList.map(item => item.programId);
            this.lookReleaseProgramIds(programIds);
          }
          const ids = result.data.strategyRefList.map(item => item.refId);
          this.queryEquipmentDataList(ids);
          // detailsFmt(this.lightingData, this.$nzI18n);
          this.handNextSteps(result.data);
          if (this.lightingData.instructLightList) {
            InstructUtil.instructLight(this.lightingData.instructLightList, this.languageTable);
          }
        } else {
          this.$message.error(result.msg);
        }
      }, () => {
        this.isLoading = false;
      });
    });
  }

  /**
   * ????????????id????????????
   * @ param params
   */
  public linkageStrategyProgramIds(params: Array<string>): void {
    this.$applicationService.lookReleaseProgramIds(params).subscribe((result: ResultModel<ProgramListModel[]>) => {
      if (result.code === ResultCodeEnum.success) {
        this.lightingData.linkageStrategyInfo.instructInfoBase.programName = result.data[0].programName;
      } else {
        this.$message.error(result.msg);
      }
    });
  }

  /**
   * ????????????id????????????
   * @ param params
   */
  public lookReleaseProgramIds(params: Array<string>): void {
    this.$applicationService.lookReleaseProgramIds(params).subscribe((result: ResultModel<ProgramListModel[]>) => {
      if (result.code === ResultCodeEnum.success) {
        const tempProgram = [];
        this.lightingData.strategyProgRelationList.forEach(item => {
          const programInfo = result.data.find(it => it.programId === item.programId);
          if (programInfo) {
            tempProgram.push(programInfo);
          }
        });
        this.playProgramList = tempProgram;
      } else {
        this.$message.error(result.msg);
      }
    });
  }

  public queryEquipmentDataList(ids: Array<string>): void {
    this.$applicationService.queryEquipmentDataList({equipmentIdList: ids}).subscribe((result) => {
      this.lightingData.multiEquipmentData = result.data;
      this.lightingData.multiEquipmentData.forEach(item => {
        // ??????????????????
        const iconStyle = CommonUtil.getEquipmentStatusIconClass(item.equipmentStatus, 'list');
        item.statusIconClass = iconStyle.iconClass;
        item.statusColorClass = iconStyle.colorClass;
        item.deviceName = item.deviceInfo ? item.deviceInfo.deviceName : '';
      });
    });
  }

  /**
   * ????????????
   */
  public handleOk(): void {
    this.isLoading = true;
    this.$applicationService.deleteStrategy([this.strategyId]).subscribe((result: ResultModel<string>) => {
      this.isLoading = false;
      if (result.code === ResultCodeEnum.success) {
        this.$message.success(this.languageTable.strategyList.deleteMsg);
        this.$router.navigate([RouterJumpConst.strategy], {}).then();
      } else {
        this.$message.error(result.msg);
      }
    }, () => {
      this.isLoading = false;
    });
  }

  /**
   * ??????????????????
   */
  public onClickDelete(): void {
    this.$modalService.confirm({
      nzTitle: this.facilityLanguage.prompt,
      nzContent: `<span>${this.languageTable.strategyList.confirmDelete}?</span>`,
      nzOkText: this.commonLanguage.cancel,
      nzOkType: 'danger',
      nzMaskClosable: false,
      nzOnOk: () => {
      },
      nzCancelText: this.commonLanguage.confirm,
      nzOnCancel: () => {
        this.handleOk();
      }
    });
  }

  /**
   * ????????????
   * @ param event ?????????????????????????????????
   */
  public handleOperation(event: OperationButtonEnum): void {
    if (event === OperationButtonEnum.delete) {
      this.onClickDelete();
    } else if (event === OperationButtonEnum.enable || event === OperationButtonEnum.disable) {
      const status = event === OperationButtonEnum.enable ? CurrencyEnum.enable : CurrencyEnum.disabled;
      const params = {
        strategyType: this.strategyType,
        operation: status,
        strategyId: this.strategyId
      };
      this.enableOrDisableStrategy([params], status);
    } else if (event === OperationButtonEnum.edit) {
      this.$router.navigate([RouterJumpConst.strategyEdit], {
        queryParams: {
          strategyType: this.strategyType,
          id: this.strategyId,
        }
      }).then();
    }
  }

  /**
   * ????????????
   * @ param params
   */
  public enableOrDisableStrategy(params: EnableOrDisableModel[], status: string): void {
    this.isLoading = true;
    this.$applicationService.enableOrDisableStrategy(params).subscribe((result: ResultModel<string>) => {
      this.isLoading = false;
      if (result.code === ResultCodeEnum.success) {
        this.lightingData.strategyStatus = getStrategyStatus(this.$nzI18n, status) as string;
        this.$message.success(`${this.languageTable.contentList.successful}!`);
      } else {
        this.$message.error(result.msg);
      }
    }, err => {
      this.isLoading = false;
    });
  }


  /**
   * ???????????????
   */
  public initProgram(): void {
    this.programTable = {
      isDraggable: true,
      isLoading: false,
      showSearchSwitch: false,
      showSizeChanger: true,
      scroll: {x: '900px', y: '200px'},
      noIndex: true,
      notShowPrint: true,
      noAutoHeight: true,
      columnConfig: [
        // ??????
        {
          type: 'serial-number', width: 62, title: this.commonLanguage.serialNumber
        },
        // ????????????
        {
          title: this.languageTable.strategyList.programName, key: 'programName', width: 300, isShowSort: true
        },
        // ????????????
        {
          title: this.languageTable.strategyList.programPurpose, key: 'programPurpose', width: 300, isShowSort: true
        },
        // ??????
        {
          title: this.languageTable.strategyList.duration, key: 'duration', width: 250, isShowSort: true
        },
        // ??????
        {
          title: this.languageTable.strategyList.mode, key: 'mode', width: 250, isShowSort: true
        },
        // ?????????
        {
          title: this.languageTable.strategyList.resolution, key: 'resolution', width: 100, isShowSort: true
        },
        // ????????????
        {
          title: this.languageTable.strategyList.programFileName, key: 'programFileName', width: 300, isShowSort: true
        }
      ],
      showPagination: false,
      bordered: false,
      showSearch: false,
      topButtons: [],
      operation: [],
      // ??????
      sort: (event: SortCondition) => {
        let temp = [];
        if (event && Object.keys(event).length) {
          temp = _.sortBy(this.playProgramList, event.sortField);
          if (event.sortRule === TableSortConfig.DESC) {
            temp.reverse();
          }
        } else {
          // ??????????????????????????????????????????
          this.lightingData.strategyProgRelationList.forEach(item => {
            this.playProgramList.forEach(it => {
              if (item.programId === it.programId) {
                temp.push(it);
              }
            });
          });
        }
        this.playProgramList = [...temp];
      }
    };
  }

  /**
   * ??????????????????
   */
  public timeFmt(data: StrategyPlayPeriodRefListModel[]): string {
    let time = '';
    if (data && data.length) {
      data.forEach(item => {
        time += `${CommonUtil.dateFmt('hh:mm', new Date(item.playStartTime))}-${CommonUtil.dateFmt('hh:mm', new Date(item.playEndTime))};`;
      });
    }
    return time;
  }

  /**
   * ?????????????????????
   */
  private initTableConfig(): void {
    this.strategyTableConfig = {
      isDraggable: true,
      isLoading: false,
      showSearchSwitch: false,
      showSizeChanger: false,
      scroll: {x: '900px', y: '600px'},
      noIndex: true,
      notShowPrint: true,
      columnConfig: [
        // ??????
        {
          title: this.languageTable.strategyList.timeInterval,
          key: 'timeInterval',
          width: 300
        },
        // ??????
        {
          title: this.languageTable.strategyList.switch,
          key: 'switches',
          width: 300
        },
        // ??????
        {
          title: this.languageTable.strategyList.dimming,
          key: 'light',
          width: 300
        },
        // todo ???????????? // ???????????????
        // {
        //   title: this.languageTable.strategyList.event,
        //   key: 'refObjectName',
        //   width: 300
        // },
        // ????????????
        {
          title: this.languageTable.strategyList.lightIntensity,
          key: 'sensorList',
          width: 300
        }
      ],
      showPagination: false,
      bordered: false,
      showSearch: false,
      searchReturnType: 'Array',
      topButtons: [],
      operation: [],
      // ??????
      sort: (event: SortCondition) => {

      },
    };
  }
}
