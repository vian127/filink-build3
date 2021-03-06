import { Routes } from '@angular/router';
import { AlarmComponent } from './alarm.component';
import { CurrentAlarmComponent } from './alarm-manage/current-alarm/current-alarm.component';
import { HistoryAlarmComponent } from './alarm-manage/history-alarm/history-alarm.component';
import { CurrentAlarmSetComponent } from './alarm-manage/alarm-set/current-alarm-set/current-alarm-set.component';
import { HistoryAlarmSetComponent } from './alarm-manage/alarm-set/history-alarm-set/history-alarm-set.component';
import { AlarmLevelSetComponent } from './alarm-manage/alarm-set/current-alarm-set/alarm-level-set/alarm-level-set.component';
import { AlarmFiltrationComponent } from './alarm-manage/alarm-set/alarm-filtration/alarm-filtration.component';
import { AlarmFiltrationAddComponent } from './alarm-manage/alarm-set/alarm-filtration/alarm-filtration-add/alarm-filtration-add.component';
import { AlarmRemoteNotificationComponent } from './alarm-manage/alarm-set/alarm-remote-notification/alarm-remote-notification.component';
import { AlarmWorkOrderComponent } from './alarm-manage/alarm-set/alarm-work-order/alarm-work-order.component';
import { RemoteAddComponent } from './alarm-manage/alarm-set/alarm-remote-notification/remote-add/remote-add.component';
import { WorkOrderAddComponent } from './alarm-manage/alarm-set/alarm-work-order/work-order-add/work-order-add.component';
import { CurrentAlarmAddComponent } from './alarm-manage/current-alarm/current-alarm-add/current-alarm-add.component';
import { DiagnoseDetailsComponent } from './alarm-manage/current-alarm/diagnose-details/diagnose-details.component';
import { AddAlarmSetComponent } from './alarm-manage/alarm-set/current-alarm-set/add-alarm-set/add-alarm-set.component';
import { AlarmCorrelationSettingComponent} from './alarm-manage/alarm-set/alarm-correlation-setting/alarm-correlation-setting.component';
import {AlarmWarningSettingComponent} from './alarm-manage/alarm-set/alarm-warning-setting/alarm-warning-setting.component';
import {AddAlarmWarningSetComponent} from './alarm-manage/alarm-set/alarm-warning-setting/add-alarm-warning-set/add-alarm-warning-set.component';
import {DynamicCorrelationRuleDetailComponent} from './alarm-manage/common-components/dynamic-correlation-rule/dynamic-correlation-rule-detail/dynamic-correlation-rule-detail.component';
import {AddCorrelationAnalysisComponent} from './alarm-manage/common-components/correlation-rule/add-correlation-analysis/add-correlation-analysis.component';
import {DynamicRuleViewResultComponent} from './alarm-manage/common-components/dynamic-correlation-rule/dynamic-rule-view-result/dynamic-rule-view-result.component';

export const ROUTER_CONFIG: Routes = [
    {
        path: '',
        component: AlarmComponent,
        data: {
            breadcrumb: '????????????'
        },
        children: [
            {
                path: 'current-alarm',
                component: CurrentAlarmComponent,
                data: {
                    breadcrumb: [{ label: 'alarm', url: 'current-alarm' }, { label: 'currentAlarm' }]
                }
            },
            {
              path: 'current-alarm/:type',
              component: CurrentAlarmAddComponent,
              data: {
                  breadcrumb: [{ label: 'alarm', url: 'current-alarm' }, { label: 'templateQuery' }]
              }
            },
            {
                path: 'history-alarm',
                component: HistoryAlarmComponent,
                data: {
                    breadcrumb: [{ label: 'alarm', url: 'history-alarm' }, { label: 'historyAlarm' }]

                }
            },
            {
                path: 'current-alarm-set',
                component: CurrentAlarmSetComponent,
                data: {
                    breadcrumb: [
                        { label: 'alarm' },
                        { label: 'alarmSet' },
                        { label: 'currentAlarmSet' }
                    ]

                }
            },
            {
                path: 'history-alarm-set',
                component: HistoryAlarmSetComponent,
                data: {
                    breadcrumb: [{ label: 'alarm' },
                    { label: 'alarmSet'},
                    { label: 'historyAlarmSet' }
                    ]

                }
            },
            {
                path: 'alarm-level-set',
                component: AlarmLevelSetComponent,
                data: {
                    breadcrumb: [{ label: 'alarm' }, { label: 'alarmSet' },
                    { label: 'currentAlarmSet', url: 'current-alarm-set' },
                    { label: 'alarmLevelSet' }
                    ]

                }
            },
            {
              path: 'alarm-filtration',
              component: AlarmFiltrationComponent,
              data: {
                  breadcrumb: [
                      { label: 'alarm' },
                      { label: 'alarmSet' },
                      { label: 'alarmFilter' }
                  ]
              }
            },
            {
                path: 'alarm-filtration/:type',
                component: AlarmFiltrationAddComponent,
                data: {
                    breadcrumb: [
                      { label: 'alarm' },
                      { label: 'alarmSet' },
                      { label: 'alarmFilter', url: 'alarm-filtration' },
                      { label: 'alarmFilter' }
                    ]
                }
            },
            {
              // ??????????????????
              path: 'alarm-remote-notification',
              component: AlarmRemoteNotificationComponent,
              data: {
                  breadcrumb: [
                      { label: 'alarm' },
                      { label: 'alarmSet' },
                      { label: 'alarmRemoteNotification' }
                  ]
              }
            },
            {
              // ?????????????????? ?????? ????????????
              path: 'alarm-remote-notification/:type',
              component: RemoteAddComponent,
              data: {
                  breadcrumb: [
                      { label: 'alarm' },
                      { label: 'alarmSet' },
                      { label: 'alarmRemoteNotification', url: 'alarm-remote-notification'},
                      { label: 'alarmRemoteNotification'}
                  ]}
            },
            {
              // ???????????????
              path: 'alarm-work-order',
              component: AlarmWorkOrderComponent,
              data: {
                  breadcrumb: [
                      { label: 'alarm' },
                      { label: 'alarmSet' },
                      { label: 'alarmWorkOrder' }
                  ]
              }
            },
          {
            // ??????????????????
            path: 'alarm-warning-setting',
            component: AlarmWarningSettingComponent,
            data: {
              breadcrumb: [
                { label: 'alarm' },
                { label: 'alarmSet' },
                { label: 'alarmWarningSetting' }
              ]
            }
          },
          {
            // ????????????????????????
            path: 'alarm-warning-setting/add-alarm-warning',
            component: AddAlarmWarningSetComponent,
            data: {
              breadcrumb: [
                { label: 'alarm' },
                { label: 'alarmSet' },
                { label: 'alarmWarningSetting', url: 'alarm-warning-setting'},
                { label: 'addAlarmWarningSet'}
              ]
            }
          },
          {
            // ????????????????????????
            path: 'alarm-warning-setting/edit-alarm-warning',
            component: AddAlarmWarningSetComponent,
            data: {
              breadcrumb: [
                { label: 'alarm' },
                { label: 'alarmSet' },
                { label: 'alarmWarningSetting', url: 'alarm-warning-setting'},
                { label: 'editAlarmWarningSet'}
              ]
            }
          },
            {
              // ???????????????????????????
              path: 'alarm-correlation-setting',
              component: AlarmCorrelationSettingComponent,
              data: {
                breadcrumb: [
                  { label: 'alarm' },
                  { label: 'alarmSet' },
                  { label: 'alarmCorrelationSetting' }
                ]
              }
            },
          {
            // ?????????????????????/????????????
            path: 'alarm-correlation-setting/dynamic-correlation-view',
            component: DynamicRuleViewResultComponent,
            data: {
              breadcrumb: [
                { label: 'alarm' },
                { label: 'alarmSet'},
                { label: 'alarmSettingAndDynamicRule',  url: 'alarm-correlation-setting'},
                { label: 'viewResult' }
              ]
            }
          },
          {
            // ???????????????????????????-??????
            path: 'alarm-correlation-setting/dynamic-correlation-rule-add',
            component: DynamicCorrelationRuleDetailComponent,
            data: {
              breadcrumb: [
                { label: 'alarm' },
                { label: 'alarmSet'},
                { label: 'alarmCorrelationSetting',  url: 'alarm-correlation-setting'},
                { label: 'dynamicCorrelationSettingAdd' }
              ]
            }
          },
          {
            // ???????????????????????????-??????
            path: 'alarm-correlation-setting/dynamic-correlation-rule-edit',
            component: DynamicCorrelationRuleDetailComponent,
            data: {
              breadcrumb: [
                { label: 'alarm' },
                { label: 'alarmSet'},
                { label: 'alarmCorrelationSetting',  url: 'alarm-correlation-setting'},
                { label: 'dynamicCorrelationSettingEdit' }
              ]
            }
          },
          {
            // ?????????????????????????????????
            path: 'alarm-correlation-setting/add-correlation-analysis',
            component: AddCorrelationAnalysisComponent,
            data: {
              breadcrumb: [
                { label: 'alarm' },
                { label: 'alarmSet', url: 'alarm-correlation-setting' },
                { label: 'addAlarmCorrelationAnalysis' },
              ]
            }
          },
          {
            // ?????????????????????????????????
            path: 'alarm-correlation-setting/edit-correlation-analysis',
            component: AddCorrelationAnalysisComponent,
            data: {
              breadcrumb: [
                { label: 'alarm' },
                { label: 'alarmSet', url: 'alarm-correlation-setting' },
                { label: 'editAlarmCorrelationAnalysis' },
              ]
            }
          },
            {
              // ??????????????? ?????? ????????????
              path: 'alarm-work-order/:type',
              component: WorkOrderAddComponent,
              data: {
                  breadcrumb: [
                      { label: 'alarm' },
                      { label: 'alarmSet' },
                      { label: 'alarmWorkOrder', url: 'alarm-work-order' },
                      { label: 'alarmWorkOrder' }
                  ]}
            },
          {
            // ????????????????????????
            path: 'diagnose-details',
            component: DiagnoseDetailsComponent,
            data: {
              breadcrumb: [
                { label: 'alarm' },
                { label: 'currentAlarm', url: 'current-alarm'},
                { label: 'diagnoseDetails' }
              ]
            }
          },
          {
            // ????????????????????????
            path: 'history-diagnose-details',
            component: DiagnoseDetailsComponent,
            data: {
              breadcrumb: [
                { label: 'alarm' },
                { label: 'historyAlarm', url: 'history-alarm'},
                { label: 'diagnoseDetails' }
              ]
            }
          },
          {
            // ??????????????????
            path: 'add-alarm-set',
            component: AddAlarmSetComponent,
            data: {
              breadcrumb: [
                { label: 'alarm' },
                { label: 'alarmSet' },
                { label: 'currentAlarmSet', url: 'current-alarm-set' },
                { label: 'addCurrentAlarmSet' }
              ]
            }
          },
        ]
    }
];
