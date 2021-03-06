import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {NzI18nService, NzModalService} from 'ng-zorro-antd';
import {MapService} from '../../../core-module/api-service/index/map';
import {FiLinkModalService} from '../../../shared-module/service/filink-modal/filink-modal.service';
import {IndexLanguageInterface} from '../../../../assets/i18n/index/index.language.interface';
import {LockService} from '../../../core-module/api-service/lock';
import {FacilityService} from '../../../core-module/api-service/facility/facility-manage';
import {CommonUtil} from '../../../shared-module/util/common-util';
import {INDEX_CARD_TYPE} from '../../../core-module/const/index/index.const';
import {indexChart} from '../util/index-charts';
import {AlarmLevelColorEnum} from '../../../core-module/enum/alarm/alarm-level-color.enum';
import {DeviceStatusEnum} from '../../../core-module/enum/facility/facility.enum';
import {LanguageEnum} from '../../../shared-module/enum/language.enum';
import {ResultModel} from '../../../shared-module/model/result.model';
import {FacilityForCommonUtil} from '../../../core-module/business-util/facility/facility-for-common.util';
import {AlarmLevelCountEnum} from '../../../core-module/enum/alarm/alarm-level-count.enum';
import {DeviceTypeCountModel} from '../../../core-module/model/facility/device-type-count.model';
import {AlarmLevelStatisticsModel} from '../../../core-module/model/alarm/alarm-level-statistics.model';
import {AlarmStatisticsGroupInfoModel} from '../../../core-module/model/alarm/alarm-statistics-group-Info.model';
import {FacilityLogTopNumModel} from '../../../core-module/model/facility/facility-log-top-num.model';
import {FacilityDetailInfoModel} from '../../../core-module/model/facility/facility-detail-info.model';
import {ResultCodeEnum} from '../../../shared-module/enum/result-code.enum';
import {ApplicationSystemForCommonService} from '../../../core-module/api-service/application-system';
import {WorkOrderIncreaseModel} from '../../../core-module/model/application-system/work-order-increase.model';
import {QueryFacilityCountModel} from '../shared/model/query-facility-count.model';
import {SessionUtil} from '../../../shared-module/util/session-util';

@Component({
  selector: 'app-index-statistics',
  templateUrl: './index-statistical-chart.component.html',
  styleUrls: ['./index-statistical-chart.component.scss']
})
export class IndexStatisticalChartComponent implements OnInit, AfterViewInit {

  // ??????
  @Input() title: string;
  // ??????
  @Input() type: number;
  // ????????????
  @Input() data: any[];
  // ?????????
  public indexLanguage: IndexLanguageInterface;
  // ????????????
  public cardType = INDEX_CARD_TYPE;
  // ????????????????????????
  public statisticsCount: QueryFacilityCountModel[] = [];
  // ??????????????????
  public statisticsNumber = [0, 0, 0, 0, 0, 0];
  // ?????????????????????????????????
  public deviceStatusChartOption: any = {};
  // ????????????
  public noDeviceStatusChart = true;
  // ?????????????????????
  public procAddListCountOption: any = {};
  // ????????????????????????
  public noProcAddListCount = true;
  // ????????????TOP?????????
  public userUnlockingTopOption: any = {};
  // ????????????????????????TOP???
  public noUserUnlockingTop = true;
  // ????????????Top10?????????
  public screenDeviceIdsGroupOption: any = {};
  // ???????????????
  public ceshiOption: any = {};
  // ????????????????????????Top10???
  public noScreenDeviceIdsGroup = true;
  // ????????????ceshi???
  public noScreenCeShi = true;
  // ????????????????????????????????????
  public alarmCurrentLevelGroupOption: any = {};
  // ???????????????????????????????????????
  public noAlarmCurrentLevelGroup = true;
  // ?????????????????????
  public alarmDateStatisticsOption: any = {};
  // ????????????????????????
  public noAlarmDateStatistics = true;
  // ???????????????
  public deviceRole: string[] = [];
  // ????????????/???????????????????????????
  public deviceCount: boolean = false;
  // ????????????
  public deviceStatus: boolean = false;
  // ??????????????????
  public alarmCount: boolean = false;
  // ????????????
  public alarmIncrement: boolean = false;
  // ????????????
  public workIncrement: boolean = false;
  // ????????????TOP/????????????TOP
  public topRole: boolean = false;

  constructor(private $nzI18n: NzI18nService,
              private $message: FiLinkModalService,
              private $mapService: MapService,
              private $modal: NzModalService,
              private $lockService: LockService,
              private $facilityService: FacilityService,
              private $applicationSystemForCommonService: ApplicationSystemForCommonService,
  ) {
  }

  ngOnInit() {
    // ???????????????
    this.indexLanguage = this.$nzI18n.getLocaleData(LanguageEnum.index);
    // ????????????????????????
    this.queryDeviceRole();
  }

  ngAfterViewInit() {
    // ??????????????????
    this.initCountChart();
  }

  /**
   * ????????????
   */
  queryDeviceRole() {
    const userInfo = SessionUtil.getUserInfo();
    this.deviceRole = userInfo.role.roleDeviceTypeDto.deviceTypes;
  }

  /**
   * ??????????????????
   */
  private initCountChart(): void {
    switch (this.type) {
      // ????????????
      case this.cardType.deviceCount:
        this.queryDeviceTypeALLCount();
        break;
      // ????????????
      case this.cardType.typeCount:
        this.queryDeviceTypeCount();
        break;
      // ????????????
      case this.cardType.deviceStatus:
        this.queryUserDeviceStatusCount();
        break;
      // ??????????????????
      case this.cardType.alarmCount:
        this.queryAlarmCurrentLevelGroup();
        break;
      // ????????????
      case this.cardType.alarmIncrement:
        this.queryAlarmDateStatistics();
        break;
      // ????????????
      case this.cardType.workIncrement:
        this.queryHomeProcAddListCountGroupByDay();
        break;
      // ????????????TOP
      case this.cardType.busyTop:
        this.queryUserUnlockingTopNum();
        break;
      // ????????????TOP
      case this.cardType.alarmTop:
        this.queryScreenDeviceIdsGroup();
        break;
      // ceshi
      case this.cardType.ceshi:
        this.queryCeShi();
        break;
    }
  }

  /**
   * ??????????????????
   */
  private queryDeviceTypeALLCount(): void {
    this.$facilityService.queryDeviceTypeCount().subscribe((result: ResultModel<Array<DeviceTypeCountModel>>) => {
      if (result.code === ResultCodeEnum.success) {
        const data: Array<DeviceTypeCountModel> = [];
        // ???????????????????????????
        result.data.forEach(item => {
          const role = this.deviceRole.indexOf(item.deviceType);
          if (role !== -1) {
            data.push(item);
          }
        });
        // ????????????
        let sum = 0;
        data.forEach(item => {
          sum += item.deviceNum;
        });
        // ??????
        const count = (Array('000000').join('0') + sum).slice(-6);
        this.statisticsNumber = [];
        // ??????????????????
        this.statisticsNumber = (count + '').split('').map(Number);
      }
    });
  }

  /**
   * ??????????????????
   */
  private queryDeviceTypeCount(): void {
    this.$facilityService.queryDeviceTypeCount().subscribe((result: ResultModel<Array<DeviceTypeCountModel>>) => {
      if (result.code === ResultCodeEnum.success) {
        const data: Array<DeviceTypeCountModel> = result.data || [];
        // ????????????????????????
        const deviceTypes = FacilityForCommonUtil.translateDeviceType(this.$nzI18n) as QueryFacilityCountModel[];
        // ???????????????????????????
        const deviceList: QueryFacilityCountModel[] = [];
        deviceTypes.forEach(item => {
          const role = this.deviceRole.indexOf(item.code);
          if (role !== -1) {
            deviceList.push(item);
          }
        });
        // ??????????????????
        deviceList.forEach(item => {
          const type = data.find(_item => _item.deviceType === item.code);
          if (type) {
            item.sum = type.deviceNum;
          } else {
            item.sum = 0;
          }
          item.textClass = CommonUtil.getFacilityTextColor(item.code);
          item.iconClass = CommonUtil.getFacilityIConClass(item.code);
        });
        // ????????????????????????
        this.statisticsCount = deviceList;
      }
    });
  }

  /**
   * ???????????????????????????
   */
  private queryUserDeviceStatusCount(): void {
    this.$mapService.queryUserDeviceStatusCount().subscribe((result: ResultModel<Array<DeviceTypeCountModel>>) => {
      if (result.code === ResultCodeEnum.success) {
        const data: Array<DeviceTypeCountModel> = result.data || [];
        if (data.length === 0) {
          this.noDeviceStatusChart = true;
        } else {
          this.noDeviceStatusChart = false;
          const userDeviceStatusCount = data.map(_item => {
            if (_item.deviceNum !== 0) {
              return {
                value: _item.deviceNum,
                name: CommonUtil.codeTranslate(DeviceStatusEnum, this.$nzI18n, _item.deviceStatus, LanguageEnum.index) || '',
                itemStyle: {color: CommonUtil.getFacilityColor(_item.deviceStatus)}
              };
            }
          });
          this.deviceStatusChartOption = indexChart.setRingChartOption(userDeviceStatusCount, this.indexLanguage.facilityStatusTitle);
        }
      }
    });
  }

  /**
   * ????????????????????????
   */
  private queryAlarmCurrentLevelGroup(): void {
    this.$mapService.queryAlarmCurrentLevelGroup().subscribe((result: ResultModel<Array<AlarmLevelStatisticsModel>>) => {
      if (result.code === ResultCodeEnum.success) {
        if (result.data.length === 0) {
          this.noAlarmCurrentLevelGroup = true;
        } else {
          const data: Array<AlarmLevelStatisticsModel> = result.data || [];
          // ???????????????????????????
          const alarmCount = CommonUtil.codeTranslate(AlarmLevelCountEnum, this.$nzI18n, null, LanguageEnum.bigScreen);
          let sum = 0;
          Object.keys(data).forEach(item => {
            const alarmItem = alarmCount[Object.keys(data).indexOf(item)];
            if (item === alarmItem['code']) {
              sum += data[item];
              if (data[item] !== 0) {
                alarmItem['value'] = data[item];
                alarmItem['name'] = alarmItem['label'];
                alarmItem['itemStyle'] = {color: AlarmLevelColorEnum[item.replace('Count', '')]};
              }
            }
          });
          // ???????????????????????????
          if (sum > 0) {
            this.noAlarmCurrentLevelGroup = false;
          }
          this.alarmCurrentLevelGroupOption = indexChart.setBarChartOption(alarmCount, this.indexLanguage.currentAlarmNum);
        }
      }
    });
  }

  /**
   * ????????????
   */
  private queryHomeProcAddListCountGroupByDay(): void {
    // ????????????
    const params = {
      statisticalType: '4'
    };
    this.$applicationSystemForCommonService.findApplyStatisticsByCondition(params).subscribe((result: ResultModel<WorkOrderIncreaseModel[]>) => {
      if (result.code === ResultCodeEnum.success) {
        if (result.data.length === 0) {
          this.noProcAddListCount = true;
        } else {
          this.noProcAddListCount = false;
          const time = result.data.map(item => item.formatDate);
          const count = result.data.map(item => item.count);
          const lineData = [
            {data: count, type: 'line', name: this.indexLanguage.clearBarrierWorkOrder},
          ];
          this.procAddListCountOption = indexChart.setLineChartOption(lineData, time);
        }
      }
    });
  }

  /**
   * ????????????
   */
  private queryAlarmDateStatistics(): void {
    // ????????????
    const params: string = 'DAY';
    this.$mapService.queryAlarmDateStatistics(params, '').subscribe((result: ResultModel<Array<AlarmStatisticsGroupInfoModel>>) => {
      if (result.code === ResultCodeEnum.success) {
        const data: Array<AlarmStatisticsGroupInfoModel> = result.data || [];
        if (data.length === 0) {
          this.noAlarmDateStatistics = true;
        } else {
          this.noAlarmDateStatistics = false;
          const time = data.map(item => item.groupLevel);
          const count = data.map(item => item.groupNum);
          const lineData = [
            {data: count, type: 'line', name: this.indexLanguage.alarmIncrement},
          ];
          this.alarmDateStatisticsOption = indexChart.setLineChartOption(lineData, time);
        }
      }
    });
  }

  /**
   * ??????????????????Top10
   */
  private queryScreenDeviceIdsGroup(): void {
    this.$mapService.queryScreenDeviceIdsGroup().subscribe((result: ResultModel<any>) => {
      if (result.code === ResultCodeEnum.success) {
        if (result.data.length === 0) {
          this.noScreenDeviceIdsGroup = true;
        } else {
          // ????????????
          const deviceIds = result.data.map(_item => {
            return _item.alarmSource;
          });
          // ????????????id???????????????
          this.$mapService.queryDeviceByIds(deviceIds).subscribe((getResult: ResultModel<Array<FacilityDetailInfoModel>>) => {
            const deviceData: Array<FacilityDetailInfoModel> = getResult.data || [];
            if (getResult.code === 0 && deviceData.length > 0) {
              this.noScreenDeviceIdsGroup = false;
              // ????????????
              const screenDeviceIdsGroupNum = result.data.map(_item => {
                return {
                  value: _item.count,
                  name: this.getAlarmIdFromName(_item.alarmSource, deviceData),
                };
              });
              // ????????????
              const screenDeviceIdsGroupName = result.data.map(_item => {
                return this.getAlarmIdFromName(_item.alarmSource, deviceData);
              });
              this.screenDeviceIdsGroupOption = indexChart.setHistogramChartOption(screenDeviceIdsGroupNum, screenDeviceIdsGroupName);
            }
          });

        }
      }
    });
  }

  /**
   * ????????????TOP
   */
  private queryUserUnlockingTopNum(): void {
    this.$mapService.queryUserUnlockingTopNum().subscribe((result: ResultModel<Array<FacilityLogTopNumModel>>) => {
      if (result.code === ResultCodeEnum.success) {
        const data: Array<FacilityLogTopNumModel> = result.data || [];
        if (data.length === 0) {
          this.noUserUnlockingTop = true;
        } else {
          this.noUserUnlockingTop = false;
          const userUnlockingTopNum = data.map(_item => {
            return {
              value: _item.countValue,
              name: _item.deviceName,
            };
          });
          const userUnlockingTopName = data.map(item => item.deviceName);
          this.userUnlockingTopOption = indexChart.setHistogramChartOption(userUnlockingTopNum, userUnlockingTopName);
        }
      }
    });
  }

  /**
   * ??????????????????id?????????data??????????????????
   */
  private getAlarmIdFromName(id: string, data: any): string {
    let alarmName = '';
    data.filter(item => {
      if (item.deviceId === id) {
        alarmName = item.deviceName;
      }
    });
    return alarmName;
  }

  queryCeShi() {
    // this.noScreenCeShi = this.noScreenCeShi;
    const newlineData = [{value: 1048, name: '????????????'},
      {value: 735, name: '????????????'},
      {value: 580, name: '????????????'},
      {value: 484, name: '????????????'},
      {value: 300, name: '????????????'}];
    const newTime = 'ceshi';
    this.ceshiOption = indexChart.setNewBarChartOption(newlineData, newTime);
  }
}
